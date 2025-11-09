# 🎬 CTAS-7 Visual Sizzle Specification

**Date:** November 9, 2025  
**Goal:** CrowdStrike/Palantir-level "holy shit" factor for demos and sales

---

## 🎯 THE SIZZLE ELEMENTS

### **1. ANIMATED GLOBE WITH REAL-TIME THREAT PULSES** 🌍

**Inspiration:** CrowdStrike Threat Graph, Palantir Metropolis

**What It Shows:**
- 3D rotating Earth (WebGL)
- Real-time threat events as **pulsing arcs** between locations
- Color-coded by severity (red = critical, yellow = high, cyan = medium)
- Submarine cables as **glowing lines** on ocean floor
- Power grid as **pulsing nodes** on continents
- Attack paths animated in real-time

**Tech Stack:**
```typescript
// Use Cesium.js (you already have it for orbital)
import * as Cesium from 'cesium';

const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: Cesium.createWorldTerrain(),
  imageryProvider: new Cesium.IonImageryProvider({ assetId: 3954 }), // Dark Earth
  baseLayerPicker: false,
  animation: false,
  timeline: false,
});

// Add pulsing threat arcs
function addThreatArc(source: LatLon, target: LatLon, severity: 'critical' | 'high' | 'medium') {
  const color = severity === 'critical' ? Cesium.Color.RED : 
                severity === 'high' ? Cesium.Color.YELLOW : 
                Cesium.Color.CYAN;
  
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        source.lon, source.lat, 100000, // Arc height for visual effect
        target.lon, target.lat, 100000,
      ]),
      width: 3,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: color.withAlpha(0.8),
      }),
    },
  });
}

// Animate submarine cables (glowing lines)
function addSubmarineCable(points: LatLon[]) {
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(
        points.flatMap(p => [p.lon, p.lat])
      ),
      width: 2,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.5,
        color: Cesium.Color.CYAN.withAlpha(0.6),
      }),
    },
  });
}
```

---

### **2. REAL-TIME GRAPH VISUALIZATION (D3.js Force-Directed)** 📊

**Inspiration:** Palantir Gotham relationship graphs

**What It Shows:**
- Nodes: Actors, Tasks, Objects, Events, Attributes
- Edges: Relationships (performs, uses, targets, related_to)
- **Live updates** as TAPS messages arrive
- **Zoom to cluster** on click
- **Highlight attack path** on hover
- **Particle effects** along edges for data flow

**Tech Stack:**
```typescript
// Use D3.js v7 with force simulation
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  type: 'actor' | 'task' | 'object' | 'event' | 'attribute';
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'performs' | 'uses' | 'targets' | 'related_to';
}

const GraphVisualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const svg = d3.select(svgRef.current);
    
    // Add glow filter for nodes
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw links with animated particles
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#00d9ff')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Draw nodes with color by type
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        switch (d.type) {
          case 'actor': return '#ff0055'; // Red (solve for)
          case 'task': return '#00d9ff'; // Cyan (primary)
          case 'object': return '#00ff88'; // Green
          case 'event': return '#ffff00'; // Yellow
          case 'attribute': return '#ff00ff'; // Magenta
        }
      })
      .attr('filter', 'url(#glow)')
      .call(drag(simulation));

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 10)
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', -15);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return <svg ref={svgRef} className="w-full h-full" />;
};
```

---

### **3. THREAT HEATMAP (Mapbox GL with Clustering)** 🔥

**Inspiration:** CrowdStrike Falcon OverWatch

**What It Shows:**
- Global threat density as **heat clusters**
- Zoom in → clusters explode into individual threats
- **Pulsing markers** for active threats
- **Color gradient** (green → yellow → red)
- **Time slider** to replay attacks

**Tech Stack:**
```typescript
// Use Mapbox GL JS (you already have it)
import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
  center: [0, 20],
  zoom: 2,
});

// Add threat heatmap layer
map.on('load', () => {
  map.addSource('threats', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: threats.map(t => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.lon, t.lat] },
        properties: { severity: t.severity, title: t.title },
      })),
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  // Cluster circles (size based on count)
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'threats',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#00ff88', 10,  // Green (low)
        '#ffff00', 50,  // Yellow (medium)
        '#ff0055'       // Red (high)
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20, 10,
        30, 50,
        40
      ],
      'circle-opacity': 0.8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });

  // Individual threat markers (pulsing)
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'threats',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#ff0055',
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 10, 1],
    },
  });

  // Animate pulsing effect
  let pulseRadius = 8;
  setInterval(() => {
    pulseRadius = pulseRadius === 8 ? 12 : 8;
    map.setPaintProperty('unclustered-point', 'circle-radius', pulseRadius);
  }, 500);
});
```

---

### **4. LIVE METRICS DASHBOARD (Animated Counters)** 📈

**Inspiration:** Palantir Foundry metrics, CrowdStrike Falcon Dashboard

**What It Shows:**
- **Big numbers** that count up in real-time
- **Sparklines** for trends
- **Radial progress** for percentages
- **Glow effects** on critical metrics

**Tech Stack:**
```typescript
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value]);

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
      whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${color}` }}
    >
      <motion.div
        className={`text-5xl font-bold text-${color}-400`}
        style={{ textShadow: `0 0 20px ${color}` }}
      >
        {display}
      </motion.div>
      <div className="text-sm text-gray-400 mt-2">{label}</div>
    </motion.div>
  );
};

// Usage
<div className="grid grid-cols-4 gap-4">
  <AnimatedCounter value={threatCount} label="Active Threats" color="#ff0055" />
  <AnimatedCounter value={assetCount} label="Assets Protected" color="#00ff88" />
  <AnimatedCounter value={alertCount} label="Alerts (24h)" color="#ffff00" />
  <AnimatedCounter value={vulnCount} label="Vulnerabilities" color="#00d9ff" />
</div>
```

---

### **5. ATTACK PATH VISUALIZATION (Sankey Diagram)** 🎯

**Inspiration:** Palantir attack chain analysis

**What It Shows:**
- **Kill chain stages** (Recon → Weaponize → Deliver → Exploit → Install → C2 → Actions)
- **Flow thickness** = frequency
- **Color by severity**
- **Click to drill down**

**Tech Stack:**
```typescript
import { Sankey } from 'react-vis';

const AttackPathSankey: React.FC = () => {
  const data = {
    nodes: [
      { name: 'Reconnaissance' },
      { name: 'Weaponization' },
      { name: 'Delivery' },
      { name: 'Exploitation' },
      { name: 'Installation' },
      { name: 'C2' },
      { name: 'Actions on Objectives' },
    ],
    links: [
      { source: 0, target: 1, value: 45 },
      { source: 1, target: 2, value: 38 },
      { source: 2, target: 3, value: 32 },
      { source: 3, target: 4, value: 28 },
      { source: 4, target: 5, value: 22 },
      { source: 5, target: 6, value: 18 },
    ],
  };

  return (
    <Sankey
      nodes={data.nodes}
      links={data.links}
      width={800}
      height={400}
      nodeWidth={15}
      nodePadding={10}
      style={{
        links: { opacity: 0.6 },
        rects: { fill: '#00d9ff', strokeWidth: 2, stroke: '#ffffff' },
        labels: { fontSize: 12, fill: '#ffffff' },
      }}
    />
  );
};
```

---

### **6. PARTICLE SYSTEM (WebGL Background)** ✨

**Inspiration:** CrowdStrike Falcon loading screen

**What It Shows:**
- Thousands of **particles** forming network mesh
- **Connections** between nearby particles
- **Mouse interaction** (particles avoid cursor)
- **Color shifts** based on threat level

**Tech Stack:**
```typescript
// Use Three.js for WebGL particles
import * as THREE from 'three';

const ParticleBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create particles
    const particleCount = 5000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00d9ff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particles, material);
    scene.add(particleSystem);

    camera.position.z = 50;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      particleSystem.rotation.x += 0.0005;
      particleSystem.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};
```

---

## 🎬 THE "WOW MOMENT" DEMO FLOW

**Scene 1: Globe View (0:00-0:15)**
- Camera orbits Earth
- Submarine cables glow
- Threat arcs pulse between continents
- Zoom to hotspot (Eastern Europe)

**Scene 2: Graph Explosion (0:15-0:30)**
- Transition to force-directed graph
- Nodes fly in from edges
- Highlight APT28 actor node (red)
- Show attack path to US infrastructure

**Scene 3: Heatmap Zoom (0:30-0:45)**
- Pull back to global heatmap
- Clusters pulse and grow
- Zoom to Texas power grid
- Individual threats appear

**Scene 4: Metrics Dashboard (0:45-1:00)**
- Numbers count up dramatically
- Sparklines animate
- Radial progress fills
- Critical alert flashes

**Scene 5: Attack Path (1:00-1:15)**
- Sankey diagram flows
- Kill chain stages light up
- Show interdiction points
- Fade to logo

---

## 🎨 COLOR PALETTE (CrowdStrike/Palantir Inspired)

```css
/* Primary Colors */
--cyber-red: #ff0055;      /* Critical threats, actors */
--cyber-cyan: #00d9ff;     /* Tasks, primary elements */
--cyber-green: #00ff88;    /* Assets, success states */
--cyber-yellow: #ffff00;   /* Warnings, high priority */
--cyber-magenta: #ff00ff;  /* Attributes, metadata */

/* Background */
--bg-dark: #0a0a0f;
--bg-surface: rgba(255, 255, 255, 0.05);
--bg-border: rgba(255, 255, 255, 0.1);

/* Glow Effects */
--glow-red: 0 0 20px #ff0055;
--glow-cyan: 0 0 20px #00d9ff;
--glow-green: 0 0 20px #00ff88;
```

---

## 🚀 IMPLEMENTATION PRIORITY

1. **Animated Globe** (Cesium) - 2 days
2. **Force-Directed Graph** (D3.js) - 2 days
3. **Threat Heatmap** (Mapbox) - 1 day
4. **Metrics Dashboard** (Framer Motion) - 1 day
5. **Attack Path Sankey** - 1 day
6. **Particle Background** (Three.js) - 1 day

**Total:** 1 week for full sizzle

---

**Ready to make executives say "holy shit, take my money"?** 🎬✨🚀

