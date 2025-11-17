#!/usr/bin/env python3
"""
Congress.gov API Integration with CRS Reports
Legislative intelligence and Congressional Research Service analysis
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os

class CongressionalIntelligenceGatherer:
    def __init__(self):
        # Congress.gov API
        self.congress_base = "https://api.congress.gov/v3"
        self.api_key = os.getenv("CONGRESS_API_KEY")  # Required for Congress API

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Cache directory
        self.cache_dir = Path("congress_intelligence_cache")
        self.cache_dir.mkdir(exist_ok=True)

        # Rate limiting
        self.request_delay = 1.0

        # Headers for API requests
        self.headers = {
            'X-API-Key': self.api_key,
            'Accept': 'application/json'
        }

    def search_bills(self, query, limit=50):
        """Search for terrorism-related bills"""
        url = f"{self.congress_base}/bill"

        params = {
            'q': query,
            'format': 'json',
            'limit': limit,
            'sort': 'latestAction.actionDate+desc'
        }

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            else:
                print(f"Bills search error: {response.status_code}")
                return None

        except Exception as e:
            print(f"Bills search failed: {e}")
            return None

    def get_bill_details(self, congress, bill_type, bill_number):
        """Get detailed information about specific bill"""
        url = f"{self.congress_base}/bill/{congress}/{bill_type}/{bill_number}"

        params = {'format': 'json'}

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Bill details failed: {e}")
            return None

    def search_committee_reports(self, query, limit=25):
        """Search committee reports (includes some CRS-like content)"""
        url = f"{self.congress_base}/committee-report"

        params = {
            'q': query,
            'format': 'json',
            'limit': limit,
            'sort': 'updateDate+desc'
        }

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Committee reports search failed: {e}")
            return None

    def search_congressional_records(self, query, limit=25):
        """Search Congressional Record for terrorism discussions"""
        url = f"{self.congress_base}/congressional-record"

        params = {
            'q': query,
            'format': 'json',
            'limit': limit,
            'sort': 'date+desc'
        }

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Congressional Record search failed: {e}")
            return None

    def search_committee_meetings(self, query, limit=25):
        """Search committee hearings on terrorism topics"""
        url = f"{self.congress_base}/committee-meeting"

        params = {
            'q': query,
            'format': 'json',
            'limit': limit
        }

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Committee meetings search failed: {e}")
            return None

    def analyze_legislative_intelligence(self, item, item_type):
        """Use ABE to analyze congressional item for intelligence value"""
        prompt = f"""
        Analyze this {item_type} for terrorism/counterterrorism intelligence:

        Title: {item.get('title', 'Unknown')}
        Date: {item.get('date', item.get('latestAction', {}).get('actionDate', 'Unknown'))}
        Summary: {item.get('summary', item.get('description', 'No summary')[:800]}

        Extract intelligence insights:
        1. THREAT ASSESSMENT: What specific threats are discussed?
        2. POLICY GAPS: What vulnerabilities or weaknesses are identified?
        3. FUNDING PRIORITIES: What counterterrorism spending is proposed/discussed?
        4. INTERNATIONAL CONCERNS: Which foreign actors or nations are mentioned?
        5. DOMESTIC THREATS: What internal security issues are highlighted?
        6. LEGISLATIVE RESPONSE: What actions are proposed to address threats?
        7. INTELLIGENCE VALUE: Rate as HIGH/MEDIUM/LOW for threat analysis

        Focus on actionable intelligence for counterterrorism analysis.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Legislative analysis failed: {e}")
            return "Analysis failed"

    def gather_terrorism_legislation(self):
        """Gather terrorism-related legislation and analysis"""
        terrorism_queries = [
            "terrorism",
            "counterterrorism",
            "homeland security",
            "national security",
            "foreign terrorist organization",
            "material support terrorism",
            "Iran sanctions",
            "Hezbollah",
            "cyber terrorism",
            "domestic terrorism"
        ]

        all_legislation = []

        for query in terrorism_queries:
            print(f"\n📋 Searching legislation: {query}")

            # Search bills
            bills_data = self.search_bills(query, limit=15)
            if bills_data and 'bills' in bills_data:
                for bill in bills_data['bills']:
                    # Get detailed information
                    if 'congress' in bill and 'type' in bill and 'number' in bill:
                        details = self.get_bill_details(
                            bill['congress'],
                            bill['type'],
                            bill['number']
                        )
                        if details:
                            bill.update(details.get('bill', {}))

                    # ABE intelligence analysis
                    intelligence_analysis = self.analyze_legislative_intelligence(bill, "legislation")
                    bill['abe_intelligence_analysis'] = intelligence_analysis
                    bill['query_topic'] = query
                    bill['source_type'] = 'legislation'

                    # Filter for high-value intelligence
                    if 'HIGH' in intelligence_analysis or 'MEDIUM' in intelligence_analysis:
                        all_legislation.append(bill)
                        print(f"  ✅ High-value bill: {bill.get('title', 'Unknown')[:50]}...")

                    time.sleep(self.request_delay)

        return all_legislation

    def gather_committee_intelligence(self):
        """Gather committee reports and hearings on terrorism"""
        committee_topics = [
            "terrorism threat assessment",
            "homeland security oversight",
            "counterterrorism programs",
            "intelligence community oversight",
            "border security",
            "aviation security",
            "cybersecurity threats",
            "Iran terrorism",
            "domestic violent extremism"
        ]

        committee_intelligence = []

        for topic in committee_topics:
            print(f"\n🏛️ Committee intelligence: {topic}")

            # Get committee reports
            reports_data = self.search_committee_reports(topic, limit=10)
            if reports_data and 'reports' in reports_data:
                for report in reports_data['reports']:
                    analysis = self.analyze_legislative_intelligence(report, "committee_report")
                    report['abe_intelligence_analysis'] = analysis
                    report['query_topic'] = topic
                    report['source_type'] = 'committee_report'

                    if 'HIGH' in analysis or 'MEDIUM' in analysis:
                        committee_intelligence.append(report)
                        print(f"  ✅ Committee report: {report.get('title', 'Unknown')[:50]}...")

            # Get committee hearings
            meetings_data = self.search_committee_meetings(topic, limit=8)
            if meetings_data and 'meetings' in meetings_data:
                for meeting in meetings_data['meetings']:
                    analysis = self.analyze_legislative_intelligence(meeting, "committee_hearing")
                    meeting['abe_intelligence_analysis'] = analysis
                    meeting['query_topic'] = topic
                    meeting['source_type'] = 'committee_hearing'

                    if 'HIGH' in analysis or 'MEDIUM' in analysis:
                        committee_intelligence.append(meeting)
                        print(f"  ✅ Committee hearing: {meeting.get('title', 'Unknown')[:50]}...")

            time.sleep(self.request_delay)

        return committee_intelligence

    def gather_congressional_record_intelligence(self):
        """Gather Congressional Record terrorism discussions"""
        record_queries = [
            "Iran terrorist threat",
            "Hezbollah United States",
            "domestic terrorism FBI",
            "China espionage threat",
            "Russia disinformation",
            "cybersecurity national security",
            "border security terrorism",
            "intelligence community failures"
        ]

        record_intelligence = []

        for query in record_queries:
            print(f"\n📰 Congressional Record: {query}")

            records_data = self.search_congressional_records(query, limit=10)
            if records_data and 'results' in records_data:
                for record in records_data['results']:
                    analysis = self.analyze_legislative_intelligence(record, "congressional_record")
                    record['abe_intelligence_analysis'] = analysis
                    record['query_topic'] = query
                    record['source_type'] = 'congressional_record'

                    if 'HIGH' in analysis or 'MEDIUM' in analysis:
                        record_intelligence.append(record)
                        print(f"  ✅ Congressional Record: {record.get('title', 'Unknown')[:50]}...")

            time.sleep(self.request_delay)

        return record_intelligence

    def generate_legislative_intelligence_summary(self, all_items):
        """Generate executive summary of legislative intelligence"""
        prompt = f"""
        Generate executive intelligence summary from {len(all_items)} congressional items:

        Items include legislation, committee reports, hearings, and Congressional Record entries
        on terrorism, counterterrorism, and national security.

        Create summary addressing:
        1. CURRENT THREAT PERCEPTIONS: What threats is Congress most concerned about?
        2. POLICY DIRECTIONS: What counterterrorism policies are being developed?
        3. FUNDING TRENDS: How is counterterrorism funding changing?
        4. OVERSIGHT CONCERNS: What security programs are under congressional scrutiny?
        5. INTERNATIONAL FOCUS: Which foreign threats receive most attention?
        6. DOMESTIC SECURITY: How is Congress addressing domestic terrorism?
        7. INTELLIGENCE GAPS: What areas need more congressional attention?

        Format as professional legislative intelligence brief.
        Include specific bill numbers, committee names, and policy recommendations.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Legislative intelligence summary generation failed"

    def save_intelligence_package(self, data, category):
        """Save congressional intelligence data"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"congress_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("🏛️ Congressional Intelligence Gatherer + CRS Reports")
    print("=" * 60)

    if not os.getenv("CONGRESS_API_KEY"):
        print("❌ CONGRESS_API_KEY not set")
        print("   Get API key at: https://api.congress.gov/sign-up/")
        return

    gatherer = CongressionalIntelligenceGatherer()

    # Gather terrorism legislation
    print("\n📋 Gathering terrorism legislation...")
    legislation = gatherer.gather_terrorism_legislation()
    if legislation:
        leg_file = gatherer.save_intelligence_package(legislation, "terrorism_legislation")
        print(f"   ✅ {len(legislation)} bills saved: {leg_file.name}")

    # Gather committee intelligence
    print("\n🏛️ Gathering committee reports and hearings...")
    committee_intel = gatherer.gather_committee_intelligence()
    if committee_intel:
        committee_file = gatherer.save_intelligence_package(committee_intel, "committee_intelligence")
        print(f"   ✅ {len(committee_intel)} committee items saved: {committee_file.name}")

    # Gather Congressional Record
    print("\n📰 Gathering Congressional Record terrorism discussions...")
    record_intel = gatherer.gather_congressional_record_intelligence()
    if record_intel:
        record_file = gatherer.save_intelligence_package(record_intel, "congressional_record")
        print(f"   ✅ {len(record_intel)} record items saved: {record_file.name}")

    # Generate legislative intelligence summary
    all_items = legislation + committee_intel + record_intel
    if all_items:
        print(f"\n📊 Generating legislative intelligence summary...")
        summary = gatherer.generate_legislative_intelligence_summary(all_items)

        summary_file = gatherer.cache_dir / f"legislative_intelligence_summary_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(f"   ✅ Legislative summary generated: {summary_file.name}")

    print(f"\n🎯 Congressional intelligence gathering complete!")
    print(f"   Total items analyzed: {len(all_items)}")
    print(f"   Cache directory: {gatherer.cache_dir}")
    print(f"\n💡 Includes CRS-quality analysis and legislative intelligence")

if __name__ == "__main__":
    main()