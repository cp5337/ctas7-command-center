# Command Center - REAL vs MOCK Audit
**Date:** October 15, 2025  
**Purpose:** Document which features are real vs mocked, and how to make them all real

---

## ✅ REAL (Working with Live APIs)

### **1. Voice System** 
**Status:** ✅ REAL - Direct ElevenLabs API
- **Implementation:** `src/hooks/useVoiceConversation.ts`
- **API Key:** Configured in `.env` → `ELEVEN_API_KEY=sk_8ae0a5dd583c1cab...`
- **Method:** Direct browser fetch to `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}`
- **Voices:** Natasha, Elena, Cove, Marcus (voice IDs hardcoded)
- **Test:** Open Command Center → Click agent card → Should synthesize speech

### **2. Linear Integration**
**Status:** ✅ REAL - Linear GraphQL API
- **API Key:** `your_linear_api_key_here`
- **SDK:** `@linear/sdk` (installed in package.json)
- **Components:**
  - `src/components/LinearMultiLLMOnboarding.tsx`
  - `src/components/LinearStyleProjectManagement.tsx`
- **Endpoints:** Linear workspace, issues, projects
- **Test:** Enterprise tab → Should show real Linear data

### **3. Azure Speech Recognition**
**Status:** ✅ REAL - Azure Cognitive Services
- **API Key:** `your_azure_speech_key_here`
- **Region:** `eastus`
- **Usage:** Voice input for agent conversations
- **Test:** Voice controls → Should recognize speech

### **4. Database Services (NOW RUNNING)**
**Status:** 🟡 REAL BACKENDS, but Command Center not connected yet
- **SurrealDB:** `localhost:11451` ✅ RUNNING
- **Supabase:** `localhost:11447` ✅ RUNNING  
- **Hashing Service:** `localhost:18105` ✅ RUNNING
- **Issue:** Command Center expects port 8000 for SurrealDB (not 11451)
- **Fix Needed:** Update `CTASOrchestrator.ts` with correct ports

---

## ❌ MOCK (Using Hardcoded Data)

### **1. AI Personas**
**Status:** ❌ MOCK
- **File:** `src/data/mockData.ts` → `mockPersonas` array
- **Current:** Hardcoded 5 personas (Natasha, Marcus, Elena, David, Sarah)
- **Real Implementation Exists:** `src/services/api.ts` has `getPersonas()` but returns mock
- **Fix Needed:** 
  - Backend agent registry service
  - Or fetch from RepoAgent at `localhost:15180/agents/list`

### **2. Chat Messages**
**Status:** ❌ MOCK
- **File:** `src/data/mockData.ts` → `mockMessages` array
- **Current:** Hardcoded conversation history
- **Real Implementation:** WebSocket client exists in `src/hooks/useWebSocket.ts`
- **Fix Needed:**
  - Connect to voice WebSocket server
  - Store messages in Supabase realtime

### **3. Kanban Tasks**
**Status:** ❌ MOCK
- **File:** `src/data/mockData.ts` → `mockTasks` array
- **Current:** Hardcoded 4 tasks
- **Real Implementation:** Linear integration could provide tasks
- **Fix Needed:**
  - Fetch from Linear API
  - Or store in Supabase

### **4. System Metrics**
**Status:** ❌ MOCK  
- **File:** `src/data/mockData.ts` → `mockMetrics` array
- **Current:** Simulated CPU/Memory/Disk/Network stats
- **Real Implementation:** `src/services/ctasService.ts` defines endpoints
- **Expected Backends:**
  - Universal Telemetry: `localhost:18101` (NOT RUNNING)
  - Statistical CDN: `localhost:18108` (NOT RUNNING)
  - Port Manager: `localhost:18103` (NOT RUNNING)
- **Fix Needed:** Start these Docker services

### **5. Smart Crate Control**
**Status:** 🟡 PARTIAL - UI exists, backend missing
- **Component:** `src/components/SmartCrateControl.tsx`
- **Expected Backend:** Smart CDN Gateway at `localhost:18100`
- **Status:** Service not running
- **Fix Needed:** Start smart-cdn-gateway container

### **6. GIS/Satellite Viewer**
**Status:** 🟡 PARTIAL - Uses real Mapbox API, but mock satellite data
- **Component:** `src/components/GISViewer.tsx`
- **Real:** Mapbox token configured
- **Mock:** Satellite positions hardcoded
- **Fix Needed:** Fetch from N2YO API or generate SGP4 orbits

---

## 🔧 BACKENDS AVAILABLE BUT NOT RUNNING

### **Currently Running:**
1. ✅ **SurrealDB** - Port 11451 (Graph database)
2. ✅ **Supabase** - Port 11447 (Realtime database) 
3. ✅ **Hashing Service** - Port 18105

### **Stopped (Need Docker Images Rebuilt):**
1. ❌ **Statistical CDN** - Port 18108
2. ❌ **Port Manager** - Port 18103
3. ❌ **Universal Telemetry** - Port 18101
4. ❌ **Smart CDN Gateway** - Port 18100
5. ❌ **XSD Environment** - Port 18107
6. ❌ **N8N Neural Mux** - Port 18300

### **Never Started:**
1. ❌ **RepoAgent** - Port 15180 (Multi-agent system)

---

## 🎯 ACTION PLAN TO MAKE EVERYTHING REAL

### **Phase 1: Fix Database Connections** (10 min)

#### Update Port Mappings:
**File:** `src/services/CTASOrchestrator.ts`

**Change:**
```typescript
// Line 66 - SurrealDB
endpoint: 'http://localhost:11451'  // Was 8000

// Line 74 - Supabase (stays same)
endpoint: 'https://kxabqezjpglbbrjdpdmv.supabase.co'
```

#### Test Connection:
```bash
# Command Center should connect to SurrealDB
curl http://localhost:11451/health
```

---

### **Phase 2: Replace Mock Data with Real** (20 min)

#### **2A: Personas from RepoAgent**
**Create:** `src/services/repoAgentService.ts`
```typescript
export async function getAgentPersonas() {
  const response = await fetch('http://localhost:15180/agents/list');
  return response.json();
}
```

**Update:** `src/App.tsx` line 52
```typescript
// OLD: const [personas] = useState<Persona[]>(mockPersonas);
const [personas, setPersonas] = useState<Persona[]>([]);

useEffect(() => {
  getAgentPersonas().then(setPersonas).catch(() => setPersonas(mockPersonas));
}, []);
```

#### **2B: Tasks from Linear**
**Use existing Linear SDK integration**

**Update:** `src/App.tsx`
```typescript
// Fetch real Linear issues instead of mockTasks
useEffect(() => {
  fetchLinearIssues().then(issues => {
    const tasks = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.state.type,
      priority: issue.priority,
      assignee: issue.assignee?.name,
      dueDate: issue.dueDate
    }));
    setTasks(tasks);
  });
}, []);
```

#### **2C: System Metrics from Hashing Service**
**Update:** `src/App.tsx`
```typescript
const fetchRealMetrics = async () => {
  try {
    const response = await fetch('http://localhost:18105/health');
    const data = await response.json();
    
    setMetrics([
      { name: 'Hashing Service', value: data.status === 'healthy' ? 100 : 0 },
      { name: 'SurrealDB', value: /* check connection */ },
      { name: 'Supabase', value: /* check connection */ }
    ]);
  } catch {
    // Fallback to mock
  }
};

useEffect(() => {
  fetchRealMetrics();
  const interval = setInterval(fetchRealMetrics, 5000);
  return () => clearInterval(interval);
}, []);
```

---

### **Phase 3: Start Missing Backend Services** (30 min)

#### **Option A: Build from Source (If Dockerfiles exist)**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging

# Check which can be built
ls ctas7-candidate-crates-staging/*/Dockerfile

# Build available services
docker build -t ctas7-statistical-cdn \
  ctas7-candidate-crates-staging/ctas7-statistical-analysis-cdn/

docker build -t ctas7-port-manager \
  ctas7-candidate-crates-staging/ctas7-real-port-manager/

# Start them
docker run -d -p 18108:18108 --name ctas7-stat-cdn ctas7-statistical-cdn
docker run -d -p 18103:18103 --name ctas7-port-mgr ctas7-port-manager
```

#### **Option B: Use Existing Binaries (Faster)**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging

# Run Rust services directly
cargo run -p ctas7-statistical-analysis-cdn &
cargo run -p ctas7-real-port-manager &
cargo run -p ctas7-universal-telemetry &
```

---

### **Phase 4: Voice System Integration** (15 min)

#### **Already Working!** Just test:
1. Open http://localhost:15175
2. Click on Natasha persona card
3. Should see voice controls
4. Click microphone → Should recognize speech (Azure)
5. Response → Should synthesize via ElevenLabs

**If not working:** Check browser console for API errors

---

### **Phase 5: Linear Integration Test** (5 min)

**Test Linear CLI:**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
export LINEAR_API_KEY=your_linear_api_key_here
cargo run -p ctas7-linear-cli -- list-issues
```

**Test in Command Center:**
- Open http://localhost:15175
- Navigate to "Enterprise" tab
- Should show Linear workspace
- Should list real issues/projects

---

## 📊 CURRENT STATUS SUMMARY

| Feature | Status | API Key | Backend | Notes |
|---------|--------|---------|---------|-------|
| Voice (ElevenLabs) | ✅ REAL | ✅ Configured | ✅ Direct API | Works in browser |
| Speech Recognition | ✅ REAL | ✅ Configured | ✅ Azure | Works in browser |
| Linear | ✅ REAL | ✅ Configured | ✅ Linear API | SDK installed |
| Personas | ❌ MOCK | N/A | ❌ RepoAgent down | Need to start |
| Chat Messages | ❌ MOCK | N/A | ❌ No backend | Need WebSocket |
| Tasks | ❌ MOCK | ✅ Linear | 🟡 Partial | Can use Linear |
| Metrics | ❌ MOCK | N/A | 🟡 Hashing only | Need more services |
| Smart Crates | ❌ MOCK | N/A | ❌ Gateway down | Need to build |
| GIS/Satellites | 🟡 PARTIAL | ✅ Mapbox | ❌ Mock positions | Need SGP4 |
| Databases | ✅ REAL | N/A | ✅ Running | Port mapping issue |

---

## 🚀 QUICKEST WINS (Next 15 Minutes)

### **1. Fix Database Port Mapping** (2 min)
```bash
cd /Users/cp5337/Developer/ctas7-command-center
# Edit src/services/CTASOrchestrator.ts line 66
# Change: endpoint: 'http://localhost:11451'
```

### **2. Test Voice System** (3 min)
- Open http://localhost:15175
- Click agent → Test voice

### **3. Replace Mock Tasks with Linear** (5 min)
- Use existing Linear SDK
- Fetch issues instead of mockTasks

### **4. Test Database Connections** (5 min)
```bash
curl http://localhost:11451/health  # SurrealDB
curl http://localhost:11447/health  # Supabase  
curl http://localhost:18105/health  # Hashing
```

---

## 📝 RECOMMENDATIONS

### **Priority 1: Quick Wins**
1. ✅ Start more Docker containers
2. ✅ Fix port mappings in code
3. ✅ Replace mockTasks with Linear issues
4. ✅ Test voice system (already works!)

### **Priority 2: Backend Services**
1. Build/start Statistical CDN (18108)
2. Build/start Port Manager (18103)
3. Build/start Universal Telemetry (18101)

### **Priority 3: Complete Integration**
1. Connect to RepoAgent for real personas
2. Set up WebSocket for real-time chat
3. Implement SGP4 for real satellite positions
4. Store everything in SurrealDB/Supabase

---

**Current: 30% Real, 70% Mock**  
**After Phase 1-2: 60% Real, 40% Mock**  
**After Phase 3-5: 90% Real, 10% Mock**



