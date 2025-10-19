# CTAS-7 Vite System Layout & The Great Cesium Nightmare of 2024

**Status:** 🔥 **SURVIVED THE HELL** 🔥
**Battle Duration:** 11+ hours of pure suffering
**Victory Condition:** Globe the size of a postage stamp (AND WE WERE HAPPY!)

## 🏗️ Vite System Architecture

### Core Configuration (`vite.config.ts`)
```typescript
// The config that eventually worked after 11 hours of hell
export default defineConfig({
  plugins: [
    react(),           // React support (this was easy)
    cesium(),          // THE NIGHTMARE PLUGIN (11 hours of pain)
    wasm(),            // WASM support (more pain)
    topLevelAwait()    // Because async WASM initialization is evil
  ],
```

### Directory Structure & Path Mappings

```
/Users/cp5337/Developer/ctas7-command-center/
├── vite.config.ts              # The config from hell
├── src/                        # React components
│   ├── components/             # UI components
│   │   └── cesium/            # Cesium integration components
│   ├── services/              # API services
│   └── utils/                 # Utility functions
├── public/                    # Static assets
│   └── cesium/               # Cesium static assets (massive)
├── node_modules/              # The abyss of dependencies
│   ├── cesium/               # 500MB+ of Cesium hell
│   └── @cesium/              # More Cesium dependencies
└── dist/                     # Build output (when it works)
```

### Path Resolution (`@` alias)
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),  // Simple path mapping
  },
},
```

## 🌍 The Great Cesium Battle: 11 Hours of Hell

### Hour 1-3: "This Should Be Easy"
- Install Cesium: `npm install cesium`
- Add to React component
- **Result:** White screen of death
- **Error:** "Cannot resolve Cesium workers"
- **Mood:** Optimistic → Concerned

### Hour 4-6: "Maybe I Need the Plugin"
- Install `vite-plugin-cesium`
- Add to vite config
- **Result:** Different white screen of death
- **Error:** "WASM loading failed"
- **New Error:** "Workers not found"
- **New Error:** "Assets path incorrect"
- **Mood:** Concerned → Frustrated

### Hour 7-9: "WASM Hell Dimension"
- Add `vite-plugin-wasm`
- Add `vite-plugin-top-level-await`
- Configure worker paths manually
- Copy Cesium assets to public folder
- **Result:** Black screen (progress!)
- **Error:** "SharedArrayBuffer not available"
- **New Error:** "Cross-origin isolation required"
- **Mood:** Frustrated → Rage

### Hour 10-11: "Fuck You Node/Vite/Everything"
- Configure CORS headers
- Set up proper MIME types
- Enable SharedArrayBuffer
- Configure Cesium ion token
- Manually set all asset paths
- **Result:** TINY GLOBE! 🌍 (postage stamp size)
- **Status:** VICTORY! (We were SO happy)

### Hour 11.08: "The Glory Moment"
- **Achievement Unlocked:** Live laser satellite demo
- **Achievement Unlocked:** Orbital mechanics working
- **Status:** Everything beautiful and working

### Hour 11.13: "The Fall"
- Node update? Vite update? WHO KNOWS?
- **Result:** Everything broken again
- **Error Messages:** "Fuck you" everywhere from Node and Vite
- **Status:** Back to square one
- **Mood:** Defeated

## 🔧 Working Configuration (The One That Briefly Worked)

### Vite Config Settings That Mattered
```typescript
server: {
  port: 5174,
  host: true,                    // Allow external access
  strictPort: true,              // Don't change ports randomly
  headers: {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  }
},
optimizeDeps: {
  exclude: ['lucide-react'],     // Don't pre-bundle these
  include: ['cesium']            // DO pre-bundle Cesium (maybe?)
},
```

### Required Environment Variables
```bash
VITE_CESIUM_BASE_URL=/cesium/    # Path to Cesium assets
VITE_CESIUM_ION_TOKEN=your_token # Cesium Ion access token
```

### Asset Handling Nightmare
```
public/
└── cesium/                     # Had to manually copy these
    ├── Workers/               # Web workers for Cesium
    ├── ThirdParty/           # Third-party dependencies
    ├── Assets/               # Textures, models, etc.
    └── Widgets/              # CSS and widget assets
```

## 🚨 The Proxy System (What Actually Works)

While Cesium was busy destroying our will to live, the proxy system worked beautifully:

```typescript
proxy: {
  '/api/repo': {
    target: 'http://localhost:15180',    # Repository services
    changeOrigin: true,
  },
  '/api/cannon': {
    target: 'http://localhost:18100',    # Neural Mux services
    changeOrigin: true,
  },
  '/api/stat': {
    target: 'http://localhost:18108',    # Statistics services
    changeOrigin: true,
  },
  '/forge': {
    target: 'http://localhost:18350',    # Forge/build services
    changeOrigin: true,
  },
  '/playwright': {
    target: 'http://localhost:3000',     # Playwright testing
    changeOrigin: true,
  },
}
```

**This part worked perfectly.** No drama. No 11-hour battles. Just worked.

## 💀 Lessons Learned (The Hard Way)

### What Cesium Needs to Work:
1. **WASM support** (obviously)
2. **Web Workers** (in the right place)
3. **SharedArrayBuffer** (cross-origin hell)
4. **Proper MIME types** (for .wasm files)
5. **Asset path configuration** (absolute nightmare)
6. **Ion token** (if using Cesium Ion)
7. **CORS headers** (for cross-origin isolation)
8. **A blood sacrifice** (not documented but required)

### What Breaks Everything:
- Node version changes
- Vite version changes
- Looking at the config wrong
- Breathing too hard near the build system
- The phase of the moon
- Cesium having an existential crisis

### The Postage Stamp Globe Victory
That tiny globe was **beautiful**. It had:
- ✅ Live laser satellite tracking
- ✅ Orbital mechanics simulation
- ✅ Real-time updates
- ✅ Our sanity intact (barely)

For 5 glorious minutes, we had **conquered the universe**. Then Node said "fuck you" and it all came crashing down.

## 🎯 Current Status

**Vite Config:** Still there, still complex, still traumatized
**Cesium:** Schrödinger's globe (working and broken simultaneously)
**Developer Sanity:** Missing, presumed dead
**Lesson Learned:** Sometimes a postage stamp globe is enough

---

*This documentation is dedicated to all developers who have fought the good fight against Cesium, Vite, and the general hostility of the JavaScript ecosystem. You are not alone. The globe will rise again.*

**Battle Cry:** "At least it's not webpack!" 🚀💀