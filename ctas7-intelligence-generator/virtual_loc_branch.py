#!/usr/bin/env python3
"""
Virtual LOC Branch - On-Demand Intelligence Library
Smart querying without bulk downloads
"""

import requests
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import google.generativeai as genai
import os
import hashlib

class VirtualLOCBranch:
    def __init__(self):
        # LOC API endpoints
        self.loc_base = "https://www.loc.gov"
        self.marc_base = "https://www.loc.gov/cds/products"

        # Local intelligence database
        self.db_path = Path("virtual_loc_branch.db")
        self.cache_dir = Path("loc_intelligence_cache")
        self.cache_dir.mkdir(exist_ok=True)

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Initialize local database
        self.init_database()

    def init_database(self):
        """Initialize local intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Intelligence items table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS intelligence_items (
                id TEXT PRIMARY KEY,
                title TEXT,
                date_created TEXT,
                format_type TEXT,
                subject_headings TEXT,
                description TEXT,
                intelligence_value TEXT,
                abe_analysis TEXT,
                last_accessed TEXT,
                query_context TEXT,
                item_url TEXT
            )
        ''')

        # Query history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT,
                query_type TEXT,
                results_count INTEGER,
                timestamp TEXT,
                intelligence_value TEXT
            )
        ''')

        # Subject authority cache
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subject_authorities (
                subject_heading TEXT PRIMARY KEY,
                related_headings TEXT,
                item_count INTEGER,
                last_updated TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def smart_query(self, intelligence_requirement, max_results=25):
        """Smart querying based on intelligence requirements"""
        # Generate targeted search terms using ABE
        search_terms = self.generate_search_strategy(intelligence_requirement)

        all_results = []
        for term in search_terms:
            results = self.query_loc_api(term, max_results)
            if results:
                # Filter and rank by intelligence value
                filtered_results = self.filter_by_intelligence_value(results, intelligence_requirement)
                all_results.extend(filtered_results)

        # Cache valuable results
        self.cache_results(all_results, intelligence_requirement)

        return all_results

    def generate_search_strategy(self, intelligence_requirement):
        """Use ABE to generate optimal search terms"""
        prompt = f"""
        Generate optimal Library of Congress search terms for this intelligence requirement:

        "{intelligence_requirement}"

        Consider:
        1. Government agency publications (FBI, CIA, DHS, NSC, GAO)
        2. Congressional hearings and reports
        3. Academic terrorism research
        4. Historical incident documentation
        5. Policy analysis and threat assessments

        Return 5-8 specific search terms that would find the most relevant materials.
        Format as JSON array of strings.
        """

        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import re
            json_match = re.search(r'\[.*?\]', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Fallback terms
                return [intelligence_requirement, "terrorism", "counterterrorism", "national security"]
        except:
            return [intelligence_requirement, "terrorism", "counterterrorism"]

    def query_loc_api(self, search_term, max_results=25):
        """Query LOC API with specific search term"""
        url = f"{self.loc_base}/search/"

        params = {
            'q': search_term,
            'fo': 'json',
            'c': max_results,
            'at': 'results'
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()

                # Log query
                self.log_query(search_term, "api_search",
                             len(data.get('results', [])) if data else 0)

                return data.get('results', [])
            return []
        except Exception as e:
            print(f"LOC API query failed: {e}")
            return []

    def filter_by_intelligence_value(self, results, intelligence_requirement):
        """Filter results by intelligence value using ABE"""
        valuable_results = []

        for item in results:
            # Quick relevance check
            title = item.get('title', '')
            description = item.get('description', '')

            # ABE assessment
            intelligence_value = self.assess_intelligence_value(
                item, intelligence_requirement
            )

            if intelligence_value in ['HIGH', 'MEDIUM']:
                item['intelligence_assessment'] = intelligence_value
                valuable_results.append(item)

        return valuable_results

    def assess_intelligence_value(self, item, requirement):
        """Use ABE to assess intelligence value of specific item"""
        prompt = f"""
        Assess the intelligence value of this Library of Congress item for the requirement: "{requirement}"

        Title: {item.get('title', 'Unknown')}
        Date: {item.get('date', 'Unknown')}
        Type: {item.get('original_format', 'Unknown')}
        Description: {item.get('description', 'No description')[:500]}

        Rate as HIGH/MEDIUM/LOW based on:
        1. Relevance to current threat analysis
        2. Government/official source credibility
        3. Historical significance
        4. Actionable intelligence content
        5. Policy/operational insights

        Return only: HIGH, MEDIUM, or LOW
        """

        try:
            response = self.model.generate_content(prompt)
            assessment = response.text.strip().upper()
            if assessment in ['HIGH', 'MEDIUM', 'LOW']:
                return assessment
            return 'LOW'
        except:
            return 'LOW'

    def cache_results(self, results, query_context):
        """Cache valuable results in local database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        for item in results:
            item_id = hashlib.md5(str(item).encode()).hexdigest()

            cursor.execute('''
                INSERT OR REPLACE INTO intelligence_items
                (id, title, date_created, format_type, subject_headings,
                 description, intelligence_value, last_accessed, query_context, item_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                item_id,
                item.get('title', ''),
                item.get('date', ''),
                item.get('original_format', ''),
                json.dumps(item.get('subject', [])),
                item.get('description', ''),
                item.get('intelligence_assessment', 'UNKNOWN'),
                datetime.now().isoformat(),
                query_context,
                item.get('url', '')
            ))

        conn.commit()
        conn.close()

    def log_query(self, query_text, query_type, results_count):
        """Log query for intelligence tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO query_history
            (query_text, query_type, results_count, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (query_text, query_type, results_count, datetime.now().isoformat()))

        conn.commit()
        conn.close()

    def get_cached_intelligence(self, topic):
        """Retrieve cached intelligence on topic"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM intelligence_items
            WHERE query_context LIKE ? OR title LIKE ? OR subject_headings LIKE ?
            ORDER BY intelligence_value DESC, last_accessed DESC
        ''', (f'%{topic}%', f'%{topic}%', f'%{topic}%'))

        results = cursor.fetchall()
        conn.close()

        return results

    def generate_intelligence_summary(self, topic):
        """Generate intelligence summary for topic using cached + new data"""
        # Check cache first
        cached_intel = self.get_cached_intelligence(topic)

        # Get fresh intelligence if needed
        if len(cached_intel) < 10:
            fresh_intel = self.smart_query(topic, max_results=50)
            print(f"Gathered {len(fresh_intel)} new intelligence items")

        # Generate summary using ABE
        all_items = self.get_cached_intelligence(topic)

        summary_prompt = f"""
        Generate an executive intelligence summary for: "{topic}"

        Based on {len(all_items)} Library of Congress intelligence items including:
        - Government reports and publications
        - Congressional hearings and studies
        - Academic terrorism research
        - Historical incident documentation

        Provide:
        1. Key findings and trends
        2. Historical context and lessons
        3. Current threat implications
        4. Policy recommendations
        5. Intelligence gaps requiring further research

        Format as professional intelligence brief.
        """

        try:
            response = self.model.generate_content(summary_prompt)
            return response.text
        except:
            return "Intelligence summary generation failed"

    def get_branch_statistics(self):
        """Get statistics on virtual branch usage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Total items cached
        cursor.execute("SELECT COUNT(*) FROM intelligence_items")
        total_items = cursor.fetchone()[0]

        # High-value items
        cursor.execute("SELECT COUNT(*) FROM intelligence_items WHERE intelligence_value = 'HIGH'")
        high_value_items = cursor.fetchone()[0]

        # Recent queries
        cursor.execute("SELECT COUNT(*) FROM query_history WHERE timestamp > datetime('now', '-7 days')")
        recent_queries = cursor.fetchone()[0]

        # Top topics
        cursor.execute('''
            SELECT query_context, COUNT(*) as frequency
            FROM intelligence_items
            GROUP BY query_context
            ORDER BY frequency DESC
            LIMIT 5
        ''')
        top_topics = cursor.fetchall()

        conn.close()

        return {
            'total_items': total_items,
            'high_value_items': high_value_items,
            'recent_queries': recent_queries,
            'top_topics': top_topics
        }

def main():
    print("🏛️ Virtual LOC Branch - On-Demand Intelligence")
    print("=" * 50)

    branch = VirtualLOCBranch()

    # Example intelligence requirements
    test_requirements = [
        "Hezbollah financing operations in United States",
        "Iranian Quds Force activities and capabilities",
        "Domestic terrorism threat assessment 2020-2024",
        "Cyber terrorism capabilities by state actors"
    ]

    for requirement in test_requirements:
        print(f"\n🔍 Intelligence Requirement: {requirement}")

        # Generate intelligence summary
        summary = branch.generate_intelligence_summary(requirement)

        # Save summary
        summary_file = branch.cache_dir / f"intel_summary_{requirement.replace(' ', '_')[:30]}_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(f"   ✅ Intelligence summary generated: {summary_file.name}")

    # Branch statistics
    stats = branch.get_branch_statistics()
    print(f"\n📊 Virtual Branch Statistics:")
    print(f"   Total intelligence items: {stats['total_items']}")
    print(f"   High-value items: {stats['high_value_items']}")
    print(f"   Recent queries (7 days): {stats['recent_queries']}")
    print(f"   Database: {branch.db_path}")

if __name__ == "__main__":
    main()