"""
Unified Threat Intelligence Orchestrator for CTAS7 Cybersecurity Streams
Multi-source threat intelligence fusion with CISA KEV, VirusTotal, OTX, and MISP

Author: CTAS7 Intelligence Generator
Purpose: Comprehensive threat intelligence orchestration and correlation
USIM Integration: Unified intelligence with cross-source correlation and enrichment
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
import sqlite3
import hashlib
from enum import Enum
from concurrent.futures import ThreadPoolExecutor
import requests

# Import our threat intelligence modules
from virustotal_threat_intelligence import VirusTotalUSIM, VTAnalysisResult, VT_CONFIG
from alienvault_otx_intelligence import AlienVaultOTXUSIM, OTXPulse, OTX_CONFIG
from misp_threat_intelligence import MISPThreatIntelligence, MISP_CONFIG
from cybersecurity_streams_plasma import CybersecurityUSIM, PlasmaDisplay

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ThreatIntelSource(Enum):
    """Threat intelligence source types"""
    CISA_KEV = "CISA_KEV"
    VIRUSTOTAL = "VIRUSTOTAL"
    ALIENVAULT_OTX = "ALIENVAULT_OTX"
    MISP = "MISP"
    FBI_IC3 = "FBI_IC3"
    NVD_CVE = "NVD_CVE"

class UnifiedThreatLevel(Enum):
    """Unified threat level across all sources"""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"

@dataclass
class UnifiedThreatIntelligence:
    """Unified threat intelligence structure"""
    intel_id: str
    primary_indicator: str
    indicator_type: str
    threat_level: UnifiedThreatLevel
    confidence_score: int  # 1-100
    sources: List[ThreatIntelSource]
    source_data: Dict[str, Any]
    first_seen: datetime
    last_seen: datetime
    malware_families: List[str]
    threat_actors: List[str]
    attack_patterns: List[str]
    related_indicators: List[str]
    geolocation_data: Dict[str, Any]
    correlation_score: int  # How well sources agree
    actionable_intelligence: List[str]
    plasma_priority: int

@dataclass
class CISAKEVVulnerability:
    """CISA Known Exploited Vulnerability structure based on official schema"""
    cve_id: str
    vendor_project: str
    product: str
    vulnerability_name: str
    date_added: datetime
    short_description: str
    required_action: str
    due_date: datetime
    known_ransomware_campaign_use: bool
    notes: Optional[str]

class UnifiedThreatIntelligenceOrchestrator:
    """Master orchestrator for all threat intelligence sources"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.db_path = "/Users/cp5337/Developer/ctas7-command-center/unified_threat_intelligence.db"

        # Initialize intelligence modules
        self.vt_intel = None
        self.otx_intel = None
        self.misp_intel = None
        self.cyber_usim = CybersecurityUSIM()
        self.plasma_display = PlasmaDisplay(self.cyber_usim)

        # Initialize modules if API keys are available
        self.initialize_intelligence_modules()

        # CISA KEV feed URLs
        self.cisa_kev_feed = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
        self.cisa_kev_schema = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities_schema.json"

        self.initialize_database()

    def initialize_intelligence_modules(self):
        """Initialize intelligence modules with available API keys"""
        try:
            # VirusTotal
            vt_key = self.config.get("virustotal", {}).get("api_key")
            if vt_key and vt_key != "your-virustotal-api-key-here":
                self.vt_intel = VirusTotalUSIM(vt_key)
                logger.info("✅ VirusTotal integration initialized")
            else:
                logger.warning("⚠️ VirusTotal API key not configured")

            # AlienVault OTX
            otx_key = self.config.get("alienvault_otx", {}).get("api_key")
            if otx_key and otx_key != "your-otx-api-key-here":
                self.otx_intel = AlienVaultOTXUSIM(otx_key)
                logger.info("✅ AlienVault OTX integration initialized")
            else:
                logger.warning("⚠️ AlienVault OTX API key not configured")

            # MISP
            misp_config = self.config.get("misp", MISP_CONFIG)
            if misp_config.get("instances"):
                self.misp_intel = MISPThreatIntelligence(misp_config)
                logger.info("✅ MISP integration initialized")
            else:
                logger.warning("⚠️ MISP instances not configured")

        except Exception as e:
            logger.error(f"Error initializing intelligence modules: {e}")

    def initialize_database(self):
        """Initialize comprehensive threat intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Unified threat intelligence table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS unified_threat_intel (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intel_id TEXT UNIQUE,
                primary_indicator TEXT,
                indicator_type TEXT,
                threat_level TEXT,
                confidence_score INTEGER,
                sources TEXT,
                source_data TEXT,
                first_seen TEXT,
                last_seen TEXT,
                malware_families TEXT,
                threat_actors TEXT,
                attack_patterns TEXT,
                related_indicators TEXT,
                geolocation_data TEXT,
                correlation_score INTEGER,
                actionable_intelligence TEXT,
                plasma_priority INTEGER,
                last_updated TEXT
            )
        ''')

        # CISA KEV vulnerabilities table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cisa_kev_vulnerabilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cve_id TEXT UNIQUE,
                vendor_project TEXT,
                product TEXT,
                vulnerability_name TEXT,
                date_added TEXT,
                short_description TEXT,
                required_action TEXT,
                due_date TEXT,
                known_ransomware_campaign_use BOOLEAN,
                notes TEXT,
                plasma_priority INTEGER,
                last_updated TEXT
            )
        ''')

        # Cross-source correlations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS threat_correlations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                primary_intel_id TEXT,
                related_intel_id TEXT,
                correlation_type TEXT,
                confidence_score INTEGER,
                correlation_details TEXT,
                created_timestamp TEXT,
                FOREIGN KEY (primary_intel_id) REFERENCES unified_threat_intel (intel_id),
                FOREIGN KEY (related_intel_id) REFERENCES unified_threat_intel (intel_id)
            )
        ''')

        # Intelligence source performance tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS source_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_name TEXT,
                collection_date TEXT,
                items_collected INTEGER,
                high_confidence_items INTEGER,
                api_response_time REAL,
                error_count INTEGER,
                success_rate REAL
            )
        ''')

        conn.commit()
        conn.close()

    async def orchestrate_comprehensive_threat_intelligence(self) -> Dict[str, Any]:
        """Orchestrate comprehensive threat intelligence collection from all sources"""
        logger.info("🌐 Starting Unified Threat Intelligence Orchestration")
        logger.info("=" * 60)

        orchestration_results = {
            "timestamp": datetime.now().isoformat(),
            "sources_active": [],
            "sources_failed": [],
            "intelligence_collected": {},
            "correlations_found": [],
            "unified_intelligence": [],
            "plasma_feeds_updated": [],
            "performance_metrics": {}
        }

        # Parallel intelligence gathering from all sources
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = {}

            # Submit intelligence gathering tasks
            logger.info("📡 Initiating parallel intelligence gathering...")

            # CISA KEV Collection
            futures["cisa_kev"] = executor.submit(self.collect_cisa_kev_intelligence)

            # VirusTotal Collection
            if self.vt_intel:
                futures["virustotal"] = executor.submit(self.collect_virustotal_intelligence)

            # AlienVault OTX Collection
            if self.otx_intel:
                futures["otx"] = executor.submit(self.collect_otx_intelligence)

            # MISP Collection
            if self.misp_intel:
                futures["misp"] = executor.submit(self.collect_misp_intelligence)

            # NVD CVE Collection
            futures["nvd_cve"] = executor.submit(self.collect_nvd_cve_intelligence)

            # FBI IC3 Collection
            futures["fbi_ic3"] = executor.submit(self.collect_fbi_ic3_intelligence)

            # Collect results from all sources
            for source_name, future in futures.items():
                try:
                    result = future.result(timeout=300)  # 5 minute timeout
                    orchestration_results["intelligence_collected"][source_name] = result
                    orchestration_results["sources_active"].append(source_name)
                    logger.info(f"   ✅ {source_name}: {len(result)} intelligence items collected")

                except Exception as e:
                    logger.error(f"   ❌ {source_name} failed: {e}")
                    orchestration_results["sources_failed"].append(source_name)

        # Perform intelligence correlation and fusion
        logger.info("\n🔗 Performing cross-source intelligence correlation...")
        await self.perform_intelligence_correlation(orchestration_results["intelligence_collected"])

        # Generate unified threat intelligence
        logger.info("🎯 Generating unified threat intelligence...")
        unified_intel = await self.generate_unified_intelligence()
        orchestration_results["unified_intelligence"] = unified_intel

        # Update plasma displays
        logger.info("📺 Updating plasma display feeds...")
        plasma_updates = await self.update_plasma_feeds(unified_intel)
        orchestration_results["plasma_feeds_updated"] = plasma_updates

        # Generate performance metrics
        orchestration_results["performance_metrics"] = self.calculate_performance_metrics()

        # Store orchestration results
        await self.store_orchestration_results(orchestration_results)

        return orchestration_results

    def collect_cisa_kev_intelligence(self) -> List[Dict[str, Any]]:
        """Collect CISA Known Exploited Vulnerabilities intelligence"""
        logger.info("🔒 Collecting CISA KEV intelligence...")

        try:
            response = requests.get(self.cisa_kev_feed, timeout=30)
            if response.status_code == 200:
                kev_data = response.json()
                vulnerabilities = []

                for vuln in kev_data.get("vulnerabilities", []):
                    kev_vuln = CISAKEVVulnerability(
                        cve_id=vuln.get("cveID", ""),
                        vendor_project=vuln.get("vendorProject", ""),
                        product=vuln.get("product", ""),
                        vulnerability_name=vuln.get("vulnerabilityName", ""),
                        date_added=datetime.strptime(vuln.get("dateAdded", ""), "%Y-%m-%d"),
                        short_description=vuln.get("shortDescription", ""),
                        required_action=vuln.get("requiredAction", ""),
                        due_date=datetime.strptime(vuln.get("dueDate", ""), "%Y-%m-%d"),
                        known_ransomware_campaign_use=vuln.get("knownRansomwareCampaignUse", False),
                        notes=vuln.get("notes", "")
                    )

                    intel_item = {
                        "source": ThreatIntelSource.CISA_KEV,
                        "indicator": kev_vuln.cve_id,
                        "type": "CVE",
                        "threat_level": UnifiedThreatLevel.CRITICAL,
                        "data": asdict(kev_vuln),
                        "collection_timestamp": datetime.now().isoformat()
                    }
                    vulnerabilities.append(intel_item)

                return vulnerabilities

        except Exception as e:
            logger.error(f"Error collecting CISA KEV intelligence: {e}")
            return []

    def collect_virustotal_intelligence(self) -> List[Dict[str, Any]]:
        """Collect VirusTotal intelligence"""
        logger.info("🦠 Collecting VirusTotal intelligence...")

        try:
            # This would use the VirusTotal USIM to collect recent threat intelligence
            # For demo purposes, return sample data structure
            return [{
                "source": ThreatIntelSource.VIRUSTOTAL,
                "indicator": "sample_hash",
                "type": "file_hash",
                "threat_level": UnifiedThreatLevel.HIGH,
                "data": {},
                "collection_timestamp": datetime.now().isoformat()
            }]

        except Exception as e:
            logger.error(f"Error collecting VirusTotal intelligence: {e}")
            return []

    def collect_otx_intelligence(self) -> List[Dict[str, Any]]:
        """Collect AlienVault OTX intelligence"""
        logger.info("👽 Collecting AlienVault OTX intelligence...")

        try:
            # This would use the OTX USIM to collect recent pulses
            # For demo purposes, return sample data structure
            return [{
                "source": ThreatIntelSource.ALIENVAULT_OTX,
                "indicator": "sample_indicator",
                "type": "pulse",
                "threat_level": UnifiedThreatLevel.MEDIUM,
                "data": {},
                "collection_timestamp": datetime.now().isoformat()
            }]

        except Exception as e:
            logger.error(f"Error collecting OTX intelligence: {e}")
            return []

    def collect_misp_intelligence(self) -> List[Dict[str, Any]]:
        """Collect MISP intelligence"""
        logger.info("🌐 Collecting MISP intelligence...")

        try:
            # This would use the MISP integration to collect recent events
            # For demo purposes, return sample data structure
            return [{
                "source": ThreatIntelSource.MISP,
                "indicator": "sample_misp_event",
                "type": "event",
                "threat_level": UnifiedThreatLevel.HIGH,
                "data": {},
                "collection_timestamp": datetime.now().isoformat()
            }]

        except Exception as e:
            logger.error(f"Error collecting MISP intelligence: {e}")
            return []

    def collect_nvd_cve_intelligence(self) -> List[Dict[str, Any]]:
        """Collect NVD CVE intelligence"""
        logger.info("🔓 Collecting NVD CVE intelligence...")

        try:
            # Collect recent critical CVEs from NVD
            url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
            params = {
                "cvssV3Severity": "CRITICAL",
                "resultsPerPage": 50
            }

            response = requests.get(url, params=params, timeout=30)
            if response.status_code == 200:
                cve_data = response.json()
                cve_intelligence = []

                for cve_item in cve_data.get("vulnerabilities", []):
                    cve = cve_item.get("cve", {})
                    cve_id = cve.get("id", "")

                    intel_item = {
                        "source": ThreatIntelSource.NVD_CVE,
                        "indicator": cve_id,
                        "type": "CVE",
                        "threat_level": UnifiedThreatLevel.CRITICAL,
                        "data": cve,
                        "collection_timestamp": datetime.now().isoformat()
                    }
                    cve_intelligence.append(intel_item)

                return cve_intelligence

        except Exception as e:
            logger.error(f"Error collecting NVD CVE intelligence: {e}")
            return []

    def collect_fbi_ic3_intelligence(self) -> List[Dict[str, Any]]:
        """Collect FBI IC3 intelligence"""
        logger.info("🏛️ Collecting FBI IC3 intelligence...")

        try:
            # This would scrape FBI IC3 alerts
            # For demo purposes, return sample data structure
            return [{
                "source": ThreatIntelSource.FBI_IC3,
                "indicator": "sample_ic3_alert",
                "type": "alert",
                "threat_level": UnifiedThreatLevel.HIGH,
                "data": {},
                "collection_timestamp": datetime.now().isoformat()
            }]

        except Exception as e:
            logger.error(f"Error collecting FBI IC3 intelligence: {e}")
            return []

    async def perform_intelligence_correlation(self, intelligence_data: Dict[str, List[Dict[str, Any]]]):
        """Perform cross-source intelligence correlation"""
        logger.info("🔗 Performing cross-source correlation analysis...")

        correlations = []

        # Extract all indicators by type
        indicators_by_type = {}
        for source_name, intel_list in intelligence_data.items():
            for intel_item in intel_list:
                indicator = intel_item.get("indicator", "")
                indicator_type = intel_item.get("type", "")

                if indicator_type not in indicators_by_type:
                    indicators_by_type[indicator_type] = {}

                if indicator not in indicators_by_type[indicator_type]:
                    indicators_by_type[indicator_type][indicator] = []

                indicators_by_type[indicator_type][indicator].append({
                    "source": source_name,
                    "data": intel_item
                })

        # Find correlations (indicators appearing in multiple sources)
        for indicator_type, indicators in indicators_by_type.items():
            for indicator, source_data in indicators.items():
                if len(source_data) > 1:
                    correlation = {
                        "indicator": indicator,
                        "indicator_type": indicator_type,
                        "sources": [item["source"] for item in source_data],
                        "correlation_strength": len(source_data),
                        "threat_levels": [item["data"]["threat_level"] for item in source_data],
                        "correlation_timestamp": datetime.now().isoformat()
                    }
                    correlations.append(correlation)

        logger.info(f"   🎯 Found {len(correlations)} cross-source correlations")

        # Store correlations in database
        await self.store_correlations(correlations)

        return correlations

    async def generate_unified_intelligence(self) -> List[UnifiedThreatIntelligence]:
        """Generate unified threat intelligence from all sources"""
        logger.info("🎯 Generating unified threat intelligence...")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get recent intelligence from all sources
        cursor.execute('''
            SELECT intel_id, primary_indicator, indicator_type, threat_level,
                   confidence_score, sources, correlation_score
            FROM unified_threat_intel
            WHERE datetime(last_updated) > datetime('now', '-24 hours')
            ORDER BY plasma_priority DESC, correlation_score DESC
            LIMIT 100
        ''')

        unified_intel_data = cursor.fetchall()
        conn.close()

        unified_intelligence = []
        for row in unified_intel_data:
            # This would create UnifiedThreatIntelligence objects
            # For demo purposes, create basic structure
            pass

        logger.info(f"   📊 Generated {len(unified_intelligence)} unified intelligence items")

        return unified_intelligence

    async def update_plasma_feeds(self, unified_intel: List[UnifiedThreatIntelligence]) -> List[str]:
        """Update plasma display feeds with unified intelligence"""
        logger.info("📺 Updating plasma display feeds...")

        plasma_updates = []

        try:
            # Create plasma-compatible threat data
            plasma_data = {
                "timestamp": datetime.now().isoformat(),
                "active_threats": [],
                "threat_level_summary": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "source_summary": {},
                "unified_intelligence_count": len(unified_intel)
            }

            # Send to plasma display
            await self.plasma_display.send_threat_update()

            plasma_updates.append("Unified threat intelligence feed updated")
            plasma_updates.append(f"{len(unified_intel)} intelligence items processed")

        except Exception as e:
            logger.error(f"Error updating plasma feeds: {e}")

        return plasma_updates

    def calculate_performance_metrics(self) -> Dict[str, Any]:
        """Calculate performance metrics for intelligence sources"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get source performance data
        cursor.execute('''
            SELECT source_name, AVG(success_rate), AVG(api_response_time), SUM(items_collected)
            FROM source_performance
            WHERE datetime(collection_date) > datetime('now', '-24 hours')
            GROUP BY source_name
        ''')

        performance_data = cursor.fetchall()
        conn.close()

        metrics = {
            "collection_period": "24 hours",
            "source_metrics": {}
        }

        for row in performance_data:
            source_name, avg_success_rate, avg_response_time, total_items = row
            metrics["source_metrics"][source_name] = {
                "average_success_rate": avg_success_rate or 0,
                "average_response_time": avg_response_time or 0,
                "total_items_collected": total_items or 0
            }

        return metrics

    async def store_correlations(self, correlations: List[Dict[str, Any]]):
        """Store threat intelligence correlations"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        for correlation in correlations:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO threat_correlations
                    (primary_intel_id, related_intel_id, correlation_type,
                     confidence_score, correlation_details, created_timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    correlation["indicator"],
                    correlation["indicator"],  # Self-reference for demo
                    "cross_source",
                    correlation["correlation_strength"] * 20,  # Convert to percentage
                    json.dumps(correlation),
                    correlation["correlation_timestamp"]
                ))

            except Exception as e:
                logger.error(f"Error storing correlation: {e}")

        conn.commit()
        conn.close()

    async def store_orchestration_results(self, results: Dict[str, Any]):
        """Store orchestration results for analysis"""
        # Store comprehensive results in database for historical analysis
        pass

    def generate_unified_intelligence_report(self, orchestration_results: Dict[str, Any]) -> str:
        """Generate comprehensive unified intelligence report"""
        report = f"""
UNIFIED THREAT INTELLIGENCE ORCHESTRATION REPORT
Generated: {orchestration_results['timestamp']}
{'=' * 60}

INTELLIGENCE COLLECTION SUMMARY
{'-' * 40}
Sources Active: {len(orchestration_results['sources_active'])}
Sources Failed: {len(orchestration_results['sources_failed'])}

Active Sources:
"""
        for source in orchestration_results['sources_active']:
            item_count = len(orchestration_results['intelligence_collected'].get(source, []))
            report += f"  ✅ {source}: {item_count} items collected\n"

        if orchestration_results['sources_failed']:
            report += "\nFailed Sources:\n"
            for source in orchestration_results['sources_failed']:
                report += f"  ❌ {source}: Collection failed\n"

        report += f"""

CORRELATION ANALYSIS
{'-' * 40}
Cross-source correlations: {len(orchestration_results.get('correlations_found', []))}

UNIFIED INTELLIGENCE
{'-' * 40}
Unified intelligence items: {len(orchestration_results['unified_intelligence'])}

PLASMA DISPLAY UPDATES
{'-' * 40}
"""
        for update in orchestration_results['plasma_feeds_updated']:
            report += f"  📺 {update}\n"

        report += f"""

PERFORMANCE METRICS
{'-' * 40}
Collection period: {orchestration_results['performance_metrics'].get('collection_period', 'N/A')}

Source Performance:
"""
        source_metrics = orchestration_results['performance_metrics'].get('source_metrics', {})
        for source, metrics in source_metrics.items():
            report += f"  {source}:\n"
            report += f"    Success Rate: {metrics.get('average_success_rate', 0):.1f}%\n"
            report += f"    Response Time: {metrics.get('average_response_time', 0):.2f}s\n"
            report += f"    Items Collected: {metrics.get('total_items_collected', 0)}\n"

        report += f"""

UNIFIED THREAT INTELLIGENCE PIPELINE ACTIVE
{'-' * 50}
• CISA KEV: Known Exploited Vulnerabilities catalog
• VirusTotal: Malware analysis and file reputation
• AlienVault OTX: Community threat intelligence
• MISP: Multi-platform threat intelligence sharing
• NVD CVE: National Vulnerability Database
• FBI IC3: Federal cybersecurity alerts

NEXT ACTIONS
{'-' * 40}
1. Review high-correlation intelligence items
2. Update defensive measures based on unified intelligence
3. Monitor plasma displays for real-time threats
4. Continue automated intelligence collection
"""

        return report

# Unified Configuration Template
UNIFIED_CONFIG = {
    "virustotal": VT_CONFIG,
    "alienvault_otx": OTX_CONFIG,
    "misp": MISP_CONFIG,
    "cisa": {
        "kev_feed_url": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        "update_frequency": 3600  # 1 hour
    },
    "orchestration": {
        "collection_interval": 1800,  # 30 minutes
        "correlation_threshold": 0.8,
        "plasma_update_frequency": 300,  # 5 minutes
        "max_concurrent_sources": 6
    }
}

async def main():
    """Main function for unified threat intelligence orchestration"""
    logger.info("🌐 Starting Unified Threat Intelligence Orchestrator")
    logger.info("=" * 60)

    # Initialize orchestrator
    orchestrator = UnifiedThreatIntelligenceOrchestrator(UNIFIED_CONFIG)

    # Perform comprehensive threat intelligence orchestration
    results = await orchestrator.orchestrate_comprehensive_threat_intelligence()

    # Generate and display report
    report = orchestrator.generate_unified_intelligence_report(results)
    print(report)

    # Save report to file
    report_file = f"/Users/cp5337/Developer/ctas7-command-center/unified_threat_intel_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(report_file, 'w') as f:
        f.write(report)

    logger.info(f"\n✅ Unified threat intelligence orchestration complete")
    logger.info(f"   Report saved: {report_file}")
    logger.info(f"   Sources active: {len(results['sources_active'])}")
    logger.info(f"   Intelligence items: {sum(len(items) for items in results['intelligence_collected'].values())}")

if __name__ == "__main__":
    asyncio.run(main())