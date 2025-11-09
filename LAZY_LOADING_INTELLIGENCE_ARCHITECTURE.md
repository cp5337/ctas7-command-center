# 🧠 Lazy Loading Intelligence Architecture (CTAS-7)

**Date:** November 9, 2025  
**Principle:** Don't scrape everything now. Scrape on-demand when triggered.

---

## 🎯 THE PROBLEM

**Naive Approach (Token Catastrophe):**
```
1. Scrape ALL 247 OSINT nodes NOW
2. Process millions of documents with LLMs
3. Burn $50K in tokens
4. 99% of data never used
5. Stale by next week
```

**Smart Approach (Lazy Loading):**
```
1. Create 247 OSINT node TRIGGERS (lightweight)
2. Store collection recipes (how to scrape, not the data)
3. Activate on-demand when operator needs it
4. Process only what's relevant
5. Always fresh (scraped when needed)
```

---

## 🗺️ THE MASTER GRAPH (247 OSINT Nodes)

**What's in the graph NOW:**
```json
{
  "node_id": "osint_node_042",
  "type": "cyber_threat_feed",
  "name": "Exploit-DB",
  "domain": "cyber",
  "trigger_conditions": [
    "operator_requests_exploits",
    "cve_mentioned_in_alert",
    "wazuh_rule_needs_update"
  ],
  "collection_recipe": {
    "method": "scrapy",
    "url": "https://www.exploit-db.com/",
    "frequency": "on_demand",
    "filters": {
      "platforms": ["linux", "windows", "web"],
      "types": ["remote", "local", "webapps"],
      "verified": true
    },
    "output_format": "json",
    "estimated_tokens": 5000,
    "estimated_cost": "$0.50"
  },
  "last_activated": null,
  "activation_count": 0,
  "linked_tasks": ["1.2.3", "1.3.4", "2.1.5"],
  "linked_domains": ["cyber", "cyber_physical"],
  "hash": "SCH+CUID+UUID"
}
```

**What's NOT in the graph NOW:**
- ❌ Actual exploit data (scraped on-demand)
- ❌ CVE details (fetched when needed)
- ❌ PoC code (retrieved on trigger)

---

## ⚡ TRIGGER MECHANISMS

### **1. Operator Request (Direct)**
```
Operator: "Show me all Linux privilege escalation exploits from 2024"
  ↓
System: Activates OSINT nodes [042, 087, 123]
  ↓
Scrapy: Fetches from Exploit-DB, GitHub, Packet Storm
  ↓
Marcus (Gemini): Filters to Linux + PrivEsc + 2024
  ↓
Output: 47 exploits (5K tokens, $0.50)
```

### **2. Alert-Driven (Reactive)**
```
Wazuh Alert: "CVE-2024-1234 detected on host-042"
  ↓
System: Activates OSINT node for CVE-2024-1234
  ↓
Scrapy: Fetches CVE details, exploits, patches
  ↓
Marcus: Generates Wazuh rule + remediation
  ↓
Output: Detection rule + patch instructions
```

### **3. Scheduled Update (Proactive)**
```
Cron: Weekly update for critical infrastructure nodes
  ↓
System: Activates 12 high-priority OSINT nodes
  ↓
Scrapy: Fetches latest data for power grid, cables, BGP
  ↓
Zoe: Updates Mapbox/Cesium layers
  ↓
Output: Refreshed geospatial intelligence
```

### **4. Scenario Activation (Narrative)**
```
Operator: "Run Bio Attack Scenario 7"
  ↓
System: Activates OSINT nodes for:
  - CDC Select Agents
  - Hospital locations
  - Water treatment facilities
  - Pharmaceutical supply chain
  ↓
Scrapy: Fetches domain-specific data
  ↓
Marcus + Elena: Generate scenario narrative
  ↓
Output: Frontline documentary script
```

---

## 📊 DOMAIN-SPECIFIC ACTIVATION

### **Cyber Domain (Plasma)**

**OSINT Nodes (42 nodes):**
- Exploit-DB, CVE feeds, ATT&CK, CALDERA
- APT reports, Wazuh rules, Kali tools
- GitHub exploits, security blogs

**Trigger Examples:**
- "Update Wazuh rules for ransomware"
- "Show me APT28 TTPs"
- "Find exploits for CVE-2024-5678"

**Activation Cost:**
- Per trigger: $0.50 - $5.00
- Monthly (10 triggers): ~$50

---

### **Geospatial Domain (Infrastructure)**

**OSINT Nodes (87 nodes):**
- Submarine cables, power grid, internet backbone
- GeoIP, satellite imagery, OSM infrastructure
- Critical facilities, borders, cities

**Trigger Examples:**
- "Show submarine cables near Taiwan"
- "Map power substations in Texas"
- "Find BGP peers for AS15169 (Google)"

**Activation Cost:**
- Per trigger: $1.00 - $10.00 (GEE compute)
- Monthly (5 triggers): ~$50

---

### **WMD Domain (CBRNE)**

**OSINT Nodes (34 nodes):**
- Australia Group precursors, IAEA safeguards
- CDC select agents, ATF explosives
- Nuclear facilities, proliferation pathways

**Trigger Examples:**
- "Show chemical precursors for VX nerve agent"
- "Map nuclear fuel cycle for Iran"
- "Find biological select agents in Category A"

**Activation Cost:**
- Per trigger: $0.20 - $2.00 (PDF processing)
- Monthly (3 triggers): ~$6

---

### **Physical Domain (Kinetic)**

**OSINT Nodes (58 nodes):**
- FBI Most Wanted, DOJ complaints, NCTC
- START GTD, court documents, incident reports
- Your scenarios (Beslan, OKC, Brussels, London)

**Trigger Examples:**
- "Show IED attacks in Europe 2015-2017"
- "Find indictments for domestic terrorism"
- "Generate Beslan scenario narrative"

**Activation Cost:**
- Per trigger: $0.30 - $3.00
- Monthly (5 triggers): ~$15

---

### **Cyber-Physical Convergence**

**OSINT Nodes (26 nodes):**
- ICS-CERT, NERC CIP, Shodan SCADA
- Stuxnet analysis, Colonial Pipeline, Ukraine grid
- ICS exploits, SCADA vulnerabilities

**Trigger Examples:**
- "Show exposed SCADA systems in power sector"
- "Map ICS vulnerabilities to critical infrastructure"
- "Generate cyber-physical attack scenario"

**Activation Cost:**
- Per trigger: $0.50 - $5.00
- Monthly (4 triggers): ~$20

---

## 💰 COST COMPARISON

### **Naive Approach (Scrape Everything Now):**
```
247 OSINT nodes × $50 average = $12,350 upfront
+ Monthly refresh: $12,350/month
+ Token processing: $50,000 first month
= $62,350 first month, $12,350/month after
```

### **Lazy Loading (Trigger-Based):**
```
Graph setup (247 node metadata): $0 (lightweight)
+ Average 30 triggers/month: $150/month
+ Token processing (filtered): $500/month
= $650/month total
```

### **Savings:**
- **First month:** $61,700 saved (99% reduction)
- **Ongoing:** $11,700 saved per month (95% reduction)

---

## 🏗️ IMPLEMENTATION

### **Phase 1: Build the Graph (1 day)**
```rust
// Create 247 OSINT node triggers
struct OSINTNode {
    id: String,
    name: String,
    domain: Domain,
    collection_recipe: CollectionRecipe,
    trigger_conditions: Vec<TriggerCondition>,
    linked_tasks: Vec<String>,
    hash: TrivariatHash,
}

// Store in SurrealDB (lightweight)
db.create("osint_nodes").content(node).await?;
```

### **Phase 2: Implement Trigger System (2 days)**
```rust
// Trigger activation
async fn activate_osint_node(node_id: &str, context: &TriggerContext) -> Result<IntelligenceData> {
    let node = db.select(("osint_nodes", node_id)).await?;
    let recipe = node.collection_recipe;
    
    // Execute collection recipe
    let data = match recipe.method {
        "scrapy" => scrapy_collect(&recipe).await?,
        "api" => api_fetch(&recipe).await?,
        "gee" => gee_query(&recipe).await?,
    };
    
    // Filter with AI (only if needed)
    let filtered = if context.needs_ai_filter {
        llm_filter(&data, &context).await?
    } else {
        data
    };
    
    // Cache for 24 hours
    cache.set(&node_id, &filtered, Duration::hours(24)).await?;
    
    Ok(filtered)
}
```

### **Phase 3: Connect to HD4 Pages (1 day)**
```typescript
// Operator clicks "Exploit-DB" button on Hunt page
const handleOSINTNodeClick = async (nodeId: string) => {
  setLoading(true);
  
  // Activate OSINT node (triggers scraping)
  const data = await fetch(`http://localhost:15180/osint/activate/${nodeId}`, {
    method: 'POST',
    body: JSON.stringify({ context: currentHD4Phase, filters: userFilters })
  });
  
  // Display results (fresh, filtered)
  setIntelligenceData(await data.json());
  setLoading(false);
};
```

---

## 🎯 THE 247 OSINT NODE CATEGORIES

### **Cyber (42 nodes):**
- Exploit databases (5)
- CVE feeds (3)
- ATT&CK/CALDERA (2)
- APT reports (8)
- Security blogs (10)
- GitHub exploits (7)
- Wazuh rules (3)
- Kali tools (4)

### **Geospatial (87 nodes):**
- Submarine cables (4)
- Power grid (12)
- Internet backbone (8)
- GeoIP (3)
- Satellite imagery (15)
- OSM infrastructure (25)
- Critical facilities (10)
- Natural features (10)

### **WMD (34 nodes):**
- Chemical precursors (8)
- Biological agents (6)
- Nuclear fuel cycle (7)
- Radiological sources (4)
- Explosive precursors (5)
- Proliferation data (4)

### **Physical (58 nodes):**
- FBI databases (5)
- DOJ documents (4)
- NCTC incidents (3)
- START GTD (1)
- Court records (8)
- News archives (12)
- Your scenarios (10)
- Historical attacks (15)

### **Cyber-Physical (26 nodes):**
- ICS-CERT (3)
- NERC CIP (2)
- Shodan SCADA (1)
- ICS exploits (5)
- Case studies (8)
- Vendor advisories (7)

---

## 📈 ACTIVATION PATTERNS

**Expected Usage:**
- **Cyber:** 10 activations/month (Plasma operations)
- **Geospatial:** 5 activations/month (infrastructure updates)
- **WMD:** 3 activations/month (scenario planning)
- **Physical:** 5 activations/month (Frontline narrative)
- **Cyber-Physical:** 4 activations/month (advanced scenarios)

**Total:** ~30 activations/month = $650/month

**Peak Usage (Crisis):**
- 100 activations/month = $2,000/month
- Still 85% cheaper than naive approach

---

## 🚀 NEXT STEPS

1. **Create 247 OSINT node metadata** (lightweight JSON)
2. **Build trigger system** (Rust backend)
3. **Implement collection recipes** (Scrapy, APIs, GEE)
4. **Connect to HD4 pages** (operator UI)
5. **Add caching layer** (24-hour freshness)
6. **Monitor activation costs** (cost tracker)

**Ready to build the trigger system?** ⚡

