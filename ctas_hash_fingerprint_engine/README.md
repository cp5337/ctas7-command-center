# CTAS-HASH Fingerprint Engine

This project implements the `CTAS-HASH v1.0` trivariate semantic fingerprinting system for content identification, IP detection, and lifecycle routing in CTAS-7.

Includes:
- SHC | CUID | UUID hash generation
- Base96 encoding with Lisp-style suffix
- Novelty scoring and entropy tracking
- Integration-ready CLI

## Project Structure

```
ctas_hash_fingerprint_engine/
├── README.md
├── ctas_hash_spec_v1.md
├── hash_engine/
│   ├── __init__.py
│   ├── canonicalizer.py
│   ├── encoder.py
│   ├── hasher.py
│   ├── novelty.py
│   └── utils.py
├── nlp_stack/
│   ├── __init__.py
│   ├── embedder.py
│   ├── patent_search.py
│   ├── semantic_analyzer.py
│   └── unified_compression.py
├── bne1_gnn/
│   ├── src/
│   │   ├── build_graph.py
│   │   ├── model.py
│   │   ├── train.py
│   │   └── infer.py
│   ├── data/
│   │   ├── nodes.json
│   │   └── edges.json
│   └── requirements.txt
├── tests/
│   ├── test_hasher.py
│   ├── test_encoder.py
│   ├── test_novelty.py
│   └── test_nlp_integration.py
├── cli.py
├── ingestion_pipeline.py
├── ctas_gnn_bridge.py
├── requirements.txt
└── overleaf_template.tex
```

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic Fingerprinting
```bash
python cli.py --shc λ --cuid "docs/test.md|2025-11-12T00:00:00Z" --uuid "TEST-v1-SEC001"
```

### Document Ingestion
```bash
python ingestion_pipeline.py --path /path/to/docs --output fingerprints.json
```

### GNN Embedding Integration
```bash
python ctas_gnn_bridge.py embed_and_emit
```

## Integration with CTAS-7

The fingerprint engine integrates with CTAS-7 through:
- USIM lifecycle hooks
- Pub/sub event emission
- Automated novelty-based routing
- Patent search triggering