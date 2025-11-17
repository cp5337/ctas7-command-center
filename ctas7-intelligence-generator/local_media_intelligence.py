#!/usr/bin/env python3
"""
Local Law Enforcement and Media Intelligence Gatherer
Press releases, news outlets, and social media monitoring for terrorism indicators
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os
import sqlite3
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import asyncio
import aiohttp

class LocalMediaIntelligence:
    def __init__(self):
        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Cache and database setup
        self.cache_dir = Path("local_media_intelligence")
        self.cache_dir.mkdir(exist_ok=True)
        self.db_path = self.cache_dir / "local_intelligence.db"

        # Initialize databases
        self.init_database()

        # Rate limiting
        self.request_delay = 2.0

        # Top 25 City Police Departments
        self.major_police_departments = {
            "NYPD": "https://www1.nyc.gov/site/nypd/news/news.page",
            "LAPD": "https://www.lapdonline.org/newsroom/",
            "Chicago PD": "https://home.chicagopolice.org/news/",
            "Philadelphia PD": "https://www.phillypolice.com/news/",
            "Phoenix PD": "https://www.phoenix.gov/police/news",
            "San Antonio PD": "https://www.sanantonio.gov/SAPD/News",
            "San Diego PD": "https://www.sandiego.gov/police/news",
            "Dallas PD": "https://dallaspolice.net/news",
            "San Jose PD": "https://www.sjpd.org/records/press-releases",
            "Austin PD": "https://www.austintexas.gov/department/police/news",
            "Jacksonville SO": "https://www.jaxsheriff.org/News.aspx",
            "Fort Worth PD": "https://www.fortworthpd.com/news-publications/press-releases/",
            "Columbus PD": "https://www.columbus.gov/police/news/",
            "Charlotte PD": "https://charlottenc.gov/cmpd/News/Pages/default.aspx",
            "San Francisco PD": "https://www.sanfranciscopolice.org/news",
            "Indianapolis PD": "https://www.indy.gov/agency/indianapolis-metropolitan-police-department",
            "Seattle PD": "https://spdblotter.seattle.gov/",
            "Denver PD": "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Police-Department/News",
            "Boston PD": "https://bpdnews.com/",
            "El Paso PD": "https://www.elpasotexas.gov/police/news",
            "Detroit PD": "https://detroitmi.gov/departments/police-department/news",
            "Nashville PD": "https://www.nashville.gov/departments/police/news",
            "Memphis PD": "https://www.memphis.gov/police/news/",
            "Portland PD": "https://www.portland.gov/police/news",
            "Oklahoma City PD": "https://www.okc.gov/departments/police/news"
        }

        # Major Sheriff's Departments
        self.major_sheriffs = {
            "Los Angeles County SO": "https://lasd.org/transparency/",
            "Cook County SO": "https://www.cookcountysheriff.org/news/",
            "Harris County SO": "https://hcso.org/News",
            "Maricopa County SO": "https://www.maricopasheriff.org/news/",
            "San Bernardino County SO": "https://www.sbcsd.org/news/",
            "Miami-Dade PD": "https://www.miamidade.gov/police/news.asp",
            "King County SO": "https://www.kingcounty.gov/depts/sheriff/news.aspx",
            "Clark County SO": "https://www.lvmpd.com/News/Pages/default.aspx",
            "Orange County SO": "https://www.ocsd.org/news",
            "Riverside County SO": "https://www.riversidesheriff.org/news-media"
        }

        # Major Media Networks
        self.major_networks = {
            "CNN": "https://rss.cnn.com/rss/edition.rss",
            "Fox News": "https://feeds.foxnews.com/foxnews/latest",
            "NBC News": "https://feeds.nbcnews.com/nbcnews/public/news",
            "ABC News": "https://abcnews.go.com/abcnews/topstories",
            "CBS News": "https://www.cbsnews.com/latest/rss/main",
            "Reuters": "https://feeds.reuters.com/reuters/topNews",
            "AP News": "https://feeds.apnews.com/rss/apf-topnews"
        }

        # Major Radio Outlets
        self.radio_outlets = {
            "NPR": "https://feeds.npr.org/1001/rss.xml",
            "BBC World Service": "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
            "CNN Radio": "https://feeds.cnn.com/services/podcasting/cnn10/rss.xml"
        }

        # Terrorism/Security Keywords Manifest
        self.keyword_manifest = self.generate_keyword_manifest()

    def init_database(self):
        """Initialize local media intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Local law enforcement press releases
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS local_press_releases (
                id TEXT PRIMARY KEY,
                agency_name TEXT,
                agency_type TEXT,
                title TEXT,
                content TEXT,
                url TEXT,
                pub_date TEXT,
                keywords_matched TEXT,
                threat_level TEXT,
                abe_analysis TEXT,
                collection_date TEXT
            )
        ''')

        # Media outlet monitoring
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS media_alerts (
                id TEXT PRIMARY KEY,
                outlet_name TEXT,
                outlet_type TEXT,
                headline TEXT,
                content TEXT,
                url TEXT,
                pub_date TEXT,
                keywords_matched TEXT,
                local_relevance TEXT,
                abe_analysis TEXT,
                collection_date TEXT
            )
        ''')

        # Social media monitoring (when implemented)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS social_intelligence (
                id TEXT PRIMARY KEY,
                platform TEXT,
                account_type TEXT,
                content TEXT,
                keywords_matched TEXT,
                threat_assessment TEXT,
                location_relevance TEXT,
                collection_date TEXT
            )
        ''')

        # Keyword tracking and effectiveness
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS keyword_tracking (
                keyword TEXT PRIMARY KEY,
                category TEXT,
                hit_count INTEGER,
                last_match TEXT,
                effectiveness_score REAL
            )
        ''')

        conn.commit()
        conn.close()

    def generate_keyword_manifest(self):
        """Generate comprehensive keyword manifest for monitoring"""
        return {
            "Terrorism_Core": [
                "terrorism", "terrorist", "terror attack", "terror plot",
                "bomb threat", "bombing", "explosive device", "IED",
                "suicide bomber", "car bomb", "truck bomb"
            ],
            "Extremism": [
                "domestic terrorism", "domestic extremist", "white supremacist",
                "violent extremism", "radicalization", "extremist group",
                "militia", "sovereign citizen", "antigovernment"
            ],
            "Foreign_Threats": [
                "ISIS", "ISIL", "Al Qaeda", "Hamas", "Hezbollah",
                "Iranian", "China spy", "Russian agent", "foreign agent",
                "state sponsored", "sleeper cell"
            ],
            "Weapons_Explosives": [
                "explosive", "bomb making", "chemical weapon", "biological weapon",
                "ricin", "anthrax", "nerve agent", "pressure cooker bomb",
                "pipe bomb", "backpack bomb", "vehicle bomb"
            ],
            "Targets": [
                "critical infrastructure", "power grid", "nuclear facility",
                "government building", "federal building", "courthouse",
                "airport security", "transportation hub", "subway", "mass transit"
            ],
            "Activities": [
                "surveillance", "reconnaissance", "weapons training",
                "bomb making materials", "suspicious activity", "terror training",
                "martyrdom video", "jihadi", "propaganda"
            ],
            "Investigations": [
                "FBI investigation", "terrorism investigation", "joint terrorism task force",
                "JTTF", "counterterrorism", "material support", "conspiracy",
                "indictment", "terrorism charges", "national security"
            ],
            "Cyber": [
                "cyber terrorism", "cyber attack", "critical infrastructure cyber",
                "ransomware", "state sponsored hacking", "election interference"
            ]
        }

    def crawl_police_department_press(self, dept_name, url):
        """Crawl police department press releases"""
        try:
            print(f"  🔍 Crawling {dept_name}...")

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.get(url, headers=headers, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')

                # Extract press release links and content
                press_releases = []

                # Look for common press release patterns
                press_links = soup.find_all('a', href=True)

                for link in press_links[:20]:  # Limit to recent items
                    link_text = link.get_text(strip=True).lower()
                    href = link['href']

                    # Check if this looks like a press release
                    if any(indicator in link_text for indicator in ['press', 'news', 'release', 'alert', 'arrest']):
                        # Make URL absolute
                        full_url = urljoin(url, href)

                        # Check keywords
                        keyword_matches = self.check_keywords(link_text)

                        if keyword_matches:
                            press_releases.append({
                                'title': link.get_text(strip=True),
                                'url': full_url,
                                'keywords_matched': keyword_matches,
                                'agency_name': dept_name,
                                'agency_type': 'Police Department'
                            })

                return press_releases

        except Exception as e:
            print(f"    ❌ Failed to crawl {dept_name}: {e}")
            return []

    def crawl_media_outlets(self, outlet_name, rss_url):
        """Monitor media outlet RSS feeds"""
        try:
            print(f"  📺 Monitoring {outlet_name}...")

            response = requests.get(rss_url, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                # Parse RSS/XML
                from xml.etree import ElementTree as ET

                root = ET.fromstring(response.content)

                media_alerts = []

                # Find items (RSS format)
                for item in root.findall('.//item')[:10]:  # Recent items only
                    title_elem = item.find('title')
                    link_elem = item.find('link')
                    desc_elem = item.find('description')

                    if title_elem is not None and link_elem is not None:
                        title = title_elem.text or ''
                        link = link_elem.text or ''
                        description = desc_elem.text or '' if desc_elem is not None else ''

                        # Check content for keywords
                        content = f"{title} {description}".lower()
                        keyword_matches = self.check_keywords(content)

                        if keyword_matches:
                            media_alerts.append({
                                'headline': title,
                                'url': link,
                                'content': description[:500],  # Truncate
                                'keywords_matched': keyword_matches,
                                'outlet_name': outlet_name,
                                'outlet_type': 'Media Network'
                            })

                return media_alerts

        except Exception as e:
            print(f"    ❌ Failed to monitor {outlet_name}: {e}")
            return []

    def check_keywords(self, content):
        """Check content against keyword manifest"""
        content_lower = content.lower()
        matches = {}

        for category, keywords in self.keyword_manifest.items():
            category_matches = []
            for keyword in keywords:
                if keyword.lower() in content_lower:
                    category_matches.append(keyword)

            if category_matches:
                matches[category] = category_matches

        return matches if matches else None

    def analyze_content_threat_level(self, content_data):
        """Use ABE to analyze threat level of content"""
        content = f"{content_data.get('title', '')} {content_data.get('content', '')}"
        keywords = content_data.get('keywords_matched', {})

        prompt = f"""
        Analyze the threat level of this law enforcement/media content:

        Source: {content_data.get('agency_name', content_data.get('outlet_name', 'Unknown'))}
        Content: {content[:800]}
        Keywords Matched: {keywords}

        Assess:
        1. IMMEDIATE THREAT: Is there an active or imminent threat?
        2. INVESTIGATIVE VALUE: What intelligence value does this provide?
        3. LOCAL RELEVANCE: Does this indicate broader patterns?
        4. ESCALATION POTENTIAL: Could this develop into larger threats?

        Rate threat level: CRITICAL/HIGH/MEDIUM/LOW
        Provide specific reasoning and actionable insights.

        Return as JSON with: threat_level, analysis, actionable_insights
        """

        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'threat_level': 'LOW',
                    'analysis': response.text,
                    'actionable_insights': 'Analysis needs review'
                }
        except Exception as e:
            return {
                'threat_level': 'UNKNOWN',
                'analysis': f'Analysis failed: {e}',
                'actionable_insights': 'Manual review required'
            }

    def monitor_on_demand(self, max_agencies=10, max_media=5):
        """Run on-demand monitoring of local sources"""
        print("🚨 LOCAL LAW ENFORCEMENT & MEDIA INTELLIGENCE MONITORING")
        print("=" * 70)
        print("On-demand keyword-based monitoring (not continuous feed)")

        all_intelligence = []

        # Monitor police departments
        print(f"\n👮 Monitoring {max_agencies} Police Departments...")
        dept_count = 0
        for dept_name, url in self.major_police_departments.items():
            if dept_count >= max_agencies:
                break

            press_releases = self.crawl_police_department_press(dept_name, url)

            for release in press_releases:
                # ABE threat analysis
                threat_analysis = self.analyze_content_threat_level(release)
                release.update(threat_analysis)

                # Cache in database
                self.cache_press_release(release)
                all_intelligence.append(release)

                print(f"    ✅ {release['title'][:50]}... [{release['threat_level']}]")

            dept_count += 1

        # Monitor sheriff departments
        print(f"\n🏛️ Monitoring Sheriff Departments...")
        for sheriff_name, url in list(self.major_sheriffs.items())[:5]:  # Limit for demo
            press_releases = self.crawl_police_department_press(sheriff_name, url)

            for release in press_releases:
                threat_analysis = self.analyze_content_threat_level(release)
                release.update(threat_analysis)

                self.cache_press_release(release)
                all_intelligence.append(release)

                print(f"    ✅ {release['title'][:50]}... [{release['threat_level']}]")

        # Monitor media outlets
        print(f"\n📺 Monitoring {max_media} Media Outlets...")
        media_count = 0
        for outlet_name, rss_url in self.major_networks.items():
            if media_count >= max_media:
                break

            media_alerts = self.crawl_media_outlets(outlet_name, rss_url)

            for alert in media_alerts:
                threat_analysis = self.analyze_content_threat_level(alert)
                alert.update(threat_analysis)

                self.cache_media_alert(alert)
                all_intelligence.append(alert)

                print(f"    ✅ {alert['headline'][:50]}... [{alert['threat_level']}]")

            media_count += 1

        return all_intelligence

    def cache_press_release(self, release_data):
        """Cache press release in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        release_id = f"{release_data.get('agency_name', '')}_{hash(release_data.get('title', ''))}"

        cursor.execute('''
            INSERT OR REPLACE INTO local_press_releases
            (id, agency_name, agency_type, title, content, url,
             keywords_matched, threat_level, abe_analysis, collection_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            release_id,
            release_data.get('agency_name', ''),
            release_data.get('agency_type', ''),
            release_data.get('title', ''),
            release_data.get('content', ''),
            release_data.get('url', ''),
            json.dumps(release_data.get('keywords_matched', {})),
            release_data.get('threat_level', 'UNKNOWN'),
            json.dumps(release_data.get('analysis', '')),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    def cache_media_alert(self, alert_data):
        """Cache media alert in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        alert_id = f"{alert_data.get('outlet_name', '')}_{hash(alert_data.get('headline', ''))}"

        cursor.execute('''
            INSERT OR REPLACE INTO media_alerts
            (id, outlet_name, outlet_type, headline, content, url,
             keywords_matched, abe_analysis, collection_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert_id,
            alert_data.get('outlet_name', ''),
            alert_data.get('outlet_type', ''),
            alert_data.get('headline', ''),
            alert_data.get('content', ''),
            alert_data.get('url', ''),
            json.dumps(alert_data.get('keywords_matched', {})),
            json.dumps(alert_data.get('analysis', '')),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    def generate_local_intelligence_summary(self, intelligence_items):
        """Generate summary of local intelligence findings"""
        print(f"\n📊 Generating Local Intelligence Summary...")

        threat_levels = {}
        keyword_patterns = {}

        for item in intelligence_items:
            # Count threat levels
            threat_level = item.get('threat_level', 'UNKNOWN')
            threat_levels[threat_level] = threat_levels.get(threat_level, 0) + 1

            # Analyze keyword patterns
            keywords = item.get('keywords_matched', {})
            for category, matched_keywords in keywords.items():
                if category not in keyword_patterns:
                    keyword_patterns[category] = {}
                for keyword in matched_keywords:
                    keyword_patterns[category][keyword] = keyword_patterns[category].get(keyword, 0) + 1

        prompt = f"""
        Generate local intelligence summary from {len(intelligence_items)} sources:

        Threat Level Distribution:
        {json.dumps(threat_levels, indent=2)}

        Keyword Pattern Analysis:
        {json.dumps(keyword_patterns, indent=2)}

        Create summary addressing:
        1. LOCAL THREAT INDICATORS: What threats are emerging at local levels?
        2. PATTERN ANALYSIS: What patterns emerge across jurisdictions?
        3. EARLY WARNING INDICATORS: What early indicators should be watched?
        4. RESOURCE ALLOCATION: Which areas need increased attention?
        5. COORDINATION OPPORTUNITIES: How can local/federal cooperation improve?

        Format as professional local intelligence brief.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Local intelligence summary generation failed"

    def save_intelligence_package(self, data, category):
        """Save local intelligence package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"local_intel_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("🚨 LOCAL LAW ENFORCEMENT & MEDIA INTELLIGENCE")
    print("=" * 60)
    print("Keyword-based monitoring of police, sheriff, and media sources")

    monitor = LocalMediaIntelligence()

    # Display keyword manifest
    print(f"\n🔍 KEYWORD MANIFEST:")
    for category, keywords in monitor.keyword_manifest.items():
        print(f"   {category}: {len(keywords)} keywords")

    # Display monitored sources
    print(f"\n👮 POLICE DEPARTMENTS: {len(monitor.major_police_departments)}")
    print(f"🏛️ SHERIFF DEPARTMENTS: {len(monitor.major_sheriffs)}")
    print(f"📺 MEDIA NETWORKS: {len(monitor.major_networks)}")
    print(f"📻 RADIO OUTLETS: {len(monitor.radio_outlets)}")

    # Run on-demand monitoring
    print(f"\n🔄 Running on-demand monitoring...")
    intelligence_items = monitor.monitor_on_demand(max_agencies=5, max_media=3)

    if intelligence_items:
        # Save intelligence package
        intel_file = monitor.save_intelligence_package(intelligence_items, "on_demand_monitoring")
        print(f"\n✅ {len(intelligence_items)} intelligence items collected")
        print(f"   Saved to: {intel_file.name}")

        # Generate summary
        summary = monitor.generate_local_intelligence_summary(intelligence_items)

        summary_file = monitor.cache_dir / f"local_intelligence_summary_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(f"✅ Summary generated: {summary_file.name}")

        # Display results by threat level
        threat_distribution = {}
        for item in intelligence_items:
            threat_level = item.get('threat_level', 'UNKNOWN')
            threat_distribution[threat_level] = threat_distribution.get(threat_level, 0) + 1

        print(f"\n📊 Threat Level Distribution:")
        for level, count in threat_distribution.items():
            print(f"   {level}: {count} items")

        print(f"\n💾 Database: {monitor.db_path}")
        print(f"📁 Cache: {monitor.cache_dir}")

    else:
        print("❌ No intelligence items matched keywords in current monitoring")

    print(f"\n💡 MONITORING CAPABILITIES:")
    print("   • On-demand keyword-based scanning (not continuous)")
    print("   • Local law enforcement press release analysis")
    print("   • Media outlet terrorism indicator monitoring")
    print("   • ABE threat level assessment")
    print("   • Pattern analysis across jurisdictions")

if __name__ == "__main__":
    main()