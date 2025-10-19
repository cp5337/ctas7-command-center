# NYX-TRACE Quick Start Guide
**Government-Compliant Intelligence Environment Setup**

## Classification
**UNCLASSIFIED//FOR OFFICIAL USE ONLY**

---

## 30-Second Overview

NYX-TRACE is CTAS 0.1, a Python-based intelligence platform being integrated into CTAS 7.0 (Rust). This guide gets you operational in under 30 minutes.

**Core Capabilities**:
- 🌐 **GEOINT**: H3 hexagons, OSM mapping, geospatial clustering
- 🔍 **OSINT**: Shodan, web scraping, social media monitoring
- 🕸️ **Network Analysis**: Criminal/adversary network mapping
- 🤖 **AI/NLP**: Sentiment analysis, entity extraction
- 📊 **Visualization**: Interactive dashboards, maps, graphs

---

## Step 1: Environment Setup (5 minutes)

### Create Anaconda Environment

```bash
cd /Users/cp5337/Developer/ctas7-command-center/nyx-trace-restoration

# Create environment from YAML
conda env create -f environment.yml

# Activate environment
conda activate nyx-trace-ctas7

# Verify installation
python -c "import geopandas, folium, h3, osmnx; print('✓ Geospatial OK')"
python -c "import spacy, openai; print('✓ AI/NLP OK')"
python -c "import streamlit, plotly; print('✓ Visualization OK')"
```

### Post-Installation

```bash
# Download SpaCy language model
python -m spacy download en_core_web_sm

# Install Playwright browsers
playwright install

# Verify GDAL
gdalinfo --version
```

---

## Step 2: Configure Environment Variables (2 minutes)

Create `.env` file in your project root:

```bash
# AI/LLM APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# OSINT Tools
SHODAN_API_KEY=...
NEWS_API_KEY=...

# Databases
SUPABASE_URL=https://...
SUPABASE_KEY=...
DATABASE_URL=postgresql://user:pass@host:5432/db

# Geospatial
MAPBOX_TOKEN=pk...

# CTAS 7.0 Integration
NEURAL_MUX_ENDPOINT=http://localhost:8080
LEGION_CYBER_ENDPOINT=http://localhost:8081
LEGION_GEO_ENDPOINT=http://localhost:8082

# Security
CLASSIFICATION_LEVEL=SECRET
CLEARANCE_LEVEL=TS_SCI
AUDIT_LOG_PATH=/var/log/ctas7-nyx/audit.log
```

---

## Step 3: Extract NYX Components (10 minutes)

### 3.1 Create Extraction Workspace

```bash
cd /Users/cp5337/Developer/ctas7-command-center
mkdir -p nyx-trace-extraction/{tier1,tier2,python-modules}
```

### 3.2 Extract Tier 1 Components (Public/FOUO)

```bash
# Geospatial analysis
cp /Users/cp5337/Developer/ctas7-nyx-trace-rebuild/visualization/gis/geo_processor.py \
   nyx-trace-extraction/tier1/geospatial_analysis.py

# Sentiment analysis
cp /Users/cp5337/Developer/ctas7-nyx-trace-rebuild/data_sources/osint_analyzer.py \
   nyx-trace-extraction/tier1/sentiment_analysis.py

# Entity registry
cp /Users/cp5337/Developer/ctas7-nyx-trace-rebuild/core/registry.py \
   nyx-trace-extraction/tier1/entity_registry.py

# Visualization tools
cp /Users/cp5337/Developer/ctas7-nyx-trace-rebuild/visualization/heatmap.py \
   nyx-trace-extraction/tier1/visualization_tools.py
```

### 3.3 Create Python Module Structure

```bash
cd nyx-trace-extraction/python-modules
mkdir -p nyx_intelligence/{collectors,analyzers,visualizers,integrations}

# Create __init__ files
touch nyx_intelligence/__init__.py
touch nyx_intelligence/collectors/__init__.py
touch nyx_intelligence/analyzers/__init__.py
touch nyx_intelligence/visualizers/__init__.py
touch nyx_intelligence/integrations/__init__.py
```

---

## Step 4: Test Basic Functionality (5 minutes)

### 4.1 Test Geospatial Stack

```python
# test_geospatial.py
import geopandas as gpd
import folium
import h3

# Test H3 hexagons
lat, lon = 34.05, -118.25
resolution = 9
hex_id = h3.latlng_to_cell(lat, lon, resolution)
print(f"✓ H3 Hexagon: {hex_id}")

# Test Folium map
m = folium.Map(location=[lat, lon], zoom_start=10)
print("✓ Folium map created")

# Test GeoPandas
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
print(f"✓ GeoPandas loaded {len(world)} countries")
```

```bash
python test_geospatial.py
```

### 4.2 Test OSINT Collection (requires API key)

```python
# test_osint.py
import os
from dotenv import load_dotenv
import requests

load_dotenv()

# Test Shodan (if API key available)
shodan_key = os.getenv('SHODAN_API_KEY')
if shodan_key:
    try:
        import shodan
        api = shodan.Shodan(shodan_key)
        info = api.info()
        print(f"✓ Shodan API: {info['query_credits']} credits available")
    except Exception as e:
        print(f"⚠ Shodan: {e}")

# Test basic web scraping
response = requests.get('https://example.com')
print(f"✓ Web scraping: HTTP {response.status_code}")
```

```bash
python test_osint.py
```

### 4.3 Test AI/NLP

```python
# test_nlp.py
import spacy

# Load SpaCy model
nlp = spacy.load("en_core_web_sm")

# Test entity extraction
doc = nlp("Apple Inc. is headquartered in Cupertino, California.")
entities = [(ent.text, ent.label_) for ent in doc.ents]
print(f"✓ SpaCy entities: {entities}")

# Test OpenAI (if API key available)
import os
if os.getenv('OPENAI_API_KEY'):
    from openai import OpenAI
    client = OpenAI()
    # Simple test (costs minimal tokens)
    print("✓ OpenAI API configured")
```

```bash
python test_nlp.py
```

---

## Step 5: Build Rust Bridge (Optional, 10 minutes)

### 5.1 Create Bridge Project

```bash
cd /Users/cp5337/Developer/ctas7-command-center
cargo new --lib ctas7-nyx-bridge
cd ctas7-nyx-bridge
```

### 5.2 Update Cargo.toml

```toml
[package]
name = "ctas7-nyx-bridge"
version = "0.1.0"
edition = "2021"

[lib]
name = "ctas7_nyx_bridge"
crate-type = ["cdylib"]

[dependencies]
pyo3 = { version = "0.20", features = ["extension-module"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[build-dependencies]
maturin = "1.4"
```

### 5.3 Build Bridge

```bash
# Install maturin
pip install maturin

# Development build
maturin develop

# Test import
python -c "import ctas7_nyx_bridge; print('✓ Rust bridge OK')"
```

---

## Step 6: Launch Dashboard (2 minutes)

### 6.1 Simple Dashboard Test

```python
# dashboard_test.py
import streamlit as st
import folium
from streamlit_folium import folium_static

st.set_page_config(
    page_title="NYX Intelligence Test",
    layout="wide"
)

st.title("NYX-TRACE Intelligence Dashboard")
st.markdown("**Classification: UNCLASSIFIED**")

# Test map
st.header("Geospatial View")
m = folium.Map(location=[34.05, -118.25], zoom_start=10)
folium.Marker([34.05, -118.25], popup="Test Location").add_to(m)
folium_static(m)

# Test metrics
col1, col2, col3 = st.columns(3)
col1.metric("Entities", "42")
col2.metric("Networks", "7")
col3.metric("Threats", "3")

st.success("✓ Dashboard operational")
```

```bash
streamlit run dashboard_test.py
```

Navigate to: http://localhost:8501

---

## Common Issues & Solutions

### Issue: Conda package conflicts

**Solution**: Use conda-forge channel
```bash
conda install -c conda-forge <package>
```

### Issue: GDAL installation failure

**Solution**: Install via conda-forge (not pip)
```bash
conda install -c conda-forge gdal
```

### Issue: Playwright browser download fails

**Solution**: Install manually
```bash
playwright install chromium
```

### Issue: SpaCy model download fails

**Solution**: Download directly
```bash
python -m spacy download en_core_web_sm --direct
```

### Issue: Import errors in Python

**Solution**: Verify conda environment activated
```bash
conda activate nyx-trace-ctas7
which python  # Should show conda env path
```

---

## Quick Command Reference

```bash
# Environment management
conda activate nyx-trace-ctas7
conda deactivate
conda env list
conda list  # Show installed packages

# Python package info
pip show <package>
pip list

# Test imports
python -c "import <package>; print(<package>.__version__)"

# Streamlit
streamlit run <script.py>
streamlit run <script.py> --server.port 8502  # Custom port

# Jupyter
jupyter lab
jupyter notebook

# Rust bridge
maturin develop  # Development build
maturin build --release  # Production build
```

---

## Security Checklist

Before processing classified data:

- [ ] ✅ Environment variables configured
- [ ] ✅ Audit logging enabled
- [ ] ✅ Classification headers added to all files
- [ ] ✅ API keys stored securely (not in code)
- [ ] ✅ Database connections encrypted
- [ ] ✅ User clearance level validated
- [ ] ✅ OPSEC procedures reviewed
- [ ] ✅ Incident response plan in place

---

## Next Steps

1. **Review Full Documentation**
   - `RESTORATION_PLAN.md`: Complete integration strategy
   - `MODULARIZATION_STRATEGY.md`: Code decomposition
   - `RUST_BRIDGE_ARCHITECTURE.md`: Rust↔Python bridge

2. **Extract NYX Components**
   - Identify government-safe scripts
   - Apply classification headers
   - Modularize large files

3. **Integrate with CTAS 7.0**
   - Build Rust bridge
   - Connect to Neural Mux
   - Integrate with Legion worlds

4. **Deploy to Production**
   - Security review
   - Clearance approvals
   - Operator training

---

## Support & Resources

**Documentation Location**: `/Users/cp5337/Developer/ctas7-command-center/nyx-trace-restoration/`

**Key Files**:
- `environment.yml`: Anaconda environment
- `RESTORATION_PLAN.md`: Complete strategy
- `MODULARIZATION_STRATEGY.md`: Code organization
- `RUST_BRIDGE_ARCHITECTURE.md`: Rust integration

**NYX Original System**: `/Users/cp5337/Developer/ctas7-nyx-trace-rebuild/`

**CTAS 7.0 Base**: `/Users/cp5337/Developer/ctas7-command-center/`

---

## Success Criteria

You're ready to proceed when:

✅ Conda environment activates without errors
✅ All test scripts run successfully
✅ Dashboard launches and displays map
✅ API keys configured (for OSINT/AI features)
✅ Rust bridge builds (optional but recommended)
✅ Security checklist completed

---

**Time to Operational**: ~30 minutes (with API keys configured)

**Classification**: UNCLASSIFIED//FOR OFFICIAL USE ONLY

**Last Updated**: 2025-10-18
