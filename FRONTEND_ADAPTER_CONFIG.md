# CTAS 6.6 FRONTEND ADAPTER CONFIGURATION

# Configuration to connect any 6.6 frontend to the canonical backend
# PRIMARY WORLD: CTAS (Convergent Threat Analysis System) - "main ops"

## Backend Service Endpoints (DO NOT CHANGE)

```typescript
// CANONICAL BACKEND ENDPOINTS
export const CANONICAL_BACKEND = {
  // Neural Mux Layer (AI Services)
  NEURAL_MUX_GRPC: "http://localhost:50051",
  NEURAL_MUX_WEB: "http://localhost:15001",

  // Database Layer (All Data Operations)
  DATABASE_BRIDGE: "http://localhost:8005", // Coordinates Supabase/Sled/SurrealDB
  SURREALDB: "http://localhost:8000", // Direct SurrealDB access
  SLEDIS_CACHE: "redis://localhost:19014", // Redis-compatible cache
  SLEDIS_HEALTH: "http://localhost:20014", // Health monitoring

  // Foundation Services
  SYNAPTIX_CORE: "http://localhost:8080", // Main API Gateway
  UNICODE_ASSEMBLY: "http://localhost:8001", // OSI Layer 2
  TRIVARIATE_HASH: "http://localhost:8002", // 15,240 MB/sec hashing
  INFERENCE_ENGINE: "http://localhost:8003", // Pattern recognition
  XSD_MANAGER: "http://localhost:8004", // Schema validation
  LEGION_ECS: "http://localhost:8006", // Entity management
  SLOTGRAPH: "http://localhost:8007", // Ground stations

  // Service Discovery
  PORT_MANAGER: "http://localhost:18103", // Authoritative port allocations

  // Orbital Services
  ENHANCED_GEOLOCATION: "http://localhost:18122",
  LASERLIGHT_CONSTELLATION: "http://localhost:18124",

  // Memory Mesh v2.0 RC1
  CONTEXT_MESH: "http://localhost:19011",
  ATOMIC_CLIPBOARD: "http://localhost:19012",
  VOICE_GATEWAY: "http://localhost:19015",
};
```

## Frontend Adaptation Steps

### Step 1: Replace Dev Ports

- ❌ Remove all references to ports 5173, 5174, 3000, etc.
- ✅ Use CANONICAL_BACKEND endpoints above

### Step 2: Database Integration

```typescript
// OLD: Direct database connections
// NEW: Use Database Bridge for all data operations
const dbClient = new DatabaseBridgeClient(CANONICAL_BACKEND.DATABASE_BRIDGE);

// All Supabase, SurrealDB, Sled operations go through the bridge
const data = await dbClient.query("SELECT * FROM table");
```

### Step 3: AI Services Integration

```typescript
// Connect to Neural Mux for all AI operations
const neuralMux = new NeuralMuxClient(CANONICAL_BACKEND.NEURAL_MUX_GRPC);

// Use Atomic Clipboard for cross-system operations
const clipboard = new AtomicClipboardClient(CANONICAL_BACKEND.ATOMIC_CLIPBOARD);
```

### Step 4: Service Discovery

```typescript
// Query Port Manager for dynamic service discovery
const portManager = new PortManagerClient(CANONICAL_BACKEND.PORT_MANAGER);
const services = await portManager.getAllocations();
```

## 6.6 Frontend Checklist

- [ ] Replace all dev ports with canonical backend ports
- [ ] Update database connections to use Database Bridge (8005)
- [ ] Connect to Neural Mux (50051) for AI services
- [ ] Use Sledis (19014) for caching instead of local storage
- [ ] Integrate with Legion ECS (8006) for entity management
- [ ] Connect to SlotGraph (8007) for ground station coordination
- [ ] Use Port Manager (18103) for service discovery

## Benefits

1. **No More Port Confusion**: Single source of truth for all services
2. **Robust Backend**: Cannot be corrupted, properly orchestrated
3. **Scalable**: Real port management and service discovery
4. **Complete Stack**: All databases, AI, and orchestration included
5. **Version Agnostic**: Any frontend (6.6, 7.0, 7.1) can connect

## Migration Command

```bash
# Start the canonical backend
./start-canonical-backend.sh

# Clone a working 6.6 frontend
git clone <6.6-repo> ctas-6.6-connected

# Update configuration files
# Replace all port references with CANONICAL_BACKEND endpoints
# Test connection to Neural Mux and Database Bridge
```
