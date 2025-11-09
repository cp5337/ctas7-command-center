# 🎯 CTAS-7 Interview Generator v7.3.1

**Smart Crate for generating node and crate interviews from TOML schemas.**

---

## 🚀 **Features**

- ✅ Generate 165 node interviews from IED TTL
- ✅ Generate ~40 crate interviews from active crates
- ✅ Store in SurrealDB, Supabase, Sled
- ✅ Export to JSON, LISP, Unicode LISP, Hash-only
- ✅ Compress interviews (9.4:1 to 470:1 ratios)
- ✅ Optional Gemini 2M AI generation
- ✅ Dry-run mode for testing
- ✅ Verbose logging

---

## 📦 **Installation**

```bash
cd ctas7-interview-generator
cargo build --release
```

---

## 🎯 **Usage**

### **Generate Node Interviews**

```bash
# Generate 165 node interviews (template-based)
./target/release/generate-interviews nodes --count 165

# Generate with Gemini 2M AI
./target/release/generate-interviews nodes --count 165 --gemini --gemini-api-key $GEMINI_API_KEY

# Specify IED TTL source
./target/release/generate-interviews nodes --count 165 --ttl-source /path/to/ied_ttl.txt

# Dry run (no file writes)
./target/release/generate-interviews nodes --count 165 --dry-run
```

### **Generate Crate Interviews**

```bash
# Scan and generate crate interviews
./target/release/generate-interviews crates --scan ../../ctas-7-shipyard-staging

# Generate with Gemini 2M AI
./target/release/generate-interviews crates --scan ../../ctas-7-shipyard-staging --gemini
```

### **Generate All (Nodes + Crates)**

```bash
# Generate everything
./target/release/generate-interviews all

# With Gemini 2M
./target/release/generate-interviews all --gemini --gemini-api-key $GEMINI_API_KEY
```

### **Compress Interviews**

```bash
# Compress to Unicode LISP (9.4:1 compression)
./target/release/generate-interviews compress --input ./interviews/nodes --format unicode-lisp

# Compress to hash-only (470:1 compression)
./target/release/generate-interviews compress --input ./interviews/nodes --format hash-only
```

### **Store in Databases**

```bash
# Store in all backends
./target/release/generate-interviews store --input ./interviews/nodes --backends sled,surreal,supabase

# Store in Sled only
./target/release/generate-interviews store --input ./interviews/nodes --backends sled

# With connection strings
./target/release/generate-interviews store \
  --input ./interviews/nodes \
  --backends surreal,supabase \
  --surreal-url ws://localhost:8000 \
  --supabase-url postgresql://localhost:5432/ctas
```

### **Export Interviews**

```bash
# Export to JSON
./target/release/generate-interviews export --input ./interviews/nodes --format json --output interviews.json

# Export to LISP
./target/release/generate-interviews export --input ./interviews/nodes --format lisp --output interviews.lisp

# Export hash-only (8 KB for 165 nodes!)
./target/release/generate-interviews export --input ./interviews/nodes --format hash-only --output hashes.txt
```

---

## 📊 **Compression Formats**

| **Format** | **Size** | **Compression** | **Use Case** |
|------------|----------|-----------------|--------------|
| **TOML** | 23.5 KB | 0% (baseline) | Development, editing |
| **JSON** | 18 KB | 24% | API transport, database storage |
| **LISP** | 6 KB | 75% | XSD playbook execution |
| **Unicode LISP** | 2.5 KB | 89% (9.4:1) | In-memory graph, streaming |
| **Hash-only** | 50 bytes | 99.8% (470:1) | Triggers, audit trails |

---

## 🗄️ **Storage Backends**

### **Sled KVS**
- **Purpose**: Fast hash lookups
- **Performance**: <1ms
- **Size**: ~500 KB (compressed)

### **SurrealDB**
- **Purpose**: Graph queries, relationships
- **Performance**: <10ms
- **Size**: ~1-2 MB (with indexes)

### **Supabase**
- **Purpose**: ACID compliance, permanent records
- **Performance**: <50ms
- **Size**: ~2-3 MB (with full-text search)

---

## 🧬 **Architecture**

```
TOML Schema (23.5 KB)
    ↓
Interview Generator
    ↓
    ├─ Template-based (fast, deterministic)
    └─ Gemini 2M AI (rich, contextual)
    ↓
Generated Interview (TOML)
    ↓
Compression Pipeline
    ↓
    ├─ JSON (18 KB, 24% reduction)
    ├─ LISP (6 KB, 75% reduction)
    ├─ Unicode LISP (2.5 KB, 89% reduction)
    └─ Hash-only (50 bytes, 99.8% reduction)
    ↓
Storage Backends
    ↓
    ├─ Sled KVS (hash → interview)
    ├─ SurrealDB (graph + document)
    └─ Supabase (ACID + blockchain)
```

---

## 🎯 **Example: Complete Workflow**

```bash
# 1. Generate 165 node interviews with Gemini 2M
./target/release/generate-interviews nodes \
  --count 165 \
  --gemini \
  --gemini-api-key $GEMINI_API_KEY \
  --output ./interviews/nodes

# 2. Generate ~40 crate interviews
./target/release/generate-interviews crates \
  --scan ../../ctas-7-shipyard-staging \
  --gemini \
  --output ./interviews/crates

# 3. Compress to Unicode LISP
./target/release/generate-interviews compress \
  --input ./interviews/nodes \
  --format unicode-lisp \
  --output ./interviews/compressed/nodes

# 4. Store in all backends
./target/release/generate-interviews store \
  --input ./interviews/compressed/nodes \
  --backends sled,surreal,supabase

# 5. Export hash-only for streaming
./target/release/generate-interviews export \
  --input ./interviews/nodes \
  --format hash-only \
  --output ./hashes.txt

# Result:
# - 165 node interviews: 3.88 MB (TOML) → 8 KB (hashes)
# - 40 crate interviews: 940 KB (TOML) → 2 KB (hashes)
# - Total: 4.82 MB → 10 KB = 482:1 compression
```

---

## 📈 **Performance**

### **Generation Speed**

| **Mode** | **Speed** | **Quality** |
|----------|-----------|-------------|
| **Template-based** | ~10 interviews/sec | Good (deterministic) |
| **Gemini 2M AI** | ~2-3 interviews/min | Excellent (contextual) |

### **Storage Size (165 nodes + 40 crates)**

| **Backend** | **Size** | **Lookup Speed** |
|-------------|----------|------------------|
| **Sled KVS** | ~600 KB | <1ms |
| **SurrealDB** | ~2 MB | <10ms |
| **Supabase** | ~3 MB | <50ms |

---

## 🔧 **Configuration**

### **Environment Variables**

```bash
export GEMINI_API_KEY="your-api-key-here"
export SURREAL_URL="ws://localhost:8000"
export SUPABASE_URL="postgresql://localhost:5432/ctas"
```

### **Config File** (optional)

```toml
# config.toml
[generation]
default_count = 165
use_gemini = false
gemini_model = "gemini-2.0-flash-exp"

[storage]
backends = ["sled", "surreal", "supabase"]
sled_path = "./data/interviews.sled"
surreal_url = "ws://localhost:8000"
supabase_url = "postgresql://localhost:5432/ctas"

[compression]
default_format = "unicode-lisp"
enable_hash_only = true
```

---

## 🎯 **Integration with CTAS-7**

### **Hash-Driven Execution**

```rust
use ctas7_interview_generator::*;

// 1. Generate interviews
let generator = NodeInterviewGenerator::new(&schema)?;
let interview = generator.generate(42).await?;

// 2. Compress to hash
let hash = interview.to_hash()?;  // 50 bytes

// 3. Store in Sled
let sled = SledStorage::new("./data/interviews.sled")?;
sled.store(&hash, &interview).await?;

// 4. Later: Retrieve by hash
let retrieved = sled.get(&hash).await?;

// 5. Execute hash-triggered playbook
execute_playbook(&retrieved)?;
```

---

## 🚀 **Roadmap**

- [x] Template-based generation
- [x] Gemini 2M AI integration
- [x] Multi-backend storage
- [x] Compression pipeline
- [ ] Claude Sonnet integration
- [ ] GPT-4 integration
- [ ] Grok integration
- [ ] Real-time streaming generation
- [ ] Incremental updates
- [ ] Version control (Git integration)
- [ ] Diff/merge for interview updates
- [ ] Web UI for interview editing
- [ ] Voice-driven generation (ElevenLabs)

---

## 📚 **References**

- [Node Interview Schema](../NODE_INTERVIEW_SCHEMA_V7.3.1.toml)
- [Crate Interview Schema](../CRATE_INTERVIEW_SCHEMA_V7.3.1.toml)
- [Compression Analysis](../NODE_INTERVIEW_COMPRESSION_ANALYSIS.md)
- [Hash as Spring-Loaded Work Unit](../HASH_AS_SPRING_LOADED_WORK_UNIT.md)
- [Hash-Driven Operational Intelligence](../HASH_DRIVEN_OPERATIONAL_INTELLIGENCE.md)

---

**This is the CTAS-7 way: TOML schemas → Smart Crate → Hash-driven intelligence.** 🔥

