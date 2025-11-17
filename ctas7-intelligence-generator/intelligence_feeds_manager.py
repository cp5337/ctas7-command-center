#!/usr/bin/env python3
"""
Intelligence Feeds Manager
Tests API keys and discovers quality RSS feeds for OSINT
"""

import asyncio
import aiohttp
import feedparser
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path

# Load environment variables
def load_env_file():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IntelligenceFeedsManager:
    """Test API keys and discover quality RSS feeds"""

    def __init__(self):
        self.api_keys = {
            "virustotal": os.getenv("VIRUSTOTAL_API_KEY"),
            "otx": os.getenv("ALIENVAULT_OTX_API_KEY"),
            "misp": os.getenv("MISP_API_KEY"),
            "google_ai": os.getenv("GOOGLE_AI_API_KEY")
        }

        # Quality RSS feeds for threat intelligence
        self.rss_feeds = {
            "government": [
                {
                    "name": "CISA Alerts",
                    "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml",
                    "category": "government_advisories",
                    "priority": "critical"
                },
                {
                    "name": "US-CERT Alerts",
                    "url": "https://www.us-cert.gov/ncas/alerts.xml",
                    "category": "government_alerts",
                    "priority": "critical"
                },
                {
                    "name": "FBI IC3 Alerts",
                    "url": "https://www.ic3.gov/Media/RSS",
                    "category": "law_enforcement",
                    "priority": "high"
                }
            ],
            "commercial": [
                {
                    "name": "Krebs on Security",
                    "url": "https://krebsonsecurity.com/feed/",
                    "category": "cybersecurity_news",
                    "priority": "high"
                },
                {
                    "name": "Schneier on Security",
                    "url": "https://www.schneier.com/blog/atom.xml",
                    "category": "security_analysis",
                    "priority": "high"
                },
                {
                    "name": "Threatpost",
                    "url": "https://threatpost.com/feed/",
                    "category": "threat_news",
                    "priority": "high"
                },
                {
                    "name": "Dark Reading",
                    "url": "https://www.darkreading.com/rss_simple.asp",
                    "category": "enterprise_security",
                    "priority": "medium"
                },
                {
                    "name": "The Hacker News",
                    "url": "https://feeds.feedburner.com/TheHackersNews",
                    "category": "security_news",
                    "priority": "medium"
                }
            ],
            "vendor": [
                {
                    "name": "Microsoft Security",
                    "url": "https://www.microsoft.com/en-us/security/blog/feed/",
                    "category": "vendor_intelligence",
                    "priority": "high"
                },
                {
                    "name": "Cisco Talos",
                    "url": "https://blog.talosintelligence.com/feeds/posts/default",
                    "category": "threat_research",
                    "priority": "critical"
                },
                {
                    "name": "Mandiant",
                    "url": "https://www.mandiant.com/resources/blog/rss.xml",
                    "category": "apt_research",
                    "priority": "critical"
                },
                {
                    "name": "Recorded Future",
                    "url": "https://www.recordedfuture.com/feed",
                    "category": "threat_intelligence",
                    "priority": "high"
                }
            ],
            "research": [
                {
                    "name": "SANS ISC",
                    "url": "https://isc.sans.edu/rssfeed.xml",
                    "category": "security_research",
                    "priority": "high"
                },
                {
                    "name": "Malwarebytes Labs",
                    "url": "https://blog.malwarebytes.com/feed/",
                    "category": "malware_research",
                    "priority": "medium"
                },
                {
                    "name": "Unit 42",
                    "url": "https://unit42.paloaltonetworks.com/feed/",
                    "category": "threat_research",
                    "priority": "critical"
                }
            ]
        }

    async def test_virustotal_api(self) -> Dict[str, Any]:
        """Test VirusTotal API key"""
        if not self.api_keys["virustotal"] or "get_free_key" in self.api_keys["virustotal"]:
            return {"status": "not_configured", "message": "API key not configured"}

        try:
            async with aiohttp.ClientSession() as session:
                headers = {"x-apikey": self.api_keys["virustotal"]}
                async with session.get(
                    "https://www.virustotal.com/api/v3/users/cp5337",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "valid",
                            "tier": "free" if "quota" in str(data) else "premium",
                            "limits": data.get("data", {}).get("attributes", {}).get("quotas", {})
                        }
                    elif response.status == 401:
                        return {"status": "invalid", "message": "Invalid API key"}
                    else:
                        return {"status": "error", "code": response.status}

        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def test_otx_api(self) -> Dict[str, Any]:
        """Test AlienVault OTX API key"""
        if not self.api_keys["otx"] or "get_free_key" in self.api_keys["otx"]:
            return {"status": "not_configured", "message": "API key not configured"}

        try:
            async with aiohttp.ClientSession() as session:
                headers = {"X-OTX-API-KEY": self.api_keys["otx"]}
                async with session.get(
                    "https://otx.alienvault.com/api/v1/user/me",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "valid",
                            "username": data.get("username"),
                            "member_since": data.get("member_since")
                        }
                    elif response.status == 403:
                        return {"status": "invalid", "message": "Invalid API key"}
                    else:
                        return {"status": "error", "code": response.status}

        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def test_feed_quality(self, feed: Dict[str, str]) -> Dict[str, Any]:
        """Test RSS feed quality and recent activity"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(feed["url"], timeout=10) as response:
                    if response.status != 200:
                        return {"status": "unreachable", "code": response.status}

                    content = await response.text()
                    parsed = feedparser.parse(content)

                    if not parsed.entries:
                        return {"status": "no_entries"}

                    # Check recency
                    latest_entry = parsed.entries[0]
                    published = latest_entry.get("published_parsed")

                    if published:
                        pub_date = datetime(*published[:6])
                        days_old = (datetime.now() - pub_date).days
                    else:
                        days_old = 999

                    # Quality metrics
                    total_entries = len(parsed.entries)
                    recent_entries = sum(1 for e in parsed.entries[:10]
                                       if self._is_recent_entry(e, days=7))

                    return {
                        "status": "active",
                        "total_entries": total_entries,
                        "recent_entries_7d": recent_entries,
                        "latest_entry_age_days": days_old,
                        "feed_title": parsed.feed.get("title", "Unknown"),
                        "quality_score": self._calculate_quality_score(days_old, recent_entries, total_entries)
                    }

        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _is_recent_entry(self, entry: Dict[str, Any], days: int = 7) -> bool:
        """Check if entry is recent"""
        published = entry.get("published_parsed")
        if published:
            pub_date = datetime(*published[:6])
            return (datetime.now() - pub_date).days <= days
        return False

    def _calculate_quality_score(self, latest_age: int, recent_count: int, total_count: int) -> float:
        """Calculate feed quality score (0-1)"""
        # Age penalty
        age_score = max(0, 1 - (latest_age / 30))  # Penalize if >30 days old

        # Activity score
        activity_score = min(1, recent_count / 3)  # Good if 3+ recent posts

        # Volume score
        volume_score = min(1, total_count / 10)  # Good if 10+ total posts

        return (age_score * 0.5) + (activity_score * 0.3) + (volume_score * 0.2)

    async def discover_new_feeds(self) -> List[Dict[str, Any]]:
        """Discover new quality RSS feeds"""
        # Search for feeds from known good domains
        discovery_targets = [
            "https://www.fireeye.com",
            "https://www.crowdstrike.com/blog",
            "https://blog.google/threat-analysis-group",
            "https://www.elastic.co/security-labs",
            "https://blog.checkpoint.com",
            "https://blogs.juniper.net/en-us/threat-research",
            "https://www.trendmicro.com/en_us/research.html"
        ]

        discovered_feeds = []

        for target in discovery_targets:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(target, timeout=10) as response:
                        if response.status == 200:
                            content = await response.text()

                            # Look for RSS/feed links
                            import re
                            rss_patterns = [
                                r'href="([^"]*(?:rss|feed|atom)[^"]*)"',
                                r'href="([^"]*\.xml)"',
                                r'<link[^>]*type="application/(?:rss|atom)\+xml"[^>]*href="([^"]*)"'
                            ]

                            for pattern in rss_patterns:
                                matches = re.findall(pattern, content, re.IGNORECASE)
                                for match in matches:
                                    if match.startswith('/'):
                                        feed_url = f"{target.rstrip('/')}{match}"
                                    elif match.startswith('http'):
                                        feed_url = match
                                    else:
                                        continue

                                    discovered_feeds.append({
                                        "url": feed_url,
                                        "source_domain": target,
                                        "discovered": True
                                    })

            except Exception as e:
                logger.warning(f"Could not discover feeds from {target}: {e}")

        return discovered_feeds

    async def run_complete_assessment(self) -> Dict[str, Any]:
        """Run complete intelligence feeds assessment"""
        logger.info("🔍 Running complete intelligence feeds assessment...")

        results = {
            "timestamp": datetime.now().isoformat(),
            "api_keys": {},
            "rss_feeds": {},
            "discovered_feeds": [],
            "recommendations": []
        }

        # Test API keys
        logger.info("🔑 Testing API keys...")
        results["api_keys"]["virustotal"] = await self.test_virustotal_api()
        results["api_keys"]["otx"] = await self.test_otx_api()

        # Test configured RSS feeds
        logger.info("📡 Testing RSS feeds...")
        for category, feeds in self.rss_feeds.items():
            results["rss_feeds"][category] = []

            for feed in feeds:
                logger.info(f"   Testing {feed['name']}...")
                quality = await self.test_feed_quality(feed)

                feed_result = {**feed, **quality}
                results["rss_feeds"][category].append(feed_result)

        # Discover new feeds
        logger.info("🔎 Discovering new feeds...")
        results["discovered_feeds"] = await self.discover_new_feeds()

        # Generate recommendations
        results["recommendations"] = self._generate_recommendations(results)

        return results

    def _generate_recommendations(self, results: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate recommendations based on assessment"""
        recommendations = []

        # API key recommendations
        for api_name, status in results["api_keys"].items():
            if status["status"] == "not_configured":
                recommendations.append({
                    "type": "api_key",
                    "priority": "high",
                    "message": f"Configure {api_name.upper()} API key for enhanced intelligence",
                    "action": f"Get free API key from {api_name} website"
                })
            elif status["status"] == "invalid":
                recommendations.append({
                    "type": "api_key",
                    "priority": "critical",
                    "message": f"{api_name.upper()} API key is invalid",
                    "action": f"Update {api_name} API key in .env file"
                })

        # Feed recommendations
        high_quality_feeds = []
        low_quality_feeds = []

        for category, feeds in results["rss_feeds"].items():
            for feed in feeds:
                if feed.get("quality_score", 0) > 0.7:
                    high_quality_feeds.append(feed["name"])
                elif feed.get("quality_score", 0) < 0.3:
                    low_quality_feeds.append(feed["name"])

        if high_quality_feeds:
            recommendations.append({
                "type": "feed_quality",
                "priority": "info",
                "message": f"High quality feeds: {', '.join(high_quality_feeds[:3])}",
                "action": "Consider prioritizing these feeds for monitoring"
            })

        if low_quality_feeds:
            recommendations.append({
                "type": "feed_quality",
                "priority": "low",
                "message": f"Low activity feeds: {', '.join(low_quality_feeds[:3])}",
                "action": "Consider finding alternative feeds or reducing priority"
            })

        return recommendations

async def main():
    """Run intelligence feeds assessment"""
    manager = IntelligenceFeedsManager()
    results = await manager.run_complete_assessment()

    print("🎯 INTELLIGENCE FEEDS ASSESSMENT REPORT")
    print("=" * 50)

    # API Keys Status
    print("\n🔑 API KEYS STATUS:")
    for api_name, status in results["api_keys"].items():
        status_icon = "✅" if status["status"] == "valid" else "❌" if status["status"] == "invalid" else "⚠️"
        print(f"   {status_icon} {api_name.upper()}: {status['status']}")

    # RSS Feeds Quality
    print("\n📡 RSS FEEDS QUALITY:")
    total_feeds = 0
    active_feeds = 0

    for category, feeds in results["rss_feeds"].items():
        print(f"\n   📁 {category.upper()}:")
        for feed in feeds:
            total_feeds += 1
            quality = feed.get("quality_score", 0)
            status = feed.get("status", "unknown")

            if status == "active":
                active_feeds += 1
                quality_icon = "🟢" if quality > 0.7 else "🟡" if quality > 0.4 else "🔴"
                print(f"      {quality_icon} {feed['name']}: {quality:.2f} quality")
            else:
                print(f"      ❌ {feed['name']}: {status}")

    # Summary
    print(f"\n📊 SUMMARY:")
    print(f"   Total Feeds: {total_feeds}")
    print(f"   Active Feeds: {active_feeds}")
    print(f"   Success Rate: {(active_feeds/total_feeds)*100:.1f}%")

    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    for rec in results["recommendations"]:
        priority_icon = "🔥" if rec["priority"] == "critical" else "⚡" if rec["priority"] == "high" else "💡"
        print(f"   {priority_icon} {rec['message']}")

    print("\n✅ Intelligence feeds assessment complete!")

    # Save results
    with open("intelligence_feeds_assessment.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    print("📁 Results saved to: intelligence_feeds_assessment.json")

if __name__ == "__main__":
    asyncio.run(main())