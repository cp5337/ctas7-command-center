#!/usr/bin/env python3
"""
Social Media Intelligence Monitoring
Keyword-based monitoring for terrorism indicators on social platforms
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

class SocialMediaIntelligence:
    def __init__(self):
        # ABE integration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Database setup
        self.cache_dir = Path("social_media_intelligence")
        self.cache_dir.mkdir(exist_ok=True)
        self.db_path = self.cache_dir / "social_intelligence.db"

        self.init_database()

        # Platform monitoring endpoints
        self.platforms = {
            "Twitter_Public": {
                "search_url": "https://nitter.net/search",  # Public Twitter alternative
                "description": "Public Twitter posts via Nitter",
                "enabled": True
            },
            "Reddit_Security": {
                "search_url": "https://www.reddit.com/r/security/search.json",
                "description": "Security-related Reddit posts",
                "enabled": True
            },
            "Telegram_Public": {
                "search_url": None,  # Requires specific API setup
                "description": "Public Telegram channels",
                "enabled": False
            },
            "YouTube_Security": {
                "search_url": "https://www.googleapis.com/youtube/v3/search",
                "description": "Security-related YouTube content",
                "enabled": False  # Requires API key
            }
        }

        # Social media keyword manifest (refined for social platforms)
        self.social_keywords = {
            "Immediate_Threats": [
                "planning attack", "going to bomb", "target tonight",
                "allahu akbar", "martyrdom operation", "jihad time"
            ],
            "Recruitment": [
                "join the cause", "brothers needed", "sisters welcome",
                "training camp", "learn to fight", "defend Islam"
            ],
            "Surveillance_Language": [
                "watching them", "studying target", "security weak",
                "soft target", "easy access", "no guards"
            ],
            "Weapon_Interest": [
                "bomb recipe", "pressure cooker", "truck rental",
                "gun store", "ammonium nitrate", "pipe bomb"
            ],
            "Location_Specific": [
                "federal building", "synagogue", "church", "school",
                "mall", "airport", "subway", "government office"
            ]
        }

    def init_database(self):
        """Initialize social media intelligence database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS social_posts (
                id TEXT PRIMARY KEY,
                platform TEXT,
                username TEXT,
                content TEXT,
                url TEXT,
                post_date TEXT,
                keywords_matched TEXT,
                threat_assessment TEXT,
                urgency_level TEXT,
                abe_analysis TEXT,
                location_indicators TEXT,
                collection_date TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS account_monitoring (
                account_id TEXT PRIMARY KEY,
                platform TEXT,
                username TEXT,
                account_type TEXT,
                threat_level TEXT,
                post_count INTEGER,
                last_activity TEXT,
                monitoring_reason TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS threat_indicators (
                indicator_id TEXT PRIMARY KEY,
                indicator_type TEXT,
                content_pattern TEXT,
                threat_level TEXT,
                platform_source TEXT,
                frequency INTEGER,
                last_detected TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def search_twitter_nitter(self, query_terms):
        """Search Twitter via Nitter (public access)"""
        posts = []

        try:
            # Build search query
            search_query = " OR ".join(query_terms[:3])  # Limit to avoid overwhelming

            # Note: This is a demonstration structure
            # Real implementation would use Nitter API or web scraping
            print(f"    🐦 Searching Twitter via Nitter for: {search_query[:50]}...")

            # Simulated social media post for demonstration
            sample_post = {
                'platform': 'Twitter',
                'content': f"Sample content mentioning {query_terms[0]}",
                'url': 'https://twitter.com/example_user/status/123456',
                'username': 'example_user',
                'post_date': datetime.now().isoformat()
            }

            # In real implementation, parse Nitter search results here
            # posts.append(sample_post)

        except Exception as e:
            print(f"    ❌ Twitter search failed: {e}")

        return posts

    def search_reddit_security(self, query_terms):
        """Search security-related Reddit posts"""
        posts = []

        try:
            print(f"    📱 Searching Reddit for: {query_terms[:3]}...")

            # Reddit API search (requires proper headers)
            headers = {
                'User-Agent': 'ThreatIntelligence/1.0 (by /u/security_researcher)'
            }

            for term in query_terms[:2]:  # Limit API calls
                url = f"https://www.reddit.com/search.json?q={term}&sort=new&limit=10"

                try:
                    response = requests.get(url, headers=headers, timeout=30)
                    time.sleep(2)  # Rate limiting

                    if response.status_code == 200:
                        data = response.json()

                        for post in data.get('data', {}).get('children', []):
                            post_data = post.get('data', {})

                            # Check if relevant to security/terrorism
                            title = post_data.get('title', '')
                            content = post_data.get('selftext', '')

                            if self.check_social_keywords(f"{title} {content}"):
                                posts.append({
                                    'platform': 'Reddit',
                                    'content': f"{title}\n{content}"[:500],
                                    'url': f"https://reddit.com{post_data.get('permalink', '')}",
                                    'username': post_data.get('author', 'unknown'),
                                    'post_date': datetime.fromtimestamp(
                                        post_data.get('created_utc', 0)
                                    ).isoformat()
                                })

                except requests.RequestException as e:
                    print(f"      ⚠️ Reddit API error: {e}")
                    continue

        except Exception as e:
            print(f"    ❌ Reddit search failed: {e}")

        return posts

    def check_social_keywords(self, content):
        """Check social media content against keyword manifest"""
        content_lower = content.lower()
        matches = {}

        for category, keywords in self.social_keywords.items():
            category_matches = []
            for keyword in keywords:
                if keyword.lower() in content_lower:
                    category_matches.append(keyword)

            if category_matches:
                matches[category] = category_matches

        return matches if matches else None

    def assess_social_threat_level(self, post_data):
        """Use ABE to assess threat level of social media post"""
        content = post_data.get('content', '')
        keywords = post_data.get('keywords_matched', {})
        platform = post_data.get('platform', '')

        prompt = f"""
        Assess the threat level of this social media post:

        Platform: {platform}
        Content: {content[:800]}
        Keywords Matched: {keywords}

        Analyze for:
        1. IMMINENT THREAT: Is there indication of planned violence?
        2. RECRUITMENT ACTIVITY: Is this recruiting or radicalizing?
        3. SURVEILLANCE: Is someone conducting reconnaissance?
        4. CREDIBILITY: Does this appear to be a credible threat?
        5. URGENCY: Does this require immediate law enforcement attention?

        Rate urgency: CRITICAL/HIGH/MEDIUM/LOW
        Determine if law enforcement should be alerted.

        Return as JSON with: urgency_level, law_enforcement_alert, analysis, indicators
        """

        try:
            response = self.model.generate_content(prompt)
            json_match = re.search(r'\{.*?\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'urgency_level': 'LOW',
                    'law_enforcement_alert': False,
                    'analysis': response.text[:500],
                    'indicators': 'Requires manual review'
                }
        except Exception as e:
            return {
                'urgency_level': 'UNKNOWN',
                'law_enforcement_alert': False,
                'analysis': f'Assessment failed: {e}',
                'indicators': 'Manual review required'
            }

    def monitor_social_platforms(self):
        """Monitor enabled social media platforms"""
        print("📱 SOCIAL MEDIA INTELLIGENCE MONITORING")
        print("=" * 50)

        all_posts = []

        # Generate search terms from keywords
        search_terms = []
        for category, keywords in self.social_keywords.items():
            search_terms.extend(keywords[:2])  # Take top 2 from each category

        # Monitor Twitter via Nitter
        if self.platforms["Twitter_Public"]["enabled"]:
            twitter_posts = self.search_twitter_nitter(search_terms[:5])
            all_posts.extend(twitter_posts)

        # Monitor Reddit
        if self.platforms["Reddit_Security"]["enabled"]:
            reddit_posts = self.search_reddit_security(search_terms[:3])
            all_posts.extend(reddit_posts)

        # Process and analyze posts
        intelligence_posts = []

        for post in all_posts:
            # Check for keywords
            keyword_matches = self.check_social_keywords(post.get('content', ''))

            if keyword_matches:
                post['keywords_matched'] = keyword_matches

                # ABE threat assessment
                threat_assessment = self.assess_social_threat_level(post)
                post.update(threat_assessment)

                # Cache in database
                self.cache_social_post(post)
                intelligence_posts.append(post)

                print(f"  ✅ {post['platform']}: {post.get('content', '')[:60]}... [{post.get('urgency_level', 'UNKNOWN')}]")

        return intelligence_posts

    def cache_social_post(self, post_data):
        """Cache social media post in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        post_id = f"{post_data.get('platform', '')}_{hash(post_data.get('content', ''))}"

        cursor.execute('''
            INSERT OR REPLACE INTO social_posts
            (id, platform, username, content, url, post_date,
             keywords_matched, threat_assessment, urgency_level,
             abe_analysis, collection_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post_id,
            post_data.get('platform', ''),
            post_data.get('username', ''),
            post_data.get('content', ''),
            post_data.get('url', ''),
            post_data.get('post_date', ''),
            json.dumps(post_data.get('keywords_matched', {})),
            post_data.get('analysis', ''),
            post_data.get('urgency_level', 'UNKNOWN'),
            json.dumps(post_data.get('indicators', '')),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    def generate_social_intelligence_brief(self, posts):
        """Generate social media intelligence brief"""
        if not posts:
            return "No social media intelligence gathered in current monitoring cycle."

        urgency_levels = {}
        platform_distribution = {}

        for post in posts:
            urgency = post.get('urgency_level', 'UNKNOWN')
            platform = post.get('platform', 'Unknown')

            urgency_levels[urgency] = urgency_levels.get(urgency, 0) + 1
            platform_distribution[platform] = platform_distribution.get(platform, 0) + 1

        prompt = f"""
        Generate social media intelligence brief from {len(posts)} posts:

        Urgency Distribution: {urgency_levels}
        Platform Distribution: {platform_distribution}

        Key findings:
        1. THREAT INDICATORS: What immediate threats were detected?
        2. PLATFORM PATTERNS: Which platforms show most concerning activity?
        3. TREND ANALYSIS: What trends emerge from social monitoring?
        4. EARLY WARNING: What indicators suggest developing threats?
        5. RECOMMENDATIONS: What actions should be taken?

        Format as professional social media intelligence brief.
        Include specific recommendations for law enforcement coordination.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Social media intelligence brief generation failed"

    def save_intelligence_package(self, data, category):
        """Save social intelligence package"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"social_intel_{category}_{timestamp}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

def main():
    print("📱 SOCIAL MEDIA INTELLIGENCE MONITORING")
    print("=" * 50)
    print("Keyword-based monitoring for terrorism indicators")

    monitor = SocialMediaIntelligence()

    # Display platform status
    print(f"\n🌐 MONITORED PLATFORMS:")
    for platform, config in monitor.platforms.items():
        status = "✅" if config["enabled"] else "❌"
        print(f"   {status} {platform}: {config['description']}")

    # Display keyword categories
    print(f"\n🔍 SOCIAL KEYWORD CATEGORIES:")
    for category, keywords in monitor.social_keywords.items():
        print(f"   {category}: {len(keywords)} keywords")

    # Run monitoring
    print(f"\n🔄 Running social media monitoring...")
    posts = monitor.monitor_social_platforms()

    if posts:
        # Save intelligence
        intel_file = monitor.save_intelligence_package(posts, "monitoring")
        print(f"\n✅ {len(posts)} posts analyzed")
        print(f"   Saved to: {intel_file.name}")

        # Generate brief
        brief = monitor.generate_social_intelligence_brief(posts)

        brief_file = monitor.cache_dir / f"social_intelligence_brief_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(brief_file, 'w') as f:
            f.write(brief)

        print(f"✅ Brief generated: {brief_file.name}")

        # Display urgency distribution
        urgency_dist = {}
        for post in posts:
            urgency = post.get('urgency_level', 'UNKNOWN')
            urgency_dist[urgency] = urgency_dist.get(urgency, 0) + 1

        print(f"\n📊 Urgency Distribution:")
        for level, count in urgency_dist.items():
            print(f"   {level}: {count} posts")

        print(f"\n💾 Database: {monitor.db_path}")

    else:
        print("❌ No threatening social media content detected")

    print(f"\n⚠️ IMPORTANT NOTES:")
    print("   • Social media monitoring requires platform API access")
    print("   • Nitter provides public Twitter access without API")
    print("   • Reddit monitoring uses public API with rate limits")
    print("   • Critical threats should trigger immediate law enforcement alerts")
    print("   • This is for authorized security research and threat detection only")

if __name__ == "__main__":
    main()