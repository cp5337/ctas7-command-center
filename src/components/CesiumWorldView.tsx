import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';
import {
  CesiumWorldManager,
  WorldType,
} from '@/services/cesiumWorldManager';
import { loadInitialData } from '@/services/dataLoader';
import WorldManager from '@/fusion/worlds/WorldManager';
import MaritimeDomain from '@/fusion/domains/MaritimeDomain';

interface LayerConfig {
  id: string;
  label: string;
  visible: boolean;
  color: string;
  opacity: number;
  children?: LayerConfig[];
}

export function CesiumWorldView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const worldManagerRef = useRef<CesiumWorldManager | null>(null);
  const fusionManagerRef = useRef<WorldManager | null>(null);
  const maritimeDomainRef = useRef<MaritimeDomain | null>(null);

  const [currentWorld, setCurrentWorld] = useState<WorldType>('production');
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    groundStations: 0,
    satellites: 0,
    activeLinks: 0,
    vessels: 0,
    ports: 0,
    alerts: 0,
  });

  const [layers, setLayers] = useState<LayerConfig[]>([
    {
      id: 'groundStations',
      label: 'Ground Stations',
      visible: true,
      color: '#10b981',
      opacity: 1,
      children: [
        { id: 'groundStations-online', label: 'Online', visible: true, color: '#10b981', opacity: 1 },
        { id: 'groundStations-offline', label: 'Offline', visible: true, color: '#ef4444', opacity: 1 },
      ],
    },
    {
      id: 'satellites',
      label: 'Satellites',
      visible: true,
      color: '#06b6d4',
      opacity: 1,
    },
    {
      id: 'orbits',
      label: 'Orbital Paths',
      visible: false,
      color: '#0ea5e9',
      opacity: 0.5,
    },
    {
      id: 'activeLinks',
      label: 'Network Links',
      visible: true,
      color: '#06b6d4',
      opacity: 0.5,
      children: [
        { id: 'activeLinks-active', label: 'Active', visible: true, color: '#06b6d4', opacity: 0.5 },
        { id: 'activeLinks-degraded', label: 'Degraded', visible: true, color: '#f59e0b', opacity: 0.3 },
      ],
    },
    {
      id: 'maritime',
      label: 'Maritime Domain',
      visible: true,
      color: '#0ea5e9',
      opacity: 1,
      children: [
        { id: 'maritime-vessels', label: 'Vessels', visible: true, color: '#0ea5e9', opacity: 1 },
        { id: 'maritime-ports', label: 'Ports', visible: true, color: '#16a34a', opacity: 1 },
        { id: 'maritime-routes', label: 'Shipping Routes', visible: false, color: '#0ea5e9', opacity: 0.3 },
        { id: 'maritime-alerts', label: 'Alerts', visible: true, color: '#ef4444', opacity: 1 },
      ],
    },
  ]);

  const [timeControl, setTimeControl] = useState({
    isPlaying: false,
    speed: 1,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Use environment token (required)
    const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN;

    if (!cesiumToken) {
      throw new Error('VITE_CESIUM_TOKEN is required. Please add your Cesium Ion token to .env file.');
    }

    console.log('✅ Using Cesium Ion token from environment');

    Cesium.Ion.defaultAccessToken = cesiumToken;

    try {
      console.log('🌍 Initializing Cesium Viewer for CTAS GIS...');

      const viewer = new Cesium.Viewer(containerRef.current, {
        timeline: false,
        animation: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: true,
        selectionIndicator: true,
        contextOptions: {
          webgl: {
            alpha: false,
            depth: true,
            stencil: false,
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          },
        },
        requestRenderMode: false,
        maximumRenderTimeChange: Infinity,
      });

      // Configure scene for optimal performance
      viewer.scene.globe.enableLighting = false;
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 40000000;

      console.log('✓ Cesium Viewer initialized successfully');

      viewerRef.current = viewer;
      
      // Expose viewer globally for debugging
      (window as any).cesiumViewer = viewer;

      const worldManager = new CesiumWorldManager(viewer);
      worldManagerRef.current = worldManager;

      // Initialize fusion system
      const fusionManager = new WorldManager();
      fusionManagerRef.current = fusionManager;

      const maritimeDomain = new MaritimeDomain();
      maritimeDomainRef.current = maritimeDomain;

      // Set up event listeners
      const eventBus = worldManager.getEventBus();
      eventBus.addEventListener('entity-selected', ((e: CustomEvent) => {
        console.log('Entity selected:', e.detail);
      }) as EventListener);

      // Set up fusion event listeners
      fusionManager.addEventListener('world-switched', ((e: CustomEvent) => {
        console.log('🌍 World switched:', e.detail);
      }) as EventListener);

      maritimeDomain.addEventListener('vessel-added', ((e: CustomEvent) => {
        console.log('🚢 Vessel added:', e.detail);
      }) as EventListener);

      maritimeDomain.addEventListener('maritime-alert', ((e: CustomEvent) => {
        console.log('⚠️ Maritime alert:', e.detail);
      }) as EventListener);

      // Load data directly from Supabase
      loadInitialData().then((data) => {
        console.log('Loaded data:', data);

        // Add to Cesium visualization
        data.ground_stations.forEach((station) => {
          worldManager.addGroundStation('production', station);
        });

        data.satellites.forEach((satellite) => {
          worldManager.addSatellite('production', satellite);
        });

        data.network_links?.forEach((link) => {
          worldManager.addNetworkLink('production', link);
        });

        // Add some sample maritime data for demonstration
        const sampleVessels = [
          {
            id: 'vessel-001',
            name: 'MV Ever Given',
            imo: '9811000',
            mmsi: '353136000',
            vesselType: 'container',
            coordinates: [32.3498, 29.9527] as [number, number], // Suez Canal
            speed: 12,
            heading: 180,
            destination: 'Rotterdam'
          },
          {
            id: 'vessel-002',
            name: 'USS Gerald R. Ford',
            vesselType: 'military',
            coordinates: [-76.2951, 36.9468] as [number, number], // Norfolk
            speed: 0,
            heading: 0,
            destination: 'Norfolk Naval Base'
          },
          {
            id: 'vessel-003',
            name: 'COSCO Shipping Universe',
            imo: '9795135',
            mmsi: '477995700',
            vesselType: 'container',
            coordinates: [121.5074, 31.2304] as [number, number], // Shanghai
            speed: 0,
            heading: 90,
            destination: 'Long Beach'
          }
        ];

        // Add vessels to both fusion system and maritime domain
        sampleVessels.forEach((vessel) => {
          const fusedEntity = maritimeDomain.addVessel(vessel);
          fusionManager.addEntityToWorld('production', fusedEntity);
        });

        const ports = maritimeDomain.getPorts();
        const alerts = maritimeDomain.getActiveAlerts();

        setStats({
          groundStations: data.ground_stations.length,
          satellites: data.satellites.length,
          activeLinks: data.network_links?.length || 0,
          vessels: sampleVessels.length,
          ports: ports.length,
          alerts: alerts.length,
        });

        setIsLoading(false);
      }).catch((error) => {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      });

      setInitError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setInitError(`Failed to initialize Cesium: ${errorMessage}`);
      setIsLoading(false);
    }

    return () => {
      if (fusionManagerRef.current) {
        fusionManagerRef.current.destroy();
      }
      if (worldManagerRef.current) {
        worldManagerRef.current.destroy();
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  const handleWorldChange = (world: WorldType) => {
    if (worldManagerRef.current && fusionManagerRef.current) {
      worldManagerRef.current.switchWorld(world);
      fusionManagerRef.current.switchWorld(world);
      setCurrentWorld(world);

      // Update stats for new world
      const worldState = fusionManagerRef.current.getWorldState(world);
      if (worldState) {
        setStats(prev => ({
          ...prev,
          // Update with fusion world stats
        }));
      }
    }
  };

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === layerId) {
          return { ...layer, visible };
        }
        if (layer.children) {
          return {
            ...layer,
            children: layer.children.map((child) =>
              child.id === layerId ? { ...child, visible } : child
            ),
          };
        }
        return layer;
      })
    );

    if (worldManagerRef.current) {
      worldManagerRef.current.setLayerVisibility(layerId, visible);
    }
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === layerId ? { ...layer, opacity } : layer))
    );

    if (worldManagerRef.current) {
      worldManagerRef.current.setLayerOpacity(layerId, opacity);
    }
  };

  const handlePlayPause = () => {
    if (viewerRef.current) {
      const viewer = viewerRef.current;
      const isCurrentlyPlaying = !viewer.clock.shouldAnimate;

      viewer.clock.shouldAnimate = isCurrentlyPlaying;

      setTimeControl((prev) => ({
        ...prev,
        isPlaying: isCurrentlyPlaying,
      }));
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (viewerRef.current) {
      viewerRef.current.clock.multiplier = speed;
      setTimeControl((prev) => ({
        ...prev,
        speed,
      }));
    }
  };

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.flyHome(2.0);
      viewerRef.current.clock.multiplier = 1;
      setTimeControl({
        isPlaying: false,
        speed: 1,
      });
    }
  };

  if (initError) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-slate-900 border-red-900 p-6">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Initialization Failed</h2>
          </div>
          <p className="text-slate-300 mb-4">{initError}</p>
          <Button onClick={() => window.location.reload()}>Reload Application</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg h-full overflow-hidden">
        {/* Header matching command center pattern */}
        <div className="flex items-center space-x-2 p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="text-lg font-semibold text-slate-100">3D Orbital Network Visualization</h3>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 ml-auto">
            <span>World: {currentWorld}</span>
            <span>•</span>
            <span>{stats.satellites} Satellites</span>
            <span>•</span>
            <span>{stats.groundStations} Ground Stations</span>
            <span>•</span>
            <span>Cesium Ion</span>
          </div>
        </div>

        {/* Main content grid matching command center layout */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100%-4rem)] p-6">
          {/* Left Panel - matching command center card style */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4 h-full">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 text-cyan-400">🌍</div>
                <h4 className="text-md font-semibold text-slate-100">World Controls</h4>
              </div>

              {/* World Selection */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Environment</label>
                  <select
                    value={currentWorld}
                    onChange={(e) => handleWorldChange(e.target.value as WorldType)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="sandbox">Sandbox</option>
                    <option value="fusion">Fusion</option>
                  </select>
                </div>

                {/* Stats Grid matching command center metrics */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-slate-700 rounded p-3">
                    <div className="text-sm text-slate-300">Satellites</div>
                    <div className="text-xl font-bold text-cyan-400">{stats.satellites}</div>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <div className="text-sm text-slate-300">Ground Stations</div>
                    <div className="text-xl font-bold text-green-400">{stats.groundStations}</div>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <div className="text-sm text-slate-300">Network Links</div>
                    <div className="text-xl font-bold text-blue-400">{stats.activeLinks}</div>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <div className="text-sm text-slate-300">Vessels</div>
                    <div className="text-xl font-bold text-blue-300">{stats.vessels}</div>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <div className="text-sm text-slate-300">Ports</div>
                    <div className="text-xl font-bold text-emerald-400">{stats.ports}</div>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <div className="text-sm text-slate-300">Maritime Alerts</div>
                    <div className="text-xl font-bold text-orange-400">{stats.alerts}</div>
                  </div>
                </div>

                {/* Layer Controls */}
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-slate-200 mb-3">Layer Controls</h5>
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div key={layer.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                        <span className="text-slate-300 text-sm">{layer.label}</span>
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={(e) => handleLayerToggle(layer.id, e.target.checked)}
                          className="text-cyan-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Cesium Viewer */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
              <div
                ref={containerRef}
                className="w-full h-full"
              />

              {isLoading && (
                <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-50">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg font-semibold text-slate-200">
                      Loading satellite network data...
                    </p>
                    <p className="text-sm text-slate-400">Initializing Cesium viewer and loading data from database</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - matching command center layout */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4 h-full">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 text-cyan-400">⚙️</div>
                <h4 className="text-md font-semibold text-slate-100">Time Controls</h4>
              </div>

              {/* Time Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <span className="text-slate-300 text-sm">Animation</span>
                  <button
                    onClick={handlePlayPause}
                    className={`px-3 py-1 rounded text-sm ${
                      timeControl.isPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {timeControl.isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Speed Multiplier</label>
                  <select
                    value={timeControl.speed}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                  >
                    <option value={0.1}>0.1x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-sm"
                >
                  Reset View
                </button>
              </div>

              {/* Network Status matching command center style */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-slate-200 mb-3">Network Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Earth Imagery</span>
                    <span className="text-green-400 text-sm">✓ Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Cesium Ion</span>
                    <span className="text-green-400 text-sm">✓ Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Database</span>
                    <span className="text-green-400 text-sm">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Real-time Data</span>
                    <span className="text-cyan-400 text-sm">⟳ Streaming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
