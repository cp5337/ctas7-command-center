#!/usr/bin/env python3
"""
LOC Microservices API Integration
Purpose-built endpoints for precise intelligence gathering
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime
import google.generativeai as genai
import os

class LOCMicroservicesIntelligence:
    def __init__(self):
        # LOC Microservices base URLs
        self.microservices_base = "https://www.loc.gov/apis"

        # Specific microservice endpoints
        self.endpoints = {
            'search': f"{self.microservices_base}/search",
            'item': f"{self.microservices_base}/item",
            'collection': f"{self.microservices_base}/collection",
            'resource': f"{self.microservices_base}/resource",
            'suggest': f"{self.microservices_base}/suggest"
        }

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Output cache
        self.cache_dir = Path("loc_microservices_cache")
        self.cache_dir.mkdir(exist_ok=True)

        # Rate limiting
        self.request_delay = 0.5  # Microservices may handle higher rates

    def search_microservice(self, query, filters=None, format_type="json"):
        """Use LOC search microservice for targeted queries"""
        url = f"{self.microservices_base}/search/"

        params = {
            'q': query,
            'fo': format_type
        }

        # Add filters for specific content types
        if filters:
            params.update(filters)

        try:
            response = requests.get(url, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            else:
                print(f"Search microservice error: {response.status_code}")
                return None

        except Exception as e:
            print(f"Search microservice request failed: {e}")
            return None

    def get_item_microservice(self, item_id):
        """Get detailed item data using item microservice"""
        url = f"{self.microservices_base}/item/{item_id}/"

        params = {
            'fo': 'json'
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Item microservice request failed: {e}")
            return None

    def suggest_microservice(self, partial_query):
        """Use suggest microservice for query optimization"""
        url = f"{self.microservices_base}/suggest/"

        params = {
            'q': partial_query,
            'fo': 'json'
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            time.sleep(self.request_delay)

            if response.status_code == 200:
                return response.json()
            return None

        except Exception as e:
            print(f"Suggest microservice request failed: {e}")
            return None

    def search_terrorism_intelligence(self, intelligence_requirement):
        """Targeted terrorism intelligence using microservices"""

        # Generate optimized search queries using ABE
        search_strategies = self.generate_microservice_queries(intelligence_requirement)

        intelligence_items = []

        for strategy in search_strategies:
            query = strategy['query']
            filters = strategy.get('filters', {})

            print(f"  🔍 Microservice query: {query}")

            # Use search microservice
            results = self.search_microservice(query, filters)

            if results and 'results' in results:
                for item in results['results']:
                    # Get detailed information using item microservice
                    if 'id' in item:
                        detailed_item = self.get_item_microservice(item['id'])
                        if detailed_item:
                            item.update(detailed_item)

                    # ABE intelligence assessment
                    intelligence_value = self.assess_item_intelligence(item, intelligence_requirement)
                    item['intelligence_assessment'] = intelligence_value
                    item['query_strategy'] = strategy

                    if intelligence_value in ['HIGH', 'MEDIUM']:
                        intelligence_items.append(item)

            time.sleep(self.request_delay)

        return intelligence_items

    def generate_microservice_queries(self, intelligence_requirement):
        """Generate optimized queries for LOC microservices"""
        prompt = f"""
        Generate optimized Library of Congress microservice queries for: "{intelligence_requirement}"

        Create 5 specific search strategies with:
        1. QUERY: Specific search terms
        2. FILTERS: Content type filters (books, serials, maps, visual materials, etc.)
        3. RATIONALE: Why this approach finds relevant intelligence

        Focus on:
        - Government publications (FBI, CIA, DHS, Congress, GAO)
        - Academic terrorism research
        - Historical incident documentation
        - Policy analysis and threat assessments
        - Visual/map intelligence

        Return as JSON array with query, filters, and rationale for each strategy.
        """

        try:
            response = self.model.generate_content(prompt)
            # Extract JSON from response
            import re
            json_match = re.search(r'\[.*?\]', response.text, re.DOTALL)
            if json_match:
                strategies = json.loads(json_match.group())
                return strategies
            else:
                # Fallback strategies
                return [
                    {
                        "query": intelligence_requirement,
                        "filters": {"original_format": "book"},
                        "rationale": "Government publications and reports"
                    },
                    {
                        "query": f"{intelligence_requirement} terrorism",
                        "filters": {"original_format": "serial"},
                        "rationale": "Government serial publications"
                    }
                ]
        except Exception as e:
            print(f"Query generation failed: {e}")
            return [{"query": intelligence_requirement, "filters": {}}]

    def assess_item_intelligence(self, item, requirement):
        """Assess intelligence value of specific item"""
        prompt = f"""
        Rate the intelligence value of this LOC item for requirement: "{requirement}"

        Title: {item.get('title', 'Unknown')}
        Date: {item.get('date', 'Unknown')}
        Type: {item.get('original_format', 'Unknown')}
        Description: {item.get('description', 'No description')[:300]}
        Subject: {item.get('subject', [])}

        Consider:
        1. Government/official source authority
        2. Relevance to current threat landscape
        3. Historical significance and lessons
        4. Actionable intelligence content
        5. Policy and operational insights

        Rate as: HIGH, MEDIUM, or LOW
        Return only the rating.
        """

        try:
            response = self.model.generate_content(prompt)
            rating = response.text.strip().upper()
            return rating if rating in ['HIGH', 'MEDIUM', 'LOW'] else 'LOW'
        except:
            return 'LOW'

    def gather_government_terrorism_reports(self):
        """Specifically gather government terrorism reports using microservices"""
        government_queries = [
            {
                "requirement": "FBI terrorism assessments",
                "query": "FBI terrorism threat assessment",
                "filters": {"original_format": ["book", "serial"]}
            },
            {
                "requirement": "DHS intelligence reports",
                "query": "Department Homeland Security terrorism",
                "filters": {"original_format": ["book", "serial"]}
            },
            {
                "requirement": "Congressional terrorism hearings",
                "query": "Congress terrorism hearing",
                "filters": {"original_format": ["book", "serial"]}
            },
            {
                "requirement": "GAO terrorism studies",
                "query": "Government Accountability Office terrorism",
                "filters": {"original_format": "book"}
            }
        ]

        all_intelligence = []

        for gov_query in government_queries:
            print(f"\n📋 Gathering: {gov_query['requirement']}")

            results = self.search_microservice(
                gov_query['query'],
                gov_query['filters']
            )

            if results and 'results' in results:
                for item in results['results'][:10]:  # Limit results
                    # Get detailed info
                    if 'id' in item:
                        detailed = self.get_item_microservice(item['id'])
                        if detailed:
                            item.update(detailed)

                    # Assess intelligence value
                    value = self.assess_item_intelligence(item, gov_query['requirement'])
                    if value in ['HIGH', 'MEDIUM']:
                        item['intelligence_assessment'] = value
                        item['source_category'] = gov_query['requirement']
                        all_intelligence.append(item)

        return all_intelligence

    def gather_historical_incident_intelligence(self):
        """Gather historical terrorism incident documentation"""
        historical_incidents = [
            "September 11 attacks documentation",
            "Oklahoma City bombing investigation",
            "Boston Marathon bombing analysis",
            "USS Cole bombing report",
            "1993 World Trade Center bombing",
            "embassy bombings East Africa"
        ]

        historical_intelligence = []

        for incident in historical_incidents:
            print(f"\n📅 Historical incident: {incident}")

            # Use suggest microservice to optimize query
            suggestions = self.suggest_microservice(incident)

            # Use best suggestion or original query
            if suggestions and 'terms' in suggestions:
                query = suggestions['terms'][0] if suggestions['terms'] else incident
            else:
                query = incident

            results = self.search_microservice(
                query,
                {"original_format": ["book", "serial", "visual"]}
            )

            if results and 'results' in results:
                for item in results['results'][:8]:
                    if 'id' in item:
                        detailed = self.get_item_microservice(item['id'])
                        if detailed:
                            item.update(detailed)

                    value = self.assess_item_intelligence(item, incident)
                    if value in ['HIGH', 'MEDIUM']:
                        item['intelligence_assessment'] = value
                        item['incident_category'] = incident
                        historical_intelligence.append(item)

        return historical_intelligence

    def save_intelligence_package(self, data, category):
        """Save microservices intelligence data"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"microservices_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("🔧 LOC Microservices Intelligence Gatherer")
    print("=" * 50)

    intelligence = LOCMicroservicesIntelligence()

    # Test specific intelligence requirements
    requirements = [
        "Hezbollah financial operations United States",
        "Iranian Quds Force assassination attempts",
        "Chinese intelligence operations cyber terrorism",
        "Russian disinformation terrorism threats"
    ]

    for requirement in requirements:
        print(f"\n🎯 Intelligence Requirement: {requirement}")

        items = intelligence.search_terrorism_intelligence(requirement)

        if items:
            # Save intelligence package
            filename = intelligence.save_intelligence_package(items,
                requirement.replace(' ', '_')[:20])
            print(f"   ✅ {len(items)} intelligence items saved: {filename.name}")
        else:
            print(f"   ❌ No high-value intelligence found")

    # Gather government reports
    print(f"\n🏛️ Gathering government terrorism reports...")
    gov_reports = intelligence.gather_government_terrorism_reports()
    if gov_reports:
        gov_file = intelligence.save_intelligence_package(gov_reports, "government_reports")
        print(f"   ✅ {len(gov_reports)} government reports saved: {gov_file.name}")

    # Gather historical incidents
    print(f"\n📚 Gathering historical incident intelligence...")
    historical = intelligence.gather_historical_incident_intelligence()
    if historical:
        hist_file = intelligence.save_intelligence_package(historical, "historical_incidents")
        print(f"   ✅ {len(historical)} historical items saved: {hist_file.name}")

    print(f"\n🎯 Microservices intelligence gathering complete!")
    print(f"   Cache directory: {intelligence.cache_dir}")

if __name__ == "__main__":
    main()