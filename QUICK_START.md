# CTAS7 Command Center - Quick Start with Cesium

**Get running in 3 steps!**

---

## Step 1: Install Dependencies

```bash
cd /Users/cp5337/Developer/ctas7-command-center
rm -rf node_modules package-lock.json
npm install
```

⏱️ **Time:** 2-3 minutes  
⚠️ **Important:** Clean install required for Cesium package overrides

---

## Step 2: Start WebSocket Server (Terminal 1)

```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-gis-cesium-1
node server.js
```

✅ **Expected output:**
```
WebSocket server starting on ws://localhost:18401/stream (CTAS7 Port)
WebSocket server ready at ws://localhost:18401/stream (CTAS7 Port)
```

---

## Step 3: Start Command Center (Terminal 2)

```bash
cd /Users/cp5337/Developer/ctas7-command-center
npm run dev
```

✅ **Expected output:**
```
VITE v7.1.5  ready in XXX ms

➜  Local:   http://localhost:21575/
➜  Network: use --host to expose
```

---

## Access

Open in browser: **http://localhost:21575/**

Navigate to the GIS viewer to see the Cesium 3D globe!

---

## What You Should See

✅ **Cesium 3D Globe** - Blue earth with atmosphere  
✅ **Left Panel** - World selection (Production, Staging, Sandbox, Fusion)  
✅ **Right Panel** - Layer controls with opacity sliders  
✅ **Ground Stations** - 259 stations plotted on globe  
✅ **Satellites** - Real-time orbital tracking  
✅ **Network Links** - Connections between stations  

---

## Troubleshooting

### Black Screen?

**Check:**
1. Browser console for errors
2. Cesium token in `.env` file
3. WebGL support: https://get.webgl.org/

**Fix:**
```bash
# Create .env file
echo "VITE_CESIUM_TOKEN=your-token-here" > .env
```

Get token: https://ion.cesium.com/

### WebSocket Not Connecting?

**Check:** Terminal 1 - Is `node server.js` running?

**Fix:** Restart WebSocket server

### Component Errors?

**Check:** Did `npm install` complete successfully?

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Ports Used

| Service | Port | Purpose |
|---------|------|---------|
| Command Center | 21575 | Frontend (Vite) |
| GIS WebSocket | 18401 | Real-time telemetry |
| GIS Backend | 18400 | REST API (optional) |

---

## Next Steps

1. ✅ Verify Cesium loads
2. ✅ Test layer controls
3. ✅ Check WebSocket connection
4. 📋 Explore multi-world system
5. 📋 Test time controls

---

## Documentation

- `CESIUM_INTEGRATION_SUMMARY.md` - Full integration details
- `smart-crate.toml` - Smart crate configuration
- Canonical GIS: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-gis-cesium-1/README.md`

---

**Status:** ✅ Ready to Run  
**Integration:** ✅ Complete  
**Smart Crate:** ✅ Certified

