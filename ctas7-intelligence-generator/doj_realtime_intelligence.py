#!/usr/bin/env python3
"""
DOJ Real-Time Intelligence Gatherer
RSS feed monitoring for terrorism prosecutions and law enforcement activities
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
import re
import sqlite3

class DOJRealTimeIntelligence:
    def __init__(self):
        # DOJ RSS endpoints
        self.doj_rss_base = "https://www.justice.gov/news/rss"
        self.rss_feeds = {
            'press_releases': f"{self.doj_rss_base}?type=press_release&m=1",
            'speeches': f"{self.doj_rss_base}?type=speech&m=1",
            'testimony': f"{self.doj_rss_base}?type=testimony&m=1"
        }

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Cache directory and database
        self.cache_dir = Path("doj_realtime_cache")
        self.cache_dir.mkdir(exist_ok=True)
        self.db_path = self.cache_dir / "doj_intelligence.db"

        # Initialize database
        self.init_database()

        # Rate limiting
        self.request_delay = 1.0

    def init_database(self):
        """Initialize DOJ intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS doj_items (
                id TEXT PRIMARY KEY,
                title TEXT,
                link TEXT,
                pub_date TEXT,
                description TEXT,
                content_type TEXT,
                intelligence_value TEXT,
                terrorism_relevance TEXT,
                abe_analysis TEXT,
                collection_date TEXT,
                last_updated TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS terrorism_prosecutions (
                case_id TEXT PRIMARY KEY,
                defendant_name TEXT,
                charges TEXT,
                jurisdiction TEXT,
                case_date TEXT,
                case_status TEXT,
                threat_level TEXT,
                operational_insights TEXT,
                doj_item_id TEXT,
                FOREIGN KEY (doj_item_id) REFERENCES doj_items (id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS enforcement_operations (
                operation_id TEXT PRIMARY KEY,
                operation_name TEXT,
                operation_type TEXT,
                agencies_involved TEXT,
                targets TEXT,
                results TEXT,
                intelligence_value TEXT,
                doj_item_id TEXT,
                FOREIGN KEY (doj_item_id) REFERENCES doj_items (id)
            )
        ''')

        conn.commit()
        conn.close()

    def fetch_rss_feed(self, feed_url):
        """Fetch and parse RSS feed"""
        try:
            response = requests.get(feed_url, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                # Parse XML
                root = ET.fromstring(response.content)

                items = []
                for item in root.findall('.//item'):
                    title = item.find('title')
                    link = item.find('link')
                    pub_date = item.find('pubDate')
                    description = item.find('description')

                    items.append({
                        'title': title.text if title is not None else '',
                        'link': link.text if link is not None else '',
                        'pub_date': pub_date.text if pub_date is not None else '',
                        'description': description.text if description is not None else ''
                    })

                return items

            return []

        except Exception as e:
            print(f"RSS feed fetch failed: {e}")
            return []

    def analyze_terrorism_relevance(self, item):
        """Use ABE to analyze terrorism relevance of DOJ item"""
        prompt = f"""
        Analyze this DOJ press release for terrorism/counterterrorism relevance:

        Title: {item.get('title', 'Unknown')}
        Date: {item.get('pub_date', 'Unknown')}
        Description: {item.get('description', 'No description')[:800]}

        Determine:
        1. TERRORISM RELEVANCE: Is this related to terrorism, counterterrorism, or national security?
        2. THREAT LEVEL: What level of threat does this represent? (HIGH/MEDIUM/LOW)
        3. OPERATIONAL VALUE: What operational intelligence can be derived?
        4. PROSECUTION INSIGHTS: What prosecution patterns or trends are revealed?
        5. POLICY IMPLICATIONS: What policy or enforcement changes are indicated?

        Rate overall intelligence value: HIGH/MEDIUM/LOW
        Provide specific reasoning for rating.

        Return as JSON with: relevance_score, threat_level, intelligence_value, analysis
        """

        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import json as json_lib
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json_lib.loads(json_match.group())
            else:
                # Fallback analysis
                text = response.text.lower()
                if any(keyword in text for keyword in ['terrorism', 'terrorist', 'national security', 'counterterrorism']):
                    return {
                        'relevance_score': 'HIGH',
                        'threat_level': 'MEDIUM',
                        'intelligence_value': 'HIGH',
                        'analysis': response.text
                    }
                return {
                    'relevance_score': 'LOW',
                    'threat_level': 'LOW',
                    'intelligence_value': 'LOW',
                    'analysis': 'Not terrorism-related'
                }
        except Exception as e:
            print(f"ABE analysis failed: {e}")
            return {
                'relevance_score': 'UNKNOWN',
                'threat_level': 'UNKNOWN',
                'intelligence_value': 'LOW',
                'analysis': 'Analysis failed'
            }

    def extract_prosecution_details(self, item, analysis):
        """Extract prosecution details from DOJ item"""
        if analysis.get('relevance_score') in ['HIGH', 'MEDIUM']:
            prompt = f"""
            Extract prosecution details from this DOJ announcement:

            Title: {item.get('title', 'Unknown')}
            Description: {item.get('description', 'No description')}

            Extract:
            1. Defendant name(s)
            2. Charges filed
            3. Jurisdiction (court/district)
            4. Case status (arrested, indicted, sentenced, etc.)
            5. Operational insights (methods, networks, capabilities)

            Return as JSON with: defendants, charges, jurisdiction, status, insights
            If not a prosecution announcement, return null.
            """

            try:
                response = self.model.generate_content(prompt)
                json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
            except:
                pass

        return None

    def extract_operation_details(self, item, analysis):
        """Extract law enforcement operation details"""
        if analysis.get('relevance_score') in ['HIGH', 'MEDIUM']:
            prompt = f"""
            Extract law enforcement operation details from this DOJ announcement:

            Title: {item.get('title', 'Unknown')}
            Description: {item.get('description', 'No description')}

            Extract:
            1. Operation name/type
            2. Agencies involved
            3. Targets (individuals, organizations, networks)
            4. Results achieved
            5. Intelligence gathered

            Return as JSON with: operation_name, agencies, targets, results, intelligence
            If not an operation announcement, return null.
            """

            try:
                response = self.model.generate_content(prompt)
                json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
            except:
                pass

        return None

    def gather_current_doj_intelligence(self):
        """Gather current DOJ intelligence from all RSS feeds"""
        print("📡 Gathering Real-Time DOJ Intelligence...")

        all_intelligence = []

        for feed_name, feed_url in self.rss_feeds.items():
            print(f"\n🔍 Processing {feed_name}...")

            items = self.fetch_rss_feed(feed_url)
            print(f"   Retrieved {len(items)} items")

            terrorism_items = []

            for item in items:
                # ABE analysis for terrorism relevance
                analysis = self.analyze_terrorism_relevance(item)

                if analysis.get('intelligence_value') in ['HIGH', 'MEDIUM']:
                    # Generate unique ID
                    item_id = f"doj_{hash(item.get('title', '') + item.get('link', ''))}"

                    # Extract prosecution details if relevant
                    prosecution_details = self.extract_prosecution_details(item, analysis)
                    operation_details = self.extract_operation_details(item, analysis)

                    # Enhance item with analysis
                    enhanced_item = {
                        **item,
                        'id': item_id,
                        'content_type': feed_name,
                        'abe_analysis': analysis,
                        'prosecution_details': prosecution_details,
                        'operation_details': operation_details,
                        'collection_date': datetime.now().isoformat()
                    }

                    terrorism_items.append(enhanced_item)
                    print(f"   ✅ High-value item: {item.get('title', 'Unknown')[:60]}...")

                    # Cache in database
                    self.cache_intelligence_item(enhanced_item)

                time.sleep(self.request_delay)

            all_intelligence.extend(terrorism_items)

        return all_intelligence

    def cache_intelligence_item(self, item):
        """Cache intelligence item in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Cache main item
        cursor.execute('''
            INSERT OR REPLACE INTO doj_items
            (id, title, link, pub_date, description, content_type,
             intelligence_value, terrorism_relevance, abe_analysis,
             collection_date, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item['id'],
            item.get('title', ''),
            item.get('link', ''),
            item.get('pub_date', ''),
            item.get('description', ''),
            item.get('content_type', ''),
            item['abe_analysis'].get('intelligence_value', 'UNKNOWN'),
            item['abe_analysis'].get('relevance_score', 'UNKNOWN'),
            json.dumps(item['abe_analysis']),
            item.get('collection_date', ''),
            datetime.now().isoformat()
        ))

        # Cache prosecution details if available
        if item.get('prosecution_details'):
            prosecution = item['prosecution_details']
            case_id = f"{item['id']}_prosecution"

            cursor.execute('''
                INSERT OR REPLACE INTO terrorism_prosecutions
                (case_id, defendant_name, charges, jurisdiction, case_status,
                 threat_level, operational_insights, doj_item_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                case_id,
                prosecution.get('defendants', ''),
                prosecution.get('charges', ''),
                prosecution.get('jurisdiction', ''),
                prosecution.get('status', ''),
                item['abe_analysis'].get('threat_level', 'UNKNOWN'),
                prosecution.get('insights', ''),
                item['id']
            ))

        # Cache operation details if available
        if item.get('operation_details'):
            operation = item['operation_details']
            operation_id = f"{item['id']}_operation"

            cursor.execute('''
                INSERT OR REPLACE INTO enforcement_operations
                (operation_id, operation_name, operation_type, agencies_involved,
                 targets, results, intelligence_value, doj_item_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                operation_id,
                operation.get('operation_name', ''),
                item.get('content_type', ''),
                operation.get('agencies', ''),
                operation.get('targets', ''),
                operation.get('results', ''),
                item['abe_analysis'].get('intelligence_value', 'UNKNOWN'),
                item['id']
            ))

        conn.commit()
        conn.close()

    def get_recent_prosecutions(self, days=30):
        """Get recent terrorism prosecutions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()

        cursor.execute('''
            SELECT p.*, d.title, d.pub_date, d.link
            FROM terrorism_prosecutions p
            JOIN doj_items d ON p.doj_item_id = d.id
            WHERE d.collection_date > ?
            ORDER BY d.pub_date DESC
        ''', (cutoff_date,))

        results = cursor.fetchall()
        conn.close()
        return results

    def get_recent_operations(self, days=30):
        """Get recent law enforcement operations"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()

        cursor.execute('''
            SELECT o.*, d.title, d.pub_date, d.link
            FROM enforcement_operations o
            JOIN doj_items d ON o.doj_item_id = d.id
            WHERE d.collection_date > ?
            ORDER BY d.pub_date DESC
        ''', (cutoff_date,))

        results = cursor.fetchall()
        conn.close()
        return results

    def generate_realtime_intelligence_brief(self, days=7):
        """Generate real-time intelligence brief"""
        print(f"\n📊 Generating {days}-day DOJ Intelligence Brief...")

        recent_prosecutions = self.get_recent_prosecutions(days)
        recent_operations = self.get_recent_operations(days)

        prompt = f"""
        Generate real-time intelligence brief from DOJ activities (last {days} days):

        Recent Prosecutions: {len(recent_prosecutions)}
        Recent Operations: {len(recent_operations)}

        Create brief addressing:
        1. CURRENT THREAT LANDSCAPE: What threats is DOJ actively prosecuting?
        2. PROSECUTION TRENDS: What patterns emerge in recent cases?
        3. ENFORCEMENT PRIORITIES: What areas are receiving focus?
        4. OPERATIONAL INSIGHTS: What capabilities or methods are revealed?
        5. POLICY IMPLICATIONS: What enforcement strategies are indicated?

        Format as professional real-time intelligence brief.
        Include specific case references and operational details.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Real-time intelligence brief generation failed"

    def save_intelligence_package(self, data, category):
        """Save real-time intelligence package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"doj_realtime_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("📡 DOJ Real-Time Intelligence Gatherer")
    print("=" * 50)
    print("Monitoring DOJ RSS feeds for terrorism prosecutions and law enforcement")

    intelligence = DOJRealTimeIntelligence()

    # Gather current intelligence
    print("\n🔄 Gathering current DOJ intelligence...")
    current_intelligence = intelligence.gather_current_doj_intelligence()

    if current_intelligence:
        # Save intelligence package
        intel_file = intelligence.save_intelligence_package(current_intelligence, "current_intelligence")
        print(f"\n✅ {len(current_intelligence)} intelligence items saved: {intel_file.name}")

        # Generate real-time brief
        realtime_brief = intelligence.generate_realtime_intelligence_brief(days=7)

        brief_file = intelligence.cache_dir / f"doj_realtime_brief_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(brief_file, 'w') as f:
            f.write(realtime_brief)

        print(f"✅ Real-time brief generated: {brief_file.name}")

        # Display recent activity summary
        recent_prosecutions = intelligence.get_recent_prosecutions(days=30)
        recent_operations = intelligence.get_recent_operations(days=30)

        print(f"\n📊 Recent Activity Summary (30 days):")
        print(f"   Terrorism Prosecutions: {len(recent_prosecutions)}")
        print(f"   Law Enforcement Operations: {len(recent_operations)}")
        print(f"   Total Intelligence Items: {len(current_intelligence)}")
        print(f"   Database: {intelligence.db_path}")

    else:
        print("❌ No high-value intelligence found in current DOJ feeds")

    print(f"\n💡 DOJ RSS Feeds Monitored:")
    for feed_name, feed_url in intelligence.rss_feeds.items():
        print(f"   • {feed_name}: {feed_url}")

    print(f"\n🔄 For continuous monitoring, run this script on a schedule")

if __name__ == "__main__":
    main()