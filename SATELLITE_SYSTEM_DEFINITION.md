# CTAS7 Satellite System - Clean Definition

## 🎯 Goal: Get Out of Hairball Mode

**Problem:** Too many overlapping systems, unclear what's what  
**Solution:** One clear definition, organized views, no more confusion

---

## 📡 THE SATELLITE CONSTELLATION

### **12 MEO Satellites** - HALO Constellation

| Slot | Name    | Altitude | Inclination | Orbital Plane | Status  | Primary Function |
|------|---------|----------|-------------|---------------|---------|------------------|
| 1    | HALO-01 | 29,888km | 55°         | Plane A       | Active  | Global Coverage  |
| 2    | HALO-02 | 29,891km | 55°         | Plane A       | Active  | Global Coverage  |
| 3    | HALO-03 | 29,889km | 55°         | Plane A       | Active  | Global Coverage  |
| 4    | HALO-04 | 29,890km | 55°         | Plane B       | Active  | Global Coverage  |
| 5    | HALO-05 | 29,887km | 55°         | Plane B       | Active  | Global Coverage  |
| 6    | HALO-06 | 29,892km | 55°         | Plane B       | Active  | Global Coverage  |
| 7    | HALO-07 | 29,889km | 55°         | Plane C       | Active  | Global Coverage  |
| 8    | HALO-08 | 29,891km | 55°         | Plane C       | Active  | Global Coverage  |
| 9    | HALO-09 | 29,888km | 55°         | Plane C       | Active  | Global Coverage  |
| 10   | HALO-10 | 29,890km | 55°         | Plane D       | Active  | Global Coverage  |
| 11   | HALO-11 | 29,889km | 55°         | Plane D       | Active  | Global Coverage  |
| 12   | HALO-12 | 29,887km | 55°         | Plane D       | Active  | Global Coverage  |

**Constellation Design:**
- **4 orbital planes** (A, B, C, D)
- **3 satellites per plane**
- **55° inclination** for global coverage
- **~30,000 km altitude** (MEO - Medium Earth Orbit)
- **~12 hour orbital period**

---

## 🌍 GROUND STATION NETWORK

### **259 Ground Stations** - Global Distribution

#### **Tier 1: Primary Stations (87 stations)**
- **Purpose:** High-capacity, always-on, primary uplinks
- **Capacity:** 100+ Gbps each
- **Antennas:** 4-6 per station
- **Features:** Laser optical, QKD capable
- **Color:** Green (#10b981)
- **Locations:** Major hubs (US, EU, Asia, Australia)

#### **Tier 2: Secondary Stations (86 stations)**
- **Purpose:** Regional coverage, backup capacity
- **Capacity:** 50-100 Gbps each
- **Antennas:** 2-4 per station
- **Features:** RF + some optical
- **Color:** Blue (#3b82f6)
- **Locations:** Regional centers worldwide

#### **Tier 3: Backup Stations (86 stations)**
- **Purpose:** Redundancy, emergency backup
- **Capacity:** 10-50 Gbps each
- **Antennas:** 1-2 per station
- **Features:** RF only
- **Color:** Gray (#6b7280)
- **Locations:** Remote/strategic locations

**Total Network Capacity:** ~15 Tbps global

---

## 🔗 NETWORK LINKS

### **Satellite-to-Ground Links (FSO + RF)**
- **Free Space Optical (FSO):** 10-50 Gbps per link
- **Radio Frequency (RF):** 1-10 Gbps per link
- **Active Links:** ~450 simultaneous connections
- **Latency:** 120-150ms (MEO round-trip)
- **Availability:** 99.5% (weather-dependent)

### **Inter-Satellite Links (ISL)**
- **Laser Optical:** 100 Gbps per link
- **Topology:** Mesh within plane, cross-links between planes
- **Active Links:** 24 ISLs (2 per satellite)
- **Latency:** <5ms (satellite-to-satellite)
- **Availability:** 99.9% (space environment)

### **Ground-to-Ground (Fiber)**
- **Fiber Backbone:** 100-400 Gbps per route
- **Purpose:** Station interconnection, data backhaul
- **Latency:** Variable (1-50ms depending on distance)

---

## 📊 DATA STRUCTURE

### **Satellite Entity**
```typescript
interface Satellite {
  // Identity
  id: string;                    // UUID
  name: string;                  // "HALO-01"
  norad_id?: string;            // NORAD catalog number
  
  // Orbital Parameters
  orbital_elements: {
    semi_major_axis_km: number;
    eccentricity: number;
    inclination_deg: number;
    raan_deg: number;            // Right Ascension
    arg_perigee_deg: number;
    true_anomaly_deg: number;
    epoch: Date;
  };
  
  // Constellation
  constellation_slot: number;    // 1-12
  orbital_plane: 'A' | 'B' | 'C' | 'D';
  
  // Status
  status: 'active' | 'standby' | 'maintenance' | 'offline';
  health_score: number;          // 0-100
  
  // Capabilities
  beam_systems: BeamSystem[];
  laser_power_w: number;
  qrng_capable: boolean;
  
  // Current State
  position: {
    latitude: number;
    longitude: number;
    altitude_km: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  
  // Network
  active_ground_links: string[]; // Ground station IDs
  active_isl_links: string[];    // Satellite IDs
  bandwidth_utilization: number; // 0-100%
  
  // Multi-tenant
  org_id: string;                // Tenant ID
  legion_entity_id?: string;     // Legion ECS reference
}
```

### **Ground Station Entity**
```typescript
interface GroundStation {
  // Identity
  id: string;                    // UUID
  station_code: string;          // "GS-001"
  name: string;                  // "Fortaleza Primary"
  
  // Location
  location: {
    latitude: number;
    longitude: number;
    elevation_m: number;
    timezone: string;
    country: string;
    region: string;
  };
  
  // Classification
  tier: 1 | 2 | 3;
  type: 'primary' | 'secondary' | 'backup';
  
  // Status
  status: 'online' | 'offline' | 'maintenance' | 'degraded';
  health_score: number;          // 0-100
  
  // Capabilities
  max_bandwidth_gbps: number;
  antennas: number;
  optical_capable: boolean;
  qkd_capable: boolean;
  
  // Current Metrics
  current_metrics: {
    cpu_percent: number;
    bandwidth_utilization: number;
    active_connections: number;
    average_latency_ms: number;
    signal_quality: number;
  };
  
  // Network
  active_satellite_links: string[]; // Satellite IDs
  uptime_sla: number;            // 0-100%
  
  // Multi-tenant
  org_id: string;                // Tenant ID
  legion_entity_id?: string;     // Legion ECS reference
}
```

### **Network Link Entity**
```typescript
interface NetworkLink {
  // Identity
  id: string;                    // UUID
  
  // Endpoints
  source_id: string;             // Satellite or Station ID
  target_id: string;             // Satellite or Station ID
  link_type: 'sat-to-ground' | 'sat-to-sat' | 'ground-to-ground';
  
  // Performance
  bandwidth_gbps: number;
  latency_ms: number;
  reliability: number;           // 0-1
  quality_score: number;         // 0-100
  
  // Technology
  technology: 'fso' | 'rf' | 'fiber';
  frequency_ghz?: number;        // For RF
  wavelength_nm?: number;        // For FSO
  
  // Status
  status: 'active' | 'congested' | 'degraded' | 'offline';
  encryption: 'qkd' | 'classical' | 'hybrid';
  
  // Multi-tenant
  org_id: string;                // Tenant ID
}
```

---

## 🎨 VISUALIZATION LAYERS

### **Layer 1: Satellites** (Cyan #06b6d4)
- **3D Icons:** Satellite models with solar panels
- **Labels:** Satellite name + slot number
- **Animation:** Real-time orbital motion
- **Interaction:** Click to show details, track camera

### **Layer 2: Ground Stations** (Tiered Colors)
- **Tier 1:** Green (#10b981) - Large icons
- **Tier 2:** Blue (#3b82f6) - Medium icons
- **Tier 3:** Gray (#6b7280) - Small icons
- **Labels:** Station name + status
- **Interaction:** Click to show metrics, filter by tier

### **Layer 3: Orbital Paths** (Light Blue #0ea5e9, 50% opacity)
- **Lines:** Predicted orbital tracks
- **Duration:** Next 2 orbits (~24 hours)
- **Style:** Dashed lines
- **Interaction:** Toggle on/off

### **Layer 4: Satellite-to-Ground Links** (Red-to-Green gradient)
- **Lines:** Laser beams from satellite to station
- **Color:** Based on link quality (red=poor, green=excellent)
- **Animation:** Pulsing glow effect
- **Width:** Based on bandwidth
- **Interaction:** Click to show link metrics

### **Layer 5: Inter-Satellite Links** (Yellow #eab308, 70% opacity)
- **Lines:** Satellite-to-satellite connections
- **Style:** Thicker than ground links
- **Animation:** Data flow animation
- **Interaction:** Toggle on/off

### **Layer 6: Coverage Areas** (Satellite footprints)
- **Circles:** Satellite visibility cones
- **Color:** Cyan with 20% opacity
- **Radius:** ~900km per satellite
- **Interaction:** Toggle on/off

### **Layer 7: Radiation Belts** (Red #dc2626, 30% opacity)
- **Inner Belt:** 1,000-6,000 km altitude
- **Outer Belt:** 13,000-60,000 km altitude
- **Purpose:** Show hazard zones
- **Interaction:** Toggle on/off

### **Layer 8: Orbital Zones** (Purple #8b5cf6, 20% opacity)
- **LEO:** 200-2,000 km (Low Earth Orbit)
- **MEO:** 2,000-35,786 km (Medium Earth Orbit)
- **GEO:** 35,786 km (Geostationary)
- **Purpose:** Show orbital classifications
- **Interaction:** Toggle on/off

---

## 🗂️ VIEW ORGANIZATION

### **View 1: 3D Space World** ✅ WORKING
```
Component: SpaceWorldDemo.tsx
Purpose: Primary 3D visualization
Shows: All layers simultaneously
Controls: World selector, layer toggles, opacity sliders
Status: PRODUCTION READY
```

### **View 2: 2D Flat Map** ✅ WORKING
```
Component: FlatMapView.tsx
Purpose: 2D projection for planning
Shows: Ground stations, satellite ground tracks
Controls: Zoom, pan, layer filters
Status: PRODUCTION READY
```

### **View 3: Satellite Table** 🆕 TO BUILD
```
Component: SatelliteTable.tsx (NEW)
Purpose: List all satellites with metrics
Columns: Name, Slot, Plane, Altitude, Status, Links, Health
Features: Sort, filter, click to track on map
Status: NEEDS IMPLEMENTATION
```

### **View 4: Ground Station Table** 🆕 TO BUILD
```
Component: GroundStationTable.tsx (NEW)
Purpose: List all stations with metrics
Columns: Name, Location, Tier, Status, Load, Links
Features: Sort by tier/status, filter, click to focus
Status: NEEDS IMPLEMENTATION
```

### **View 5: Network Links Matrix** 🆕 TO BUILD
```
Component: NetworkLinksMatrix.tsx (NEW)
Purpose: Show connection topology
Display: Matrix of satellite-to-station links
Features: Color-coded by quality, click to highlight
Status: NEEDS IMPLEMENTATION
```

### **View 6: Beam Dashboard** ✅ WORKING
```
Component: BeamDashboard.tsx
Purpose: Beam pattern analysis
Shows: Beam quality, bandwidth, signal strength
Controls: Beam selection, time range
Status: PRODUCTION READY
```

---

## 🎯 CLEAR SEPARATION OF CONCERNS

### **Data Layer** (Supabase)
- **Tables:** `satellites`, `ground_nodes`, `beams`
- **Purpose:** Store all entity data
- **Access:** Read/write via Supabase client
- **Status:** ✅ WORKING

### **Service Layer** (TypeScript)
- **Files:** `dataLoader.ts`, `orbitalAnimation.ts`, `cesiumWorldManager.ts`
- **Purpose:** Fetch data, calculate positions, manage entities
- **Access:** Called by components
- **Status:** ✅ WORKING

### **Visualization Layer** (Cesium)
- **Component:** `CesiumWorldView.tsx`
- **Purpose:** Render 3D globe and entities
- **Access:** Used by SpaceWorldDemo
- **Status:** ✅ WORKING

### **UI Layer** (React Components)
- **Components:** All the view components
- **Purpose:** User interface and controls
- **Access:** Rendered by App.tsx
- **Status:** ✅ WORKING (3D/2D), 🆕 TO BUILD (Tables)

---

## 📋 IMMEDIATE ACTION PLAN

### **Step 1: Document Current State** (30 min)
- ✅ This document
- 📸 Take screenshots of working views
- 📝 Create user guide

### **Step 2: Build Satellite Table** (1 hour)
```typescript
// src/components/satellite-views/SatelliteTable.tsx
// Simple table, no Cesium, just data display
```

### **Step 3: Build Ground Station Table** (1 hour)
```typescript
// src/components/satellite-views/GroundStationTable.tsx
// Simple table, no Cesium, just data display
```

### **Step 4: Add Tab Navigation** (30 min)
```typescript
// Update App.tsx or create TabNavigation.tsx
// Tabs: [3D View] [2D Map] [Satellites] [Stations] [Network]
```

### **Step 5: Test Everything** (30 min)
- Verify 3D view still works
- Verify 2D map still works
- Verify new tables load data
- Verify navigation works

**Total Time: ~3.5 hours**

---

## 🛡️ PROTECTION RULES

### **DO NOT MODIFY:**
1. ✅ `SpaceWorldDemo.tsx` - Working 3D view
2. ✅ `CesiumWorldView.tsx` - Cesium wrapper
3. ✅ `orbitalAnimation.ts` - Satellite motion
4. ✅ `dataLoader.ts` - Data fetching
5. ✅ Supabase schema - Database structure

### **SAFE TO ADD:**
1. 🆕 New components in `satellite-views/` folder
2. 🆕 New tabs in navigation
3. 🆕 New utility functions
4. 🆕 Documentation

### **SAFE TO ENHANCE:**
1. ⚠️ Styling/CSS (make prettier)
2. ⚠️ Data queries (optimize, don't break)
3. ⚠️ UI controls (add features, keep existing)

---

## ✅ SUCCESS CRITERIA

### **Immediate:**
- ✅ Clear definition of satellite system (this document)
- ✅ No more confusion about what's what
- ✅ Plan to get out of hairball mode

### **Short-term (Today):**
- ✅ Satellite table showing all 12 satellites
- ✅ Ground station table showing all 259 stations
- ✅ Tab navigation to switch views
- ✅ Everything still works

### **Medium-term (This Week):**
- ✅ Network links matrix
- ✅ Performance metrics dashboard
- ✅ Export/import functionality
- ✅ Documentation complete

---

## 🎉 OUT OF HAIRBALL MODE

**Before:** Confused mess of overlapping systems  
**After:** Clear, organized, documented satellite system

**Key Principle:** Build on what works, don't break things, organize clearly

---

*Last updated: October 18, 2025*
*Status: DEFINED AND ORGANIZED*
*Next: Build simple table views*

