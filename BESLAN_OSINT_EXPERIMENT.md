# Beslan School Siege - OSINT Extraction Experiment

## 🎯 Objective

Test the **old-school OSINT stack** (NO AI) to extract intelligence from the Beslan School Siege (2004) and normalize it using the **CTAS 5-tuple ontology** (Task, Actor, Object, Event, Attribute).

This validates the hypothesis: **"Can we create needle-rich hay with pre-AI tools to reduce LLM token costs?"**

---

## 📊 Methodology

### Data Sources
1. **Wikipedia** - Baseline narrative and timeline
2. **Global Terrorism Database (GTD)** - Structured event data (Event ID: 200409010001)
3. **NLTK NER** - Named Entity Recognition (persons, orgs, locations)
4. **Regex Pattern Matching** - N-V-N-N extraction for actions

### Extraction Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Web Scraping (BeautifulSoup + Requests)                 │
│    ↓                                                        │
│ 2. Entity Extraction (NLTK NER)                            │
│    ↓                                                        │
│ 3. Pattern Matching (Regex + POS Tagging)                  │
│    ↓                                                        │
│ 4. CTAS Ontology Mapping (5-tuple)                         │
│    ↓                                                        │
│ 5. Graph Node Generation (JSON)                            │
│    ↓                                                        │
│ 6. SCH Hash Generation (SHA-256 simplified)                │
└─────────────────────────────────────────────────────────────┘
```

### CTAS 5-Tuple Ontology

1. **Task** - What adversaries did (surveillance, planning, infiltration, hostage-taking, fortification)
2. **Actor** - Who (terrorists, hostages, security forces, individuals)
3. **Object** - What they used (schools, explosives, vehicles, weapons)
4. **Event** - When things happened (temporal markers, timeline)
5. **Attribute** - Metrics (casualty counts, hostage numbers, duration)

### Task Classification (IED TTL Style)

- **Mandatory** - Surveillance, Planning, Infiltration, Hostage-Taking
- **Desirable** - Weaponization, Fortification, Communication
- **Optional** - Execution

---

## 🔧 Technical Stack

### Core Tools
- **Python 3.10+** (ABE execution)
- **BeautifulSoup4** - HTML parsing
- **Requests** - HTTP client
- **NLTK** - Natural Language Toolkit
  - `punkt` - Sentence tokenization
  - `averaged_perceptron_tagger` - POS tagging
  - `maxent_ne_chunker` - Named Entity Recognition
  - `words` - Corpus

### Pattern Matching Rules

**Task Patterns:**
```python
{
    "surveillance": ["surveillance", "reconnaissance", "observe", "monitor"],
    "planning": ["plan", "coordinate", "organize", "prepare"],
    "weaponization": ["explosive", "bomb", "IED", "weapon"],
    "infiltration": ["enter", "infiltrate", "breach", "access"],
    "hostage_taking": ["hostage", "captive", "prisoner", "detain"],
    "fortification": ["barricade", "fortify", "secure", "defend"],
    "communication": ["communicate", "demand", "negotiate"],
    "execution": ["kill", "shoot", "detonate", "execute"]
}
```

**Actor Patterns:**
```python
{
    "terrorist": ["terrorist", "militant", "insurgent", "fighter"],
    "hostage": ["hostage", "victim", "child", "teacher"],
    "security_force": ["police", "special forces", "FSB", "Alpha Group"]
}
```

**Object Patterns:**
```python
{
    "facility": ["school", "gymnasium", "building"],
    "weapon": ["explosive", "bomb", "grenade", "rifle"],
    "vehicle": ["vehicle", "car", "truck", "bus"]
}
```

### N-V-N-N Pattern Extraction

Extracts action sequences:
```
Noun (Actor) → Verb (Action) → Noun (Object1) → Noun (Object2)

Example:
"Terrorists seized the school building"
  ↓
{
  "actor": "Terrorists",
  "action": "seized",
  "object1": "school",
  "object2": "building"
}
```

---

## 📦 Deployment

### ABE Execution

**Bucket:** `gs://ctas7-abe-osint/`

**Files:**
- `beslan_osint_extraction.py` - Main extraction script
- `beslan_abe_notebook.py` - Colab/AI Studio wrapper

**Execution:**
```bash
# Option 1: Google Colab
# Upload beslan_abe_notebook.py to Colab and run

# Option 2: Local with Anaconda
conda create -n beslan-osint python=3.10
conda activate beslan-osint
pip install beautifulsoup4 requests nltk
python beslan_osint_extraction.py

# Option 3: Download from ABE
gsutil cp gs://ctas7-abe-osint/beslan_osint_extraction.py .
python beslan_osint_extraction.py
```

**Results:**
```bash
# Download results
gsutil cp gs://ctas7-abe-osint/results/beslan_osint_results.json .
```

---

## 📈 Expected Output

### JSON Structure

```json
{
  "scenario_id": "S-BESLAN-001",
  "name": "Beslan School Siege",
  "scenario_type": "real_world",
  "domains": ["kinetic", "terrorism", "hostage_crisis"],
  "metadata": {
    "date": "2004-09-01 to 2004-09-03",
    "location": "Beslan, North Ossetia, Russia",
    "casualties": {"killed": 334, "wounded": 783},
    "hostages": 1100,
    "attackers": 32,
    "duration_hours": 52,
    "sch": "SCH-BESLAN-abc123def456"
  },
  "graph_nodes": {
    "tasks": [
      {
        "task_type": "surveillance",
        "keyword": "reconnaissance",
        "context": "...terrorists conducted reconnaissance of the school...",
        "ttl_classification": "mandatory"
      }
    ],
    "actors": [
      {
        "actor_type": "terrorist",
        "name": "Riyadus-Salikhin Battalion",
        "source": "pattern_matching"
      }
    ],
    "objects": [
      {
        "object_type": "facility",
        "name": "School No. 1",
        "mentions": 47
      }
    ],
    "events": [
      {
        "event_type": "temporal_marker",
        "description": "September 1, 2004: Terrorists seized the school...",
        "source": "regex_extraction"
      }
    ],
    "attributes": [
      {
        "attribute_type": "casualty_count",
        "value": 334,
        "category": "killed",
        "source": "regex_extraction"
      }
    ]
  }
}
```

### Graph Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    BESLAN GRAPH NODES                       │
├─────────────────────────────────────────────────────────────┤
│ Tasks:      50 nodes (surveillance → execution)             │
│ Actors:     30 nodes (terrorists, hostages, forces)         │
│ Objects:    20 nodes (school, explosives, vehicles)         │
│ Events:     20 nodes (timeline markers)                     │
│ Attributes: 30 nodes (casualties, metrics)                  │
├─────────────────────────────────────────────────────────────┤
│ Total:     150 graph nodes                                  │
│ SCH Hash:  SCH-BESLAN-abc123def456                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Analysis

### Zero-AI Baseline (This Experiment)

- **Wikipedia scraping:** Free
- **NLTK processing:** Free (local compute)
- **Pattern matching:** Free (deterministic)
- **Storage (GCS):** ~$0.01/month for JSON results
- **Total:** **~$0.01/month**

### AI-Enhanced (For Comparison)

- **Gemini 1.5 Pro (2M context):** $7/1M input tokens
- **Estimated tokens for Beslan:** ~50K tokens (Wikipedia article)
- **Cost per run:** ~$0.35
- **Monthly (daily updates):** ~$10.50

### Cost Savings

**35x cheaper** using old-school OSINT stack for initial extraction.

**Strategy:** Use zero-AI stack to create "needle-rich hay," then use AI only for:
- Complex narrative generation
- Geopolitical context
- Course of Action (COA) recommendations
- Node interviews (Marcus + Gemini 2M)

---

## 🎯 Next Steps

### 1. Execute on ABE
- Run `beslan_abe_notebook.py` in Google Colab
- Validate extraction quality
- Measure token savings vs. AI-only approach

### 2. Expand to All 41 Scenarios
- Apply same pipeline to:
  - 15 DHS National Planning Scenarios
  - 7 Modernized scenarios
  - 19 Real-world cyber scenarios
- Generate full CTAS intelligence graph

### 3. Integrate with Matroid Analysis
- Feed graph nodes into matroid validator
- Identify vulnerabilities and interdiction points
- Generate Time-of-Value curves

### 4. Build Lazy Loading Triggers
- Convert graph nodes into 247 OSINT triggers
- Implement on-demand collection (not data dumps)
- Reduce token costs by 90%+

### 5. Domain-Specific Ontologies
- Separate into: Cyber, Geospatial, WMD, Physical, Cyber-Physical
- Apply specialized extraction rules per domain
- Optimize for Plasma/Wazuh integration

---

## 📚 References

- **Beslan School Siege:** https://en.wikipedia.org/wiki/Beslan_school_siege
- **Global Terrorism Database:** https://www.start.umd.edu/gtd/
- **NLTK Documentation:** https://www.nltk.org/
- **CTAS IED TTL:** Original DHS OBP document (user IP)
- **5-Tuple Ontology:** Task → Actor → Object → Event → Attribute

---

## 🔐 Security Notes

- All data sources are **open-source** and **unclassified**
- Beslan scenario is **historical** (2004) and **publicly documented**
- No sensitive or classified information used
- Suitable for training, research, and customer demos

---

**Status:** ✅ Ready for ABE execution
**Cost:** ~$0.01/month (zero-AI baseline)
**Token Savings:** 35x vs. AI-only approach

