# Voice Command Center Integration Plan
## DevSecOps-First Voice Operations

**Date:** November 3, 2025  
**Priority:** Command Center → Main Ops → Python/ABE  
**Approach:** Containerize First, Voice Second

---

## **PHASE 1: CONTAINERIZE CORE SYSTEMS** 🐳

### **1.1 Backend Services (PRIORITY 1)**
```bash
# Start canonical backend first
cd /Users/cp5337/Developer/ctas7-command-center
./start-canonical-backend-docker.sh

# Verify all services running:
# - Real Port Manager (15170)
# - Synaptix Core (15171) 
# - Neural Mux (15172)
# - Sledis (15173)
# - Foundation Data (15174)
```

### **1.2 Main Ops Platform (PRIORITY 2)**
```bash
# Get main ops running
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform
npm install && npm run dev
# Target: Port 15173 (verified working)
```

### **1.3 Command Center Container (PRIORITY 3)**
```dockerfile
# /Users/cp5337/Developer/ctas7-command-center/Dockerfile.command-center
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### **1.4 Agent Containerization (PRIORITY 4)**
```yaml
# docker-compose.agents.yml
version: '3.8'

services:
  agent-natasha:
    build: ./agents/natasha
    ports:
      - "15180:8080"
    environment:
      - AGENT_TYPE=red_team
      - NEURAL_MUX_URL=http://neural-mux:15172
    
  agent-forge:
    build: ./agents/forge
    ports:
      - "15181:8080"
    environment:
      - AGENT_TYPE=workflow
      - NEURAL_MUX_URL=http://neural-mux:15172
```

---

## **PHASE 2: VOICE INTEGRATION (COMMAND CENTER)** 🎤

### **2.1 Voice System Architecture**
```
Voice Command → Command Center → Forge Workflows → Backend Services
    ↓              ↓                ↓                    ↓
ElevenLabs → React Frontend → Rust Orchestrator → Canonical Backend
```

### **2.2 Command Center Voice Routes**
```typescript
// src/voice/CommandCenterVoiceRouter.ts
export class CommandCenterVoiceRouter {
  async handleDevOpsCommand(command: string): Promise<VoiceResponse> {
    switch (command.toLowerCase()) {
      case 'start development environment':
        return this.startDevEnvironment();
      
      case 'run full validation suite':
        return this.runValidationSuite();
      
      case 'bootstrap validation':
        return this.runBootstrapValidation();
      
      case 'check inventory':
        return this.runInventoryCheck();
      
      case 'merge reports':
        return this.mergeReports();
      
      default:
        return { status: 'unknown', message: 'Command not recognized' };
    }
  }

  private async startDevEnvironment(): Promise<VoiceResponse> {
    try {
      // Start backend services
      await this.executeTask('shell: CTAS7: Bootstrap Validation');
      
      // Verify services
      const services = await this.checkServices();
      
      return {
        status: 'success',
        message: `Development environment started. ${services.length} services running.`,
        data: services
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to start environment: ${error.message}`
      };
    }
  }
}
```

### **2.3 Voice-Enabled VS Code Tasks**
```json
// .vscode/tasks.json (enhanced)
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "CTAS7: Voice Bootstrap",
      "type": "shell",
      "command": "npm run bootstrap && echo 'Bootstrap complete - Voice confirmation ready'",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "CTAS7: Voice Inventory", 
      "type": "shell",
      "command": "npm run inventory && echo 'Inventory complete - Ready for voice feedback'",
      "group": "test"
    }
  ]
}
```

---

## **PHASE 3: FORGE WORKFLOW INTEGRATION** ⚡

### **3.1 DevSecOps Workflow Nodes**
```rust
// Command Center specific workflows
pub enum DevSecOpsWorkflowType {
    BootstrapValidation {
        target_env: String,
        validation_level: ValidationLevel,
    },
    InventoryCheck {
        scan_depth: ScanDepth,
        include_dependencies: bool,
    },
    LayerTesting {
        layer: InfrastructureLayer,
        test_suite: TestSuite,
    },
    ReportGeneration {
        report_type: ReportType,
        output_format: OutputFormat,
    },
}

pub enum ValidationLevel {
    Quick,     // 30 seconds
    Standard,  // 2-3 minutes
    Full,      // 5-10 minutes
}
```

### **3.2 Voice → Task Integration**
```rust
impl DevSecOpsOrchestrator {
    pub async fn handle_voice_devsecops(&self, command: VoiceCommand) -> Result<WorkflowInstance> {
        let workflow_type = match command.intent.as_str() {
            "bootstrap_validation" => DevSecOpsWorkflowType::BootstrapValidation {
                target_env: "development".to_string(),
                validation_level: ValidationLevel::Standard,
            },
            "inventory_check" => DevSecOpsWorkflowType::InventoryCheck {
                scan_depth: ScanDepth::Standard,
                include_dependencies: true,
            },
            "layer2_fabric_tests" => DevSecOpsWorkflowType::LayerTesting {
                layer: InfrastructureLayer::Fabric,
                test_suite: TestSuite::Layer2,
            },
            _ => return Err(WorkflowError::UnknownDevSecOpsIntent),
        };
        
        self.create_devsecops_workflow(workflow_type, command.metadata).await
    }
}
```

---

## **PHASE 4: ABE ARCHIVE OPERATIONS** 📚

### **4.1 Let ABE Run Archive Before Python Changes**
```bash
# ABE archive operations (current state, no changes)
# Let ABE complete current archival tasks:
# - Document processing
# - Entity extraction 
# - USIM lifecycle management
# - Storage tier assignments

# DO NOT MODIFY:
# - Python intelligence systems
# - Nyx-Trace rebuild  
# - Anaconda environment
# - Jupyter notebooks
```

### **4.2 ABE → Command Center Integration Points**
```typescript
// Future integration (after ABE archive complete)
interface ABEArchiveStatus {
  documentsProcessed: number;
  entitiesExtracted: number;
  usimEntriesCreated: number;
  storageReduction: number; // percentage
}

// Voice query: "What's the archive status?"
export async function getABEArchiveStatus(): Promise<ABEArchiveStatus> {
  // Query ABE systems for current archival progress
  // Return status for voice feedback
}
```

---

## **IMPLEMENTATION PRIORITY ORDER**

### **Week 1: Foundation** 
1. ✅ Verify canonical backend running (`docker-compose.canonical-backend.yml`)
2. ✅ Get main ops platform stable (port 15173)
3. 🔄 Containerize command center
4. 🔄 Basic agent containerization

### **Week 2: Voice Core**
1. Implement `CommandCenterVoiceRouter`
2. Add voice triggers to existing VS Code tasks
3. Test voice → task execution flow
4. Integrate with Forge workflow system

### **Week 3: DevSecOps Voice Workflows**
1. Build DevSecOps workflow nodes in Forge
2. Voice commands for bootstrap, inventory, layer2 tests
3. Real-time voice feedback during task execution
4. Linear issue creation from voice commands

### **Week 4: ABE Integration**
1. Let ABE complete current archive operations
2. Add ABE status queries to voice system
3. Plan Nyx-Trace Anaconda rebuild (future phase)
4. Document Python integration strategy

---

## **VOICE COMMAND EXAMPLES (COMMAND CENTER)**

```
Developer: "Start development environment"
System: "Starting canonical backend services... Bootstrap validation running... Development environment ready. 5 services online."

Developer: "Run inventory check"  
System: "Scanning project structure... Found 247 TypeScript files, 89 Rust crates, 15 Docker services. Inventory complete."

Developer: "Check layer2 fabric tests"
System: "Running Layer2 fabric test suite... 12 tests passed, 1 warning. Layer2 fabric operational."

Developer: "Generate validation report"
System: "Compiling validation data... Report generated: validation-2025-11-03.json. Would you like me to create a Linear issue?"
```

---

## **CONTAINER ORCHESTRATION STRATEGY**

```yaml
# docker-compose.full-stack.yml
version: '3.8'

services:
  # Phase 1: Backend (Already working)
  canonical-backend:
    extends:
      file: docker-compose.canonical-backend.yml
      service: canonical-backend

  # Phase 1: Main Ops (Already working) 
  main-ops:
    build: ../ctas-7-shipyard-staging/ctas-7.0-main-ops-platform
    ports:
      - "15173:5173"
    depends_on:
      - canonical-backend

  # Phase 1: Command Center (New)
  command-center:
    build: 
      context: .
      dockerfile: Dockerfile.command-center
    ports:
      - "5173:5173"
    depends_on:
      - canonical-backend
    environment:
      - VITE_BACKEND_URL=http://canonical-backend:15170

  # Phase 1: Forge Orchestrator (New)
  forge-orchestrator:
    build: ./forge
    ports:
      - "15182:8080"
    depends_on:
      - canonical-backend
    environment:
      - NEURAL_MUX_URL=http://canonical-backend:15172
      - VOICE_ENABLED=true
```

---

**Next Action:** Start with Phase 1 containerization, then add voice capabilities to command center for DevSecOps workflows. ABE continues archive operations without disruption.
