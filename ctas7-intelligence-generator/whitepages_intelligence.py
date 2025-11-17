#!/usr/bin/env python3
"""
WhitePages Intelligence Integration
Person-based OSINT for terrorism investigations and threat analysis
"""

import asyncio
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os
import sqlite3
import re
from playwright.async_api import async_playwright
from urllib.parse import urljoin, urlparse
import hashlib
import aiofiles

class WhitePagesIntelligence:
    def __init__(self):
        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Credentials
        self.username = os.getenv("WHITEPAGES_USERNAME")
        self.password = os.getenv("WHITEPAGES_PASSWORD")

        # Cache and database setup
        self.cache_dir = Path("whitepages_intelligence")
        self.cache_dir.mkdir(exist_ok=True)
        self.db_path = self.cache_dir / "person_intelligence.db"

        # Screenshots for evidence
        self.evidence_dir = self.cache_dir / "evidence_screenshots"
        self.evidence_dir.mkdir(exist_ok=True)

        # Initialize database
        self.init_database()

        # Intelligence focus areas for person research
        self.intelligence_focus = {
            "terrorism_indicators": [
                "multiple identities", "frequent moves", "cash transactions",
                "foreign travel", "associates", "criminal history"
            ],
            "network_analysis": [
                "family members", "known associates", "shared addresses",
                "business connections", "phone connections", "email patterns"
            ],
            "location_intelligence": [
                "current address", "previous addresses", "travel patterns",
                "property ownership", "business locations", "geographical clusters"
            ],
            "identity_verification": [
                "name variations", "aliases", "age verification",
                "social security", "identity consistency", "document verification"
            ]
        }

    def init_database(self):
        """Initialize person intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Person profiles and intelligence
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS person_profiles (
                profile_id TEXT PRIMARY KEY,
                search_name TEXT,
                full_name TEXT,
                age INTEGER,
                current_address TEXT,
                current_city TEXT,
                current_state TEXT,
                phone_numbers TEXT,
                email_addresses TEXT,
                previous_addresses TEXT,
                associates TEXT,
                criminal_background TEXT,
                intelligence_assessment TEXT,
                threat_level TEXT,
                network_connections TEXT,
                abe_analysis TEXT,
                last_updated TEXT,
                search_context TEXT,
                evidence_screenshot TEXT
            )
        ''')

        # Address intelligence and patterns
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS address_intelligence (
                address_id TEXT PRIMARY KEY,
                full_address TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                property_type TEXT,
                residents_count INTEGER,
                residents_list TEXT,
                suspicious_indicators TEXT,
                intelligence_value TEXT,
                last_analyzed TEXT
            )
        ''')

        # Phone number intelligence
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS phone_intelligence (
                phone_id TEXT PRIMARY KEY,
                phone_number TEXT,
                phone_type TEXT,
                carrier TEXT,
                registered_name TEXT,
                associated_addresses TEXT,
                associated_persons TEXT,
                intelligence_flags TEXT,
                last_checked TEXT
            )
        ''')

        # Network analysis and connections
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS network_connections (
                connection_id TEXT PRIMARY KEY,
                person_a TEXT,
                person_b TEXT,
                connection_type TEXT,
                connection_strength REAL,
                shared_addresses TEXT,
                shared_phones TEXT,
                relationship_type TEXT,
                intelligence_significance TEXT,
                discovery_date TEXT
            )
        ''')

        # Search history and intelligence queries
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS search_history (
                search_id TEXT PRIMARY KEY,
                search_query TEXT,
                search_type TEXT,
                results_count INTEGER,
                intelligence_hits INTEGER,
                search_context TEXT,
                search_date TEXT,
                success_rate REAL
            )
        ''')

        conn.commit()
        conn.close()

    async def authenticate_whitepages(self, page):
        """Authenticate with WhitePages using provided credentials"""
        try:
            print("🔐 Authenticating with WhitePages...")

            await page.goto('https://www.whitepages.com/login')
            await page.wait_for_load_state('networkidle')

            # Fill login form
            await page.fill('input[name="username"], input[type="email"]', self.username)
            await page.fill('input[name="password"], input[type="password"]', self.password)

            # Submit login
            await page.click('button[type="submit"], input[type="submit"]')
            await page.wait_for_load_state('networkidle')

            # Verify successful login
            if await page.query_selector('.user-menu, .account, .profile'):
                print("   ✅ Authentication successful")
                return True
            else:
                print("   ❌ Authentication failed")
                return False

        except Exception as e:
            print(f"   ❌ Authentication error: {e}")
            return False

    async def search_person_intelligence(self, page, search_query, context="general"):
        """Search for person and extract comprehensive intelligence"""
        try:
            print(f"    🔍 Searching: {search_query}")

            # Navigate to search
            await page.goto('https://www.whitepages.com/name')
            await page.wait_for_load_state('networkidle')

            # Perform search
            await page.fill('input[name="name"], #name', search_query)
            await page.click('button[type="submit"], .search-button')
            await page.wait_for_load_state('networkidle')

            # Extract search results
            results = await self.extract_search_results(page)

            # Process each result for intelligence
            for result in results[:5]:  # Limit to top 5 results
                person_intel = await self.extract_person_intelligence(page, result, context)
                if person_intel:
                    await self.cache_person_intelligence(person_intel)

            return results

        except Exception as e:
            print(f"      ❌ Person search failed: {e}")
            return []

    async def extract_search_results(self, page):
        """Extract search results from WhitePages"""
        try:
            results = await page.evaluate('''
                () => {
                    const results = [];
                    const resultElements = document.querySelectorAll('.result-item, .person-result, .listing');

                    resultElements.forEach(element => {
                        const nameElement = element.querySelector('.name, h3, .person-name');
                        const ageElement = element.querySelector('.age, .person-age');
                        const locationElement = element.querySelector('.location, .address, .city-state');
                        const linkElement = element.querySelector('a[href*="/name/"]');

                        if (nameElement) {
                            results.push({
                                name: nameElement.textContent.trim(),
                                age: ageElement?.textContent.trim() || '',
                                location: locationElement?.textContent.trim() || '',
                                detailUrl: linkElement?.href || ''
                            });
                        }
                    });

                    return results;
                }
            ''')

            return results

        except Exception as e:
            print(f"      ❌ Results extraction failed: {e}")
            return []

    async def extract_person_intelligence(self, page, result, context):
        """Extract detailed intelligence from person profile page"""
        try:
            if not result.get('detailUrl'):
                return None

            await page.goto(result['detailUrl'])
            await page.wait_for_load_state('networkidle')

            # Take evidence screenshot
            screenshot_name = f"person_{hash(result['name'])}_{datetime.now().strftime('%Y%m%d_%H%M')}.png"
            await page.screenshot(path=self.evidence_dir / screenshot_name)

            # Extract comprehensive profile data
            profile_data = await page.evaluate('''
                () => {
                    const profile = {};

                    // Basic information
                    profile.fullName = document.querySelector('.person-name, h1')?.textContent?.trim() || '';
                    profile.age = document.querySelector('.age, .person-age')?.textContent?.trim() || '';

                    // Current address
                    const currentAddressElement = document.querySelector('.current-address, .primary-address');
                    if (currentAddressElement) {
                        profile.currentAddress = currentAddressElement.textContent.trim();
                    }

                    // Phone numbers
                    const phoneElements = document.querySelectorAll('.phone, .phone-number');
                    profile.phoneNumbers = Array.from(phoneElements).map(el => el.textContent.trim());

                    // Previous addresses
                    const previousAddressElements = document.querySelectorAll('.previous-address, .address-history .address');
                    profile.previousAddresses = Array.from(previousAddressElements).map(el => el.textContent.trim());

                    // Associates/relatives
                    const associateElements = document.querySelectorAll('.associate, .relative, .family-member');
                    profile.associates = Array.from(associateElements).map(el => {
                        const name = el.querySelector('.name')?.textContent?.trim() || el.textContent.trim();
                        const relationship = el.querySelector('.relationship')?.textContent?.trim() || '';
                        return { name, relationship };
                    });

                    // Background information
                    const backgroundElement = document.querySelector('.background, .criminal-history');
                    if (backgroundElement) {
                        profile.backgroundInfo = backgroundElement.textContent.trim();
                    }

                    // Property information
                    const propertyElements = document.querySelectorAll('.property, .real-estate');
                    profile.properties = Array.from(propertyElements).map(el => el.textContent.trim());

                    return profile;
                }
            ''')

            # Enhance with original search data
            profile_data.update(result)
            profile_data['searchContext'] = context
            profile_data['evidenceScreenshot'] = str(self.evidence_dir / screenshot_name)

            # ABE intelligence analysis
            intelligence_analysis = await self.analyze_person_threat_level(profile_data)
            profile_data['intelligence_analysis'] = intelligence_analysis

            return profile_data

        except Exception as e:
            print(f"      ❌ Person intelligence extraction failed: {e}")
            return None

    async def analyze_person_threat_level(self, profile_data):
        """Use ABE to analyze person for threat indicators"""
        profile_summary = f"""
        Name: {profile_data.get('fullName', 'Unknown')}
        Age: {profile_data.get('age', 'Unknown')}
        Current Address: {profile_data.get('currentAddress', 'Unknown')}
        Phone Numbers: {profile_data.get('phoneNumbers', [])}
        Previous Addresses: {len(profile_data.get('previousAddresses', []))} locations
        Associates: {len(profile_data.get('associates', []))} known connections
        Background: {profile_data.get('backgroundInfo', 'No background info available')}
        Properties: {profile_data.get('properties', [])}
        """

        prompt = f"""
        Analyze this person profile for terrorism/security threat indicators:

        {profile_summary}

        Assess for:
        1. MOBILITY PATTERNS: Frequent address changes, unusual locations
        2. IDENTITY INDICATORS: Multiple names, identity inconsistencies
        3. NETWORK ANALYSIS: Associates with concerning backgrounds
        4. FINANCIAL PATTERNS: Property ownership, unusual economic activity
        5. BACKGROUND FLAGS: Criminal history, concerning activities
        6. OPERATIONAL SECURITY: Patterns suggesting operational awareness

        Consider:
        - Are there indicators of operational planning?
        - Does the network suggest concerning associations?
        - Are there patterns consistent with terrorist tradecraft?
        - What follow-up intelligence collection is recommended?

        Return as JSON with: threat_level (CRITICAL/HIGH/MEDIUM/LOW), indicators, network_priority, follow_up_recommendations
        """

        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'threat_level': 'LOW',
                    'indicators': response.text[:300],
                    'network_priority': 'Standard',
                    'follow_up_recommendations': 'Standard monitoring'
                }
        except Exception as e:
            return {
                'threat_level': 'UNKNOWN',
                'indicators': f'Analysis failed: {e}',
                'network_priority': 'Manual review required',
                'follow_up_recommendations': 'Manual analysis needed'
            }

    async def analyze_address_intelligence(self, page, address):
        """Deep dive analysis of specific address for intelligence"""
        try:
            print(f"      🏠 Analyzing address: {address}")

            # Search for address
            await page.goto('https://www.whitepages.com/address')
            await page.fill('input[name="address"], #address', address)
            await page.click('button[type="submit"]')
            await page.wait_for_load_state('networkidle')

            # Extract address intelligence
            address_data = await page.evaluate('''
                () => {
                    const data = {};

                    // Property information
                    data.propertyType = document.querySelector('.property-type')?.textContent?.trim() || '';
                    data.propertyValue = document.querySelector('.property-value, .estimated-value')?.textContent?.trim() || '';

                    // Current residents
                    const residentElements = document.querySelectorAll('.resident, .current-resident');
                    data.residents = Array.from(residentElements).map(el => el.textContent.trim());

                    // Previous residents
                    const prevResidentElements = document.querySelectorAll('.previous-resident');
                    data.previousResidents = Array.from(prevResidentElements).map(el => el.textContent.trim());

                    // Neighborhood information
                    data.neighborhood = document.querySelector('.neighborhood, .area-info')?.textContent?.trim() || '';

                    return data;
                }
            ''')

            # ABE analysis for suspicious patterns
            address_intelligence = await self.analyze_address_patterns(address, address_data)
            address_data['intelligence_analysis'] = address_intelligence

            await self.cache_address_intelligence(address, address_data)
            return address_data

        except Exception as e:
            print(f"        ❌ Address analysis failed: {e}")
            return None

    async def analyze_address_patterns(self, address, address_data):
        """Analyze address for suspicious patterns"""
        prompt = f"""
        Analyze this address for suspicious patterns and intelligence indicators:

        Address: {address}
        Property Type: {address_data.get('propertyType', 'Unknown')}
        Current Residents: {len(address_data.get('residents', []))} people
        Previous Residents: {len(address_data.get('previousResidents', []))} historical residents
        Neighborhood: {address_data.get('neighborhood', 'Unknown')}

        Look for:
        1. HIGH TURNOVER: Unusual resident turnover patterns
        2. MULTIPLE OCCUPANTS: Suspicious occupancy patterns
        3. IDENTITY PATTERNS: Multiple identities at same location
        4. OPERATIONAL INDICATORS: Patterns suggesting operational use

        Rate suspicion level: HIGH/MEDIUM/LOW
        Provide specific indicators and recommendations.

        Return as JSON with: suspicion_level, indicators, recommendations
        """

        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'suspicion_level': 'LOW',
                    'indicators': 'Standard residential pattern',
                    'recommendations': 'No special action needed'
                }
        except:
            return {
                'suspicion_level': 'UNKNOWN',
                'indicators': 'Analysis failed',
                'recommendations': 'Manual review required'
            }

    async def build_network_analysis(self, target_persons):
        """Build network analysis from multiple person profiles"""
        print("🕸️ Building Network Analysis...")

        connections = []

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get all person profiles for analysis
        cursor.execute("SELECT * FROM person_profiles WHERE threat_level IN ('HIGH', 'MEDIUM', 'CRITICAL')")
        profiles = cursor.fetchall()

        # Analyze connections between profiles
        for i, profile_a in enumerate(profiles):
            for profile_b in profiles[i+1:]:
                connection_strength = self.calculate_connection_strength(profile_a, profile_b)

                if connection_strength > 0.3:  # Threshold for significant connection
                    connection_data = {
                        'person_a': profile_a[2],  # full_name
                        'person_b': profile_b[2],
                        'connection_strength': connection_strength,
                        'connection_type': self.determine_connection_type(profile_a, profile_b),
                        'intelligence_significance': await self.assess_connection_significance(profile_a, profile_b, connection_strength)
                    }

                    connections.append(connection_data)
                    await self.cache_network_connection(connection_data)

        conn.close()
        return connections

    def calculate_connection_strength(self, profile_a, profile_b):
        """Calculate connection strength between two profiles"""
        strength = 0.0

        # Shared addresses
        addresses_a = json.loads(profile_a[8] or '[]')  # previous_addresses
        addresses_b = json.loads(profile_b[8] or '[]')

        if set(addresses_a) & set(addresses_b):
            strength += 0.4

        # Shared phone numbers
        phones_a = json.loads(profile_a[6] or '[]')  # phone_numbers
        phones_b = json.loads(profile_b[6] or '[]')

        if set(phones_a) & set(phones_b):
            strength += 0.3

        # Name similarity (simple check)
        name_a = profile_a[2].lower() if profile_a[2] else ''
        name_b = profile_b[2].lower() if profile_b[2] else ''

        if any(part in name_b for part in name_a.split() if len(part) > 2):
            strength += 0.2

        return min(strength, 1.0)

    def determine_connection_type(self, profile_a, profile_b):
        """Determine type of connection between profiles"""
        # This would be more sophisticated in production
        if json.loads(profile_a[8] or '[]') and json.loads(profile_b[8] or '[]'):
            if set(json.loads(profile_a[8])) & set(json.loads(profile_b[8])):
                return "shared_address"

        if json.loads(profile_a[6] or '[]') and json.loads(profile_b[6] or '[]'):
            if set(json.loads(profile_a[6])) & set(json.loads(profile_b[6])):
                return "shared_phone"

        return "potential_associate"

    async def assess_connection_significance(self, profile_a, profile_b, strength):
        """Assess intelligence significance of connection"""
        threat_a = profile_a[11]  # threat_level
        threat_b = profile_b[11]

        if strength > 0.7 and (threat_a in ['HIGH', 'CRITICAL'] or threat_b in ['HIGH', 'CRITICAL']):
            return "HIGH_PRIORITY"
        elif strength > 0.5:
            return "MEDIUM_PRIORITY"
        else:
            return "LOW_PRIORITY"

    async def cache_person_intelligence(self, profile_data):
        """Cache person intelligence in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        profile_id = f"wp_{hash(profile_data.get('fullName', '') + profile_data.get('currentAddress', ''))}"

        cursor.execute('''
            INSERT OR REPLACE INTO person_profiles
            (profile_id, search_name, full_name, age, current_address,
             phone_numbers, previous_addresses, associates, intelligence_assessment,
             threat_level, abe_analysis, last_updated, search_context, evidence_screenshot)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            profile_id,
            profile_data.get('name', ''),
            profile_data.get('fullName', ''),
            profile_data.get('age', ''),
            profile_data.get('currentAddress', ''),
            json.dumps(profile_data.get('phoneNumbers', [])),
            json.dumps(profile_data.get('previousAddresses', [])),
            json.dumps(profile_data.get('associates', [])),
            json.dumps(profile_data.get('intelligence_analysis', {})),
            profile_data.get('intelligence_analysis', {}).get('threat_level', 'LOW'),
            json.dumps(profile_data.get('intelligence_analysis', {})),
            datetime.now().isoformat(),
            profile_data.get('searchContext', 'general'),
            profile_data.get('evidenceScreenshot', '')
        ))

        conn.commit()
        conn.close()

    async def cache_address_intelligence(self, address, address_data):
        """Cache address intelligence"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        address_id = f"addr_{hash(address)}"

        cursor.execute('''
            INSERT OR REPLACE INTO address_intelligence
            (address_id, full_address, residents_list, suspicious_indicators,
             intelligence_value, last_analyzed)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            address_id,
            address,
            json.dumps(address_data.get('residents', [])),
            json.dumps(address_data.get('intelligence_analysis', {})),
            address_data.get('intelligence_analysis', {}).get('suspicion_level', 'LOW'),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def cache_network_connection(self, connection_data):
        """Cache network connection analysis"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        connection_id = f"conn_{hash(connection_data['person_a'] + connection_data['person_b'])}"

        cursor.execute('''
            INSERT OR REPLACE INTO network_connections
            (connection_id, person_a, person_b, connection_type,
             connection_strength, intelligence_significance, discovery_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            connection_id,
            connection_data['person_a'],
            connection_data['person_b'],
            connection_data['connection_type'],
            connection_data['connection_strength'],
            connection_data['intelligence_significance'],
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def generate_person_intelligence_report(self, search_queries):
        """Generate comprehensive person intelligence report"""
        print("📋 Generating Person Intelligence Report...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get statistics
        cursor.execute("SELECT COUNT(*) FROM person_profiles")
        total_profiles = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM person_profiles WHERE threat_level IN ('HIGH', 'CRITICAL')")
        high_threat = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM network_connections WHERE intelligence_significance = 'HIGH_PRIORITY'")
        priority_connections = cursor.fetchone()[0]

        conn.close()

        prompt = f"""
        Generate comprehensive WhitePages intelligence report:

        Search Queries: {search_queries}
        Profiles Analyzed: {total_profiles}
        High Threat Individuals: {high_threat}
        Priority Network Connections: {priority_connections}

        Create executive report covering:
        1. THREAT ASSESSMENT: Individual threat levels identified
        2. NETWORK ANALYSIS: Significant connections and associations
        3. PATTERN RECOGNITION: Behavioral and location patterns
        4. OPERATIONAL RECOMMENDATIONS: Follow-up intelligence collection
        5. INTELLIGENCE GAPS: Additional research needed
        6. SECURITY IMPLICATIONS: Threat mitigation recommendations

        Format as professional person intelligence assessment.
        Include specific names and threat indicators found.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Person intelligence report generation failed"

    async def run_person_intelligence_operation(self, target_list, context="terrorism_investigation"):
        """Execute comprehensive person intelligence operation"""
        print("👥 STARTING WHITEPAGES PERSON INTELLIGENCE OPERATION")
        print("=" * 70)

        if not self.username or not self.password:
            print("❌ WhitePages credentials not configured")
            print("   Set WHITEPAGES_USERNAME and WHITEPAGES_PASSWORD environment variables")
            return

        start_time = datetime.now()
        search_queries = target_list if isinstance(target_list, list) else [target_list]

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)  # Visible for login
            page = await browser.new_page()

            try:
                # Phase 1: Authentication
                print("\n[1/4] Authenticating with WhitePages...")
                if not await self.authenticate_whitepages(page):
                    print("❌ Authentication failed")
                    return

                # Phase 2: Person Intelligence Gathering
                print("\n[2/4] Gathering Person Intelligence...")
                for target in search_queries:
                    await self.search_person_intelligence(page, target, context)
                    await asyncio.sleep(3)  # Rate limiting

                # Phase 3: Network Analysis
                print("\n[3/4] Building Network Analysis...")
                network_connections = await self.build_network_analysis(search_queries)

                # Phase 4: Generate Report
                print("\n[4/4] Generating Intelligence Report...")
                report = await self.generate_person_intelligence_report(search_queries)

                # Save report
                report_file = self.cache_dir / f"person_intelligence_report_{datetime.now().strftime('%Y%m%d_%H%M')}.txt"
                async with aiofiles.open(report_file, 'w') as f:
                    await f.write(report)

                elapsed = datetime.now() - start_time

                print(f"\n✅ PERSON INTELLIGENCE OPERATION COMPLETE")
                print(f"   Duration: {elapsed}")
                print(f"   Targets Researched: {len(search_queries)}")
                print(f"   Network Connections: {len(network_connections)}")
                print(f"   Report: {report_file}")
                print(f"   Database: {self.db_path}")
                print(f"   Evidence: {self.evidence_dir}")

                return {
                    'report_file': report_file,
                    'database_path': self.db_path,
                    'evidence_dir': self.evidence_dir,
                    'targets_researched': len(search_queries),
                    'network_connections': len(network_connections),
                    'duration': str(elapsed)
                }

            finally:
                await browser.close()

def main():
    """Demo WhitePages intelligence operation"""
    # Example target list - replace with actual investigation targets
    target_list = [
        "John Smith Boston",
        "Mohammed Ahmed Michigan",
        "Sarah Johnson Virginia"
    ]

    whitepages = WhitePagesIntelligence()
    result = asyncio.run(whitepages.run_person_intelligence_operation(
        target_list,
        context="terrorism_investigation"
    ))

    print(f"\n💡 WHITEPAGES INTELLIGENCE CAPABILITIES:")
    print("   • Authenticated access to comprehensive person data")
    print("   • Threat level assessment with ABE analysis")
    print("   • Network connection analysis and mapping")
    print("   • Address intelligence and pattern recognition")
    print("   • Evidence collection with screenshots")
    print("   • Integration with broader intelligence pipeline")

if __name__ == "__main__":
    main()