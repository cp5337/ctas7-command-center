"""
MISP Threat Intelligence Integration for CTAS7 Cybersecurity Streams
Real-time threat intelligence from MISP platforms with plasma feed integration

Author: CTAS7 Intelligence Generator
Purpose: MISP platform integration for comprehensive threat intelligence
USIM Integration: On-demand MISP queries with continuous threat monitoring
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
import requests
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MISPThreatLevel(Enum):
    """MISP threat level classification"""
    UNDEFINED = 4
    LOW = 3
    MEDIUM = 2
    HIGH = 1

class MISPAnalysis(Enum):
    """MISP analysis classification"""
    INITIAL = 0
    ONGOING = 1
    COMPLETE = 2

class MISPDistribution(Enum):
    """MISP distribution levels"""
    ORGANIZATION_ONLY = 0
    COMMUNITY_ONLY = 1
    CONNECTED_COMMUNITIES = 2
    ALL_COMMUNITIES = 3
    SHARING_GROUP = 4

@dataclass
class MISPIndicator:
    """MISP Indicator of Compromise structure"""
    ioc_id: str
    type: str  # ip-dst, domain, url, md5, sha256, etc.
    value: str
    category: str  # malware-sample, network activity, etc.
    to_ids: bool
    timestamp: datetime
    comment: str
    tags: List[str]
    galaxy_clusters: List[str]  # ATT&CK TTPs, threat actors, etc.

@dataclass
class MISPEvent:
    """MISP Event structure"""
    event_id: str
    uuid: str
    title: str
    info: str
    threat_level: MISPThreatLevel
    analysis: MISPAnalysis
    distribution: MISPDistribution
    timestamp: datetime
    published: bool
    attributes: List[MISPIndicator]
    tags: List[str]
    galaxy_clusters: List[Dict[str, Any]]
    org_name: str
    orgc_name: str

@dataclass
class MISPThreatActor:
    """MISP Threat Actor intelligence"""
    actor_id: str
    name: str
    description: str
    aliases: List[str]
    country: Optional[str]
    motivation: List[str]
    sophistication: str
    resource_level: str
    attack_ttps: List[str]  # MITRE ATT&CK TTPs
    associated_indicators: List[str]
    last_activity: datetime

class MISPThreatIntelligence:
    """MISP Threat Intelligence Integration System"""

    def __init__(self, misp_config: Dict[str, Any]):
        self.misp_instances = misp_config.get("instances", [])
        self.db_path = "/Users/cp5337/Developer/ctas7-command-center/misp_intelligence.db"
        self.rate_limit_delay = 1.0  # seconds between requests
        self.initialize_database()

    def initialize_database(self):
        """Initialize SQLite database for MISP intelligence"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # MISP Events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS misp_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT UNIQUE,
                uuid TEXT,
                title TEXT,
                info TEXT,
                threat_level INTEGER,
                analysis INTEGER,
                timestamp TEXT,
                published BOOLEAN,
                org_name TEXT,
                orgc_name TEXT,
                tags TEXT,
                galaxy_clusters TEXT,
                plasma_priority INTEGER,
                processed BOOLEAN DEFAULT FALSE
            )
        ''')

        # MISP Indicators table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS misp_indicators (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ioc_id TEXT UNIQUE,
                event_id TEXT,
                type TEXT,
                value TEXT,
                category TEXT,
                to_ids BOOLEAN,
                timestamp TEXT,
                comment TEXT,
                tags TEXT,
                galaxy_clusters TEXT,
                threat_relevance INTEGER,
                FOREIGN KEY (event_id) REFERENCES misp_events (event_id)
            )
        ''')

        # MISP Threat Actors table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS misp_threat_actors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id TEXT UNIQUE,
                name TEXT,
                description TEXT,
                aliases TEXT,
                country TEXT,
                motivation TEXT,
                sophistication TEXT,
                resource_level TEXT,
                attack_ttps TEXT,
                associated_indicators TEXT,
                last_activity TEXT,
                intelligence_value INTEGER
            )
        ''')

        # MISP Sources table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS misp_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                instance_url TEXT,
                instance_name TEXT,
                last_sync TEXT,
                event_count INTEGER,
                status TEXT
            )
        ''')

        conn.commit()
        conn.close()

    async def fetch_recent_events(self, days: int = 7, threat_level_min: int = 2) -> List[MISPEvent]:
        """Fetch recent events from all MISP instances"""
        logger.info(f"Fetching MISP events from last {days} days with threat level >= {threat_level_min}")

        all_events = []

        for instance in self.misp_instances:
            try:
                events = await self.fetch_from_misp_instance(instance, days, threat_level_min)
                all_events.extend(events)
                logger.info(f"Retrieved {len(events)} events from {instance['name']}")
            except Exception as e:
                logger.error(f"Error fetching from MISP instance {instance['name']}: {e}")

        return all_events

    async def fetch_from_misp_instance(self, instance: Dict[str, Any], days: int, threat_level_min: int) -> List[MISPEvent]:
        """Fetch events from a specific MISP instance"""
        url = instance["url"]
        api_key = instance["api_key"]
        verify_cert = instance.get("verify_cert", True)

        headers = {
            "Authorization": api_key,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        # MISP REST API search parameters
        search_params = {
            "returnFormat": "json",
            "type": "json",
            "last": f"{days}d",
            "threat_level": [str(i) for i in range(1, threat_level_min + 1)],
            "includeContext": 1,
            "metadata": 0
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{url}/events/restSearch",
                    headers=headers,
                    json=search_params,
                    ssl=verify_cert
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self.parse_misp_events(data, instance["name"])
                    else:
                        logger.error(f"MISP API error: {response.status}")
                        return []

        except Exception as e:
            logger.error(f"Error connecting to MISP instance {url}: {e}")
            return []

    def parse_misp_events(self, misp_data: Dict[str, Any], instance_name: str) -> List[MISPEvent]:
        """Parse MISP JSON response into MISPEvent objects"""
        events = []

        for event_data in misp_data.get("response", []):
            event = event_data.get("Event", {})

            # Parse attributes (indicators)
            attributes = []
            for attr in event.get("Attribute", []):
                indicator = MISPIndicator(
                    ioc_id=attr.get("uuid", ""),
                    type=attr.get("type", ""),
                    value=attr.get("value", ""),
                    category=attr.get("category", ""),
                    to_ids=attr.get("to_ids", False),
                    timestamp=datetime.fromtimestamp(int(attr.get("timestamp", 0))),
                    comment=attr.get("comment", ""),
                    tags=[tag.get("name", "") for tag in attr.get("Tag", [])],
                    galaxy_clusters=self.extract_galaxy_clusters(attr.get("Galaxy", []))
                )
                attributes.append(indicator)

            # Parse event-level galaxy clusters (MITRE ATT&CK, threat actors, etc.)
            galaxy_clusters = []
            for galaxy in event.get("Galaxy", []):
                for cluster in galaxy.get("GalaxyCluster", []):
                    galaxy_clusters.append({
                        "type": galaxy.get("type", ""),
                        "name": cluster.get("value", ""),
                        "description": cluster.get("description", ""),
                        "meta": cluster.get("meta", {})
                    })

            misp_event = MISPEvent(
                event_id=event.get("id", ""),
                uuid=event.get("uuid", ""),
                title=event.get("info", ""),
                info=event.get("info", ""),
                threat_level=MISPThreatLevel(int(event.get("threat_level_id", 4))),
                analysis=MISPAnalysis(int(event.get("analysis", 0))),
                distribution=MISPDistribution(int(event.get("distribution", 0))),
                timestamp=datetime.fromtimestamp(int(event.get("timestamp", 0))),
                published=bool(event.get("published", False)),
                attributes=attributes,
                tags=[tag.get("name", "") for tag in event.get("Tag", [])],
                galaxy_clusters=galaxy_clusters,
                org_name=event.get("Org", {}).get("name", ""),
                orgc_name=event.get("Orgc", {}).get("name", "")
            )

            events.append(misp_event)

        return events

    def extract_galaxy_clusters(self, galaxies: List[Dict[str, Any]]) -> List[str]:
        """Extract galaxy cluster names from MISP galaxy data"""
        clusters = []
        for galaxy in galaxies:
            for cluster in galaxy.get("GalaxyCluster", []):
                clusters.append(cluster.get("value", ""))
        return clusters

    async def fetch_threat_actors(self) -> List[MISPThreatActor]:
        """Fetch threat actor intelligence from MISP"""
        logger.info("Fetching threat actor intelligence from MISP")

        threat_actors = []

        for instance in self.misp_instances:
            try:
                actors = await self.fetch_threat_actors_from_instance(instance)
                threat_actors.extend(actors)
            except Exception as e:
                logger.error(f"Error fetching threat actors from {instance['name']}: {e}")

        return threat_actors

    async def fetch_threat_actors_from_instance(self, instance: Dict[str, Any]) -> List[MISPThreatActor]:
        """Fetch threat actors from a specific MISP instance"""
        url = instance["url"]
        api_key = instance["api_key"]
        verify_cert = instance.get("verify_cert", True)

        headers = {
            "Authorization": api_key,
            "Accept": "application/json"
        }

        try:
            # Fetch threat actor galaxy
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{url}/galaxies/view/threat-actor",
                    headers=headers,
                    ssl=verify_cert
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self.parse_threat_actors(data)
                    else:
                        logger.error(f"Error fetching threat actors: {response.status}")
                        return []

        except Exception as e:
            logger.error(f"Error fetching threat actors: {e}")
            return []

    def parse_threat_actors(self, galaxy_data: Dict[str, Any]) -> List[MISPThreatActor]:
        """Parse MISP threat actor galaxy data"""
        actors = []

        galaxy = galaxy_data.get("Galaxy", {})
        for cluster in galaxy.get("GalaxyCluster", []):
            meta = cluster.get("meta", {})

            actor = MISPThreatActor(
                actor_id=cluster.get("uuid", ""),
                name=cluster.get("value", ""),
                description=cluster.get("description", ""),
                aliases=meta.get("synonyms", []),
                country=meta.get("country", [None])[0] if meta.get("country") else None,
                motivation=meta.get("motivation", []),
                sophistication=meta.get("sophistication", ["Unknown"])[0],
                resource_level=meta.get("resource-level", ["Unknown"])[0],
                attack_ttps=meta.get("techniques", []),
                associated_indicators=[],  # Would need separate query
                last_activity=datetime.now()  # Would need to determine from events
            )
            actors.append(actor)

        return actors

    async def analyze_threat_landscape(self) -> Dict[str, Any]:
        """Analyze current threat landscape from MISP data"""
        logger.info("Analyzing MISP threat landscape")

        # Fetch recent events and threat actors
        recent_events = await self.fetch_recent_events(days=7, threat_level_min=2)
        threat_actors = await self.fetch_threat_actors()

        analysis = {
            "timestamp": datetime.now().isoformat(),
            "misp_summary": {
                "recent_events": len(recent_events),
                "high_threat_events": len([e for e in recent_events if e.threat_level == MISPThreatLevel.HIGH]),
                "published_events": len([e for e in recent_events if e.published]),
                "active_threat_actors": len(threat_actors)
            },
            "indicator_analysis": self.analyze_indicators(recent_events),
            "threat_actor_analysis": self.analyze_threat_actors(threat_actors),
            "attack_pattern_analysis": self.analyze_attack_patterns(recent_events),
            "plasma_feed_recommendations": {},
            "actionable_intelligence": []
        }

        # Generate plasma feed recommendations
        analysis["plasma_feed_recommendations"] = self.generate_plasma_recommendations(analysis)

        # Generate actionable intelligence
        analysis["actionable_intelligence"] = self.generate_actionable_intelligence(analysis, recent_events)

        # Store analysis results
        await self.store_misp_data(recent_events, threat_actors)

        return analysis

    def analyze_indicators(self, events: List[MISPEvent]) -> Dict[str, Any]:
        """Analyze indicators of compromise from MISP events"""
        all_indicators = []
        for event in events:
            all_indicators.extend(event.attributes)

        indicator_types = {}
        threat_categories = {}

        for indicator in all_indicators:
            # Count indicator types
            if indicator.type not in indicator_types:
                indicator_types[indicator.type] = 0
            indicator_types[indicator.type] += 1

            # Count threat categories
            if indicator.category not in threat_categories:
                threat_categories[indicator.category] = 0
            threat_categories[indicator.category] += 1

        return {
            "total_indicators": len(all_indicators),
            "to_ids_indicators": len([i for i in all_indicators if i.to_ids]),
            "indicator_types": indicator_types,
            "threat_categories": threat_categories,
            "recent_indicators": len([i for i in all_indicators if (datetime.now() - i.timestamp).days <= 1])
        }

    def analyze_threat_actors(self, actors: List[MISPThreatActor]) -> Dict[str, Any]:
        """Analyze threat actor intelligence"""
        country_attribution = {}
        motivation_analysis = {}
        sophistication_levels = {}

        for actor in actors:
            # Country attribution
            if actor.country:
                if actor.country not in country_attribution:
                    country_attribution[actor.country] = 0
                country_attribution[actor.country] += 1

            # Motivation analysis
            for motivation in actor.motivation:
                if motivation not in motivation_analysis:
                    motivation_analysis[motivation] = 0
                motivation_analysis[motivation] += 1

            # Sophistication levels
            if actor.sophistication not in sophistication_levels:
                sophistication_levels[actor.sophistication] = 0
            sophistication_levels[actor.sophistication] += 1

        return {
            "total_actors": len(actors),
            "country_attribution": country_attribution,
            "motivation_analysis": motivation_analysis,
            "sophistication_levels": sophistication_levels,
            "state_sponsored_count": len([a for a in actors if "state" in " ".join(a.motivation).lower()])
        }

    def analyze_attack_patterns(self, events: List[MISPEvent]) -> Dict[str, Any]:
        """Analyze MITRE ATT&CK patterns from MISP events"""
        attack_patterns = {}
        tactics = {}

        for event in events:
            for cluster in event.galaxy_clusters:
                if cluster.get("type") == "mitre-attack-pattern":
                    pattern_name = cluster.get("name", "")
                    if pattern_name not in attack_patterns:
                        attack_patterns[pattern_name] = 0
                    attack_patterns[pattern_name] += 1

                    # Extract tactic from meta data
                    meta = cluster.get("meta", {})
                    if "kill_chain_phases" in meta:
                        for phase in meta["kill_chain_phases"]:
                            tactic = phase.get("phase_name", "")
                            if tactic not in tactics:
                                tactics[tactic] = 0
                            tactics[tactic] += 1

        return {
            "total_patterns": len(attack_patterns),
            "top_attack_patterns": dict(sorted(attack_patterns.items(), key=lambda x: x[1], reverse=True)[:10]),
            "tactic_distribution": tactics,
            "unique_tactics": len(tactics)
        }

    def generate_plasma_recommendations(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate recommendations for plasma display feeds"""
        recommendations = {}

        misp_summary = analysis["misp_summary"]

        # High priority MISP events feed
        if misp_summary["high_threat_events"] > 0:
            recommendations["misp_high_threat"] = {
                "active": True,
                "priority": 9,
                "update_frequency": "15min",
                "reason": f"{misp_summary['high_threat_events']} high threat events detected"
            }

        # Recent indicators feed
        indicator_analysis = analysis["indicator_analysis"]
        if indicator_analysis["recent_indicators"] > 10:
            recommendations["misp_indicators"] = {
                "active": True,
                "priority": 8,
                "update_frequency": "30min",
                "reason": f"{indicator_analysis['recent_indicators']} recent indicators available"
            }

        # Threat actor intelligence feed
        actor_analysis = analysis["threat_actor_analysis"]
        if actor_analysis["state_sponsored_count"] > 0:
            recommendations["misp_threat_actors"] = {
                "active": True,
                "priority": 9,
                "update_frequency": "1hour",
                "reason": f"{actor_analysis['state_sponsored_count']} state-sponsored actors tracked"
            }

        return recommendations

    def generate_actionable_intelligence(self, analysis: Dict[str, Any], events: List[MISPEvent]) -> List[str]:
        """Generate actionable intelligence from MISP analysis"""
        intelligence = []

        misp_summary = analysis["misp_summary"]

        if misp_summary["high_threat_events"] > 3:
            intelligence.append(f"CRITICAL: {misp_summary['high_threat_events']} high threat events published in MISP - review immediately")

        # Recent published events
        if misp_summary["published_events"] > 5:
            intelligence.append(f"HIGH: {misp_summary['published_events']} events recently published - integrate IoCs into defensive measures")

        # Attack pattern analysis
        attack_analysis = analysis["attack_pattern_analysis"]
        if attack_analysis["total_patterns"] > 0:
            top_pattern = list(attack_analysis["top_attack_patterns"].keys())[0] if attack_analysis["top_attack_patterns"] else "Unknown"
            intelligence.append(f"MEDIUM: Most observed attack pattern: {top_pattern} - enhance detection capabilities")

        # Threat actor intelligence
        actor_analysis = analysis["threat_actor_analysis"]
        if actor_analysis["state_sponsored_count"] > 0:
            intelligence.append(f"HIGH: {actor_analysis['state_sponsored_count']} state-sponsored threat actors active - implement advanced threat hunting")

        intelligence.append("ONGOING: Maintain MISP integration and threat intelligence sharing")

        return intelligence

    async def store_misp_data(self, events: List[MISPEvent], threat_actors: List[MISPThreatActor]):
        """Store MISP data to local database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Store events
        for event in events:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO misp_events
                    (event_id, uuid, title, info, threat_level, analysis, timestamp, published,
                     org_name, orgc_name, tags, galaxy_clusters, plasma_priority)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    event.event_id,
                    event.uuid,
                    event.title,
                    event.info,
                    event.threat_level.value,
                    event.analysis.value,
                    event.timestamp.isoformat(),
                    event.published,
                    event.org_name,
                    event.orgc_name,
                    json.dumps(event.tags),
                    json.dumps(event.galaxy_clusters),
                    9 if event.threat_level == MISPThreatLevel.HIGH else 7
                ))

                # Store indicators
                for indicator in event.attributes:
                    cursor.execute('''
                        INSERT OR REPLACE INTO misp_indicators
                        (ioc_id, event_id, type, value, category, to_ids, timestamp,
                         comment, tags, galaxy_clusters, threat_relevance)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        indicator.ioc_id,
                        event.event_id,
                        indicator.type,
                        indicator.value,
                        indicator.category,
                        indicator.to_ids,
                        indicator.timestamp.isoformat(),
                        indicator.comment,
                        json.dumps(indicator.tags),
                        json.dumps(indicator.galaxy_clusters),
                        8 if indicator.to_ids else 5
                    ))

            except Exception as e:
                logger.error(f"Error storing MISP event {event.event_id}: {e}")

        # Store threat actors
        for actor in threat_actors:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO misp_threat_actors
                    (actor_id, name, description, aliases, country, motivation,
                     sophistication, resource_level, attack_ttps, last_activity, intelligence_value)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    actor.actor_id,
                    actor.name,
                    actor.description,
                    json.dumps(actor.aliases),
                    actor.country,
                    json.dumps(actor.motivation),
                    actor.sophistication,
                    actor.resource_level,
                    json.dumps(actor.attack_ttps),
                    actor.last_activity.isoformat(),
                    9 if "state" in " ".join(actor.motivation).lower() else 6
                ))

            except Exception as e:
                logger.error(f"Error storing threat actor {actor.name}: {e}")

        conn.commit()
        conn.close()

# MISP Configuration Template
MISP_CONFIG = {
    "instances": [
        {
            "name": "MISP Instance 1",
            "url": "https://your-misp-instance.com",
            "api_key": "your-api-key-here",
            "verify_cert": True,
            "priority": 1
        },
        {
            "name": "Public MISP",
            "url": "https://misp.circl.lu",
            "api_key": "your-public-api-key",
            "verify_cert": True,
            "priority": 2
        }
    ],
    "update_frequency": 300,  # seconds
    "threat_level_threshold": 2,  # minimum threat level to fetch
    "days_history": 7
}

async def main():
    """Main function for MISP threat intelligence integration"""
    logger.info("Starting MISP Threat Intelligence Integration")

    # Initialize MISP integration
    misp_intel = MISPThreatIntelligence(MISP_CONFIG)

    # Perform threat landscape analysis
    analysis = await misp_intel.analyze_threat_landscape()

    # Log analysis results
    logger.info("MISP Analysis Complete:")
    logger.info(f"Recent Events: {analysis['misp_summary']['recent_events']}")
    logger.info(f"High Threat Events: {analysis['misp_summary']['high_threat_events']}")
    logger.info(f"Total Indicators: {analysis['indicator_analysis']['total_indicators']}")
    logger.info(f"Active Threat Actors: {analysis['misp_summary']['active_threat_actors']}")

    return analysis

if __name__ == "__main__":
    asyncio.run(main())