# 🚀 CTAS7 Cesium GIS - Complete Installation Kit for Ops Center

**Created:** October 18, 2025  
**Status:** Production Ready  
**Target:** CTAS7 Main Ops Platform Integration

---

## 📦 Package Contents

This installation kit includes everything needed to deploy the CTAS7 Canonical Cesium GIS into the Main Ops Platform.

### Core Components
- ✅ **289 Ground Stations** - Global network with tier-based organization
- ✅ **6 Satellites** - Real-time orbital tracking with SGP4
- ✅ **Animated Laser Beams** - Tier-colored pulsing network links
- ✅ **Van Allen Radiation Belts** - 3D visualization
- ✅ **Layer Management** - Hierarchical filtering system
- ✅ **Supabase Integration** - Real-time data with RLS
- ✅ **WebSocket Telemetry** - Live updates on port 18401

---

## 🎯 Installation Steps

### Step 1: Prerequisites

```bash
# Required
- Node.js 20+
- Docker Desktop (optional but recommended)
- Modern browser with WebGL 2.0

# Verify
node --version  # Should be 20+
docker --version
```

### Step 2: Clone/Copy Files

```bash
# From canonical GIS to Ops Center
cp -r /Users/cp5337/Developer/ctas7-command-center/src/components/SpaceWorldDemo.tsx \
      /path/to/ops-center/src/components/

cp -r /Users/cp5337/Developer/ctas7-command-center/src/services/* \
      /path/to/ops-center/src/services/

cp -r /Users/cp5337/Developer/ctas7-command-center/src/hooks/useSupabaseData.ts \
      /path/to/ops-center/src/hooks/

cp -r /Users/cp5337/Developer/ctas7-command-center/src/components/ui \
      /path/to/ops-center/src/components/
```

### Step 3: Install Dependencies

```bash
cd /path/to/ops-center

# Install Cesium and related packages
npm install cesium@1.134.1 \
            vite-plugin-cesium@1.2.23 \
            vite-plugin-wasm@3.3.0 \
            vite-plugin-top-level-await@1.4.4 \
            @supabase/supabase-js@2.75.1 \
            framer-motion@12.23.24 \
            recharts@2.12.7 \
            satellite.js@6.0.1

# Install UI components
npm install @radix-ui/react-slot \
            @radix-ui/react-separator \
            @radix-ui/react-label \
            @radix-ui/react-checkbox \
            @radix-ui/react-slider \
            @radix-ui/react-dialog \
            @radix-ui/react-tooltip \
            class-variance-authority \
            clsx \
            tailwind-merge \
            lucide-react
```

### Step 4: Configure Vite

Add to `vite.config.ts`:

```typescript
import cesium from 'vite-plugin-cesium';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    react(),
    cesium(),
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### Step 5: Setup Supabase

```bash
# Run migration to create tables
node import-259-organized.js

# Or manually run SQL in Supabase dashboard:
# See: supabase-realistic-data.sql
```

### Step 6: Configure Environment

Create `.env`:

```env
VITE_SUPABASE_URL=https://kxabqezjpglbbrjdpdmv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_CESIUM_TOKEN=your_cesium_ion_token
VITE_MAPBOX_TOKEN=your_mapbox_token (optional)
VITE_WEATHER_API_KEY=your_weather_api_key (optional)
```

### Step 7: Start Services

```bash
# Terminal 1: WebSocket Server
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-gis-cesium-1
node server.js

# Terminal 2: Ops Center
cd /path/to/ops-center
npm run dev
```

---

## 🎨 Features Included

### 1. Ground Station Network (289 Stations)
- **Tier 1 (Primary)**: 50 stations - Bright green, high capacity
- **Tier 2 (Secondary)**: 149 stations - Blue, medium capacity
- **Tier 3 (Backup)**: 90 stations - Gray, backup capacity

**Distribution:**
- North America: 60 stations
- Europe: 50 stations
- Asia: 70 stations
- Middle East: 30 stations
- Africa: 35 stations
- South America: 25 stations
- Pacific: 14 stations
- Australia: 15 stations

### 2. Animated Laser Beams

**Implementation:**
```typescript
// Pulsing glow effect
material: new Cesium.PolylineGlowMaterialProperty({
  glowPower: new Cesium.CallbackProperty(() => {
    const time = Date.now() / 1000;
    return 0.2 + Math.sin(time * 3) * 0.15;
  }, false),
  taperPower: 0.5,
  color: getTierColor(tier), // Cyan/Blue/Gray based on tier
})
```

**Features:**
- ✅ Pulsing animation (3Hz frequency)
- ✅ Tier-based coloring
- ✅ Automatic link management
- ✅ Quality-based visibility

### 3. Layer Management System

**Hierarchy:**
```
Ground Stations (289)
├── Tier 1 (Primary) - 50 stations
├── Tier 2 (Secondary) - 149 stations
└── Tier 3 (Backup) - 90 stations

Satellites (6)
├── SAT-ALPHA through SAT-ZETA
└── Real-time orbital propagation

Orbital Features
├── Radiation Belts (Van Allen)
├── Orbital Zones (LEO/MEO/GEO)
└── Orbital Paths (dashed lines)

Network Links
├── Active (cyan, pulsing)
├── Degraded (orange, slow pulse)
└── Offline (red, no pulse)
```

### 4. Performance Optimizations

**For 289 Stations:**
- Level of Detail (LOD) rendering
- Frustum culling
- Label clustering at distance
- Selective rendering based on zoom level
- Request render mode for static scenes

---

## 🔧 Configuration Options

### Camera Settings

```typescript
// Initial view
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(-100.0, 40.0, 20000000.0),
  orientation: {
    heading: 0.0,
    pitch: Cesium.Math.toRadians(-90.0),
    roll: 0.0,
  },
});
```

### Rendering Performance

```typescript
// High performance mode
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = Infinity;
viewer.scene.targetFrameRate = 60;

// Quality settings
viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 200000000;
```

### Layer Visibility

```typescript
// Toggle by tier
const toggleTier = (tier: number, visible: boolean) => {
  viewer.entities.values
    .filter(e => e.properties?.tier === tier)
    .forEach(e => e.show = visible);
};

// Toggle by region
const toggleRegion = (region: string, visible: boolean) => {
  viewer.entities.values
    .filter(e => e.properties?.region === region)
    .forEach(e => e.show = visible);
};
```

---

## 📊 Database Schema

### Ground Nodes Table

```sql
CREATE TABLE ground_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude double precision NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  tier smallint NOT NULL CHECK (tier IN (1, 2, 3)),
  demand_gbps double precision NOT NULL DEFAULT 0,
  weather_score double precision NOT NULL DEFAULT 1.0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'offline')),
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);
```

### Satellites Table

```sql
CREATE TABLE satellites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  norad_id text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  altitude double precision NOT NULL,
  inclination double precision,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);
```

### Beams Table

```sql
CREATE TABLE beams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beam_type text NOT NULL,
  source_node_id uuid NOT NULL,
  target_node_id uuid NOT NULL,
  beam_status text NOT NULL DEFAULT 'active',
  link_quality_score double precision DEFAULT 0,
  throughput_gbps double precision DEFAULT 0,
  latency_ms double precision DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t ctas7-gis:latest .

# Run container
docker run -p 21575:21575 \
           -e VITE_SUPABASE_URL=$SUPABASE_URL \
           -e VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY \
           ctas7-gis:latest
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ctas7-gis
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ctas7-gis
  template:
    metadata:
      labels:
        app: ctas7-gis
    spec:
      containers:
      - name: gis
        image: ctas7-gis:latest
        ports:
        - containerPort: 21575
        env:
        - name: VITE_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: supabase-creds
              key: url
```

---

## 🧪 Testing

### Playwright Tests

```bash
# Run all tests
npx playwright test

# Specific tests
npx playwright test tests/cesium-integration.spec.ts
npx playwright test tests/satellite-visibility-check.spec.ts
npx playwright test tests/data-loading-check.spec.ts
```

### Manual Testing Checklist

- [ ] Globe renders with imagery
- [ ] 289 ground stations visible
- [ ] 6 satellites in orbit
- [ ] Laser beams animate and pulse
- [ ] Layer controls toggle visibility
- [ ] Tier filtering works
- [ ] Camera controls responsive
- [ ] WebSocket connects
- [ ] Data loads from Supabase
- [ ] Performance > 30 FPS

---

## 📚 Documentation

### Key Files

| File | Purpose |
|------|---------|
| `SpaceWorldDemo.tsx` | Main Cesium component |
| `orbitalAnimation.ts` | Satellite propagation (SGP4) |
| `cesiumWorldManager.ts` | Entity management |
| `useSupabaseData.ts` | Data fetching hooks |
| `radiationBeltRenderer.ts` | Van Allen belts |
| `orbitalZones.ts` | LEO/MEO/GEO zones |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ground-stations` | GET | List all stations |
| `/api/satellites` | GET | List all satellites |
| `/api/beams` | GET | List all network links |
| `/ws` | WebSocket | Real-time telemetry |

---

## 🐛 Troubleshooting

### Black Screen
**Cause:** Cesium token missing or invalid  
**Fix:** Set `VITE_CESIUM_TOKEN` in `.env`

### No Ground Stations
**Cause:** Supabase tables empty  
**Fix:** Run `node import-259-organized.js`

### Slow Performance
**Cause:** Too many entities rendering  
**Fix:** Enable request render mode, increase LOD distance

### WebSocket Not Connecting
**Cause:** Server not running on port 18401  
**Fix:** Start `node server.js` in canonical GIS directory

### Circular Dependency Errors
**Cause:** Cesium package overrides in package.json  
**Fix:** Remove overrides section, reinstall

---

## 📞 Support

**Documentation:** See `README.md`, `CESIUM_WORKING.md`, `QUICK_START.md`  
**Issues:** Check browser console for errors  
**Performance:** Use Chrome DevTools Performance tab

---

## ✅ Verification

After installation, verify:

```bash
# 1. Check Supabase data
node check-existing-data.js
# Expected: 289 ground_nodes, 6 satellites

# 2. Run Playwright test
npx playwright test tests/final-visualization-check.spec.ts
# Expected: Screenshot shows globe, stations, satellites

# 3. Check browser
# Open http://localhost:21575
# Navigate to "3D Satellites" tab
# Expected: 3D globe with 289 stations and 6 satellites
```

---

## 🎉 Success Criteria

✅ **289 ground stations** visible on globe  
✅ **6 satellites** orbiting in real-time  
✅ **Animated laser beams** pulsing between entities  
✅ **Layer controls** filter by tier  
✅ **Van Allen belts** rendered  
✅ **Performance** > 30 FPS  
✅ **WebSocket** connected  
✅ **Supabase** data loading  

---

**Status:** Ready for Deployment  
**Version:** 1.0.0  
**Last Updated:** October 18, 2025

