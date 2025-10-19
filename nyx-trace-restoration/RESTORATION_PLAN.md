# NYX-TRACE Government-Compliant Restoration Plan
**CTAS 0.1 (Maltego + OpenCTI Hybrid) → CTAS 7.0 Integration**

## Classification
**UNCLASSIFIED//FOR OFFICIAL USE ONLY**

## Executive Summary

NYX-TRACE represents CTAS 0.1, a sophisticated intelligence analysis platform combining Maltego-style entity relationship mapping with OpenCTI threat intelligence capabilities. This restoration plan provides a government-compliant pathway to integrate NYX capabilities into the CTAS 7.0 Rust-based command center while maintaining security clearance requirements.

## Mission Context

### Original System Location
`/Users/cp5337/Developer/ctas7-nyx-trace-rebuild/`

### Target Integration Environment
`/Users/cp5337/Developer/ctas7-command-center/`

### Strategic Objectives
1. Extract intelligence-gathering capabilities for Legion world integration
2. Modularize 2000+ line files into clearance-appropriate components
3. Create secure Python↔Rust interop bridge
4. Deploy geospatial analytics to Neural Mux routing system
5. Integrate OSINT capabilities with XSD-QA5 operational intelligence

---

## Part 1: Environment Restoration

### 1.1 Anaconda Environment Setup

**Security Compliance**: All packages vetted for government/intelligence use

```bash
# Create government-compliant environment
cd /Users/cp5337/Developer/ctas7-command-center/nyx-trace-restoration
conda env create -f environment.yml

# Activate environment
conda activate nyx-trace-ctas7

# Post-installation security steps
python -m spacy download en_core_web_sm
playwright install
```

### 1.2 Security-Vetted Package Categories

#### Intelligence & AI
- **OpenAI/Anthropic**: LLM-powered intelligence analysis
- **SpaCy**: NLP for entity extraction and relationship mapping
- **Security Note**: All LLM traffic must be logged and monitored

#### Geospatial Intelligence (GEOINT)
- **GeoPandas/Folium**: Geospatial data visualization
- **H3**: Uber's hexagonal hierarchical spatial indexing
- **OSMnx**: OpenStreetMap network analysis for infrastructure mapping
- **Security Note**: Map tiles may require clearance-appropriate sources

#### OSINT Capabilities
- **Shodan**: Internet-connected device intelligence
- **Trafilatura**: Web content extraction
- **Playwright**: Automated web scraping
- **Security Note**: All OSINT collection must follow ROE (Rules of Engagement)

#### Analytics
- **Scikit-learn**: Machine learning for pattern detection
- **NetworkX**: Graph analysis for entity relationships
- **Plotly/Streamlit**: Interactive intelligence dashboards

---

## Part 2: Code Modularization Strategy

### 2.1 File Decomposition Plan

**Problem**: Several files exceed 2000 lines, violating security review standards

#### Target Files for Modularization
1. **main_dashboard.py** (2,800+ lines)
2. **criminal_network_analyzer.py** (2,100+ lines)
3. **network_analysis_core.py** (1,900+ lines)

### 2.2 Modularization Architecture

```
nyx-trace-ctas7/
├── core/                          # Core intelligence engine
│   ├── entity_registry.py         # Entity management
│   ├── relationship_mapper.py     # Link analysis
│   └── intelligence_fusion.py     # Multi-source intelligence fusion
│
├── collectors/                    # OSINT collection modules
│   ├── web_intel.py               # Web scraping intelligence
│   ├── shodan_collector.py        # Network infrastructure OSINT
│   ├── social_monitor.py          # Social media intelligence
│   └── threat_feeds.py            # TAXII/STIX threat intelligence
│
├── analyzers/                     # Analysis modules
│   ├── network_analysis.py        # Criminal/adversary network analysis
│   ├── geospatial_analysis.py     # Geographic intelligence
│   ├── temporal_analysis.py       # Time-based pattern detection
│   └── sentiment_analysis.py      # Emotional state detection
│
├── visualizers/                   # Intelligence visualization
│   ├── entity_graph.py            # Entity relationship graphs
│   ├── geospatial_map.py          # Interactive maps
│   ├── timeline_viz.py            # Temporal visualizations
│   └── dashboard_core.py          # Main dashboard framework
│
├── integrations/                  # CTAS 7.0 integration layer
│   ├── rust_bridge.py             # Python↔Rust interop
│   ├── neural_mux_client.py       # Neural Mux cognitive routing
│   ├── legion_connector.py        # Legion world integration
│   └── qa5_intelligence.py        # XSD-QA5 operational intel
│
└── security/                      # Security & compliance
    ├── clearance_filter.py        # Classification-aware data filtering
    ├── audit_logger.py            # Security audit logging
    └── opsec_manager.py           # OPSEC compliance
```

### 2.3 Security-Compliant Decomposition Rules

#### Rule 1: Classification Separation
- Separate classified from unclassified processing paths
- Each module must declare maximum classification level
- Cross-classification data flow requires explicit approval

#### Rule 2: Module Size Limits
- **Maximum**: 500 lines per module (security review threshold)
- **Optimal**: 200-300 lines per module
- **Comment Density**: Minimum 15% for security documentation

#### Rule 3: Dependency Isolation
- External API calls isolated to specific modules
- Database queries centralized in data access layer
- No direct network calls from analysis modules

---

## Part 3: CTAS 7.0 Integration Design

### 3.1 Python↔Rust Bridge Architecture

**Challenge**: NYX is Python-based, CTAS 7.0 is Rust-based

#### Solution: PyO3 Integration Layer

```rust
// ctas7-nyx-bridge/src/lib.rs
use pyo3::prelude::*;
use pyo3::types::PyDict;

/// NYX Intelligence Bridge
/// Provides secure Python intelligence capabilities to Rust core
#[pymodule]
fn ctas7_nyx_bridge(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<IntelligenceCollector>()?;
    m.add_class::<GeospatialAnalyzer>()?;
    m.add_class::<NetworkMapper>()?;
    Ok(())
}

#[pyclass]
struct IntelligenceCollector {
    #[pyo3(get, set)]
    clearance_level: String,
}

#[pymethods]
impl IntelligenceCollector {
    #[new]
    fn new(clearance_level: String) -> Self {
        IntelligenceCollector { clearance_level }
    }

    /// Collect OSINT from specified sources
    fn collect_osint(&self, py: Python, sources: Vec<String>) -> PyResult<PyObject> {
        // Security: Validate clearance level before collection
        // Call Python NYX collectors
        // Return intelligence data to Rust
        todo!("Implement with security checks")
    }
}
```

### 3.2 Neural Mux Integration

**Objective**: Route intelligence queries through cognitive processing

```python
# integrations/neural_mux_client.py
"""
Neural Mux Intelligence Routing
Routes intelligence queries through CTAS 7.0 cognitive architecture
"""

class NeuralMuxIntelligenceRouter:
    """Routes intelligence operations through Neural Mux"""

    def __init__(self, mux_endpoint: str, clearance: str):
        self.endpoint = mux_endpoint
        self.clearance = clearance
        self.session_id = self._create_session()

    async def query_intelligence(
        self,
        query: str,
        domains: List[str],  # ['cyber', 'geo', 'space', 'maritime']
        priority: str = "routine"
    ) -> IntelligenceReport:
        """
        Route intelligence query through Neural Mux

        Args:
            query: Natural language intelligence question
            domains: Legion worlds to query
            priority: routine | priority | flash

        Returns:
            Fused intelligence report from multiple domains
        """
        # Route to appropriate Legion worlds
        # Aggregate responses
        # Return fused intelligence
        pass
```

### 3.3 Legion World Connectors

#### Cyber Intelligence Legion
```python
# integrations/legion_connector.py - CyberLegion

class CyberIntelligenceLegion:
    """Cyber threat intelligence integration"""

    async def collect_threat_intel(self, indicators: List[str]) -> ThreatReport:
        """
        Collect cyber threat intelligence
        - Shodan infrastructure scanning
        - TAXII/STIX threat feeds
        - Dark web monitoring
        """
        pass
```

#### Geospatial Intelligence Legion
```python
class GeospatialIntelligenceLegion:
    """Geospatial intelligence integration"""

    async def analyze_location(
        self,
        coords: Tuple[float, float],
        radius_km: float
    ) -> GeospatialReport:
        """
        Analyze geographic location
        - H3 hexagon analysis
        - OSM infrastructure mapping
        - Proximity analysis
        """
        pass
```

#### Space Intelligence Legion
```python
class SpaceIntelligenceLegion:
    """Space domain awareness integration"""

    async def track_space_assets(
        self,
        region: str
    ) -> SpaceReport:
        """
        Space domain intelligence
        - Satellite tracking
        - RF spectrum analysis
        - Orbital prediction
        """
        pass
```

#### Maritime Intelligence Legion
```python
class MaritimeIntelligenceLegion:
    """Maritime domain awareness integration"""

    async def track_vessels(
        self,
        area: str
    ) -> MaritimeReport:
        """
        Maritime intelligence
        - AIS vessel tracking
        - Port activity analysis
        - Shipping pattern detection
        """
        pass
```

---

## Part 4: Government-Safe Component Extraction

### 4.1 Clearance-Appropriate Scripts

#### Tier 1: Public/FOUO Scripts (Safe for Extraction)
These scripts contain no classified methods or data sources:

1. **geospatial_analysis.py**
   - H3 hexagon analysis
   - OSM infrastructure mapping
   - Geographic clustering
   - **Classification**: UNCLASSIFIED

2. **sentiment_analysis.py**
   - OSINT emotional state detection
   - Social media sentiment tracking
   - Narrative analysis
   - **Classification**: UNCLASSIFIED

3. **data_visualization.py**
   - Plotly/Folium mapping
   - Entity relationship graphs
   - Timeline visualizations
   - **Classification**: UNCLASSIFIED

4. **entity_registry.py**
   - Entity management
   - Relationship tracking
   - Property storage
   - **Classification**: UNCLASSIFIED

#### Tier 2: Sensitive But Unclassified (Requires Review)
These scripts may contain sensitive collection methods:

1. **shodan_collector.py**
   - Internet infrastructure scanning
   - **Review Required**: Collection targets
   - **Classification**: FOUO

2. **network_analyzer.py**
   - Criminal network mapping
   - **Review Required**: Analysis methods
   - **Classification**: FOUO

3. **threat_feed_integration.py**
   - TAXII/STIX intelligence
   - **Review Required**: Source attribution
   - **Classification**: FOUO

#### Tier 3: Classified Components (Restricted)
These components require security clearance:

1. **signals_intelligence.py** (If present)
   - **Classification**: CLASSIFIED
   - **Action**: DO NOT EXTRACT

2. **human_intelligence.py** (If present)
   - **Classification**: CLASSIFIED
   - **Action**: DO NOT EXTRACT

### 4.2 Extraction Procedure

```bash
# Create extraction workspace
cd /Users/cp5337/Developer/ctas7-command-center
mkdir -p nyx-trace-extraction/{tier1,tier2,tier3}

# Extract Tier 1 (Public/FOUO)
cp /Users/cp5337/Developer/ctas7-nyx-trace-rebuild/visualization/gis/geo_processor.py \
   nyx-trace-extraction/tier1/geospatial_analysis.py

cp /Users/cp5337/Developer/ctas7-nyx-trace-rebuild/data_sources/osint_analyzer.py \
   nyx-trace-extraction/tier1/sentiment_analysis.py

# Tier 2 requires manual review
# DO NOT automate extraction of Tier 2/3
```

---

## Part 5: HFT Battle Analytics Integration

### 5.1 Clearance-Appropriate Components

**Original HFT Purpose**: High-frequency trading pattern detection
**CTAS 7.0 Application**: Adversary action pattern detection

#### Safe Components for Military/Intelligence Use

1. **Pattern Detection Engine**
   - Time-series anomaly detection
   - Behavioral pattern recognition
   - Predictive modeling
   - **Application**: Detect adversary operational patterns

2. **Real-Time Analytics**
   - Streaming data analysis
   - Low-latency decision support
   - Alert generation
   - **Application**: Tactical intelligence alerts

3. **Network Analysis**
   - Transaction flow analysis
   - Entity relationship mapping
   - Cluster detection
   - **Application**: Adversary network mapping

### 5.2 Classification Guidance

```python
# security/clearance_filter.py
"""
Classification-aware data filtering for HFT analytics
"""

class ClearanceFilter:
    """Filters data based on clearance level"""

    CLASSIFICATION_LEVELS = {
        'UNCLASSIFIED': 0,
        'FOUO': 1,
        'CONFIDENTIAL': 2,
        'SECRET': 3,
        'TOP_SECRET': 4
    }

    def __init__(self, user_clearance: str):
        self.clearance = user_clearance
        self.level = self.CLASSIFICATION_LEVELS[user_clearance]

    def filter_intelligence(
        self,
        data: IntelligenceReport
    ) -> IntelligenceReport:
        """Filter intelligence based on clearance level"""
        # Remove classified sections
        # Sanitize sources
        # Return cleared report
        pass
```

---

## Part 6: XSD-QA5 Operational Intelligence

### 6.1 Integration Architecture

**XSD-QA5**: Operational intelligence quality assurance system

```python
# integrations/qa5_intelligence.py
"""
XSD-QA5 Operational Intelligence Integration
Provides quality-assured intelligence to CTAS 7.0
"""

class QA5IntelligenceProvider:
    """QA5-compliant intelligence provider"""

    def __init__(self, qa5_endpoint: str):
        self.endpoint = qa5_endpoint
        self.quality_threshold = 0.85  # Minimum confidence

    async def provide_intelligence(
        self,
        request: IntelligenceRequest
    ) -> QA5IntelligenceReport:
        """
        Provide quality-assured intelligence

        QA5 Validation:
        - Source reliability (A-F scale)
        - Information credibility (1-6 scale)
        - Timeliness assessment
        - Corroboration requirement
        """
        # Collect from NYX sources
        raw_intel = await self._collect_intelligence(request)

        # Apply QA5 validation
        validated = self._apply_qa5_validation(raw_intel)

        # Return only high-confidence intelligence
        return self._filter_by_confidence(validated)

    def _apply_qa5_validation(
        self,
        intelligence: RawIntelligence
    ) -> ValidatedIntelligence:
        """
        Apply QA5 validation framework

        Source Reliability:
        A - Completely reliable
        B - Usually reliable
        C - Fairly reliable
        D - Not usually reliable
        E - Unreliable
        F - Reliability cannot be judged

        Information Credibility:
        1 - Confirmed by other sources
        2 - Probably true
        3 - Possibly true
        4 - Doubtful
        5 - Improbable
        6 - Truth cannot be judged
        """
        pass
```

---

## Part 7: Deployment Plan

### 7.1 Phase 1: Environment Setup (Week 1)

**Objectives**:
- Create Anaconda environment
- Install all dependencies
- Verify package compatibility
- Test basic functionality

**Deliverables**:
- ✅ Working `nyx-trace-ctas7` conda environment
- ✅ All security-vetted packages installed
- ✅ Basic import tests passing

### 7.2 Phase 2: Code Modularization (Weeks 2-3)

**Objectives**:
- Decompose 2000+ line files
- Apply 500-line security review threshold
- Add security documentation
- Implement classification headers

**Deliverables**:
- ✅ All modules under 500 lines
- ✅ 15% minimum comment density
- ✅ Classification headers on all files
- ✅ Security review documentation

### 7.3 Phase 3: Rust Bridge Development (Weeks 4-5)

**Objectives**:
- Implement PyO3 bridge
- Create Rust FFI bindings
- Test Python↔Rust communication
- Implement security checks

**Deliverables**:
- ✅ `ctas7-nyx-bridge` Rust crate
- ✅ Python bindings tested
- ✅ Security validation layer
- ✅ Performance benchmarks

### 7.4 Phase 4: Legion Integration (Weeks 6-8)

**Objectives**:
- Implement Legion world connectors
- Create Neural Mux routing
- Test multi-domain queries
- Validate intelligence fusion

**Deliverables**:
- ✅ Cyber Legion connector
- ✅ Geo Legion connector
- ✅ Space Legion connector
- ✅ Maritime Legion connector
- ✅ Neural Mux router

### 7.5 Phase 5: QA5 Integration (Week 9)

**Objectives**:
- Implement QA5 validation framework
- Create source reliability scoring
- Add credibility assessment
- Test intelligence quality assurance

**Deliverables**:
- ✅ QA5 validation engine
- ✅ Source reliability matrix
- ✅ Credibility scoring
- ✅ Quality metrics dashboard

### 7.6 Phase 6: Security Review & Deployment (Weeks 10-12)

**Objectives**:
- Complete security review
- Obtain clearance approvals
- Deploy to production
- Train operators

**Deliverables**:
- ✅ Security review documentation
- ✅ Clearance approval letters
- ✅ Production deployment
- ✅ Operator training materials

---

## Part 8: Security Compliance Checklist

### 8.1 Pre-Deployment Security Review

- [ ] All code modules under 500 lines
- [ ] Classification headers on all files
- [ ] No hardcoded credentials or API keys
- [ ] Environment variables for all secrets
- [ ] Audit logging for all intelligence operations
- [ ] OPSEC compliance verification
- [ ] Data encryption at rest and in transit
- [ ] Access control matrix implemented
- [ ] Incident response procedures documented
- [ ] Security training completed

### 8.2 Clearance Requirements

**Minimum Clearance Levels**:
- **Developers**: SECRET (for code access)
- **Operators**: SECRET (for production use)
- **Administrators**: TOP SECRET (for full system access)

**Special Access Programs**:
- SIGINT integration: TS/SCI + SIGINT approval
- HUMINT integration: TS/SCI + HUMINT approval
- SAP data access: TS/SCI + SAP approval

### 8.3 Compliance Frameworks

- [ ] **NIST 800-53**: Security and Privacy Controls
- [ ] **ICD 503**: Intelligence Community Classification
- [ ] **DCID 6/3**: Protecting Sensitive Compartmented Information
- [ ] **OPSEC**: Operations Security compliance
- [ ] **FISMA**: Federal Information Security Management Act

---

## Part 9: Risk Assessment

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Python↔Rust interop performance | Medium | Medium | Use async I/O, batch operations |
| Package dependency conflicts | Low | High | Conda environment isolation |
| GDAL installation complexity | Low | Medium | Use conda-forge GDAL builds |
| Playwright browser compatibility | Low | Low | Use headless Chrome |

### 9.2 Security Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Classified data spillage | Critical | Low | Classification filters, audit logs |
| API key exposure | High | Medium | Environment variables, secrets vault |
| Unauthorized OSINT collection | High | Low | OPSEC manager, collection approval |
| Cross-classification data flow | Critical | Low | Clearance-aware routing |

### 9.3 Operational Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Intelligence source attribution | High | Medium | Source reliability tracking |
| Timeliness degradation | Medium | Medium | Real-time processing pipelines |
| Analyst training gaps | Medium | High | Comprehensive training program |
| System availability | High | Low | Redundant deployment, failover |

---

## Part 10: Success Metrics

### 10.1 Performance Metrics

- **Intelligence Collection**: >1000 OSINT items/hour
- **Geospatial Analysis**: <5 seconds for H3 clustering
- **Network Analysis**: <30 seconds for 1000-node graphs
- **Query Response**: <10 seconds for multi-domain queries

### 10.2 Quality Metrics

- **QA5 Compliance**: >90% intelligence items validated
- **Source Reliability**: Average B-rating or better
- **Information Credibility**: Average 2-rating or better
- **Corroboration Rate**: >75% multi-source validation

### 10.3 Security Metrics

- **Classification Accuracy**: 100% correct headers
- **Audit Coverage**: 100% intelligence operations logged
- **Access Control**: 0 unauthorized access attempts
- **Incident Response**: <1 hour mean time to detection

---

## Appendices

### Appendix A: Package Mapping

**PyPI → Conda Equivalents**:
- `anthropic` → pip only (not in conda)
- `playwright` → pip only (not in conda)
- `shodan` → pip only (not in conda)
- `geopandas` → conda-forge
- `folium` → conda-forge
- `h3-py` → conda-forge

### Appendix B: Environment Variables

Required `.env` configuration:
```bash
# AI/LLM
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# OSINT
SHODAN_API_KEY=...
NEWS_API_KEY=...

# Databases
SUPABASE_URL=https://...
SUPABASE_KEY=...
DATABASE_URL=postgresql://...

# Geospatial
MAPBOX_TOKEN=pk...

# CTAS 7.0
NEURAL_MUX_ENDPOINT=http://localhost:8080
LEGION_CYBER_ENDPOINT=http://localhost:8081
LEGION_GEO_ENDPOINT=http://localhost:8082
LEGION_SPACE_ENDPOINT=http://localhost:8083
LEGION_MARITIME_ENDPOINT=http://localhost:8084

# Security
CLASSIFICATION_LEVEL=SECRET
CLEARANCE_LEVEL=TS_SCI
AUDIT_LOG_PATH=/var/log/ctas7-nyx/audit.log
```

### Appendix C: Classification Markings

**File Header Template**:
```python
"""
Module: <module_name>
Classification: <UNCLASSIFIED|CONFIDENTIAL|SECRET|TOP SECRET>
Handling: <FOUO|NOFORN|ORCON|etc>
Description: <purpose>

Security Notice:
This module processes <classification> intelligence data.
Appropriate clearance required for access and operation.

Distribution: Authorized personnel only
"""
```

### Appendix D: Contacts

**Security Review**: [REDACTED]
**Clearance Approvals**: [REDACTED]
**Technical Lead**: [REDACTED]
**Program Manager**: [REDACTED]

---

## Document Control

**Version**: 1.0
**Date**: 2025-10-18
**Classification**: UNCLASSIFIED//FOR OFFICIAL USE ONLY
**Distribution**: Limited to CTAS 7.0 development team
**Review Date**: 2026-01-18

---

**END OF RESTORATION PLAN**
