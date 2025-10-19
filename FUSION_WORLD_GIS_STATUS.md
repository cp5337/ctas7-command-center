# Fusion World GIS - Multi-Tenant Architecture Status

## Current Architecture Analysis

### ✅ What's Already Implemented

#### 1. **Multi-World System** (Command Center)
```typescript
// src/components/SpaceWorldDemo.tsx
const worlds = ['production', 'staging', 'sandbox', 'fusion'];
```
- ✅ World selection dropdown
- ✅ Independent entity collections per world
- ✅ Camera position persistence
- ✅ Layer visibility per world
- ✅ Color-coded entities

#### 2. **Layer System** (Command Center)
```typescript
const [layers, setLayers] = useState<LayerConfig[]>([
  { id: 'groundStations', label: 'Ground Stations (289)', visible: true, color: '#10b981', opacity: 1,
    children: [
      { id: 'groundStations-tier1', label: 'Tier 1 (Primary)', visible: true, color: '#10b981', opacity: 1 },
      { id: 'groundStations-tier2', label: 'Tier 2 (Secondary)', visible: true, color: '#3b82f6', opacity: 1 },
      { id: 'groundStations-tier3', label: 'Tier 3 (Backup)', visible: true, color: '#6b7280', opacity: 1 },
    ],
  },
  { id: 'satellites', label: 'Satellites', visible: true, color: '#06b6d4', opacity: 1 },
  { id: 'orbits', label: 'Orbital Paths', visible: true, color: '#0ea5e9', opacity: 0.5 },
  { id: 'radiationBelts', label: 'Radiation Belts', visible: true, color: '#dc2626', opacity: 0.3 },
  { id: 'orbitalZones', label: 'Orbital Zones', visible: true, color: '#8b5cf6', opacity: 0.2 },
]);
```
- ✅ Hierarchical layer structure
- ✅ Visibility toggles
- ✅ Opacity controls
- ✅ Color coding
- ✅ Tier-based filtering

#### 3. **Supabase Multi-Tenant** (Partial)
```sql
-- fix-rls-policies.sql shows RLS is enabled
ALTER TABLE ground_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE beams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON ground_nodes FOR SELECT USING (true);
```
- ✅ Row Level Security (RLS) enabled
- ⚠️ Currently set to public read (needs tenant_id filtering)
- ❌ No tenant_id column in tables yet

---

## 🎯 What's Missing for Full Fusion World

### 1. **Tenant Isolation in Database**

**Current State:**
```sql
-- Tables without tenant_id
CREATE TABLE ground_nodes (
  id UUID PRIMARY KEY,
  name TEXT,
  latitude FLOAT,
  longitude FLOAT,
  -- Missing: tenant_id UUID
);
```

**Needed:**
```sql
-- Add tenant_id to all tables
ALTER TABLE ground_nodes ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE satellites ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE beams ADD COLUMN tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'command_center', 'main_ops', 'fusion'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tenants
INSERT INTO tenants (id, name, type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Command Center', 'command_center'),
  ('22222222-2222-2222-2222-222222222222', 'Main Ops', 'main_ops'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Fusion World', 'fusion');

-- Update RLS policies
CREATE POLICY "Tenant isolation" ON ground_nodes
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant')::UUID OR tenant_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff');
```

### 2. **Fusion Layer Visualization**

**Current State:**
- ✅ Single world view at a time
- ❌ No fusion mode that shows ALL tenants simultaneously

**Needed:**
```typescript
// src/components/FusionWorldView.tsx
interface FusionWorldConfig {
  tenants: {
    commandCenter: {
      color: '#10b981',  // Green
      entities: Entity[],
      visible: true
    },
    mainOps: {
      color: '#3b82f6',  // Blue
      entities: Entity[],
      visible: true
    },
    fusion: {
      color: '#8b5cf6',  // Purple
      entities: Entity[],
      visible: true
    }
  },
  correlationEngine: CorrelationEngine,
  threatAggregator: ThreatAggregator
}
```

### 3. **Legion Slot Graph Integration**

**Current State:**
- ✅ HFT Slot Graph in Main Ops (port 15173)
- ✅ SurrealDB schema defined
- ❌ Not connected to Command Center GIS
- ❌ No cross-tenant queries

**Needed:**
```typescript
// src/services/LegionFusionBridge.ts
export class LegionFusionBridge {
  private supabase: SupabaseClient;
  private surrealdb: Surreal;
  
  async queryFusionWorld(tenantIds: string[]): Promise<FusionWorldData> {
    // Query Supabase for each tenant
    const commandCenterData = await this.supabase
      .from('ground_nodes')
      .select('*')
      .eq('tenant_id', '11111111-1111-1111-1111-111111111111');
    
    const mainOpsData = await this.supabase
      .from('ground_nodes')
      .select('*')
      .eq('tenant_id', '22222222-2222-2222-2222-222222222222');
    
    // Query SurrealDB for slot graph
    const slotGraphData = await this.surrealdb.query(`
      SELECT * FROM ground_station WHERE tenant IN $tenants
    `, { tenants: tenantIds });
    
    // Merge and correlate
    return this.correlateData(commandCenterData, mainOpsData, slotGraphData);
  }
}
```

---

## 📊 Current vs. Target Architecture

### **Current: Single-Tenant per View**
```
Command Center (21575)          Main Ops (15173)
        ↓                              ↓
   Supabase                       Supabase
        ↓                              ↓
   259 stations                   257 stations
        ↓                              ↓
   Cesium View                    HFT Dashboard
```

### **Target: Multi-Tenant Fusion**
```
                    Fusion World Layer
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                   ↓
 Command Center      Main Ops           Legion Slot Graph
   (Tenant 1)        (Tenant 2)          (Universal Layer)
        ↓                  ↓                   ↓
   Supabase          Supabase             SurrealDB
        ↓                  ↓                   ↓
   259 stations      257 stations         Graph Queries
        ↓                  ↓                   ↓
        └──────────────────┴───────────────────┘
                           ↓
                    Cesium Fusion View
                  (All tenants visible,
                   color-coded by tenant)
```

---

## 🔧 Implementation Plan

### Phase 1: Database Multi-Tenancy (30 min)
1. Add `tenant_id` to all tables
2. Create `tenants` table
3. Update RLS policies
4. Seed tenant data

### Phase 2: Fusion Layer Service (45 min)
1. Create `LegionFusionBridge.ts`
2. Implement cross-tenant queries
3. Add correlation engine
4. Connect to SurrealDB slot graph

### Phase 3: Fusion World UI (60 min)
1. Create `FusionWorldView.tsx` component
2. Add tenant color coding
3. Implement layer blending
4. Add tenant filtering controls

### Phase 4: Integration (30 min)
1. Add fusion mode to world selector
2. Connect Command Center and Main Ops
3. Test cross-tenant visualization
4. Performance optimization

**Total Time: ~2.5 hours**

---

## ✅ Recommendations

### For Command Center (Keep Safe, Don't Break)
- ✅ **Current GIS is PRODUCTION READY** - Don't touch it
- ✅ Keep running on port 21575
- ✅ Add tenant_id to database (non-breaking change)
- ✅ Add fusion mode as NEW feature (doesn't affect existing)

### For Main Ops (Needs Work)
- ❌ Cesium not loading - needs integration
- ❌ Supabase queries failing - needs fixing
- ✅ HFT Dashboard structure ready
- ✅ Can receive fusion layer data

### For Fusion World (New Feature)
- 🆕 Create as separate view/mode
- 🆕 Query both tenants simultaneously
- 🆕 Color-code by tenant
- 🆕 Add correlation engine
- 🆕 Connect to Legion Slot Graph

---

## 🎯 Next Steps

1. **Add tenant_id to database** (non-breaking, safe)
2. **Create Fusion World service** (new code, doesn't affect existing)
3. **Add fusion mode to Command Center** (optional feature toggle)
4. **Test with both tenants** (Command Center + Main Ops)
5. **Connect to Legion Slot Graph** (SurrealDB integration)

**Status: Ready to implement without breaking existing GIS** ✅

---

*Last updated: October 18, 2025*
*Command Center GIS: FULLY OPERATIONAL*
*Main Ops GIS: NEEDS INTEGRATION*
*Fusion World: READY TO BUILD*

