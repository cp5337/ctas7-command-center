import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import {
  Globe,
  Map,
  Navigation,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Zap,
  Satellite,
  Radio,
  Eye,
  EyeOff,
  Grid3X3,
  Route,
  Radar,
  Crosshair,
} from 'lucide-react';
import { addRadiationBeltsToViewer } from '@/utils/radiationBeltRenderer';
import { fetchWeatherForLocation } from '@/services/weatherService';
import { useGroundNodes, useSatellites } from '@/hooks/useSupabaseData';
import SatelliteControlPanel, { SatelliteControlState } from './SatelliteControlPanel';
import DuplicateDetectionOverlay from './DuplicateDetectionOverlay';

type ViewMode = '3d-globe' | 'flat-map' | 'street-view' | 'beam-dashboard';

interface Layer {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  opacity: number;
}

// Duplicate satellite removal function - Keep only 12 unique satellites
const removeDuplicateSatellites = (satellites: any[]) => {
  const seenNames: Record<string, boolean> = {};
  const uniqueSatellites: any[] = [];

  // Target: exactly 12 unique satellites
  const targetSatelliteNames = [
    'SAT-ALPHA', 'SAT-BETA', 'SAT-DELTA', 'SAT-GAMMA',
    'MEO-ALPHA', 'MEO-BETA', 'MEO-DELTA', 'MEO-GAMMA',
    'MEO-EPSILON', 'MEO-ETA', 'MEO-LAMBDA', 'MEO-ZETA'
  ];

  for (const sat of satellites) {
    const baseName = sat.name?.split('-')[0] + '-' + sat.name?.split('-')[1]; // Get base name like "SAT-ALPHA"

    // Only keep first occurrence of each unique satellite name
    if (!seenNames[baseName] && targetSatelliteNames.includes(baseName)) {
      seenNames[baseName] = true;
      uniqueSatellites.push({
        ...sat,
        id: sat.id || baseName,
        name: baseName
      });
      console.log(`✅ Keeping unique satellite: ${baseName}`);
    } else {
      console.log(`🗑️ Removed duplicate satellite: ${sat.name}`);
    }
  }

  console.log(`🛰️ SATELLITE CLEANUP COMPLETE: ${satellites.length} → ${uniqueSatellites.length} satellites (exactly 12 unique)`);
  return uniqueSatellites.slice(0, 12); // Ensure exactly 12
};

export const LaserLightMultiView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('3d-globe');
  const [isPlaying, setIsPlaying] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isSatelliteControlPanelOpen, setIsSatelliteControlPanelOpen] = useState(false);

  const { nodes: groundNodes } = useGroundNodes();
  const { satellites } = useSatellites();

  // Left Glyph Rail - View Controls
  const viewControls = [
    { id: '3d-globe', icon: <Globe size={18} />, label: '3D Globe', mode: '3d-globe' as ViewMode },
    { id: 'flat-map', icon: <Map size={18} />, label: 'Flat Map', mode: 'flat-map' as ViewMode },
    { id: 'street-view', icon: <Navigation size={18} />, label: 'Street View', mode: 'street-view' as ViewMode },
    { id: 'beam-dashboard', icon: <Activity size={18} />, label: 'Beam Dashboard', mode: 'beam-dashboard' as ViewMode },
  ];

  // Right Glyph Rail - Layer Controls
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'ground', icon: <Radio size={18} />, label: 'Ground Stations', active: true, opacity: 1 },
    { id: 'satellites', icon: <Satellite size={18} />, label: 'Satellites', active: true, opacity: 1 },
    { id: 'radiation', icon: <Radar size={18} />, label: 'Radiation Belts', active: true, opacity: 0.6 },
    { id: 'beams', icon: <Zap size={18} />, label: 'Laser Beams', active: true, opacity: 0.8 },
    { id: 'grid', icon: <Grid3X3 size={18} />, label: 'Coordinate Grid', active: false, opacity: 0.3 },
    { id: 'routes', icon: <Route size={18} />, label: 'Flight Paths', active: false, opacity: 0.5 },
  ]);

  useEffect(() => {
    if (!containerRef.current || viewMode !== '3d-globe') return;

    const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN;
    if (!cesiumToken) {
      setInitError('VITE_CESIUM_TOKEN required');
      return;
    }

    Cesium.Ion.defaultAccessToken = cesiumToken;

    try {
      const viewer = new Cesium.Viewer(containerRef.current, {
        timeline: false,
        animation: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: true,
      });

      // Add world imagery with labels asynchronously
      Cesium.createWorldImageryAsync({
        style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
      }).then((imageryProvider) => {
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imageryProvider);
      }).catch((error) => {
        console.warn('Failed to load world imagery, using default:', error);
      });

      // Add world terrain asynchronously
      Cesium.createWorldTerrainAsync().then((terrainProvider) => {
        viewer.terrainProvider = terrainProvider;
      }).catch((error) => {
        console.warn('Failed to load world terrain, using default:', error);
      });

      viewerRef.current = viewer;

      // Clear all existing entities to prevent duplication
      viewer.entities.removeAll();

      // Add radiation belts if layer is active
      if (layers.find(l => l.id === 'radiation')?.active) {
        addRadiationBeltsToViewer(viewer);
      }

      // Add coordinate grid if active
      if (layers.find(l => l.id === 'grid')?.active) {
        addCoordinateGrid(viewer);
      }

      // Add ground stations with laser beams
      groundNodes.forEach((node, index) => {
        const height = 500 + Math.random() * 1000; // Raise above terrain
        const entity = viewer.entities.add({
          id: `ground-${node.id}`,
          position: Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude, height),
          point: {
            pixelSize: 12,
            color: Cesium.Color.LIME,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
          },
          label: {
            text: node.name,
            font: '11pt monospace',
            scale: 0.8,
            pixelOffset: new Cesium.Cartesian2(0, -40),
            fillColor: Cesium.Color.WHITE,
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0),
          },
          properties: {
            type: 'ground_station',
            tier: node.tier || 1,
            name: node.name,
            id: node.id,
          }
        });

        // Add pulsing laser beam with ground station illumination
        if (satellites.length > 0) {
          const nearestSat = satellites[index % satellites.length];
          if (nearestSat) {
            // Laser beam that fires briefly
            viewer.entities.add({
              id: `laser-ground-${node.id}-sat-${nearestSat.id}`,
              polyline: {
                positions: [
                  Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude, height),
                  Cesium.Cartesian3.fromDegrees(
                    nearestSat.longitude || 0,
                    nearestSat.latitude || 0,
                    nearestSat.altitude || 550000
                  )
                ],
                width: 4,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.6,
                  color: Cesium.Color.CYAN.withAlpha(0.9)
                }),
                clampToGround: false,
                show: new Cesium.CallbackProperty(() => {
                  const now = viewer.clock.currentTime;
                  if (!now) return false;
                  const startTime = viewer.clock.startTime || Cesium.JulianDate.now();
                  const seconds = Cesium.JulianDate.secondsDifference(now, startTime);
                  // Fire for 0.3 seconds every 4 seconds, staggered by station
                  const cycle = (seconds + index * 0.8) % 4;
                  return cycle < 0.3;
                }, false)
              }
            });

            // Ground station illumination during laser fire
            if (entity.point) {
              entity.point.color = new Cesium.CallbackProperty(() => {
                const now = viewer.clock.currentTime;
                if (!now) return Cesium.Color.LIME;
                const startTime = viewer.clock.startTime || Cesium.JulianDate.now();
                const seconds = Cesium.JulianDate.secondsDifference(now, startTime);
                const cycle = (seconds + index * 0.8) % 4;
                return cycle < 0.3 ? Cesium.Color.WHITE : Cesium.Color.LIME;
              }, false);
            }
          }
        }
      });

      // Remove duplicate satellites first
      const uniqueSatellites = removeDuplicateSatellites(satellites);

      // Add satellites with proper global distribution and orbital motion
      uniqueSatellites.forEach((sat, index) => {
        const baseAltitude = sat.altitude || 550000;

        // Different orbital inclinations for diverse coverage
        const inclinations = [51.6, 97.8, 0, 63.4, 28.5]; // ISS, polar, geostationary, Molniya, GPS-like
        const inclination = inclinations[index % inclinations.length];

        const period = baseAltitude > 20000000 ? 1440 : 90; // geostationary vs LEO

        // Distribute satellites globally instead of clustering
        const basePhase = (index * (360 / uniqueSatellites.length)) % 360; // Even distribution
        const longitudeOffset = (index * 137.508) % 360; // Golden angle for optimal spacing

        // Create dynamic position for orbital motion
        const position = new Cesium.CallbackPositionProperty((time) => {
          const startTime = viewer.clock.startTime || Cesium.JulianDate.now();
          const minutes = Cesium.JulianDate.secondsDifference(time, startTime) / 60;
          const angle = (minutes / period) * 2 * Math.PI;

          // Global distribution with proper orbital mechanics
          let lon = (basePhase + longitudeOffset + (angle * 180 / Math.PI)) % 360;
          if (lon > 180) lon -= 360; // Normalize to -180 to 180

          const lat = Math.sin(angle + index * 0.5) * inclination;

          return Cesium.Cartesian3.fromDegrees(lon, lat, baseAltitude);
        }, false, Cesium.ReferenceFrame.FIXED);

        viewer.entities.add({
          id: `sat-${sat.id}`,
          position: position,
          point: {
            pixelSize: 10,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: sat.name,
            font: '10pt monospace',
            scale: 0.7,
            pixelOffset: new Cesium.Cartesian2(0, -25),
            fillColor: Cesium.Color.CYAN,
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
          },
          properties: {
            type: 'satellite',
            name: sat.name,
            id: sat.id,
            norad_id: sat.norad_id,
          }
        });

        // Add inter-satellite laser links
        if (index < uniqueSatellites.length - 1) {
          const nextSat = uniqueSatellites[index + 1];
          viewer.entities.add({
            id: `laser-sat-${sat.id}-sat-${nextSat.id}`,
            polyline: {
              positions: new Cesium.CallbackProperty((time) => {
                if (!time) return [];
                const startTime = viewer.clock.startTime || Cesium.JulianDate.now();
                const minutes = Cesium.JulianDate.secondsDifference(time, startTime) / 60;
                const angle1 = (minutes / period) * 2 * Math.PI;
                const angle2 = (minutes / period) * 2 * Math.PI + 0.5; // Slight offset

                // Use the same global distribution logic as the satellites
                const basePhase1 = (index * (360 / uniqueSatellites.length)) % 360;
                const longitudeOffset1 = (index * 137.508) % 360;
                const basePhase2 = ((index + 1) * (360 / uniqueSatellites.length)) % 360;
                const longitudeOffset2 = ((index + 1) * 137.508) % 360;

                let lon1 = (basePhase1 + longitudeOffset1 + (angle1 * 180 / Math.PI)) % 360;
                if (lon1 > 180) lon1 -= 360;
                const lat1 = Math.sin(angle1 + index * 0.5) * inclination;

                let lon2 = (basePhase2 + longitudeOffset2 + (angle2 * 180 / Math.PI)) % 360;
                if (lon2 > 180) lon2 -= 360;
                const lat2 = Math.sin(angle2 + (index + 1) * 0.5) * inclination;

                return [
                  Cesium.Cartesian3.fromDegrees(lon1, lat1, baseAltitude),
                  Cesium.Cartesian3.fromDegrees(lon2, lat2, (nextSat.altitude || 550000))
                ];
              }, false),
              width: 2,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: Cesium.Color.YELLOW.withAlpha(0.6)
              }),
            }
          });
        }
      });

      // Entity selection handler
      viewer.selectedEntityChanged.addEventListener((entity) => {
        if (entity) {
          setSelectedEntity({
            id: entity.id,
            name: entity.properties?.getValue(Cesium.JulianDate.now())?.name,
            type: entity.properties?.getValue(Cesium.JulianDate.now())?.type,
          });
        } else {
          setSelectedEntity(null);
        }
      });

      // Configure Earth rotation and animation
      viewer.scene.globe.enableLighting = true;
      viewer.clock.multiplier = 60; // 60x real time for visible orbital motion
      viewer.clock.shouldAnimate = true;
      setIsPlaying(true);

      setIsLoading(false);
    } catch (error) {
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [viewMode, groundNodes, satellites, layers]);

  const addCoordinateGrid = (viewer: Cesium.Viewer) => {
    // Add longitude/latitude grid lines (old-school satellite tracking style)
    for (let lon = -180; lon <= 180; lon += 30) {
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            lon, -90, lon, 90
          ]),
          width: 1,
          material: Cesium.Color.WHITE.withAlpha(0.3),
        }
      });
    }

    for (let lat = -90; lat <= 90; lat += 30) {
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            -180, lat, 180, lat
          ]),
          width: 1,
          material: Cesium.Color.WHITE.withAlpha(0.3),
        }
      });
    }
  };

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l =>
      l.id === id ? { ...l, active: !l.active } : l
    ));
  };

  const handlePlayPause = () => {
    if (viewerRef.current) {
      viewerRef.current.clock.shouldAnimate = !isPlaying;
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.flyHome(2.0);
      viewerRef.current.clock.multiplier = 1;
      setIsPlaying(false);
    }
  };

  const handleSatelliteControlChange = (satelliteId: string, controls: Partial<SatelliteControlState>) => {
    console.log('Satellite control change:', satelliteId, controls);
    // TODO: Apply control changes to Cesium visualization
    // This will update laser beam colors, visibility, pulse rates, etc.
  };

  // Animation state for flat map satellites
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const renderFlatMapView = () => {

    return (
      <div className="h-full bg-slate-950 relative overflow-hidden">
        {/* World Map SVG with coordinate grid */}
        <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
          {/* Background with world map outline */}
          <rect width="1200" height="600" fill="#0f172a" />

          {/* Simple world map continents */}
          <g fill="#1e293b" stroke="#334155" strokeWidth="0.5">
            {/* North America */}
            <path d="M 150 150 L 250 120 L 280 180 L 250 220 L 180 250 L 120 200 Z" />
            {/* South America */}
            <path d="M 220 320 L 280 300 L 300 400 L 260 480 L 240 450 L 200 380 Z" />
            {/* Europe */}
            <path d="M 480 140 L 520 130 L 540 160 L 520 180 L 480 170 Z" />
            {/* Africa */}
            <path d="M 480 200 L 540 190 L 560 300 L 520 380 L 480 350 L 460 280 Z" />
            {/* Asia */}
            <path d="M 560 120 L 720 100 L 800 140 L 820 200 L 780 240 L 700 220 L 580 180 Z" />
            {/* Australia */}
            <path d="M 720 380 L 800 370 L 820 400 L 800 420 L 720 410 Z" />
          </g>

        {/* Longitude lines (vertical) */}
        {Array.from({ length: 13 }, (_, i) => {
          const lon = -180 + (i * 30);
          const x = ((lon + 180) / 360) * 1200;
          return (
            <g key={`lon-${i}`}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={600}
                stroke="#334155"
                strokeWidth="1"
                opacity="0.5"
              />
              <text
                x={x}
                y={590}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontFamily="monospace"
              >
                {lon}°
              </text>
            </g>
          );
        })}

        {/* Latitude lines (horizontal) */}
        {Array.from({ length: 7 }, (_, i) => {
          const lat = -90 + (i * 30);
          const y = ((90 - lat) / 180) * 600;
          return (
            <g key={`lat-${i}`}>
              <line
                x1={0}
                y1={y}
                x2={1200}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                opacity="0.5"
              />
              <text
                x={10}
                y={y - 5}
                fontSize="10"
                fill="#64748b"
                fontFamily="monospace"
              >
                {lat}°
              </text>
            </g>
          );
        })}

        {/* Equator line (emphasized) */}
        <line
          x1={0}
          y1={300}
          x2={1200}
          y2={300}
          stroke="#06b6d4"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Prime meridian (emphasized) */}
        <line
          x1={600}
          y1={0}
          x2={600}
          y2={600}
          stroke="#06b6d4"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Ground Stations */}
        {groundNodes.map((node, index) => {
          const x = ((node.longitude + 180) / 360) * 1200;
          const y = ((90 - node.latitude) / 180) * 600;
          return (
            <g key={`ground-${node.id}`}>
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="0.5"
                opacity="0.9"
              />
              {/* Only show labels for major strategic hubs to reduce hair ball */}
              {node.name.includes('Strategic Hub') && (
                <text
                  x={x + 4}
                  y={y - 4}
                  fontSize="6"
                  fill="#10b981"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {node.name.replace(' Strategic Hub', '')}
                </text>
              )}
            </g>
          );
        })}

        {/* Animated Satellites in Orbital Slots */}
        {satellites.map((sat, index) => {
          // Calculate animated orbital position
          const period = 90; // minutes for one orbit
          const inclination = 51.6; // ISS-like inclination
          const minutes = animationTime * 0.1; // Convert animation time to minutes
          const angle = (minutes / period) * 2 * Math.PI;

          const baseLon = sat.longitude || (index * 30); // Spread satellites if no longitude
          const animatedLon = ((baseLon + (angle * 180 / Math.PI)) % 360);
          const animatedLat = Math.sin(angle + index * 0.5) * inclination;

          const x = ((animatedLon + 180) / 360) * 1200;
          const y = ((90 - animatedLat) / 180) * 600;

          return (
            <g key={`sat-${sat.id}`}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.9"
              >
                {/* Pulse animation */}
                <animate
                  attributeName="r"
                  values="3;5;3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={x + 8}
                y={y - 8}
                fontSize="8"
                fill="#06b6d4"
                fontFamily="monospace"
                className="pointer-events-none"
              >
                {sat.name}
              </text>
            </g>
          );
        })}

        {/* Satellite ground tracks (orbital paths) */}
        {satellites.map((sat, index) => {
          if (!layers.find(l => l.id === 'routes')?.active) return null;

          // Generate simple orbital track approximation
          const inclination = 51.6; // ISS-like inclination
          const points = [];
          for (let t = 0; t <= 360; t += 10) {
            const lon = ((sat.longitude + t) % 360) - 180;
            const lat = Math.sin((t * Math.PI) / 180) * inclination;
            const x = ((lon + 180) / 360) * 1200;
            const y = ((90 - lat) / 180) * 600;
            points.push(`${x},${y}`);
          }

          return (
            <polyline
              key={`track-${sat.id}`}
              points={points.join(' ')}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1"
              opacity="0.4"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Laser links between ground stations and satellites */}
        {layers.find(l => l.id === 'beams')?.active && groundNodes.slice(0, 10).map((node, i) => {
          const nearestSat = satellites[i % satellites.length];
          if (!nearestSat) return null;

          const x1 = ((node.longitude + 180) / 360) * 1200;
          const y1 = ((90 - node.latitude) / 180) * 600;
          const x2 = ((nearestSat.longitude + 180) / 360) * 1200;
          const y2 = ((90 - nearestSat.latitude) / 180) * 600;

          return (
            <line
              key={`beam-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#f59e0b"
              strokeWidth="1"
              opacity="0.6"
              strokeDasharray="3,3"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded p-3 text-xs">
        <div className="text-slate-300 font-medium mb-2">FLAT MAP PROJECTION</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded border border-white"></div>
            <span className="text-slate-300">Equator / Prime Meridian</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded border border-white"></div>
            <span className="text-slate-300">Ground Stations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded border border-white"></div>
            <span className="text-slate-300">Satellites</span>
          </div>
          {layers.find(l => l.id === 'beams')?.active && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-yellow-400"></div>
              <span className="text-slate-300">Laser Links</span>
            </div>
          )}
        </div>

      </div>

      {/* Grid Info */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded p-3 text-xs">
        <div className="text-slate-300 font-medium mb-1">COORDINATE GRID</div>
        <div className="text-slate-400">30° increments</div>
        <div className="text-slate-400">Mercator projection</div>
      </div>
    </div>
  );
};

const renderStreetView = () => (
    <div className="h-full bg-slate-950 relative">
      {/* Ground-level view grid */}
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-2">
        {/* Top Left - Urban Station View */}
        <div className="bg-slate-900 rounded border border-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700">
            {/* Simulated street view with buildings */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-slate-600"></div>
            <div className="absolute bottom-0 left-1/4 w-8 h-1/2 bg-slate-500"></div>
            <div className="absolute bottom-0 right-1/4 w-12 h-2/3 bg-slate-500"></div>
            <div className="absolute bottom-0 left-1/2 w-6 h-1/3 bg-slate-400"></div>

            {/* Ground station antenna */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-8 bg-green-400"></div>
              <div className="w-8 h-1 bg-green-400 -mt-4 -ml-3"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full -mt-1 ml-3.5 animate-pulse"></div>
            </div>
          </div>

          <div className="absolute top-2 left-2 bg-slate-800/90 rounded px-2 py-1 text-xs text-green-400">
            URBAN STATION GN-247
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-slate-400 space-y-1">
            <div>39.7392° N, 104.9903° W</div>
            <div className="text-green-400">Signal: Strong</div>
          </div>
        </div>

        {/* Top Right - Rural Station View */}
        <div className="bg-slate-900 rounded border border-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-slate-800 to-blue-900/30">
            {/* Rural terrain */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-green-800/30"></div>
            <div className="absolute bottom-1/4 left-1/4 w-4 h-8 bg-green-700/50"></div>
            <div className="absolute bottom-1/4 right-1/3 w-3 h-6 bg-green-700/40"></div>

            {/* Large dish antenna */}
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-8 bg-slate-300 rounded-t-full"></div>
              <div className="w-2 h-12 bg-slate-400 ml-7"></div>
              <div className="w-1 h-1 bg-cyan-400 rounded-full ml-7.5 animate-pulse"></div>
            </div>
          </div>

          <div className="absolute top-2 left-2 bg-slate-800/90 rounded px-2 py-1 text-xs text-cyan-400">
            REMOTE STATION GN-089
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-slate-400 space-y-1">
            <div>45.5152° N, 122.6784° W</div>
            <div className="text-cyan-400">Signal: Optimal</div>
          </div>
        </div>

        {/* Bottom Left - Coastal Station View */}
        <div className="bg-slate-900 rounded border border-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-slate-800 to-slate-700">
            {/* Ocean horizon */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-blue-900/40"></div>
            <div className="absolute bottom-1/2 left-0 right-0 h-px bg-blue-400/60"></div>

            {/* Shore and facility */}
            <div className="absolute bottom-1/2 left-0 right-0 h-1/6 bg-yellow-800/30"></div>
            <div className="absolute bottom-1/3 left-1/3 w-8 h-4 bg-slate-500"></div>

            {/* Coastal antenna array */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-1 h-6 bg-blue-400"></div>
              <div className="w-1 h-8 bg-blue-400"></div>
              <div className="w-1 h-6 bg-blue-400"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>

          <div className="absolute top-2 left-2 bg-slate-800/90 rounded px-2 py-1 text-xs text-blue-400">
            COASTAL STATION GN-156
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-slate-400 space-y-1">
            <div>34.0522° N, 118.2437° W</div>
            <div className="text-yellow-400">Signal: Weather Affected</div>
          </div>
        </div>

        {/* Bottom Right - Mountain Station View */}
        <div className="bg-slate-900 rounded border border-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-700 via-slate-600 to-purple-900/50">
            {/* Mountain terrain */}
            <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-slate-600 transform skew-x-12"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-slate-500 transform -skew-x-6"></div>
            <div className="absolute bottom-0 left-1/3 w-1/3 h-1/2 bg-slate-700"></div>

            {/* High-altitude station */}
            <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-6 bg-slate-300 rounded"></div>
              <div className="w-3 h-10 bg-slate-400 ml-3.5"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full ml-4 animate-pulse"></div>
            </div>
          </div>

          <div className="absolute top-2 left-2 bg-slate-800/90 rounded px-2 py-1 text-xs text-purple-400">
            MOUNTAIN STATION GN-334
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-slate-400 space-y-1">
            <div>40.3428° N, 106.5180° W</div>
            <div className="text-red-400">Signal: Offline</div>
          </div>
        </div>
      </div>

      {/* Street View Controls */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded p-3 text-xs">
        <div className="text-slate-300 font-medium mb-2">GROUND PERSPECTIVES</div>
        <div className="space-y-2">
          <button className="w-full text-left px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
            📍 Station Vicinity
          </button>
          <button className="w-full text-left px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
            🛰️ Elevation View
          </button>
          <button className="w-full text-left px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
            🌊 Environmental
          </button>
          <button className="w-full text-left px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
            ⛰️ Terrain Analysis
          </button>
        </div>
      </div>

      {/* Real-time telemetry */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded p-3 text-xs">
        <div className="text-slate-300 font-medium mb-2">FIELD TELEMETRY</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-slate-400">Weather</div>
            <div className="text-green-400">Clear</div>
          </div>
          <div>
            <div className="text-slate-400">Visibility</div>
            <div className="text-green-400">15km</div>
          </div>
          <div>
            <div className="text-slate-400">Wind</div>
            <div className="text-yellow-400">12 mph</div>
          </div>
          <div>
            <div className="text-slate-400">Elevation</div>
            <div className="text-cyan-400">1,847m</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBeamDashboard = () => (
    <div className="h-full bg-slate-900 p-2 grid grid-cols-12 gap-2">
      {/* Network Overview */}
      <div className="col-span-4 bg-slate-800/50 rounded p-3">
        <div className="text-xs text-slate-400 mb-2 flex items-center">
          <Zap size={12} className="mr-1" />
          LASER LINK STATUS
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Active Links</span>
            <span className="text-green-400 font-mono">42</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Degraded</span>
            <span className="text-yellow-400 font-mono">3</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Offline</span>
            <span className="text-red-400 font-mono">1</span>
          </div>
          <div className="flex justify-between text-xs border-t border-slate-700 pt-2">
            <span className="text-slate-300">Total Bandwidth</span>
            <span className="text-cyan-400 font-mono">1.2 Tbps</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="col-span-4 bg-slate-800/50 rounded p-3">
        <div className="text-xs text-slate-400 mb-2 flex items-center">
          <Activity size={12} className="mr-1" />
          PERFORMANCE
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Avg Latency</span>
            <span className="text-green-400 font-mono">2.4ms</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Packet Loss</span>
            <span className="text-green-400 font-mono">0.02%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Jitter</span>
            <span className="text-yellow-400 font-mono">0.8ms</span>
          </div>
          <div className="flex justify-between text-xs border-t border-slate-700 pt-2">
            <span className="text-slate-300">Utilization</span>
            <span className="text-cyan-400 font-mono">74%</span>
          </div>
        </div>
      </div>

      {/* Weather Impact */}
      <div className="col-span-4 bg-slate-800/50 rounded p-3">
        <div className="text-xs text-slate-400 mb-2 flex items-center">
          <Activity size={12} className="mr-1" />
          WEATHER IMPACT
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Clear Sky</span>
            <span className="text-green-400 font-mono">89%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Cloudy</span>
            <span className="text-yellow-400 font-mono">8%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Storm</span>
            <span className="text-red-400 font-mono">3%</span>
          </div>
          <div className="flex justify-between text-xs border-t border-slate-700 pt-2">
            <span className="text-slate-300">Forecast</span>
            <span className="text-green-400 font-mono">Good</span>
          </div>
        </div>
      </div>

      {/* Critical Links */}
      <div className="col-span-6 bg-slate-800/50 rounded p-3">
        <div className="text-xs text-slate-400 mb-2 flex items-center">
          <Radio size={12} className="mr-1" />
          CRITICAL LINKS
        </div>
        <div className="space-y-1">
          {[
            { from: 'GN-247', to: 'SAT-EPSILON', bw: '45.2 Gbps', lat: '1.2ms', status: 'good' },
            { from: 'GN-156', to: 'SAT-BETA', bw: '38.7 Gbps', lat: '2.1ms', status: 'degraded' },
            { from: 'GN-089', to: 'SAT-GAMMA', bw: '52.1 Gbps', lat: '0.9ms', status: 'good' },
            { from: 'GN-334', to: 'SAT-DELTA', bw: '0.0 Gbps', lat: '--', status: 'offline' },
          ].map((link, i) => (
            <div key={i} className="flex items-center justify-between text-xs border-b border-slate-700/50 pb-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  link.status === 'good' ? 'bg-green-400' :
                  link.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-slate-300 font-mono">{link.from}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-300 font-mono">{link.to}</span>
              </div>
              <div className="flex space-x-3">
                <span className="text-cyan-400 font-mono">{link.bw}</span>
                <span className="text-slate-400 font-mono">{link.lat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Graph */}
      <div className="col-span-6 bg-slate-800/50 rounded p-3">
        <div className="text-xs text-slate-400 mb-2 flex items-center">
          <Activity size={12} className="mr-1" />
          BANDWIDTH UTILIZATION
        </div>
        <div className="h-24 flex items-end space-x-1">
          {Array.from({ length: 24 }, (_, i) => {
            const height = 20 + Math.random() * 60;
            return (
              <div
                key={i}
                className="flex-1 bg-cyan-400/60 rounded-t"
                style={{ height: `${height}%` }}
                title={`${(height).toFixed(1)}% utilization`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>00:00</span>
          <span>12:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );

  if (initError) {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <div className="text-xl mb-2">⚠️</div>
          <div>Error: {initError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-slate-900 flex">
      {/* Left Glyph Rail - View Controls */}
      <div className="w-8 bg-slate-800/90 border-r border-slate-700 flex flex-col items-center py-1 space-y-1">
        <div className="text-cyan-400 mb-1">
          <Crosshair size={12} />
        </div>

        {viewControls.map((control) => (
          <button
            key={control.id}
            onClick={() => setViewMode(control.mode)}
            className={`p-1 rounded transition-colors ${
              viewMode === control.mode
                ? 'text-cyan-400 bg-cyan-400/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={control.label}
          >
            {control.icon}
          </button>
        ))}

        <div className="flex-1" />

        {/* Transport Controls */}
        <button
          onClick={handlePlayPause}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <button
          onClick={handleReset}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {viewMode === '3d-globe' && (
          <div
            ref={containerRef}
            className="w-full h-full"
          />
        )}
        {viewMode === 'flat-map' && renderFlatMapView()}
        {viewMode === 'street-view' && renderStreetView()}
        {viewMode === 'beam-dashboard' && renderBeamDashboard()}

        {/* Loading State */}
        {isLoading && viewMode === '3d-globe' && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-50">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-200">Loading laser network...</p>
            </div>
          </div>
        )}

        {/* Selected Entity Info Card - Compact */}
        {selectedEntity && (
          <div className="absolute top-2 left-2 bg-slate-800/95 backdrop-blur border border-cyan-400/20 rounded p-2 min-w-[160px]">
            <div className="text-xs font-medium text-slate-100">{selectedEntity.name}</div>
            <div className="text-xs text-slate-400 capitalize">{selectedEntity.type}</div>
            <div className="text-xs text-slate-500">ID: {selectedEntity.id}</div>
          </div>
        )}
      </div>

      {/* Right Glyph Rail - Layer Controls */}
      <div className="w-8 bg-slate-800/90 border-l border-slate-700 flex flex-col items-center py-1 space-y-1">
        <div className="text-cyan-400 mb-1">
          <Layers size={12} />
        </div>

        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => layer.id === 'satellites'
              ? setIsSatelliteControlPanelOpen(true)
              : toggleLayer(layer.id)
            }
            className={`p-1 rounded transition-colors ${
              layer.id === 'satellites' && isSatelliteControlPanelOpen
                ? 'text-cyan-400 bg-cyan-400/20'
                : layer.active
                ? 'text-cyan-400 bg-cyan-400/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={layer.id === 'satellites' ? 'Satellite Controls' : layer.label}
          >
            {layer.icon}
          </button>
        ))}

        <div className="flex-1" />

        <button className="p-1 text-slate-400 hover:text-white transition-colors" title="Settings">
          <Settings size={12} />
        </button>
      </div>

      {/* Status Bar - More Compact */}
      <div className="absolute bottom-1 right-9 bg-slate-800/90 backdrop-blur rounded px-2 py-1 flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300">{satellites.length} SAT</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          <span className="text-slate-300">{groundNodes.length} GND</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
          <span className="text-slate-300">RAD</span>
        </div>
      </div>

      {/* Satellite Control Panel */}
      <SatelliteControlPanel
        isOpen={isSatelliteControlPanelOpen}
        onClose={() => setIsSatelliteControlPanelOpen(false)}
        satellites={satellites.map(sat => ({
          id: sat.id || sat.name,
          name: sat.name,
          status: 'operational' // You can derive this from actual satellite data
        }))}
        onSatelliteControlChange={handleSatelliteControlChange}
      />
    </div>
  );
};