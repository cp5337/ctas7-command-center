# Hardware Vendors & Infrastructure Analysis
## Satellite Ground Station Network - 259 Stations

**Document Version:** 1.0
**Date:** October 18, 2025
**Category:** Infrastructure & Hardware

---

## 1. SERVER HARDWARE VENDORS

### 1.1 Dell PowerEdge Server Platform

#### Product Overview
Dell PowerEdge servers deliver enterprise-grade computing for complex datacenter applications with efficient, reliable, and secure compute capabilities optimized for resource-intensive workloads.

#### Pricing Structure (2025)

**Entry-Level Enterprise Servers:**
- PowerEdge R260: $3,519 (Intel Xeon 6 Performance 6315P, 2x 16GB RAM, 2x 480GB SSD, Windows Server 2025)
- PowerEdge R360: $5,789 (Intel Xeon 6 Performance 6315P, 2x 16GB RAM, 3x 1.2TB SAS, Windows Server 2025)
- PowerEdge R6615: $5,379 (AMD EPYC platform)

**Mid-Range Enterprise Servers:**
- PowerEdge R640: $8,995 (Dual-socket 1U rack server)
- PowerEdge R6725: $10,599 (AMD EPYC 2U rack server)

**High-End Enterprise Servers:**
- PowerEdge R760: $15,000 - $25,000 (depending on configuration)
- PowerEdge R940: $30,000 - $50,000 (4-socket mission-critical platform)

**Storage Pricing (PowerEdge R760):**
- 800GB NVMe Mixed Use: $1,800
- 960GB NVMe Read Intensive: $1,696
- 1.6TB NVMe Mixed Use: $4,516
- 1.92TB NVMe Read Intensive: $3,192
- 3.2TB NVMe Mixed Use: $7,320
- 15.36TB Enterprise NVMe Read Intensive: $25,154
- 61.44TB Enterprise NVMe Very Read Intensive: $48,614

#### Recommended Configurations for Ground Stations

**Tier 1 Configuration (12 stations):**
- Primary: 4x PowerEdge R760 (compute) @ $22,000 each = $88,000
- Storage: 2x PowerEdge R7525 (storage) @ $35,000 each = $70,000
- Edge: 2x PowerEdge R640 (edge processing) @ $9,000 each = $18,000
- **Total per Tier 1 station:** $176,000
- **Total Tier 1 (12 stations):** $2,112,000

**Tier 2 Configuration (47 stations):**
- Primary: 2x PowerEdge R640 (compute) @ $9,000 each = $18,000
- Storage: 1x PowerEdge R6515 (storage) @ $15,000 = $15,000
- Edge: 1x PowerEdge R360 (edge) @ $6,000 = $6,000
- **Total per Tier 2 station:** $39,000
- **Total Tier 2 (47 stations):** $1,833,000

**Tier 3 Configuration (200 stations):**
- Primary: 1x PowerEdge R6615 (all-in-one) @ $8,500 = $8,500
- Edge: 1x PowerEdge R260 (backup) @ $3,500 = $3,500
- **Total per Tier 3 station:** $12,000
- **Total Tier 3 (200 stations):** $2,400,000

**Dell Grand Total: $6,345,000**

#### Value Proposition
- Industry-leading reliability (99.999% uptime)
- Excellent support and service options
- Strong ecosystem of integrators and partners
- Volume pricing discounts (15-25% for enterprise agreements)
- Proven performance for satellite ground systems

---

### 1.2 HPE ProLiant Server Platform

#### Product Overview
HPE ProLiant Gen11 servers engineered for quick deployment, easy management, and affordability with advanced PCIe 4.0/5.0 and NVMe capabilities.

#### Pricing Structure (2025)

**Entry-Level Servers:**
- ProLiant DL380 Gen10: $919 - $1,499 (sale pricing)
- ProLiant DL360 Gen10 Plus: $2,299 - $8,999 (NVMe-capable)
- ProLiant DL325 Gen11: $3,500 - $6,000 (AMD EPYC)

**Mid-Range Servers:**
- ProLiant DL380 Gen11: $8,000 - $15,000
- ProLiant DL360 Gen11: $7,000 - $13,000
- ProLiant DL560 Gen10: $1,299 - $2,699 (sale pricing, typically $18,000+)

**High-End Servers:**
- ProLiant DL580 Gen11: $35,000 - $55,000 (4-socket)
- Apollo systems: $25,000 - $45,000 (HPC-optimized)

#### Recommended Configurations for Ground Stations

**Tier 1 Configuration (12 stations):**
- Primary: 4x DL380 Gen11 @ $14,000 each = $56,000
- Storage: 2x Apollo 4200 @ $32,000 each = $64,000
- Edge: 2x DL360 Gen11 @ $10,000 each = $20,000
- **Total per Tier 1 station:** $140,000
- **Total Tier 1 (12 stations):** $1,680,000

**Tier 2 Configuration (47 stations):**
- Primary: 2x DL360 Gen11 @ $10,000 each = $20,000
- Storage: 1x DL380 Gen10 @ $8,000 = $8,000
- Edge: 1x DL325 Gen11 @ $5,000 = $5,000
- **Total per Tier 2 station:** $33,000
- **Total Tier 2 (47 stations):** $1,551,000

**Tier 3 Configuration (200 stations):**
- Primary: 1x DL325 Gen11 (all-in-one) @ $7,500 = $7,500
- Edge: 1x MicroServer Gen11 @ $2,500 = $2,500
- **Total per Tier 3 station:** $10,000
- **Total Tier 3 (200 stations):** $2,000,000

**HPE Grand Total: $5,231,000**

#### Value Proposition
- Cost advantage over Dell (18% lower in this analysis)
- Strong Gen11 performance improvements
- Excellent for SMB and cost-sensitive deployments
- HPE GreenLake consumption model available
- Good Tier 3 site economics

---

### 1.3 Cisco UCS Server Platform

#### Product Overview
Cisco Unified Computing System combines compute, network, storage access, and virtualization into a cohesive platform managed as a single entity.

#### Pricing Structure (2025)

**General Pricing:**
- 20-30% premium over HP/Dell equivalent
- Base UCS C-Series: $2,000 (chassis only)
- CPU and RAM can add $80,000 to high-end systems
- Annual licensing required for management

**Typical Configurations:**
- UCS C220 M6: $8,000 - $15,000
- UCS C240 M6: $12,000 - $25,000
- UCS C480 ML M5: $45,000 - $85,000 (AI/ML optimized)

#### Recommended Configurations for Ground Stations

**Tier 1 Configuration (12 stations):**
- Primary: 4x UCS C240 M6 @ $20,000 each = $80,000
- Storage: 2x UCS C240 M6 (storage-heavy) @ $28,000 each = $56,000
- Edge: 2x UCS C220 M6 @ $12,000 each = $24,000
- **Total per Tier 1 station:** $160,000
- **Total Tier 1 (12 stations):** $1,920,000

**Tier 2 Configuration (47 stations):**
- Primary: 2x UCS C220 M6 @ $12,000 each = $24,000
- Storage: 1x UCS C240 M6 @ $18,000 = $18,000
- **Total per Tier 2 station:** $42,000
- **Total Tier 2 (47 stations):** $1,974,000

**Tier 3 Configuration (200 stations):**
- Primary: 1x UCS C220 M6 @ $10,000 = $10,000
- **Total per Tier 3 station:** $10,000
- **Total Tier 3 (200 stations):** $2,000,000

**Cisco Grand Total: $5,894,000**

#### Value Proposition
- Integrated network and compute management
- Strong for Cisco-centric networking environments
- Excellent reliability and quality
- Higher cost justified by unified management
- Best for sites requiring tight network integration

---

### 1.4 Supermicro Server Platform

#### Product Overview
Supermicro delivers best-in-class cost and density with focus on green computing and TCO optimization. Strong in HPC and specialized workloads.

#### Pricing Structure (2025)

**Entry-Level:**
- Dual-socket SuperServer: Starting at $1,513
- Single-socket optimized: $3,000 - $6,000

**Mid-Range:**
- Quad-processor systems: Starting at $4,303
- MicroCloud multi-node: $8,000 - $15,000 (3.3x density vs 1U)

**High-End:**
- Octa-processor systems: Starting at $11,571
- SuperBlade (20 servers in 8U): $45,000 - $80,000
- GPU servers: $25,000 - $65,000

#### Recommended Configurations for Ground Stations

**Tier 1 Configuration (12 stations):**
- Primary: 4x SuperServer 2U Dual-socket @ $8,000 each = $32,000
- Storage: 2x SuperStorage @ $18,000 each = $36,000
- Edge: 2x SuperServer 1U @ $4,500 each = $9,000
- **Total per Tier 1 station:** $77,000
- **Total Tier 1 (12 stations):** $924,000

**Tier 2 Configuration (47 stations):**
- Primary: 1x MicroCloud (4 nodes) @ $12,000 = $12,000
- Storage: 1x SuperServer storage @ $8,000 = $8,000
- **Total per Tier 2 station:** $20,000
- **Total Tier 2 (47 stations):** $940,000

**Tier 3 Configuration (200 stations):**
- Primary: 1x SuperServer 1U @ $5,000 = $5,000
- **Total per Tier 3 station:** $5,000
- **Total Tier 3 (200 stations):** $1,000,000

**Supermicro Grand Total: $2,864,000**

#### Value Proposition
- Lowest cost option (55% of Dell pricing)
- Excellent density and power efficiency
- Strong for standardized, high-volume deployments
- Best TCO for Tier 3 sites
- May require more hands-on management

---

## 2. SERVER HARDWARE VENDOR COMPARISON MATRIX

| Category | Dell PowerEdge | HPE ProLiant | Cisco UCS | Supermicro |
|----------|---------------|--------------|-----------|------------|
| **Total Cost (259 sites)** | $6,345,000 | $5,231,000 | $5,894,000 | $2,864,000 |
| **Cost vs. Dell** | Baseline | -18% | -7% | -55% |
| **Tier 1 per site** | $176,000 | $140,000 | $160,000 | $77,000 |
| **Tier 2 per site** | $39,000 | $33,000 | $42,000 | $20,000 |
| **Tier 3 per site** | $12,000 | $10,000 | $10,000 | $5,000 |
| **Reliability** | Excellent | Excellent | Excellent | Very Good |
| **Support Quality** | Best-in-class | Excellent | Excellent | Good |
| **Management Tools** | iDRAC Enterprise | iLO Advanced | UCS Manager | IPMI/Redfish |
| **Ecosystem** | Extensive | Extensive | Cisco-centric | Growing |
| **Lead Time** | 4-8 weeks | 4-8 weeks | 6-10 weeks | 6-12 weeks |
| **Warranty** | 3-5 year options | 3-5 year options | 3-5 year options | 3 year standard |
| **Energy Efficiency** | Very Good | Excellent | Very Good | Excellent |
| **Density** | Good | Good | Good | Excellent |
| **Customization** | Extensive | Extensive | Moderate | Extensive |
| **DoD/Gov Approval** | Yes | Yes | Yes | Yes |

---

## 3. COOLING INFRASTRUCTURE VENDORS

### 3.1 Schneider Electric Cooling Solutions

#### Product Overview
Integrated cooling systems ranging from chiller and economizer plants to computer room air conditioners (CRAC) and containment solutions.

#### Key Products
- **EcoBreeze:** Indirect evaporative cooling
- **InRow Cooling:** Rack-level precision cooling
- **CRAC Units:** Room-level cooling (5-260 ton capacity)
- **Chilled Water Systems:** Central plant solutions

#### Pricing Intelligence (2025)

**Room-Level Cooling:**
- Small CRAC (20-30 kW): $15,000 - $25,000
- Medium CRAC (50-75 kW): $35,000 - $55,000
- Large CRAC (100-150 kW): $65,000 - $95,000

**Row-Level Cooling:**
- InRow RC (10-35 kW): $12,000 - $18,000 per unit
- InRow RD (chilled water): $15,000 - $22,000 per unit

**Containment:**
- Hot aisle containment: $800 - $1,500 per rack
- Cold aisle containment: $1,200 - $2,000 per rack

#### Ground Station Cooling Requirements

**Tier 1 Configuration:**
- 2x Large CRAC units @ $80,000 each = $160,000
- Hot aisle containment (20 racks) @ $1,200 each = $24,000
- Redundant N+1 configuration
- **Total per Tier 1 station:** $184,000
- **Total Tier 1 (12 stations):** $2,208,000

**Tier 2 Configuration:**
- 1x Medium CRAC unit @ $45,000 = $45,000
- InRow cooling (4 units) @ $15,000 each = $60,000
- Containment (8 racks) @ $1,200 each = $9,600
- **Total per Tier 2 station:** $114,600
- **Total Tier 2 (47 stations):** $5,386,200

**Tier 3 Configuration:**
- 1x InRow RD unit @ $18,000 = $18,000
- Basic containment (2 racks) @ $1,000 each = $2,000
- **Total per Tier 3 station:** $20,000
- **Total Tier 3 (200 stations):** $4,000,000

**Schneider Electric Cooling Total: $11,594,200**

---

### 3.2 Vertiv Cooling Solutions

#### Product Overview
Precision cooling and thermal management for mission-critical infrastructure with focus on efficiency and reliability.

#### Key Products
- **Liebert DSE:** Packaged cooling systems
- **Liebert LPC:** High-precision air conditioning
- **CoolPhase Flex:** Hybrid liquid/air cooling
- **Liebert XD:** Pumped refrigerant systems

#### Pricing Intelligence (2025)

**Precision Air Conditioning:**
- Self-contained (0.5-10 ton): $8,000 - $35,000
- Room cooling (20-50 ton): $40,000 - $75,000
- Large capacity (75-100+ ton): $85,000 - $150,000

**Hybrid Cooling:**
- CoolPhase Flex: $95,000 - $140,000
- Liquid cooling components: $25,000 - $45,000 per rack

**Features:**
- PUE < 1.1 achievable
- Up to 50% lower capital costs vs traditional
- Temperature precision: ±0.5°C

#### Ground Station Cooling Requirements

**Tier 1 Configuration:**
- 1x Large Liebert DSE @ $125,000 = $125,000
- 1x CoolPhase Flex (future-ready) @ $120,000 = $120,000
- Containment @ $25,000 = $25,000
- **Total per Tier 1 station:** $270,000
- **Total Tier 1 (12 stations):** $3,240,000

**Tier 2 Configuration:**
- 1x Medium Liebert DSE @ $65,000 = $65,000
- Liebert XD rows @ $40,000 = $40,000
- Containment @ $10,000 = $10,000
- **Total per Tier 2 station:** $115,000
- **Total Tier 2 (47 stations):** $5,405,000

**Tier 3 Configuration:**
- 1x Small Liebert LPC @ $25,000 = $25,000
- **Total per Tier 3 station:** $25,000
- **Total Tier 3 (200 stations):** $5,000,000

**Vertiv Cooling Total: $13,645,000**

---

### 3.3 Cooling Vendor Comparison Matrix

| Category | Schneider Electric | Vertiv |
|----------|-------------------|--------|
| **Total Cost (259 sites)** | $11,594,200 | $13,645,000 |
| **Cost vs. Schneider** | Baseline | +18% |
| **Tier 1 per site** | $184,000 | $270,000 |
| **Tier 2 per site** | $114,600 | $115,000 |
| **Tier 3 per site** | $20,000 | $25,000 |
| **Energy Efficiency** | Excellent | Excellent |
| **Precision** | ±1°C | ±0.5°C |
| **Capacity Range** | 5-260 ton | 0.5-100+ ton |
| **Hybrid Cooling** | Available | Advanced |
| **PUE Achievement** | 1.2-1.3 | <1.1 |
| **Reliability** | Excellent | Excellent |
| **Service Network** | Global | Global |
| **Lead Time** | 8-12 weeks | 10-14 weeks |

**Recommendation:**
- **Tier 1:** Vertiv (future-proof hybrid cooling for AI workloads)
- **Tier 2/3:** Schneider Electric (cost-optimized, proven technology)
- **Blended Approach Total:** $12,500,000 (average of both vendors)

---

## 4. DATACENTER RACK & INFRASTRUCTURE

### 4.1 Rack Infrastructure Costs

#### Standard 42U Rack Equipment

**Rack Enclosure:**
- Entry-level 42U: $500 - $800
- Enterprise 42U with features: $1,000 - $1,500
- Premium 42U with glass door: $1,500 - $2,000

**Power Distribution Units (PDUs):**
- Basic PDU: $100 - $200
- Monitored PDU: $500 - $800
- Switched/Intelligent PDU: $1,200 - $2,000

**Cable Management:**
- Vertical managers: $150 - $300 per rack
- Horizontal managers: $50 - $100 per U
- Cable trays and accessories: $200 - $400

**KVM and Console:**
- Basic KVM switch: $300 - $600
- Enterprise KVM (8-16 port): $1,200 - $2,500
- LCD console drawer: $800 - $1,500

#### Complete Rack Configuration Costs

**Tier 1 Standard Rack (20 racks per site):**
- Rack enclosure: $1,500
- 2x Intelligent PDUs: $3,000
- Cable management: $500
- KVM console: $1,800
- **Per rack:** $6,800
- **Per Tier 1 site (20 racks):** $136,000
- **Total Tier 1 (12 sites):** $1,632,000

**Tier 2 Standard Rack (8 racks per site):**
- Rack enclosure: $1,000
- 2x Monitored PDUs: $1,200
- Cable management: $350
- KVM switch: $800
- **Per rack:** $3,350
- **Per Tier 2 site (8 racks):** $26,800
- **Total Tier 2 (47 sites):** $1,259,600

**Tier 3 Standard Rack (2 racks per site):**
- Rack enclosure: $600
- 2x Basic PDUs: $300
- Cable management: $200
- **Per rack:** $1,100
- **Per Tier 3 site (2 racks):** $2,200
- **Total Tier 3 (200 sites):** $440,000

**Total Rack Infrastructure: $3,331,600**

---

### 4.2 Datacenter Construction Costs

#### Cost per Square Foot (2025 Pricing)

**Component Breakdown:**
- Land: $25 - $75/sq ft
- Building shell: $80 - $160/sq ft
- Electrical systems: $280 - $460/sq ft (40-45% of total)
- Powered shell: $105 - $235/sq ft
- DC improvements (HVAC, fire, fit-out): $520 - $900/sq ft
- **Total development: $625 - $1,135/sq ft**

**Per Megawatt Costs:**
- Greenfield datacenter: $7M - $12M per MW
- Industry average: $8M - $12M per MW

#### Ground Station Facility Requirements

**Tier 1 Facility (500 kW IT load):**
- 3,000 sq ft total facility
- Construction @ $900/sq ft = $2,700,000
- Electrical infrastructure = $1,200,000
- HVAC and cooling = $800,000
- Fire suppression & security = $300,000
- **Total per Tier 1 facility:** $5,000,000
- **Total Tier 1 (12 sites):** $60,000,000

**Tier 2 Facility (200 kW IT load):**
- 1,500 sq ft total facility
- Construction @ $750/sq ft = $1,125,000
- Electrical infrastructure = $500,000
- HVAC and cooling = $350,000
- Fire suppression & security = $125,000
- **Total per Tier 2 facility:** $2,100,000
- **Total Tier 2 (47 sites):** $98,700,000

**Tier 3 Facility (50 kW IT load):**
- 600 sq ft total facility
- Construction @ $600/sq ft = $360,000
- Electrical infrastructure = $150,000
- HVAC and cooling = $90,000
- Fire suppression & security = $50,000
- **Total per Tier 3 facility:** $650,000
- **Total Tier 3 (200 sites):** $130,000,000

**Total Facility Construction: $288,700,000**

---

## 5. CONSOLIDATED HARDWARE & INFRASTRUCTURE SUMMARY

### Total Capital Expenditure by Category

| Category | Cost Range | Recommended |
|----------|-----------|-------------|
| **Server Hardware** | $2.9M - $6.3M | $5.2M (HPE/Supermicro blend) |
| **Cooling Infrastructure** | $11.6M - $13.6M | $12.5M (blended approach) |
| **Rack Infrastructure** | $3.3M | $3.3M |
| **Facility Construction** | $288.7M | $288.7M |
| **Satellite Equipment** | $200M - $350M | $275M (see separate doc) |
| **Network Equipment** | $25M - $40M | $32M (see separate doc) |
| **Security Infrastructure** | $15M - $25M | $20M (see separate doc) |
| **TOTAL INFRASTRUCTURE** | $546.5M - $738.9M | $636.7M |

### Cost Optimization Recommendations

1. **Blended Server Strategy:**
   - Tier 1: Dell PowerEdge (reliability priority)
   - Tier 2: HPE ProLiant (balanced cost/performance)
   - Tier 3: Supermicro (cost optimization)
   - **Savings: $1.1M vs. all-Dell**

2. **Cooling Approach:**
   - Tier 1: Vertiv hybrid (future-ready)
   - Tier 2/3: Schneider Electric (proven, cost-effective)
   - **Savings: $1.1M vs. all-Vertiv**

3. **Facility Optimization:**
   - Co-locate Tier 2 sites where possible (save 20% construction)
   - Modular/prefab for Tier 3 (save 30% construction)
   - **Potential Savings: $45M**

4. **Procurement Strategy:**
   - Enterprise agreements for 20-25% hardware discount
   - Multi-year commitments for price stability
   - Bundled services for 10-15% additional savings
   - **Total Savings Potential: $95M - $127M (15-20%)**

### Final Optimized Hardware Budget

- **Baseline Infrastructure:** $636.7M
- **Less Procurement Optimization:** -$115M (18%)
- **Net Infrastructure CAPEX:** $521.7M
- **Contingency Reserve (15%):** $78.3M
- **TOTAL HARDWARE BUDGET:** $600M

---

## Document Control

**Next Documents in Series:**
- SECURITY_INFRASTRUCTURE_ANALYSIS.md
- SATELLITE_EQUIPMENT_VENDORS.md
- MANAGEMENT_PLATFORMS_ANALYSIS.md
- COST_MODELS_AND_ROI.md
