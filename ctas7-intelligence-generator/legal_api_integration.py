#!/usr/bin/env python3
"""
Legal Case API Integration for CTAS7-TT-Narrative
Integrates PACER and CourtListener APIs for real terrorism prosecution data
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime, timedelta
from pathlib import Path
import google.generativeai as genai

class LegalCaseHarvester:
    def __init__(self):
        # CourtListener API
        self.courtlistener_base = "https://www.courtlistener.com/api/rest/v3"
        self.courtlistener_token = os.getenv("COURTLISTENER_API_TOKEN")

        # PACER credentials (if available)
        self.pacer_username = os.getenv("PACER_USERNAME")
        self.pacer_password = os.getenv("PACER_PASSWORD")

        # ABE for analysis
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        self.cache_dir = Path("legal_case_cache")
        self.cache_dir.mkdir(exist_ok=True)

    async def search_terrorism_cases(self, session, keywords):
        """Search CourtListener for terrorism-related cases"""
        url = f"{self.courtlistener_base}/search/"

        headers = {
            "Authorization": f"Token {self.courtlistener_token}",
            "Content-Type": "application/json"
        }

        params = {
            "type": "o",  # Opinions
            "q": f"terrorism OR {' OR '.join(keywords)}",
            "order_by": "dateFiled desc",
            "format": "json"
        }

        async with session.get(url, headers=headers, params=params) as response:
            if response.status == 200:
                return await response.json()
            else:
                print(f"CourtListener API error: {response.status}")
                return None

    async def get_case_details(self, session, case_id):
        """Get detailed case information"""
        url = f"{self.courtlistener_base}/opinions/{case_id}/"

        headers = {
            "Authorization": f"Token {self.courtlistener_token}",
        }

        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                return await response.json()
            return None

    async def analyze_case_with_abe(self, case_data):
        """Use ABE to extract intelligence from case documents"""
        prompt = f"""
        Analyze this terrorism prosecution case for intelligence value:

        Case: {case_data.get('case_name', 'Unknown')}
        Date: {case_data.get('date_filed', 'Unknown')}
        Court: {case_data.get('court', 'Unknown')}

        Extract and categorize:
        1. TTL PHASE MAPPING: Which terrorist task list phases does this case demonstrate?
        2. METHODS USED: Specific tactics, techniques, procedures
        3. NETWORK ANALYSIS: Co-conspirators, organizational structure
        4. FINANCIAL FLOWS: Funding sources, money laundering methods
        5. OPERATIONAL SECURITY: How they avoided detection
        6. FAILURE POINTS: Where law enforcement disrupted operations
        7. SENTENCING DATA: Legal consequences and precedents

        Focus on actionable intelligence for counterterrorism analysis.
        """

        response = await self.model.generate_content_async(prompt)
        return response.text

    async def harvest_hezbollah_cases(self):
        """Specific search for Hezbollah prosecutions"""
        keywords = [
            "Hezbollah",
            "Unit 3800",
            "Islamic Jihad",
            "Iran IRGC",
            "Lebanon",
            "money laundering terrorism",
            "cocaine terrorism financing"
        ]

        async with aiohttp.ClientSession() as session:
            results = await self.search_terrorism_cases(session, keywords)

            if not results:
                return []

            cases = []
            for case in results.get('results', [])[:10]:  # Limit to recent cases
                details = await self.get_case_details(session, case['id'])
                if details:
                    analysis = await self.analyze_case_with_abe(details)
                    cases.append({
                        'case_data': details,
                        'abe_analysis': analysis,
                        'relevance': 'hezbollah_operations'
                    })

            return cases

    async def harvest_domestic_terror_cases(self):
        """Search domestic terrorism prosecutions"""
        keywords = [
            "domestic terrorism",
            "white supremacist",
            "militia movement",
            "synagogue bombing",
            "federal building attack",
            "mass shooting conspiracy"
        ]

        async with aiohttp.ClientSession() as session:
            results = await self.search_terrorism_cases(session, keywords)

            if not results:
                return []

            cases = []
            for case in results.get('results', [])[:10]:
                details = await self.get_case_details(session, case['id'])
                if details:
                    analysis = await self.analyze_case_with_abe(details)
                    cases.append({
                        'case_data': details,
                        'abe_analysis': analysis,
                        'relevance': 'domestic_terrorism'
                    })

            return cases

    async def harvest_state_sponsored_cases(self):
        """Search state-sponsored terrorism cases"""
        keywords = [
            "Iran terrorism",
            "China espionage",
            "Russia intelligence",
            "North Korea cyber",
            "foreign agent registration",
            "state sponsored terrorism"
        ]

        async with aiohttp.ClientSession() as session:
            results = await self.search_terrorism_cases(session, keywords)

            if not results:
                return []

            cases = []
            for case in results.get('results', [])[:15]:
                details = await self.get_case_details(session, case['id'])
                if details:
                    analysis = await self.analyze_case_with_abe(details)
                    cases.append({
                        'case_data': details,
                        'abe_analysis': analysis,
                        'relevance': 'state_sponsored'
                    })

            return cases

    async def generate_network_graphs(self, cases):
        """Generate network analysis from case data"""
        prompt = f"""
        Create network relationship data for visualization from these {len(cases)} terrorism cases.

        Generate JSON data for:
        1. NODES: People, organizations, locations, financial entities
        2. EDGES: Relationships, funding flows, communication links
        3. CLUSTERS: Operational cells, financial networks, geographic regions

        Format for graph visualization libraries (D3.js, Cytoscape, etc.)
        Include node properties: type, importance, risk_level, activity_dates
        Include edge properties: relationship_type, strength, evidence_source
        """

        response = await self.model.generate_content_async(prompt)
        return response.text

    def save_intelligence_package(self, data, category):
        """Save harvested intelligence"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{category}_intelligence_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

async def main():
    print("🏛️  Legal Case Harvester for CTAS7-TT-Narrative")
    print("=" * 60)

    if not os.getenv("COURTLISTENER_API_TOKEN"):
        print("❌ COURTLISTENER_API_TOKEN not set")
        print("   Get token at: https://www.courtlistener.com/api/")
        return

    harvester = LegalCaseHarvester()

    # Harvest different categories
    print("\n📊 Harvesting Hezbollah prosecution cases...")
    hezbollah_cases = await harvester.harvest_hezbollah_cases()
    hezbollah_file = harvester.save_intelligence_package(hezbollah_cases, "hezbollah")
    print(f"   ✅ {len(hezbollah_cases)} cases saved to {hezbollah_file}")

    print("\n📊 Harvesting domestic terrorism cases...")
    domestic_cases = await harvester.harvest_domestic_terror_cases()
    domestic_file = harvester.save_intelligence_package(domestic_cases, "domestic")
    print(f"   ✅ {len(domestic_cases)} cases saved to {domestic_file}")

    print("\n📊 Harvesting state-sponsored cases...")
    state_cases = await harvester.harvest_state_sponsored_cases()
    state_file = harvester.save_intelligence_package(state_cases, "state_sponsored")
    print(f"   ✅ {len(state_cases)} cases saved to {state_file}")

    # Generate network analysis
    all_cases = hezbollah_cases + domestic_cases + state_cases
    if all_cases:
        print("\n🕸️  Generating network relationship graphs...")
        network_data = await harvester.generate_network_graphs(all_cases)
        network_file = harvester.save_intelligence_package(
            {"network_analysis": network_data}, "network_graphs"
        )
        print(f"   ✅ Network data saved to {network_file}")

    print(f"\n🎯 Intelligence harvest complete!")
    print(f"   Total cases processed: {len(all_cases)}")
    print(f"   Ready for CTAS7-TT-Narrative integration")

if __name__ == "__main__":
    asyncio.run(main())