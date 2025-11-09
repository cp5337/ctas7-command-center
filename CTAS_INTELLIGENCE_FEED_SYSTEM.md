# 🌊 CTAS Intelligence Feed System (Your Own Feedly)

**Date:** November 9, 2025  
**Purpose:** 24/7 baseline intelligence streams via TAPS, not expensive APIs

---

## 🎯 THE PROBLEM

**Current Approach (Expensive):**
- Pay-per-call APIs ($650/month)
- No baseline data for graph display
- Reactive, not proactive
- Stale when you need it

**CTAS Approach (Smart):**
- **TAPS streaming** (free, your infrastructure)
- **RSS/Atom feeds** (free, public)
- **YouTube/Twitter scraping** (free, rate-limited)
- **Baseline data always flowing** for graph
- **$0/month for streams** (just compute)

---

## 🌊 TAPS (Tokio Async Pub/Sub) - Your Kafka Knockoff

**Current Implementation:**
```rust
// ctas7-foundation-taps/src/lib.rs
pub struct TAPSBroker {
    channels: HashMap<String, Channel>,
    buffer_size: usize, // 10,000 messages default
}

// Channels (Topics)
pub enum TAPSChannel {
    ThreatIntel,      // Cyber threats, CVEs, exploits
    GeoIntel,         // Infrastructure, cables, power
    PhysicalIntel,    // Incidents, attacks, actors
    WMDIntel,         // CBRNE, precursors, proliferation
    MediaFeed,        // YouTube, Twitter, news
    AlertStream,      // Wazuh, Plasma, real-time alerts
    TaskUpdates,      // CTAS task execution status
    GraphEvents,      // Node creation, relationship updates
}
```

**What TAPS Needs:**
1. ✅ **Persistent storage** (Redis or Sled for replay)
2. ✅ **Multiple subscribers** (graph, UI, Wazuh, agents)
3. ✅ **Backpressure handling** (don't overwhelm consumers)
4. ✅ **Dead letter queue** (failed messages)
5. ✅ **Message TTL** (expire old intel)

---

## 📡 BASELINE INTELLIGENCE STREAMS (Free)

### **1. CYBER THREAT FEEDS (RSS/Atom)**

**Sources (All Free):**
```yaml
feeds:
  - name: "US-CERT Alerts"
    url: "https://www.cisa.gov/uscert/ncas/alerts.xml"
    frequency: "hourly"
    taps_channel: "ThreatIntel"
    
  - name: "Exploit-DB Latest"
    url: "https://www.exploit-db.com/rss.xml"
    frequency: "hourly"
    taps_channel: "ThreatIntel"
    
  - name: "CVE Recent"
    url: "https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml"
    frequency: "hourly"
    taps_channel: "ThreatIntel"
    
  - name: "Krebs on Security"
    url: "https://krebsonsecurity.com/feed/"
    frequency: "daily"
    taps_channel: "ThreatIntel"
    
  - name: "The Hacker News"
    url: "https://feeds.feedburner.com/TheHackersNews"
    frequency: "hourly"
    taps_channel: "ThreatIntel"
    
  - name: "Schneier on Security"
    url: "https://www.schneier.com/blog/atom.xml"
    frequency: "daily"
    taps_channel: "ThreatIntel"
    
  - name: "Dark Reading"
    url: "https://www.darkreading.com/rss.xml"
    frequency: "daily"
    taps_channel: "ThreatIntel"
```

**Implementation:**
```rust
// ctas7-intel-feeds/src/rss_collector.rs
use rss::Channel;
use tokio::time::{interval, Duration};

pub struct RSSCollector {
    feeds: Vec<FeedConfig>,
    taps: TAPSBroker,
}

impl RSSCollector {
    pub async fn start(&self) {
        for feed in &self.feeds {
            let feed = feed.clone();
            let taps = self.taps.clone();
            
            tokio::spawn(async move {
                let mut ticker = interval(Duration::from_secs(feed.frequency_seconds));
                loop {
                    ticker.tick().await;
                    if let Ok(items) = fetch_rss(&feed.url).await {
                        for item in items {
                            let intel = IntelMessage {
                                source: feed.name.clone(),
                                title: item.title,
                                content: item.description,
                                link: item.link,
                                timestamp: item.pub_date,
                                hash: generate_sch(&item),
                            };
                            taps.publish("ThreatIntel", intel).await;
                        }
                    }
                }
            });
        }
    }
}
```

---

### **2. YOUTUBE THREAT INTELLIGENCE**

**Channels to Monitor (Free via YouTube Data API):**
```yaml
youtube_channels:
  - name: "SANS Internet Storm Center"
    channel_id: "UCXk659fJzt_ZCXCPzOtrWQA"
    keywords: ["vulnerability", "exploit", "attack", "breach"]
    
  - name: "Black Hat"
    channel_id: "UCJ6q9Ie29ajGqKApbLqfBOg"
    keywords: ["0-day", "research", "technique"]
    
  - name: "DEF CON"
    channel_id: "UC6Om9kAkl32dWlDSNlDS9Iw"
    keywords: ["hacking", "security", "exploit"]
    
  - name: "IppSec (HTB Walkthroughs)"
    channel_id: "UCa6eh7gCkpPo5XXUDfygQQA"
    keywords: ["privilege escalation", "exploit", "technique"]
    
  - name: "John Hammond"
    channel_id: "UCVeW9qkBjo3zosnqUbG7CFw"
    keywords: ["malware", "analysis", "CTF"]
```

**Implementation (YouTube Data API v3):**
```rust
// ctas7-intel-feeds/src/youtube_collector.rs
use google_youtube3::YouTube;

pub struct YouTubeCollector {
    api_key: String, // Free tier: 10,000 units/day
    channels: Vec<ChannelConfig>,
    taps: TAPSBroker,
}

impl YouTubeCollector {
    pub async fn start(&self) {
        let mut ticker = interval(Duration::from_secs(3600)); // Hourly
        loop {
            ticker.tick().await;
            for channel in &self.channels {
                // Search for new videos with keywords
                let videos = self.search_channel_videos(
                    &channel.channel_id,
                    &channel.keywords,
                    "24h" // Last 24 hours
                ).await?;
                
                for video in videos {
                    let intel = IntelMessage {
                        source: format!("YouTube:{}", channel.name),
                        title: video.title,
                        content: video.description,
                        link: format!("https://youtube.com/watch?v={}", video.id),
                        timestamp: video.published_at,
                        hash: generate_sch(&video),
                        metadata: json!({
                            "views": video.view_count,
                            "likes": video.like_count,
                            "channel": channel.name,
                        }),
                    };
                    self.taps.publish("ThreatIntel", intel).await;
                }
            }
        }
    }
}
```

**Cost:** Free tier = 10,000 API units/day (enough for 100 searches/day)

---

### **3. TWITTER/X THREAT INTELLIGENCE**

**Accounts to Monitor (Free via Twitter API v2):**
```yaml
twitter_accounts:
  - handle: "vxunderground"
    keywords: ["malware", "sample", "analysis"]
    
  - handle: "GossiTheDog"
    keywords: ["vulnerability", "0-day", "breach"]
    
  - handle: "SwiftOnSecurity"
    keywords: ["threat", "intel", "security"]
    
  - handle: "malwrhunterteam"
    keywords: ["ransomware", "malware", "campaign"]
    
  - handle: "bad_packets"
    keywords: ["scan", "exploit", "botnet"]
    
  - handle: "Cyber_O51NT"
    keywords: ["osint", "breach", "leak"]
    
  - handle: "threatintel"
    keywords: ["apt", "campaign", "ioc"]
```

**Implementation (Twitter API v2 - Free Tier):**
```rust
// ctas7-intel-feeds/src/twitter_collector.rs
use egg_mode::tweet::Timeline;

pub struct TwitterCollector {
    api_key: String, // Free tier: 500K tweets/month
    accounts: Vec<AccountConfig>,
    taps: TAPSBroker,
}

impl TwitterCollector {
    pub async fn start(&self) {
        let mut ticker = interval(Duration::from_secs(300)); // Every 5 minutes
        loop {
            ticker.tick().await;
            for account in &self.accounts {
                let tweets = self.fetch_user_timeline(&account.handle, 10).await?;
                
                for tweet in tweets {
                    // Filter by keywords
                    if self.matches_keywords(&tweet.text, &account.keywords) {
                        let intel = IntelMessage {
                            source: format!("Twitter:@{}", account.handle),
                            title: format!("@{}", account.handle),
                            content: tweet.text,
                            link: format!("https://twitter.com/{}/status/{}", account.handle, tweet.id),
                            timestamp: tweet.created_at,
                            hash: generate_sch(&tweet),
                            metadata: json!({
                                "retweets": tweet.retweet_count,
                                "likes": tweet.favorite_count,
                                "author": account.handle,
                            }),
                        };
                        self.taps.publish("ThreatIntel", intel).await;
                    }
                }
            }
        }
    }
}
```

**Cost:** Free tier = 500K tweets/month (enough for 16K tweets/day)

---

### **4. GEOSPATIAL INTELLIGENCE FEEDS**

**Sources (Free):**
```yaml
geo_feeds:
  - name: "USGS Earthquakes"
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    frequency: "hourly"
    taps_channel: "GeoIntel"
    
  - name: "GDACS Disasters"
    url: "https://www.gdacs.org/xml/rss.xml"
    frequency: "hourly"
    taps_channel: "GeoIntel"
    
  - name: "BGP Updates (RIPE)"
    url: "https://stat.ripe.net/data/bgp-updates/data.json"
    frequency: "15min"
    taps_channel: "GeoIntel"
    
  - name: "Submarine Cable Alerts"
    url: "https://www.submarinecablemap.com/api/alerts"
    frequency: "daily"
    taps_channel: "GeoIntel"
```

---

### **5. PHYSICAL THREAT FEEDS**

**Sources (Free):**
```yaml
physical_feeds:
  - name: "FBI Most Wanted RSS"
    url: "https://www.fbi.gov/wanted/rss.xml"
    frequency: "daily"
    taps_channel: "PhysicalIntel"
    
  - name: "START GTD Updates"
    url: "https://www.start.umd.edu/gtd/rss/"
    frequency: "daily"
    taps_channel: "PhysicalIntel"
    
  - name: "NCTC Alerts"
    url: "https://www.dni.gov/nctc/rss.xml"
    frequency: "daily"
    taps_channel: "PhysicalIntel"
```

---

## 🎨 GRAPH BASELINE DATA (Always Flowing)

**What the Graph Displays (Real-Time):**
```typescript
// Frontend subscribes to TAPS via WebSocket
const tapsClient = new TAPSWebSocketClient('ws://localhost:15001/taps');

// Subscribe to all channels
tapsClient.subscribe('ThreatIntel', (message) => {
  addNodeToGraph({
    type: 'threat',
    title: message.title,
    source: message.source,
    timestamp: message.timestamp,
    hash: message.hash,
  });
});

tapsClient.subscribe('GeoIntel', (message) => {
  addNodeToGraph({
    type: 'infrastructure',
    title: message.title,
    location: message.location,
    timestamp: message.timestamp,
  });
});

tapsClient.subscribe('PhysicalIntel', (message) => {
  addNodeToGraph({
    type: 'actor',
    title: message.title,
    source: message.source,
    timestamp: message.timestamp,
  });
});
```

**Graph Always Has Data:**
- 🔴 **Cyber threats** (RSS feeds, YouTube, Twitter)
- 🌍 **Geospatial events** (BGP, cables, disasters)
- 💥 **Physical threats** (FBI, GTD, NCTC)
- ⚡ **Wazuh alerts** (real-time from Plasma)
- 📊 **Task updates** (CTAS execution status)

---

## 💰 COST BREAKDOWN (Your Own Feedly)

### **Infrastructure (Your Hardware):**
- **TAPS Broker:** $0 (Rust, bare metal)
- **Redis (persistence):** $0 (self-hosted)
- **Compute:** $0 (already running)

### **API Costs (Free Tiers):**
- **RSS/Atom feeds:** $0 (public)
- **YouTube Data API:** $0 (10K units/day free)
- **Twitter API v2:** $0 (500K tweets/month free)
- **BGPView, RIPE, etc.:** $0 (public APIs)

### **Total Monthly Cost:**
- **$0/month** for baseline streams
- **$0/month** for graph display data
- **$0/month** for 24/7 intelligence

### **On-Demand (Lazy Loading):**
- **Cyber Domain triggers:** ~$50/month (10 activations)
- **Geospatial triggers:** ~$50/month (5 activations)
- **WMD triggers:** ~$6/month (3 activations)
- **Physical triggers:** ~$15/month (5 activations)
- **Total:** ~$120/month (not $650)

---

## 🚀 IMPLEMENTATION PLAN

### **Phase 1: TAPS Upgrade (2 days)**
```rust
// Add persistence to TAPS
pub struct TAPSBroker {
    channels: HashMap<String, Channel>,
    buffer_size: usize,
    persistence: RedisPersistence, // NEW: Replay capability
    dead_letter: DeadLetterQueue,  // NEW: Failed messages
}

// Add WebSocket server for frontend
pub struct TAPSWebSocketServer {
    addr: SocketAddr,
    broker: Arc<TAPSBroker>,
}
```

### **Phase 2: RSS Collector (1 day)**
```bash
cargo new ctas7-intel-feeds --lib
cd ctas7-intel-feeds
cargo add rss tokio reqwest serde_json
```

### **Phase 3: YouTube Collector (1 day)**
```bash
cargo add google-youtube3 hyper hyper-rustls
```

### **Phase 4: Twitter Collector (1 day)**
```bash
cargo add egg-mode tokio-stream
```

### **Phase 5: Frontend Integration (1 day)**
```typescript
// Connect graph to TAPS WebSocket
// Display baseline data 24/7
// Add filters by domain, source, time
```

### **Phase 6: Lazy Loading Triggers (2 days)**
```rust
// When operator clicks "Exploit-DB" button
// Activate deep scraping (not RSS)
// Process with LLM (filtered)
// Cache for 24 hours
```

---

## 📊 COMPARISON: Your Feedly vs. Commercial

| Feature | CTAS Feedly | Feedly Pro | Recorded Future |
|---------|-------------|------------|-----------------|
| **Cost** | $0/month | $6/month | $50K/year |
| **Sources** | Unlimited (RSS) | 1,000 feeds | Proprietary |
| **YouTube** | ✅ Free API | ❌ No | ❌ No |
| **Twitter** | ✅ Free API | ❌ No | ✅ Paid |
| **Custom Filters** | ✅ Full control | ⚠️ Limited | ✅ Yes |
| **Graph Display** | ✅ Real-time | ❌ No | ✅ Yes |
| **TAPS Integration** | ✅ Native | ❌ No | ❌ No |
| **Lazy Loading** | ✅ On-demand | ❌ No | ❌ No |
| **Your Data** | ✅ You own it | ❌ They own it | ❌ They own it |

---

## 🎯 SUCCESS METRICS

**Baseline Streams (24/7):**
- ✅ 50+ RSS feeds ingested hourly
- ✅ 10+ YouTube channels monitored
- ✅ 20+ Twitter accounts tracked
- ✅ Graph always has fresh data
- ✅ $0/month cost

**Lazy Loading (On-Demand):**
- ✅ Deep scraping only when triggered
- ✅ LLM processing only for high-value targets
- ✅ ~$120/month (not $650)
- ✅ 81% cost reduction

---

**Ready to build your own Feedly with TAPS?** 🌊⚡

