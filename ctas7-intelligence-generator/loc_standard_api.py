#!/usr/bin/env python3
"""
Library of Congress Standard API Integration
Simple, normal API access for intelligence gathering
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime
import google.generativeai as genai
import os

class LOCIntelligenceGatherer:
    def __init__(self):
        self.base_url = "https://www.loc.gov"

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Output directory
        self.cache_dir = Path("loc_intelligence_cache")
        self.cache_dir.mkdir(exist_ok=True)

        # Rate limiting (respect LOC servers)
        self.request_delay = 1.0  # 1 second between requests

    def search_items(self, query, format_type="json", count=25):
        """Search LOC items with normal API calls"""
        url = f"{self.base_url}/search/"

        params = {
            'q': query,
            'fo': format_type,
            'c': count,
            'at': 'results'
        }

        try:
            response = requests.get(url, params=params)
            time.sleep(self.request_delay)  # Rate limiting

            if response.status_code == 200:
                return response.json()
            else:
                print(f"API Error: {response.status_code}")
                return None

        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def get_item_details(self, item_url):
        """Get detailed information about specific item"""
        # Convert to API URL
        api_url = item_url.replace('www.loc.gov/item/', 'www.loc.gov/item/') + '?fo=json'

        try:
            response = requests.get(api_url)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Failed to get item details: {e}")
            return None

    def search_terrorism_materials(self):
        """Search for terrorism-related materials"""
        search_terms = [
            "terrorism",
            "counterterrorism",
            "homeland security",
            "national security",
            "September 11",
            "al-Qaeda",
            "ISIS",
            "Hezbollah",
            "Iran terrorism",
            "domestic terrorism"
        ]

        all_results = []

        for term in search_terms:
            print(f"Searching for: {term}")

            results = self.search_items(term, count=50)
            if results and 'results' in results:
                for item in results['results']:
                    item['search_term'] = term
                    all_results.append(item)

            time.sleep(self.request_delay)

        print(f"Found {len(all_results)} terrorism-related items")
        return all_results

    def analyze_with_abe(self, item_data):
        """Analyze LOC materials with ABE"""
        prompt = f"""
        Analyze this Library of Congress item for terrorism intelligence value:

        Title: {item_data.get('title', 'Unknown')}
        Date: {item_data.get('date', 'Unknown')}
        Type: {item_data.get('original_format', 'Unknown')}
        Description: {item_data.get('description', 'No description')}

        Extract intelligence value:
        1. Historical context and significance
        2. Relevance to current threat analysis
        3. Policy implications and lessons
        4. Visual/documentary evidence value
        5. Research and academic insights
        6. Government assessment quality

        Rate intelligence value: HIGH/MEDIUM/LOW
        Provide specific reasons for rating.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"ABE analysis failed: {e}")
            return "Analysis failed"

    def gather_government_reports(self):
        """Specifically search for government terrorism reports"""
        gov_queries = [
            "FBI terrorism report",
            "DHS threat assessment",
            "CIA terrorism analysis",
            "NSC national security",
            "Congressional terrorism hearing",
            "GAO terrorism study",
            "State Department terrorism report"
        ]

        government_materials = []

        for query in gov_queries:
            print(f"Searching government materials: {query}")

            results = self.search_items(query, count=25)
            if results and 'results' in results:
                for item in results['results']:
                    # Filter for likely government sources
                    if any(gov_term in item.get('title', '').lower() for gov_term in
                          ['fbi', 'dhs', 'cia', 'congress', 'gao', 'state department', 'nsc']):

                        # Get detailed information
                        details = self.get_item_details(item.get('id', ''))
                        if details:
                            item.update(details)

                        # Analyze with ABE
                        analysis = self.analyze_with_abe(item)
                        item['abe_analysis'] = analysis

                        government_materials.append(item)

        print(f"Found {len(government_materials)} government terrorism materials")
        return government_materials

    def gather_historical_incidents(self):
        """Search for historical terrorism incident documentation"""
        historical_queries = [
            "Oklahoma City bombing",
            "World Trade Center 1993",
            "USS Cole bombing",
            "embassy bombings Africa",
            "anthrax attacks 2001",
            "Boston Marathon bombing",
            "San Bernardino attack"
        ]

        historical_materials = []

        for incident in historical_queries:
            print(f"Searching historical incident: {incident}")

            results = self.search_items(incident, count=30)
            if results and 'results' in results:
                for item in results['results']:
                    # Get details and analyze
                    details = self.get_item_details(item.get('id', ''))
                    if details:
                        item.update(details)

                    analysis = self.analyze_with_abe(item)
                    item['abe_analysis'] = analysis
                    item['incident_category'] = incident

                    historical_materials.append(item)

        print(f"Found {len(historical_materials)} historical incident materials")
        return historical_materials

    def save_intelligence_package(self, data, category):
        """Save intelligence data to cache"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"loc_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("📚 Library of Congress Intelligence Gatherer")
    print("=" * 50)

    gatherer = LOCIntelligenceGatherer()

    # Gather different types of intelligence
    print("\n🔍 Gathering general terrorism materials...")
    general_materials = gatherer.search_terrorism_materials()
    general_file = gatherer.save_intelligence_package(general_materials, "general_terrorism")
    print(f"✅ Saved: {general_file}")

    print("\n🏛️ Gathering government reports...")
    government_materials = gatherer.gather_government_reports()
    gov_file = gatherer.save_intelligence_package(government_materials, "government_reports")
    print(f"✅ Saved: {gov_file}")

    print("\n📅 Gathering historical incident materials...")
    historical_materials = gatherer.gather_historical_incidents()
    hist_file = gatherer.save_intelligence_package(historical_materials, "historical_incidents")
    print(f"✅ Saved: {hist_file}")

    total_items = len(general_materials) + len(government_materials) + len(historical_materials)
    print(f"\n🎯 Intelligence gathering complete!")
    print(f"   Total items processed: {total_items}")
    print(f"   Cache directory: {gatherer.cache_dir}")
    print(f"   Ready for CTAS7-TT-Narrative integration")

if __name__ == "__main__":
    main()