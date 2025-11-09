# CTAS-7 Security Architecture - Layer Clarification

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Defense Layers - JeetTek vs Synaptix Plasma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    Internet (Threats)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: PERIMETER                           │
│                    Kali JeetTek                                 │
│                    (Stop-Kick Defense)                          │
│                                                                 │
│  Purpose: Stop attacks at the edge before they touch services  │
│  Tech: Nginx + ModSecurity + Rust eBPF                        │
│  Response: Sub-millisecond blocking                            │
│  Port: 443 (HTTPS ingress)                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              LAYER 2-7: FULL THREAT DETECTION                   │
│              Synaptix Plasma                                    │
│              (Wazuh + AXON + Legion + Phi-3)                   │
│                                                                 │
│  Purpose: Complete threat intelligence & response platform     │
│  Components:                                                    │
│    • Wazuh (SIEM data collection)                             │
│    • AXON (Rust-based processing)                             │
│    • Legion ECS (entity tracking)                             │
│    • Phi-3 LoRA (AI validation)                               │
│    • HFT Ground Stations (response)                           │
│  Dashboard: Port 5601                                          │
└─────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Component Breakdown

### 🥋 Kali JeetTek (Perimeter Only)
**What it is**: Layer 1 perimeter defense
**Scope**: Stop-kick at the edge
**Technology**: Nginx + ModSecurity WAF + Cloudflare
**Response Time**: < 1ms
**Port**: 443 (HTTPS)
**Purpose**: Block obvious attacks before they reach anything

**Analogy**: Like a bouncer at the door - stops troublemakers before they get in

### 🛡️ Synaptix Plasma (Complete Platform)
**What it is**: Full threat detection & response system
**Scope**: Entire infrastructure monitoring
**Technology**: Wazuh + AXON + Legion + Phi-3 + HFT
**Response Time**: < 102ms end-to-end
**Port**: 5601 (Dashboard)
**Purpose**: Detect, analyze, track, validate, and respond to ALL threats

**Analogy**: Like having security cameras, alarm system, AI analysis, guards, and response team - the full security operation

## Data Flow

```
Attack Attempt
     │
     ▼
┌──────────────┐
│ JeetTek      │ ← If obvious attack: BLOCKED (< 1ms)
│ (Layer 1)    │ ← If suspicious: Let through but FLAG
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Internal     │ ← Request reaches services
│ Services     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ Synaptix Plasma (Full Monitoring)                    │
│                                                       │
│ 1. Wazuh Agents: Collect logs from ALL services     │
│                                                       │
│ 2. AXON: Process events, detect anomalies           │
│    - Pattern matching                                │
│    - Entropy analysis                                │
│    - Behavioral analysis                             │
│                                                       │
│ 3. Legion ECS: Track attacker as entity             │
│    - IP, User-Agent, behavior                        │
│    - Relationship mapping                            │
│    - Historical context                              │
│                                                       │
│ 4. Phi-3 LoRA: AI validation                        │
│    - Is this really a threat?                        │
│    - What TTPs are being used?                       │
│    - What's the risk level?                          │
│                                                       │
│ 5. HFT Ground Stations: Automated response          │
│    - Block at multiple layers                        │
│    - Isolate compromised service                     │
│    - Alert team                                      │
│    - Create Linear issue                             │
└──────────────────────────────────────────────────────┘
```

## Use Cases

### JeetTek Handles:
- ✅ DDoS attacks (volumetric)
- ✅ Known bad IPs
- ✅ SQL injection attempts
- ✅ XSS attacks
- ✅ Path traversal
- ✅ Rate limit violations

**Action**: Immediate block, minimal logging

### Synaptix Plasma Handles:
- ✅ Advanced Persistent Threats (APTs)
- ✅ Insider threats
- ✅ Zero-day exploits
- ✅ Lateral movement
- ✅ Data exfiltration
- ✅ Living Off The Land (LOTL) attacks
- ✅ Supply chain attacks
- ✅ Social engineering
- ✅ Privilege escalation
- ✅ Credential stuffing (sophisticated)

**Action**: Track, analyze, validate, respond with full context

## Deployment

### JeetTek Deployment (Perimeter)
```yaml
kali-jeettek:
  image: ctas7/kali-jeettek:latest
  container_name: kali-jeettek-ingress
  ports:
    - "443:443"
  environment:
    - SYNAPTIX_PLASMA_URL=http://wazuh-manager:55000
    - AXON_URL=http://axon:18102
  # Forwards suspicious activity to Synaptix Plasma
```

### Synaptix Plasma Deployment (Full Platform)
```yaml
# Wazuh Manager (data collection)
wazuh-manager:
  image: wazuh/wazuh-manager:latest
  ports:
    - "1514:1514"   # Agents
    - "55000:55000" # API
  volumes:
    - wazuh-data:/var/ossec

# AXON (processing engine)
axon:
  image: ctas7/axon:latest
  ports:
    - "18102:18102"
  environment:
    - WAZUH_API=http://wazuh-manager:55000
    - LEGION_ENDPOINT=http://legion-ecs:18106

# Legion ECS (entity tracking)
legion-ecs:
  image: ctas7/legion-ecs:latest
  ports:
    - "18106:18106"

# Phi-3 LoRA Farm (AI validation)
phi3-lora:
  image: ollama/ollama:latest
  ports:
    - "11434:11434"
  environment:
    - MODEL=phi3:mini

# HFT Ground Stations (response)
hft-ground-stations:
  image: ctas7/hft-ground-stations:latest
  ports:
    - "18200:18200"

# Synaptix Plasma Dashboard
plasma-dashboard:
  image: ctas7/plasma-dashboard:latest
  ports:
    - "5601:5601"  # Main threat detection UI
```

## Dashboard Access

### Stats Dashboard (Dioxus)
- **Port**: 8080
- **Purpose**: System-wide QA metrics, performance stats
- **Link to Synaptix Plasma**: Big button → http://localhost:5601

### Synaptix Plasma Dashboard
- **Port**: 5601
- **Purpose**: Full threat detection, entity tracking, response management
- **Features**:
  - Real-time threat feed
  - Entity relationship graphs
  - ATT&CK technique mapping
  - Wazuh alert viewer
  - AXON processing metrics
  - Legion entity browser
  - Phi-3 validation results
  - HFT response timeline

## Scope Comparison

| Feature | JeetTek | Synaptix Plasma |
|---------|---------|-----------------|
| **Layer** | Layer 1 only | Layers 2-7 |
| **Scope** | Perimeter | Entire infrastructure |
| **Data** | Minimal | Complete |
| **Response** | Block/Allow | Block/Isolate/Hunt/Track |
| **Latency** | < 1ms | < 102ms |
| **Visibility** | Request-level | Entity-level |
| **Intelligence** | Signatures | AI + Behavioral |
| **Tracking** | None | Persistent entities |

## When Each Layer Activates

### Example 1: DDoS Attack
```
1. JeetTek: Detects 10,000 req/sec from single IP
   → BLOCKS immediately (< 1ms)

2. Synaptix Plasma: Receives block notification
   → Logs attack pattern
   → Updates threat intelligence
   → No further action needed
```

### Example 2: APT Attack
```
1. JeetTek: Sees normal-looking HTTPS requests
   → ALLOWS through (nothing suspicious)

2. Synaptix Plasma:
   → Wazuh: Collects logs from service
   → AXON: Detects unusual file access pattern
   → Legion: Tracks entity across multiple requests
   → Phi-3: Validates as APT (Cobalt Strike pattern)
   → HFT: Isolates service, blocks IP, alerts team
   → Duration: 102ms from detection to response
```

---

**Summary**:
- **Kali JeetTek**: Perimeter stop-kick (Layer 1 only)
- **Synaptix Plasma**: Complete threat detection platform (Wazuh + AXON + Legion + Phi-3)
- **Dashboard**: Dioxus site links to Synaptix Plasma for full threat visibility
