# 🔓 Free Threat Intelligence Feeds for CTAS-7

**Date:** November 9, 2025  
**Purpose:** Add premium-quality free threat intel feeds to TAPS baseline

---

## 🎯 THE BIG FREE ONES

### **1. AlienVault OTX (Open Threat Exchange)** ⭐

**What It Is:**
- Community-driven threat intelligence platform
- 19M+ IoCs (Indicators of Compromise)
- 140K+ pulses (threat reports)
- APT groups, malware families, campaigns

**API (Free):**
```yaml
alienvault_otx:
  api_url: "https://otx.alienvault.com/api/v1/"
  api_key: "required (free signup)"
  rate_limit: "unlimited (fair use)"
  endpoints:
    - "/pulses/subscribed" # Your subscribed threat feeds
    - "/indicators/IPv4/{ip}" # IP reputation
    - "/indicators/domain/{domain}" # Domain reputation
    - "/indicators/file/{hash}" # File hash lookup
    - "/search/pulses" # Search threat intel
```

**Implementation:**
```rust
// ctas7-intel-feeds/src/otx_collector.rs
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct OTXPulse {
    id: String,
    name: String,
    description: String,
    author_name: String,
    created: String,
    indicators: Vec<OTXIndicator>,
    tags: Vec<String>,
}

#[derive(Deserialize)]
struct OTXIndicator {
    indicator: String,
    type_: String, // IPv4, domain, FileHash-SHA256, etc.
    title: String,
}

pub struct OTXCollector {
    api_key: String,
    client: Client,
    taps: TAPSBroker,
}

impl OTXCollector {
    pub async fn start(&self) {
        let mut ticker = interval(Duration::from_secs(3600)); // Hourly
        loop {
            ticker.tick().await;
            
            // Fetch subscribed pulses (threat intel reports)
            let pulses = self.fetch_subscribed_pulses().await?;
            
            for pulse in pulses {
                let intel = IntelMessage {
                    source: "AlienVault OTX",
                    title: pulse.name,
                    content: pulse.description,
                    link: format!("https://otx.alienvault.com/pulse/{}", pulse.id),
                    timestamp: pulse.created,
                    hash: generate_sch(&pulse),
                    metadata: json!({
                        "author": pulse.author_name,
                        "tags": pulse.tags,
                        "ioc_count": pulse.indicators.len(),
                        "indicators": pulse.indicators.iter()
                            .map(|i| json!({"type": i.type_, "value": i.indicator}))
                            .collect::<Vec<_>>(),
                    }),
                };
                self.taps.publish("ThreatIntel", intel).await;
            }
        }
    }
    
    pub async fn lookup_ip(&self, ip: &str) -> Result<IPReputation> {
        let url = format!("https://otx.alienvault.com/api/v1/indicators/IPv4/{}/general", ip);
        let resp = self.client.get(&url)
            .header("X-OTX-API-KEY", &self.api_key)
            .send().await?
            .json::<IPReputation>().await?;
        Ok(resp)
    }
}
```

**What You Get:**
- APT campaigns (APT28, APT29, Lazarus, etc.)
- Malware families (Emotet, TrickBot, Cobalt Strike)
- Phishing campaigns
- C2 infrastructure
- Exploit kits

---

### **2. Abuse.ch Feeds** ⭐

**Multiple Free Feeds:**

#### **URLhaus (Malicious URLs)**
```yaml
urlhaus:
  url: "https://urlhaus.abuse.ch/downloads/csv_recent/"
  format: "CSV"
  frequency: "5min"
  content: "Malware distribution URLs"
```

#### **Feodo Tracker (C2 IPs)**
```yaml
feodo_tracker:
  url: "https://feodotracker.abuse.ch/downloads/ipblocklist.csv"
  format: "CSV"
  frequency: "5min"
  content: "Botnet C2 servers"
```

#### **SSL Blacklist (Malicious Certs)**
```yaml
ssl_blacklist:
  url: "https://sslbl.abuse.ch/blacklist/sslblacklist.csv"
  format: "CSV"
  frequency: "hourly"
  content: "Malicious SSL certificates"
```

#### **ThreatFox (IoCs)**
```yaml
threatfox:
  url: "https://threatfox.abuse.ch/export/csv/recent/"
  format: "CSV"
  frequency: "5min"
  content: "Recent IoCs (IPs, domains, hashes)"
```

**Implementation:**
```rust
// ctas7-intel-feeds/src/abuse_ch_collector.rs
pub struct AbuseChCollector {
    feeds: Vec<AbuseChFeed>,
    taps: TAPSBroker,
}

impl AbuseChCollector {
    pub async fn start(&self) {
        for feed in &self.feeds {
            let feed = feed.clone();
            let taps = self.taps.clone();
            
            tokio::spawn(async move {
                let mut ticker = interval(Duration::from_secs(feed.frequency_seconds));
                loop {
                    ticker.tick().await;
                    let csv = reqwest::get(&feed.url).await?.text().await?;
                    let iocs = parse_csv(&csv)?;
                    
                    for ioc in iocs {
                        let intel = IntelMessage {
                            source: format!("Abuse.ch:{}", feed.name),
                            title: format!("{} - {}", ioc.ioc_type, ioc.value),
                            content: ioc.description,
                            link: ioc.reference,
                            timestamp: ioc.first_seen,
                            hash: generate_sch(&ioc),
                            metadata: json!({
                                "ioc_type": ioc.ioc_type,
                                "ioc_value": ioc.value,
                                "malware": ioc.malware,
                                "confidence": ioc.confidence,
                            }),
                        };
                        taps.publish("ThreatIntel", intel).await;
                    }
                }
            });
        }
    }
}
```

---

### **3. Blocklist.de (Brute Force Attacks)**

```yaml
blocklist_de:
  feeds:
    - name: "SSH Attacks"
      url: "https://lists.blocklist.de/lists/ssh.txt"
      type: "IPv4"
      
    - name: "Apache Attacks"
      url: "https://lists.blocklist.de/lists/apache.txt"
      type: "IPv4"
      
    - name: "Mail Attacks"
      url: "https://lists.blocklist.de/lists/mail.txt"
      type: "IPv4"
```

---

### **4. Spamhaus (Spam & Malware)**

```yaml
spamhaus:
  feeds:
    - name: "DROP (Don't Route Or Peer)"
      url: "https://www.spamhaus.org/drop/drop.txt"
      type: "CIDR"
      
    - name: "EDROP (Extended DROP)"
      url: "https://www.spamhaus.org/drop/edrop.txt"
      type: "CIDR"
```

---

### **5. EmergingThreats (Proofpoint)**

```yaml
emerging_threats:
  feeds:
    - name: "Compromised IPs"
      url: "https://rules.emergingthreats.net/blockrules/compromised-ips.txt"
      type: "IPv4"
      
    - name: "Known Malicious IPs"
      url: "https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt"
      type: "IPv4"
```

---

### **6. PhishTank (Phishing URLs)**

```yaml
phishtank:
  url: "http://data.phishtank.com/data/online-valid.csv"
  format: "CSV"
  frequency: "hourly"
  api_key: "required (free signup)"
```

---

### **7. MalwareBazaar (Malware Samples)**

```yaml
malwarebazaar:
  url: "https://bazaar.abuse.ch/export/csv/recent/"
  format: "CSV"
  frequency: "5min"
  content: "Recent malware samples (hashes)"
```

---

## 🛡️ OPENVAS INTEGRATION (Plasma Stack)

**What OpenVAS Is:**
- Open-source vulnerability scanner
- 50K+ vulnerability tests (NVTs)
- Actively maintained by Greenbone
- Replacement for Nessus (commercial)

**Why It Belongs in Plasma:**
- Wazuh detects threats → OpenVAS finds vulnerabilities
- AXON orchestrates → OpenVAS scans targets
- Kali tools exploit → OpenVAS discovers attack surface

**Architecture:**
```
┌─────────────────────────────────────────────┐
│           SYNAPTIX PLASMA STACK             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│  │ Wazuh   │  │ OpenVAS │  │  AXON    │   │
│  │ (SIEM)  │  │ (Vuln)  │  │ (Orches) │   │
│  └────┬────┘  └────┬────┘  └────┬─────┘   │
│       │            │             │          │
│       └────────────┴─────────────┘          │
│                    │                        │
│       ┌────────────▼────────────┐           │
│       │    Legion ECS           │           │
│       │  (Asset Management)     │           │
│       └─────────────────────────┘           │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │       Kali Tool Orchestration        │  │
│  │  (Nmap, Rustscan, Metasploit, etc.) │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**OpenVAS Deployment (OrbStack Container):**
```yaml
# docker-compose.yml (add to Plasma stack)
services:
  openvas:
    image: greenbone/openvas-scanner:latest
    container_name: ctas-openvas
    ports:
      - "9390:9390"  # OpenVAS Manager
      - "9392:9392"  # Greenbone Security Assistant (Web UI)
    environment:
      - USERNAME=admin
      - PASSWORD=${OPENVAS_PASSWORD}
      - RELAYHOST=${SMTP_RELAY}
    volumes:
      - openvas-data:/var/lib/openvas
      - openvas-logs:/var/log/gvm
    networks:
      - plasma-network
    restart: unless-stopped
    
  # Greenbone Vulnerability Manager (GVM)
  gvm:
    image: greenbone/gvm:latest
    container_name: ctas-gvm
    ports:
      - "9390:9390"
    depends_on:
      - openvas
    volumes:
      - gvm-data:/var/lib/gvm
    networks:
      - plasma-network
```

**OpenVAS → Wazuh Integration:**
```rust
// ctas7-plasma/src/openvas_integration.rs
pub struct OpenVASIntegration {
    openvas_url: String,
    wazuh_client: WazuhClient,
    legion: LegionECS,
}

impl OpenVASIntegration {
    pub async fn scan_asset(&self, asset_id: &str) -> Result<ScanReport> {
        // Get asset from Legion ECS
        let asset = self.legion.get_asset(asset_id).await?;
        
        // Create OpenVAS scan task
        let task_id = self.create_scan_task(&asset.ip_address).await?;
        
        // Start scan
        self.start_scan(&task_id).await?;
        
        // Wait for completion (async)
        let report = self.wait_for_scan(&task_id).await?;
        
        // Parse vulnerabilities
        let vulns = self.parse_vulnerabilities(&report)?;
        
        // Send to Wazuh as alerts
        for vuln in vulns {
            self.wazuh_client.send_alert(WazuhAlert {
                rule_id: 100001,
                level: vuln.severity,
                description: format!("OpenVAS: {} on {}", vuln.name, asset.hostname),
                data: json!({
                    "cve": vuln.cve,
                    "cvss": vuln.cvss_score,
                    "asset_id": asset_id,
                    "port": vuln.port,
                    "service": vuln.service,
                }),
            }).await?;
        }
        
        Ok(report)
    }
}
```

---

## 🎨 PLASMA UI REDESIGN (Make It Beautiful)

**Current UI:** Ugly as fuck (your words)  
**New UI:** Cyberpunk meets Apple design system

**Design Principles:**
1. **Dark mode only** (operator-friendly)
2. **Neon accents** (cyan, magenta, yellow)
3. **Glassmorphism** (frosted glass panels)
4. **Smooth animations** (60fps)
5. **Information density** (no wasted space)

**New Plasma Dashboard:**
```typescript
// ctas6-reference/src/pages/Plasma.tsx (redesign)
import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle, Zap, Target } from 'lucide-react';

const Plasma: React.FC = () => {
  const [wazuhAlerts, setWazuhAlerts] = useState([]);
  const [openvasScans, setOpenvasScans] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ wazuh: 'healthy', openvas: 'healthy', axon: 'healthy' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              SYNAPTIX PLASMA
            </h1>
            <p className="text-sm text-gray-400 mt-1">Wazuh • OpenVAS • AXON • Legion</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge service="Wazuh" status={systemHealth.wazuh} />
            <StatusBadge service="OpenVAS" status={systemHealth.openvas} />
            <StatusBadge service="AXON" status={systemHealth.axon} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<AlertTriangle className="text-red-400" />}
          title="Critical Alerts"
          value="7"
          change="+2 (1h)"
          color="red"
        />
        <StatCard
          icon={<Shield className="text-yellow-400" />}
          title="Vulnerabilities"
          value="142"
          change="-5 (24h)"
          color="yellow"
        />
        <StatCard
          icon={<Activity className="text-cyan-400" />}
          title="Active Scans"
          value="3"
          change="2 queued"
          color="cyan"
        />
        <StatCard
          icon={<CheckCircle className="text-green-400" />}
          title="Assets Protected"
          value="247"
          change="100%"
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wazuh Alerts (2/3 width) */}
        <div className="lg:col-span-2">
          <GlassPanel title="Wazuh Real-Time Alerts" icon={<Zap className="text-yellow-400" />}>
            <AlertStream alerts={wazuhAlerts} />
          </GlassPanel>
        </div>

        {/* OpenVAS Scans (1/3 width) */}
        <div>
          <GlassPanel title="OpenVAS Scans" icon={<Target className="text-cyan-400" />}>
            <ScanList scans={openvasScans} />
          </GlassPanel>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GlassPanel title="Threat Intelligence" icon={<Shield />}>
          <ThreatIntelFeed />
        </GlassPanel>
        <GlassPanel title="Asset Inventory" icon={<Activity />}>
          <AssetInventory />
        </GlassPanel>
      </div>
    </div>
  );
};

// Glassmorphism Panel Component
const GlassPanel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition-all">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

// Stat Card Component
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; change: string; color: string }> = 
  ({ icon, title, value, change, color }) => (
  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:scale-105 transition-transform">
    <div className="flex items-center justify-between mb-2">
      {icon}
      <span className={`text-xs text-${color}-400`}>{change}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </div>
);

export default Plasma;
```

**Color Palette:**
```css
/* Plasma Theme */
:root {
  --plasma-bg: #0a0a0f;
  --plasma-surface: rgba(255, 255, 255, 0.05);
  --plasma-border: rgba(255, 255, 255, 0.1);
  --plasma-cyan: #00d9ff;
  --plasma-magenta: #ff00ff;
  --plasma-yellow: #ffff00;
  --plasma-green: #00ff88;
  --plasma-red: #ff0055;
}
```

---

## 📊 UPDATED FEED LIST (With Free Threat Intel)

**Total Free Feeds:**
- **RSS/Atom:** 50+ feeds
- **AlienVault OTX:** 19M IoCs, 140K pulses
- **Abuse.ch:** 4 feeds (URLhaus, Feodo, SSL, ThreatFox)
- **Blocklist.de:** 3 feeds (SSH, Apache, Mail)
- **Spamhaus:** 2 feeds (DROP, EDROP)
- **EmergingThreats:** 2 feeds (Compromised IPs, Malicious IPs)
- **PhishTank:** 1 feed (Phishing URLs)
- **MalwareBazaar:** 1 feed (Malware samples)
- **YouTube:** 10+ channels
- **Twitter:** 20+ accounts

**Total Cost:** $0/month (all free APIs)

---

**Ready to add these feeds and redesign Plasma?** 🛡️⚡

