#!/usr/bin/env python3
"""
GSA Government Contracting Intelligence
Security-related procurement patterns and threat response indicators
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os
import sqlite3
import re
from urllib.parse import urljoin, urlparse

class GSAContractingIntelligence:
    def __init__(self):
        # GSA API endpoints
        self.gsa_base = "https://api.gsa.gov/opportunities/v1"
        self.api_key = os.getenv("GSA_API_KEY")  # Optional for public API

        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Database setup
        self.cache_dir = Path("gsa_contracting_intelligence")
        self.cache_dir.mkdir(exist_ok=True)
        self.db_path = self.cache_dir / "gsa_intelligence.db"

        self.init_database()

        # Request headers
        self.headers = {
            'Accept': 'application/json',
            'User-Agent': 'CTAS7-Intelligence/1.0'
        }
        if self.api_key:
            self.headers['X-API-Key'] = self.api_key

        # Rate limiting
        self.request_delay = 1.0

        # Security-related contracting keywords
        self.security_keywords = {
            "Counterterrorism": [
                "counterterrorism", "counter-terrorism", "terrorism prevention",
                "terrorist threat", "anti-terrorism", "homeland security"
            ],
            "Cybersecurity": [
                "cybersecurity", "cyber security", "information security",
                "network security", "cyber defense", "cyber threat"
            ],
            "Intelligence": [
                "intelligence analysis", "threat intelligence", "OSINT",
                "intelligence community", "classified systems", "SCIF"
            ],
            "Physical_Security": [
                "physical security", "access control", "perimeter security",
                "surveillance systems", "security screening", "metal detection"
            ],
            "Critical_Infrastructure": [
                "critical infrastructure", "infrastructure protection",
                "SCADA security", "industrial control", "power grid"
            ],
            "Border_Security": [
                "border security", "customs", "immigration enforcement",
                "port security", "maritime security", "aviation security"
            ],
            "Emergency_Response": [
                "emergency response", "crisis management", "disaster recovery",
                "continuity of operations", "COOP", "emergency communications"
            ],
            "Surveillance_Technology": [
                "surveillance", "monitoring systems", "facial recognition",
                "biometric", "video analytics", "sensor networks"
            ]
        }

    def init_database(self):
        """Initialize GSA contracting intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS security_contracts (
                contract_id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                agency TEXT,
                office TEXT,
                posted_date TEXT,
                response_deadline TEXT,
                contract_value TEXT,
                naics_code TEXT,
                set_aside TEXT,
                keywords_matched TEXT,
                security_category TEXT,
                threat_relevance TEXT,
                abe_analysis TEXT,
                intelligence_value TEXT,
                collection_date TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agency_spending_patterns (
                agency_name TEXT,
                security_category TEXT,
                contract_count INTEGER,
                total_estimated_value REAL,
                average_contract_value REAL,
                last_updated TEXT,
                PRIMARY KEY (agency_name, security_category)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vendor_intelligence (
                vendor_name TEXT PRIMARY KEY,
                security_categories TEXT,
                contract_count INTEGER,
                total_contract_value REAL,
                agencies_worked_with TEXT,
                capabilities_analysis TEXT,
                last_updated TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def search_security_contracts(self, keywords, limit=50):
        """Search GSA opportunities for security-related contracts"""
        all_contracts = []

        for keyword in keywords[:5]:  # Limit API calls
            print(f"    🔍 Searching GSA contracts for: {keyword}")

            url = f"{self.gsa_base}/search"
            params = {
                'q': keyword,
                'limit': limit,
                'offset': 0,
                'postedFrom': (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')  # Last 90 days
            }

            try:
                response = requests.get(url, headers=self.headers, params=params, timeout=30)
                time.sleep(self.request_delay)

                if response.status_code == 200:
                    data = response.json()

                    for contract in data.get('_embedded', {}).get('opportunities', []):
                        # Check if this contract is security-related
                        contract_text = f"{contract.get('title', '')} {contract.get('description', '')}"
                        security_categories = self.categorize_security_contract(contract_text)

                        if security_categories:
                            contract['security_categories'] = security_categories
                            contract['search_keyword'] = keyword
                            all_contracts.append(contract)

                else:
                    print(f"      ⚠️ GSA API error: {response.status_code}")

            except Exception as e:
                print(f"      ❌ GSA search failed for {keyword}: {e}")

        return all_contracts

    def categorize_security_contract(self, contract_text):
        """Categorize contract by security type"""
        contract_lower = contract_text.lower()
        categories = {}

        for category, keywords in self.security_keywords.items():
            matches = []
            for keyword in keywords:
                if keyword.lower() in contract_lower:
                    matches.append(keyword)

            if matches:
                categories[category] = matches

        return categories if categories else None

    def analyze_contract_intelligence_value(self, contract):
        """Use ABE to analyze intelligence value of government contract"""
        title = contract.get('title', 'Unknown')
        description = contract.get('description', 'No description')[:1000]
        agency = contract.get('fullParentPathName', 'Unknown Agency')
        security_categories = contract.get('security_categories', {})

        prompt = f"""
        Analyze this government security contract for intelligence value:

        Title: {title}
        Agency: {agency}
        Description: {description}
        Security Categories: {list(security_categories.keys())}

        Assess:
        1. THREAT RESPONSE: What threats is this contract addressing?
        2. CAPABILITY GAPS: What security gaps does this reveal?
        3. TECHNOLOGY TRENDS: What new security technologies are being acquired?
        4. BUDGET PRIORITIES: What does this indicate about agency priorities?
        5. THREAT INTELLIGENCE: What threat intelligence can be inferred?
        6. OPERATIONAL INSIGHTS: What operational capabilities are being enhanced?

        Rate intelligence value: HIGH/MEDIUM/LOW
        Identify specific threat indicators and capability insights.

        Return as JSON with: intelligence_value, threat_indicators, capability_insights, budget_implications
        """

        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'intelligence_value': 'MEDIUM',
                    'threat_indicators': response.text[:500],
                    'capability_insights': 'Requires manual review',
                    'budget_implications': 'Analysis incomplete'
                }
        except Exception as e:
            return {
                'intelligence_value': 'UNKNOWN',
                'threat_indicators': f'Analysis failed: {e}',
                'capability_insights': 'Manual review required',
                'budget_implications': 'Unable to assess'
            }

    def gather_counterterrorism_contracts(self):
        """Gather counterterrorism-related government contracts"""
        print("🏛️ Gathering Counterterrorism Contracts...")

        ct_keywords = [
            "counterterrorism", "terrorism prevention", "threat assessment",
            "security screening", "surveillance systems", "intelligence analysis"
        ]

        contracts = self.search_security_contracts(ct_keywords, limit=30)
        high_value_contracts = []

        for contract in contracts:
            # ABE intelligence analysis
            analysis = self.analyze_contract_intelligence_value(contract)
            contract.update(analysis)

            # Filter for high-value intelligence
            if analysis.get('intelligence_value') in ['HIGH', 'MEDIUM']:
                high_value_contracts.append(contract)
                print(f"  ✅ {contract.get('title', 'Unknown')[:60]}... [{analysis['intelligence_value']}]")

                # Cache in database
                self.cache_contract(contract)

        return high_value_contracts

    def gather_cybersecurity_contracts(self):
        """Gather cybersecurity-related government contracts"""
        print("💻 Gathering Cybersecurity Contracts...")

        cyber_keywords = [
            "cybersecurity", "cyber defense", "network security",
            "information security", "cyber threat", "incident response"
        ]

        contracts = self.search_security_contracts(cyber_keywords, limit=25)
        high_value_contracts = []

        for contract in contracts:
            analysis = self.analyze_contract_intelligence_value(contract)
            contract.update(analysis)

            if analysis.get('intelligence_value') in ['HIGH', 'MEDIUM']:
                high_value_contracts.append(contract)
                print(f"  ✅ {contract.get('title', 'Unknown')[:60]}... [{analysis['intelligence_value']}]")
                self.cache_contract(contract)

        return high_value_contracts

    def gather_critical_infrastructure_contracts(self):
        """Gather critical infrastructure protection contracts"""
        print("🏗️ Gathering Critical Infrastructure Contracts...")

        infra_keywords = [
            "critical infrastructure", "infrastructure protection",
            "power grid security", "SCADA security", "industrial control"
        ]

        contracts = self.search_security_contracts(infra_keywords, limit=20)
        high_value_contracts = []

        for contract in contracts:
            analysis = self.analyze_contract_intelligence_value(contract)
            contract.update(analysis)

            if analysis.get('intelligence_value') in ['HIGH', 'MEDIUM']:
                high_value_contracts.append(contract)
                print(f"  ✅ {contract.get('title', 'Unknown')[:60]}... [{analysis['intelligence_value']}]")
                self.cache_contract(contract)

        return high_value_contracts

    def analyze_agency_spending_patterns(self, contracts):
        """Analyze government agency spending patterns"""
        print("📊 Analyzing Agency Spending Patterns...")

        agency_patterns = {}

        for contract in contracts:
            agency = contract.get('fullParentPathName', 'Unknown')
            security_categories = contract.get('security_categories', {})

            if agency not in agency_patterns:
                agency_patterns[agency] = {}

            for category in security_categories.keys():
                if category not in agency_patterns[agency]:
                    agency_patterns[agency][category] = {
                        'contracts': [],
                        'total_value': 0
                    }

                agency_patterns[agency][category]['contracts'].append(contract)

                # Estimate contract value (if available)
                try:
                    value_str = contract.get('award', {}).get('amount', '0')
                    if isinstance(value_str, str):
                        value = float(re.sub(r'[^\d.]', '', value_str))
                    else:
                        value = float(value_str) if value_str else 0
                    agency_patterns[agency][category]['total_value'] += value
                except:
                    pass

        # Store patterns in database
        self.cache_spending_patterns(agency_patterns)
        return agency_patterns

    def cache_contract(self, contract):
        """Cache contract in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        contract_id = contract.get('opportunityId', f"gsa_{hash(contract.get('title', ''))}")

        cursor.execute('''
            INSERT OR REPLACE INTO security_contracts
            (contract_id, title, description, agency, office, posted_date,
             response_deadline, naics_code, keywords_matched, security_category,
             threat_relevance, abe_analysis, intelligence_value, collection_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            contract_id,
            contract.get('title', ''),
            contract.get('description', '')[:1000],  # Truncate description
            contract.get('fullParentPathName', ''),
            contract.get('officeAddress', {}).get('city', ''),
            contract.get('postedDate', ''),
            contract.get('responseDeadLine', ''),
            contract.get('naicsCode', ''),
            json.dumps(contract.get('security_categories', {})),
            ', '.join(contract.get('security_categories', {}).keys()),
            contract.get('threat_indicators', ''),
            json.dumps(contract.get('capability_insights', '')),
            contract.get('intelligence_value', 'UNKNOWN'),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    def cache_spending_patterns(self, patterns):
        """Cache agency spending patterns"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        for agency, categories in patterns.items():
            for category, data in categories.items():
                contract_count = len(data['contracts'])
                total_value = data['total_value']
                avg_value = total_value / contract_count if contract_count > 0 else 0

                cursor.execute('''
                    INSERT OR REPLACE INTO agency_spending_patterns
                    (agency_name, security_category, contract_count,
                     total_estimated_value, average_contract_value, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    agency, category, contract_count,
                    total_value, avg_value, datetime.now().isoformat()
                ))

        conn.commit()
        conn.close()

    def generate_contracting_intelligence_summary(self, all_contracts):
        """Generate executive summary of contracting intelligence"""
        print("📋 Generating Contracting Intelligence Summary...")

        agency_count = len(set(c.get('fullParentPathName', '') for c in all_contracts))
        category_distribution = {}

        for contract in all_contracts:
            for category in contract.get('security_categories', {}).keys():
                category_distribution[category] = category_distribution.get(category, 0) + 1

        prompt = f"""
        Generate executive contracting intelligence summary from {len(all_contracts)} government security contracts:

        Agencies Involved: {agency_count}
        Security Category Distribution: {json.dumps(category_distribution, indent=2)}

        Create summary addressing:
        1. GOVERNMENT SECURITY PRIORITIES: What security areas are receiving funding?
        2. EMERGING THREATS: What new threats do contracts reveal?
        3. CAPABILITY GAPS: What security gaps is government addressing?
        4. TECHNOLOGY TRENDS: What new security technologies are being acquired?
        5. BUDGET ALLOCATION: How is security spending distributed?
        6. THREAT INTELLIGENCE: What threat patterns emerge from contracting data?
        7. OPERATIONAL IMPLICATIONS: What capabilities are being enhanced?

        Format as professional contracting intelligence brief.
        Include specific contract examples and spending patterns.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Contracting intelligence summary generation failed"

    def save_intelligence_package(self, data, category):
        """Save contracting intelligence package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"gsa_contracting_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("🏛️ GSA Government Contracting Intelligence")
    print("=" * 50)
    print("Security procurement patterns and threat response indicators")

    intelligence = GSAContractingIntelligence()

    # Display security categories
    print(f"\n🔍 SECURITY CONTRACT CATEGORIES:")
    for category, keywords in intelligence.security_keywords.items():
        print(f"   {category}: {len(keywords)} keywords")

    # Gather different types of security contracts
    all_contracts = []

    # Counterterrorism contracts
    ct_contracts = intelligence.gather_counterterrorism_contracts()
    all_contracts.extend(ct_contracts)

    # Cybersecurity contracts
    cyber_contracts = intelligence.gather_cybersecurity_contracts()
    all_contracts.extend(cyber_contracts)

    # Critical infrastructure contracts
    infra_contracts = intelligence.gather_critical_infrastructure_contracts()
    all_contracts.extend(infra_contracts)

    if all_contracts:
        # Analyze spending patterns
        spending_patterns = intelligence.analyze_agency_spending_patterns(all_contracts)

        # Save intelligence packages
        contract_file = intelligence.save_intelligence_package(all_contracts, "security_contracts")
        patterns_file = intelligence.save_intelligence_package(spending_patterns, "spending_patterns")

        print(f"\n✅ {len(all_contracts)} security contracts analyzed")
        print(f"   Contracts saved: {contract_file.name}")
        print(f"   Patterns saved: {patterns_file.name}")

        # Generate summary
        summary = intelligence.generate_contracting_intelligence_summary(all_contracts)

        summary_file = intelligence.cache_dir / f"contracting_intelligence_summary_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(summary_file, 'w') as f:
            f.write(summary)

        print(f"✅ Summary generated: {summary_file.name}")

        # Display results by intelligence value
        value_distribution = {}
        for contract in all_contracts:
            value = contract.get('intelligence_value', 'UNKNOWN')
            value_distribution[value] = value_distribution.get(value, 0) + 1

        print(f"\n📊 Intelligence Value Distribution:")
        for level, count in value_distribution.items():
            print(f"   {level}: {count} contracts")

        print(f"\n📊 Agency Participation:")
        agencies = set(c.get('fullParentPathName', 'Unknown') for c in all_contracts)
        for agency in list(agencies)[:10]:  # Top 10
            print(f"   • {agency}")

        print(f"\n💾 Database: {intelligence.db_path}")

    else:
        print("❌ No security-related contracts found in current search")

    print(f"\n💡 CONTRACTING INTELLIGENCE CAPABILITIES:")
    print("   • Government security spending pattern analysis")
    print("   • Emerging threat indicator detection from procurement")
    print("   • Agency capability gap identification")
    print("   • Technology trend analysis from contracts")
    print("   • Vendor intelligence and capability assessment")

if __name__ == "__main__":
    main()