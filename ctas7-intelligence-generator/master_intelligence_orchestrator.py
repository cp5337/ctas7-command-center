#!/usr/bin/env python3
"""
CTAS7 Master Intelligence Orchestrator
Comprehensive intelligence gathering and narrative generation
"""

import asyncio
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
import google.generativeai as genai
import os
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import requests

# Import our intelligence modules
from legal_api_integration import LegalCaseHarvester
from virtual_loc_branch import VirtualLOCBranch
from loc_microservices_integration import LOCMicroservicesIntelligence
from gao_intelligence_integration import GAOIntelligenceGatherer
from congress_api_integration import CongressionalIntelligenceGatherer
from datagov_integration import DataGovIntelligenceHarvester
from doj_realtime_intelligence import DOJRealTimeIntelligence
from local_media_intelligence import LocalMediaIntelligence
from social_media_intelligence import SocialMediaIntelligence

# Cybersecurity Intelligence Modules
from cybersecurity_streams_plasma import CybersecurityUSIM, PlasmaDisplay
from misp_threat_intelligence import MISPThreatIntelligence, MISP_CONFIG

class CTAS7MasterOrchestrator:
    def __init__(self):
        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Master intelligence database
        self.db_path = Path("ctas7_master_intelligence.db")
        self.output_dir = Path("ctas7_intelligence_products")
        self.output_dir.mkdir(exist_ok=True)

        # Intelligence modules
        self.legal_harvester = LegalCaseHarvester()
        self.loc_branch = VirtualLOCBranch()
        self.loc_microservices = LOCMicroservicesIntelligence()
        self.gao_gatherer = GAOIntelligenceGatherer()
        self.congress_gatherer = CongressionalIntelligenceGatherer()
        self.datagov_harvester = DataGovIntelligenceHarvester()
        self.doj_realtime = DOJRealTimeIntelligence()
        self.local_media = LocalMediaIntelligence()
        self.social_media = SocialMediaIntelligence()

        # Cybersecurity Intelligence modules
        self.cyber_usim = CybersecurityUSIM()
        self.misp_intel = MISPThreatIntelligence(MISP_CONFIG)
        self.plasma_display = PlasmaDisplay(self.cyber_usim)

        # Transportation security data sources
        self.nhtsa_base = "https://vpic.nhtsa.dot.gov/api/vehicles"
        self.cdan_base = "https://cdan.dot.gov"

        # Initialize master database
        self.init_master_database()

    def init_master_database(self):
        """Initialize comprehensive intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Master intelligence collection table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS master_intelligence (
                id TEXT PRIMARY KEY,
                source_type TEXT,
                source_agency TEXT,
                title TEXT,
                content TEXT,
                intelligence_value TEXT,
                threat_relevance TEXT,
                abe_analysis TEXT,
                collection_date TEXT,
                last_updated TEXT,
                ttl_phase TEXT,
                narrative_section TEXT
            )
        ''')

        # TTL narrative sections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ttl_narrative_sections (
                section_id TEXT PRIMARY KEY,
                phase_name TEXT,
                section_title TEXT,
                narrative_content TEXT,
                intelligence_sources TEXT,
                last_generated TEXT
            )
        ''')

        # Transportation security intelligence
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transportation_intelligence (
                vehicle_id TEXT PRIMARY KEY,
                make_model TEXT,
                vin_analysis TEXT,
                threat_assessment TEXT,
                collection_source TEXT,
                intelligence_value TEXT,
                last_updated TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def orchestrate_comprehensive_intelligence_gathering(self, target_scenarios):
        """Orchestrate intelligence gathering across all sources"""
        print("🌐 CTAS7 Master Intelligence Orchestration - COMPREHENSIVE GATHERING")
        print("=" * 80)

        all_intelligence = {
            'legal_cases': [],
            'government_reports': [],
            'legislative_intelligence': [],
            'raw_datasets': [],
            'historical_incidents': [],
            'transportation_security': [],
            'realtime_prosecutions': [],
            'crash_intelligence': [],
            'local_law_enforcement': [],
            'media_monitoring': [],
            'social_media_threats': [],
            'cybersecurity_threats': [],
            'misp_intelligence': [],
            'cyber_indicators': []
        }

        # Parallel intelligence gathering
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = {}

            for scenario in target_scenarios:
                print(f"\n🎯 Target Scenario: {scenario}")

                # Submit all intelligence gathering tasks
                futures[f"legal_{scenario}"] = executor.submit(
                    self.gather_legal_intelligence, scenario
                )
                futures[f"loc_{scenario}"] = executor.submit(
                    self.gather_loc_intelligence, scenario
                )
                futures[f"gao_{scenario}"] = executor.submit(
                    self.gather_gao_intelligence, scenario
                )
                futures[f"congress_{scenario}"] = executor.submit(
                    self.gather_congressional_intelligence, scenario
                )
                futures[f"datagov_{scenario}"] = executor.submit(
                    self.gather_datagov_intelligence, scenario
                )
                futures[f"transport_{scenario}"] = executor.submit(
                    self.gather_transportation_intelligence, scenario
                )
                futures[f"doj_{scenario}"] = executor.submit(
                    self.gather_doj_realtime_intelligence, scenario
                )
                futures[f"crash_{scenario}"] = executor.submit(
                    self.gather_crash_intelligence, scenario
                )
                futures[f"local_{scenario}"] = executor.submit(
                    self.gather_local_intelligence, scenario
                )
                futures[f"social_{scenario}"] = executor.submit(
                    self.gather_social_intelligence, scenario
                )
                futures[f"cyber_{scenario}"] = executor.submit(
                    self.gather_cybersecurity_intelligence, scenario
                )
                futures[f"misp_{scenario}"] = executor.submit(
                    self.gather_misp_intelligence, scenario
                )

            # Collect results
            for future_name, future in futures.items():
                try:
                    result = future.result(timeout=300)  # 5 minute timeout
                    source_type = future_name.split('_')[0]

                    if source_type == 'legal':
                        all_intelligence['legal_cases'].extend(result)
                    elif source_type == 'loc':
                        all_intelligence['government_reports'].extend(result)
                    elif source_type == 'gao':
                        all_intelligence['government_reports'].extend(result)
                    elif source_type == 'congress':
                        all_intelligence['legislative_intelligence'].extend(result)
                    elif source_type == 'datagov':
                        all_intelligence['raw_datasets'].extend(result)
                    elif source_type == 'transport':
                        all_intelligence['transportation_security'].extend(result)
                    elif source_type == 'doj':
                        all_intelligence['realtime_prosecutions'].extend(result)
                    elif source_type == 'crash':
                        all_intelligence['crash_intelligence'].extend(result)
                    elif source_type == 'local':
                        all_intelligence['local_law_enforcement'].extend(result)
                    elif source_type == 'social':
                        all_intelligence['social_media_threats'].extend(result)
                    elif source_type == 'cyber':
                        all_intelligence['cybersecurity_threats'].extend(result)
                    elif source_type == 'misp':
                        all_intelligence['misp_intelligence'].extend(result)

                    print(f"   ✅ {future_name}: {len(result)} items collected")

                except Exception as e:
                    print(f"   ❌ {future_name} failed: {e}")

        return all_intelligence

    def gather_legal_intelligence(self, scenario):
        """Gather legal case intelligence"""
        try:
            # Search terrorism cases related to scenario
            cases = self.legal_harvester.search_terrorism_cases(scenario)
            return cases[:25]  # Limit results
        except Exception as e:
            print(f"Legal intelligence gathering failed: {e}")
            return []

    def gather_loc_intelligence(self, scenario):
        """Gather Library of Congress intelligence"""
        try:
            # Use virtual LOC branch for targeted intelligence
            intelligence = self.loc_branch.smart_query(scenario, max_results=30)

            # Also use microservices for specific searches
            microservice_intel = self.loc_microservices.search_terrorism_intelligence(scenario)

            return intelligence + microservice_intel
        except Exception as e:
            print(f"LOC intelligence gathering failed: {e}")
            return []

    def gather_gao_intelligence(self, scenario):
        """Gather GAO report intelligence"""
        try:
            # Search GAO reports for security program assessments
            reports = self.gao_gatherer.search_gao_reports(scenario, max_results=20)
            return reports
        except Exception as e:
            print(f"GAO intelligence gathering failed: {e}")
            return []

    def gather_congressional_intelligence(self, scenario):
        """Gather Congressional intelligence"""
        try:
            # Search bills and hearings
            bills = self.congress_gatherer.search_bills(scenario, limit=15)
            hearings = self.congress_gatherer.search_committee_meetings(scenario, limit=10)

            return (bills.get('bills', []) if bills else []) + \
                   (hearings.get('meetings', []) if hearings else [])
        except Exception as e:
            print(f"Congressional intelligence gathering failed: {e}")
            return []

    def gather_datagov_intelligence(self, scenario):
        """Gather Data.gov dataset intelligence"""
        try:
            # Search government datasets
            datasets = self.datagov_harvester.search_security_datasets(scenario, limit=15)
            return datasets.get('result', {}).get('results', []) if datasets else []
        except Exception as e:
            print(f"Data.gov intelligence gathering failed: {e}")
            return []

    def gather_transportation_intelligence(self, scenario):
        """Gather transportation security intelligence using NHTSA"""
        try:
            # Vehicle-based threat analysis using NHTSA decoder
            transport_intel = []

            # Search for vehicle-related terrorism incidents
            if any(keyword in scenario.lower() for keyword in ['vehicle', 'truck', 'car', 'transportation']):
                # Get vehicle make/model data for threat analysis
                url = f"{self.nhtsa_base}/getallmakes"
                params = {'format': 'json'}

                response = requests.get(url, params=params, timeout=30)
                if response.status_code == 200:
                    vehicle_data = response.json()

                    # ABE analysis of vehicle threat potential
                    for vehicle in vehicle_data.get('Results', [])[:10]:
                        threat_analysis = self.analyze_vehicle_threat_potential(vehicle, scenario)
                        if threat_analysis['threat_level'] in ['HIGH', 'MEDIUM']:
                            transport_intel.append({
                                'vehicle_make': vehicle.get('Make_Name', ''),
                                'threat_analysis': threat_analysis,
                                'scenario_relevance': scenario
                            })

            return transport_intel
        except Exception as e:
            print(f"Transportation intelligence gathering failed: {e}")
            return []

    def analyze_vehicle_threat_potential(self, vehicle_data, scenario):
        """Analyze vehicle threat potential using ABE"""
        prompt = f"""
        Analyze the terrorism threat potential of this vehicle for scenario: "{scenario}"

        Vehicle: {vehicle_data.get('Make_Name', 'Unknown')}

        Consider:
        1. Historical use in terrorist attacks
        2. Availability and accessibility
        3. Payload/modification capacity
        4. Psychological impact potential
        5. Defensive countermeasures effectiveness

        Rate threat level: HIGH/MEDIUM/LOW
        Provide specific reasoning.
        Return as JSON with threat_level and analysis fields.
        """

        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import re
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {'threat_level': 'LOW', 'analysis': 'Analysis failed'}
        except:
            return {'threat_level': 'LOW', 'analysis': 'Analysis failed'}

    def gather_doj_realtime_intelligence(self, scenario):
        """Gather real-time DOJ intelligence"""
        try:
            # Get current DOJ intelligence from RSS feeds
            current_intelligence = self.doj_realtime.gather_current_doj_intelligence()

            # Filter for scenario relevance
            relevant_intelligence = []
            for item in current_intelligence:
                if any(keyword.lower() in item.get('title', '').lower() + item.get('description', '').lower()
                       for keyword in scenario.split()):
                    relevant_intelligence.append(item)

            return relevant_intelligence[:15]  # Limit results
        except Exception as e:
            print(f"DOJ real-time intelligence gathering failed: {e}")
            return []

    def gather_crash_intelligence(self, scenario):
        """Gather crash data intelligence from CDAN"""
        try:
            crash_intel = []

            # Vehicle-related scenarios get crash analysis
            if any(keyword in scenario.lower() for keyword in ['vehicle', 'truck', 'car', 'transportation', 'crash']):
                # CDAN crash data analysis using ABE
                prompt = f"""
                Analyze transportation security implications for scenario: "{scenario}"

                Consider CDAN crash data patterns for:
                1. Vehicle-based attack vulnerabilities
                2. Infrastructure security gaps
                3. Emergency response effectiveness
                4. Pattern analysis for threat indicators

                Generate intelligence insights about transportation security risks.
                Rate intelligence value: HIGH/MEDIUM/LOW
                """

                try:
                    response = self.model.generate_content(prompt)
                    crash_intel.append({
                        'scenario': scenario,
                        'crash_analysis': response.text,
                        'source': 'CDAN Pattern Analysis',
                        'intelligence_value': 'MEDIUM',
                        'collection_date': datetime.now().isoformat()
                    })
                except:
                    pass

            return crash_intel
        except Exception as e:
            print(f"Crash intelligence gathering failed: {e}")
            return []

    def gather_local_intelligence(self, scenario):
        """Gather local law enforcement and media intelligence"""
        try:
            # Monitor local law enforcement press releases and media outlets
            local_intel = self.local_media.monitor_on_demand(max_agencies=5, max_media=3)

            # Filter for scenario relevance
            relevant_intel = []
            for item in local_intel:
                item_content = f"{item.get('title', '')} {item.get('content', '')}"
                if any(keyword.lower() in item_content.lower()
                       for keyword in scenario.split()):
                    relevant_intel.append(item)

            return relevant_intel[:10]  # Limit results
        except Exception as e:
            print(f"Local intelligence gathering failed: {e}")
            return []

    def gather_social_intelligence(self, scenario):
        """Gather social media intelligence"""
        try:
            # Monitor social media platforms for threat indicators
            social_posts = self.social_media.monitor_social_platforms()

            # Filter for high-threat posts only
            threat_posts = []
            for post in social_posts:
                threat_level = post.get('urgency_level', 'LOW')
                if threat_level in ['CRITICAL', 'HIGH', 'MEDIUM']:
                    threat_posts.append(post)

            return threat_posts
        except Exception as e:
            print(f"Social intelligence gathering failed: {e}")
            return []

    def gather_cybersecurity_intelligence(self, scenario):
        """Gather cybersecurity threat intelligence"""
        try:
            # Assess cyber threat landscape
            cyber_assessment = asyncio.run(
                self.cyber_usim.assess_cyber_threat_landscape(eei_focus=scenario)
            )

            # Convert assessment to intelligence items
            cyber_intel = []

            # CISA threats
            if 'cisa' in cyber_assessment.get('threat_summary', {}):
                cyber_intel.append({
                    'source': 'CISA',
                    'type': 'cybersecurity_alert',
                    'threat_level': 'HIGH',
                    'content': cyber_assessment['threat_summary']['cisa'],
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # CVE threats
            if 'cve' in cyber_assessment.get('threat_summary', {}):
                cyber_intel.append({
                    'source': 'CVE',
                    'type': 'vulnerability_intelligence',
                    'threat_level': 'CRITICAL',
                    'content': cyber_assessment['threat_summary']['cve'],
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # Threat actor intelligence
            if 'threat_actors' in cyber_assessment.get('threat_summary', {}):
                cyber_intel.append({
                    'source': 'THREAT_ACTORS',
                    'type': 'threat_actor_intelligence',
                    'threat_level': 'HIGH',
                    'content': cyber_assessment['threat_summary']['threat_actors'],
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # Actionable intelligence
            for action in cyber_assessment.get('recommended_actions', []):
                cyber_intel.append({
                    'source': 'CYBER_RECOMMENDATIONS',
                    'type': 'actionable_intelligence',
                    'threat_level': 'MEDIUM',
                    'content': action,
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            return cyber_intel

        except Exception as e:
            print(f"Cybersecurity intelligence gathering failed: {e}")
            return []

    def gather_misp_intelligence(self, scenario):
        """Gather MISP threat intelligence"""
        try:
            # Analyze MISP threat landscape
            misp_analysis = asyncio.run(
                self.misp_intel.analyze_threat_landscape()
            )

            misp_intel = []

            # MISP events summary
            misp_summary = misp_analysis.get('misp_summary', {})
            if misp_summary.get('recent_events', 0) > 0:
                misp_intel.append({
                    'source': 'MISP',
                    'type': 'threat_events',
                    'threat_level': 'HIGH' if misp_summary.get('high_threat_events', 0) > 0 else 'MEDIUM',
                    'content': {
                        'recent_events': misp_summary.get('recent_events', 0),
                        'high_threat_events': misp_summary.get('high_threat_events', 0),
                        'published_events': misp_summary.get('published_events', 0)
                    },
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # Indicators analysis
            indicator_analysis = misp_analysis.get('indicator_analysis', {})
            if indicator_analysis.get('total_indicators', 0) > 0:
                misp_intel.append({
                    'source': 'MISP',
                    'type': 'indicators_of_compromise',
                    'threat_level': 'HIGH',
                    'content': {
                        'total_indicators': indicator_analysis.get('total_indicators', 0),
                        'to_ids_indicators': indicator_analysis.get('to_ids_indicators', 0),
                        'indicator_types': indicator_analysis.get('indicator_types', {}),
                        'recent_indicators': indicator_analysis.get('recent_indicators', 0)
                    },
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # Threat actor analysis
            actor_analysis = misp_analysis.get('threat_actor_analysis', {})
            if actor_analysis.get('total_actors', 0) > 0:
                misp_intel.append({
                    'source': 'MISP',
                    'type': 'threat_actor_intelligence',
                    'threat_level': 'CRITICAL' if actor_analysis.get('state_sponsored_count', 0) > 0 else 'HIGH',
                    'content': {
                        'total_actors': actor_analysis.get('total_actors', 0),
                        'state_sponsored_count': actor_analysis.get('state_sponsored_count', 0),
                        'country_attribution': actor_analysis.get('country_attribution', {}),
                        'sophistication_levels': actor_analysis.get('sophistication_levels', {})
                    },
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # Attack pattern analysis
            attack_analysis = misp_analysis.get('attack_pattern_analysis', {})
            if attack_analysis.get('total_patterns', 0) > 0:
                misp_intel.append({
                    'source': 'MISP',
                    'type': 'attack_patterns',
                    'threat_level': 'MEDIUM',
                    'content': {
                        'total_patterns': attack_analysis.get('total_patterns', 0),
                        'top_attack_patterns': attack_analysis.get('top_attack_patterns', {}),
                        'tactic_distribution': attack_analysis.get('tactic_distribution', {}),
                        'unique_tactics': attack_analysis.get('unique_tactics', 0)
                    },
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            # Actionable intelligence
            for action in misp_analysis.get('actionable_intelligence', []):
                misp_intel.append({
                    'source': 'MISP',
                    'type': 'actionable_intelligence',
                    'threat_level': 'HIGH',
                    'content': action,
                    'scenario_relevance': scenario,
                    'collection_date': datetime.now().isoformat()
                })

            return misp_intel

        except Exception as e:
            print(f"MISP intelligence gathering failed: {e}")
            return []

    def generate_ttl_phase_narratives(self, all_intelligence):
        """Generate TTL phase narratives using collected intelligence"""
        print("\n📖 Generating TTL Phase Narratives...")

        ttl_phases = {
            'pre_operational_planning': {
                'title': 'Pre-Operational Planning Phase',
                'description': 'Target selection, surveillance planning, resource acquisition'
            },
            'reconnaissance': {
                'title': 'Reconnaissance and Target Analysis',
                'description': 'Site surveys, security assessments, timing analysis'
            },
            'ied_construction': {
                'title': 'IED Construction and Testing',
                'description': 'Component acquisition, device assembly, functional testing'
            },
            'emplacement_execution': {
                'title': 'Emplacement and Execution',
                'description': 'Final positioning, timing coordination, attack execution'
            }
        }

        phase_narratives = {}

        for phase_key, phase_info in ttl_phases.items():
            print(f"   🔍 Generating narrative: {phase_info['title']}")

            # Generate narrative using all intelligence sources
            narrative = self.generate_phase_narrative(phase_info, all_intelligence)

            phase_narratives[phase_key] = {
                'title': phase_info['title'],
                'description': phase_info['description'],
                'narrative': narrative,
                'intelligence_sources': self.count_intelligence_sources(all_intelligence)
            }

            # Cache in database
            self.cache_phase_narrative(phase_key, phase_narratives[phase_key])

        return phase_narratives

    def generate_phase_narrative(self, phase_info, all_intelligence):
        """Generate flowing prose narrative for specific TTL phase"""

        total_sources = sum(len(sources) for sources in all_intelligence.values())

        prompt = f"""
        Generate a comprehensive CTAS7-TT-Narrative for: {phase_info['title']}

        Phase Description: {phase_info['description']}

        Intelligence Sources Available:
        - Legal Cases: {len(all_intelligence['legal_cases'])} terrorism prosecutions
        - Government Reports: {len(all_intelligence['government_reports'])} official documents
        - Legislative Intelligence: {len(all_intelligence['legislative_intelligence'])} Congressional items
        - Raw Datasets: {len(all_intelligence['raw_datasets'])} government datasets
        - Historical Incidents: {len(all_intelligence['historical_incidents'])} documented attacks
        - Transportation Security: {len(all_intelligence['transportation_security'])} vehicle assessments
        - Cybersecurity Threats: {len(all_intelligence['cybersecurity_threats'])} cyber intelligence items
        - MISP Intelligence: {len(all_intelligence['misp_intelligence'])} threat intelligence reports
        - Cyber Indicators: {len(all_intelligence['cyber_indicators'])} indicators of compromise

        Total Intelligence Sources: {total_sources}

        Create a flowing prose narrative that:

        1. HUMANIZES THE THREAT: Describe the adversary mindset, decision-making process, and operational considerations during this phase

        2. TACTICS, TECHNIQUES & PROCEDURES: Detail the specific TTPs terrorists employ, including:
           - State-sponsored operatives (Hezbollah, Iranian Quds Force, Chinese MSS)
           - Domestic violent extremists
           - Lone wolves and small cells
           - Accomplices (witting, unwitting, coerced)

        3. REAL-WORLD CONTEXT: Reference actual cases, incidents, and intelligence findings from our sources

        4. VULNERABILITY ANALYSIS: Identify security gaps and defensive opportunities

        5. OPERATIONAL INSIGHTS: Provide actionable intelligence for counterterrorism professionals

        Write in professional intelligence brief style - direct, authoritative, and operationally relevant.
        This is NOT a softcore social document - focus on the hard realities of terrorist operations.

        Target length: 1500-2000 words of flowing narrative prose.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Narrative generation failed for {phase_info['title']}: {e}"

    def count_intelligence_sources(self, all_intelligence):
        """Count intelligence sources for reporting"""
        return {
            source_type: len(sources)
            for source_type, sources in all_intelligence.items()
        }

    def cache_phase_narrative(self, phase_key, narrative_data):
        """Cache generated narrative in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO ttl_narrative_sections
            (section_id, phase_name, section_title, narrative_content,
             intelligence_sources, last_generated)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            phase_key,
            narrative_data['title'],
            narrative_data['description'],
            narrative_data['narrative'],
            json.dumps(narrative_data['intelligence_sources']),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    def generate_executive_intelligence_summary(self, all_intelligence, phase_narratives):
        """Generate executive summary of all intelligence findings"""
        print("\n📊 Generating Executive Intelligence Summary...")

        total_sources = sum(len(sources) for sources in all_intelligence.values())

        prompt = f"""
        Generate an EXECUTIVE INTELLIGENCE SUMMARY for CTAS7-TT-Narrative Analysis

        INTELLIGENCE COLLECTION RESULTS:
        Total Sources Analyzed: {total_sources}
        - Legal Cases: {len(all_intelligence['legal_cases'])} terrorism prosecutions
        - Government Reports: {len(all_intelligence['government_reports'])} official documents
        - Legislative Intelligence: {len(all_intelligence['legislative_intelligence'])} Congressional items
        - Raw Government Datasets: {len(all_intelligence['raw_datasets'])} agency datasets
        - Historical Incidents: {len(all_intelligence['historical_incidents'])} documented attacks
        - Transportation Security: {len(all_intelligence['transportation_security'])} assessments
        - Real-Time Prosecutions: {len(all_intelligence['realtime_prosecutions'])} current DOJ cases
        - Crash Intelligence: {len(all_intelligence['crash_intelligence'])} CDAN pattern analyses
        - Local Law Enforcement: {len(all_intelligence['local_law_enforcement'])} police/sheriff reports
        - Media Monitoring: {len(all_intelligence['media_monitoring'])} media alerts
        - Social Media Threats: {len(all_intelligence['social_media_threats'])} threat indicators
        - Cybersecurity Threats: {len(all_intelligence['cybersecurity_threats'])} cyber intelligence items
        - MISP Intelligence: {len(all_intelligence['misp_intelligence'])} threat intelligence reports
        - Cyber Indicators: {len(all_intelligence['cyber_indicators'])} indicators of compromise

        TTL PHASES ANALYZED: {len(phase_narratives)} comprehensive narrative sections

        Create executive summary with:

        1. KEY THREAT FINDINGS: Primary threats identified across all intelligence sources

        2. OPERATIONAL PATTERNS: Common TTPs used by terrorist actors

        3. VULNERABILITY ASSESSMENT: Critical security gaps revealed by analysis

        4. INTELLIGENCE GAPS: Areas requiring additional collection/analysis

        5. POLICY IMPLICATIONS: Recommended actions for decision makers

        6. STRATEGIC RECOMMENDATIONS: Long-term counterterrorism priorities

        Format as professional intelligence brief for senior leadership.
        Include specific statistics and source citations.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Executive summary generation failed: {e}"

    def generate_comprehensive_ctas7_report(self, target_scenarios):
        """Generate complete CTAS7-TT-Narrative intelligence report"""
        print("🎯 GENERATING COMPREHENSIVE CTAS7-TT-NARRATIVE REPORT")
        print("=" * 60)

        # Step 1: Orchestrate comprehensive intelligence gathering
        all_intelligence = self.orchestrate_comprehensive_intelligence_gathering(target_scenarios)

        # Step 2: Generate TTL phase narratives
        phase_narratives = self.generate_ttl_phase_narratives(all_intelligence)

        # Step 3: Generate executive summary
        executive_summary = self.generate_executive_intelligence_summary(all_intelligence, phase_narratives)

        # Step 4: Compile final report
        report = {
            'report_metadata': {
                'generation_date': datetime.now().isoformat(),
                'target_scenarios': target_scenarios,
                'intelligence_sources': self.count_intelligence_sources(all_intelligence),
                'total_intelligence_items': sum(len(sources) for sources in all_intelligence.values())
            },
            'executive_summary': executive_summary,
            'ttl_phase_narratives': phase_narratives,
            'raw_intelligence': all_intelligence
        }

        # Save comprehensive report
        report_file = self.output_dir / f"CTAS7_TT_Narrative_Comprehensive_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)

        # Generate human-readable version
        readable_report = self.generate_readable_report(report)
        readable_file = self.output_dir / f"CTAS7_TT_Narrative_Report_{datetime.now().strftime('%Y%m%d_%H%M')}.txt"
        with open(readable_file, 'w') as f:
            f.write(readable_report)

        return {
            'report_data': report,
            'report_file': report_file,
            'readable_file': readable_file
        }

    def generate_readable_report(self, report_data):
        """Generate human-readable version of comprehensive report"""
        readable = f"""
CTAS7-TT-NARRATIVE COMPREHENSIVE INTELLIGENCE REPORT
Generated: {report_data['report_metadata']['generation_date']}
{'=' * 80}

EXECUTIVE SUMMARY
{'-' * 40}
{report_data['executive_summary']}

INTELLIGENCE COLLECTION SUMMARY
{'-' * 40}
Total Intelligence Sources: {report_data['report_metadata']['total_intelligence_items']}

Source Breakdown:
"""

        for source_type, count in report_data['report_metadata']['intelligence_sources'].items():
            readable += f"  • {source_type.replace('_', ' ').title()}: {count} items\n"

        readable += f"""
Target Scenarios Analyzed:
"""
        for scenario in report_data['report_metadata']['target_scenarios']:
            readable += f"  • {scenario}\n"

        readable += f"""

TTL PHASE NARRATIVES
{'=' * 40}
"""

        for phase_key, phase_data in report_data['ttl_phase_narratives'].items():
            readable += f"""

{phase_data['title'].upper()}
{'-' * len(phase_data['title'])}

{phase_data['narrative']}

Intelligence Sources: {sum(phase_data['intelligence_sources'].values())} total items
"""

        readable += f"""

REPORT GENERATION COMPLETE
Generated using CTAS7 Master Intelligence Orchestrator
Database: {self.db_path}
Output Directory: {self.output_dir}
"""

        return readable

def main():
    print("🌐 CTAS7 Master Intelligence Orchestrator")
    print("=" * 50)

    orchestrator = CTAS7MasterOrchestrator()

    # Define target scenarios for comprehensive analysis
    target_scenarios = [
        "Hezbollah operational capabilities United States",
        "Iranian Quds Force assassination operations",
        "Domestic violent extremism vehicle attacks",
        "Chinese cyber terrorism infrastructure",
        "Russian disinformation terrorism threats",
        "IED construction techniques and components",
        "Critical infrastructure protection vulnerabilities",
        "Transportation security gaps and exploits"
    ]

    print(f"🎯 Target Scenarios: {len(target_scenarios)}")
    for i, scenario in enumerate(target_scenarios, 1):
        print(f"   {i}. {scenario}")

    # Generate comprehensive CTAS7-TT-Narrative report
    report_results = orchestrator.generate_comprehensive_ctas7_report(target_scenarios)

    print(f"\n✅ CTAS7-TT-NARRATIVE REPORT GENERATION COMPLETE")
    print(f"   Report Data: {report_results['report_file']}")
    print(f"   Readable Report: {report_results['readable_file']}")
    print(f"   Total Intelligence: {report_results['report_data']['report_metadata']['total_intelligence_items']} items")
    print(f"   Database: {orchestrator.db_path}")
    print(f"   Output Directory: {orchestrator.output_dir}")

    print(f"\n💡 COMPREHENSIVE INTELLIGENCE PIPELINE ACTIVE")
    print(f"   • Legal Cases: PACER + CourtListener")
    print(f"   • Government Reports: LOC + GAO")
    print(f"   • Legislative Intelligence: Congress.gov")
    print(f"   • Raw Datasets: Data.gov")
    print(f"   • Transportation Security: NHTSA + CDAN")
    print(f"   • Real-Time Intelligence: DOJ RSS feeds")
    print(f"   • Local Law Enforcement: 25 Police + 10 Sheriff departments")
    print(f"   • Media Monitoring: Major networks + radio outlets")
    print(f"   • Social Media Intelligence: Multi-platform threat detection")
    print(f"   • Cybersecurity Streams: CISA + CVE + FBI IC3 + Threat Actors")
    print(f"   • MISP Threat Intelligence: Multi-platform IOC sharing")
    print(f"   • Plasma Display: Real-time cybersecurity visualization")
    print(f"   • Analysis Engine: ABE (Gemini 2M)")

if __name__ == "__main__":
    main()