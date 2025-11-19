import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';
import { LeftPanel } from './LeftPanel';
import { RightPanel, LayerConfig } from './RightPanel';
import {
  CesiumWorldManager,
  WorldType,
} from '@/services/cesiumWorldManager';
import { loadInitialData } from '@/services/dataLoader';
import { addRadiationBeltsToViewer } from '@/utils/radiationBeltRenderer';

export function CesiumWorldView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const worldManagerRef = useRef<CesiumWorldManager | null>(null);

  const [currentWorld, setCurrentWorld] = useState<WorldType>('production');
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    groundStations: 0,
    satellites: 0,
    activeLinks: 0,
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
      id: 'radiationBelts',
      label: 'Radiation Belts',
      visible: true,
      color: '#ff6b6b',
      opacity: 0.3,
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
  ]);

  const [timeControl, setTimeControl] = useState({
    isPlaying: false,
    speed: 1,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Use environment token or fallback to a default development token
    const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2VmZThmYi1hNGNiLTRhODYtYTg4Yi0xNzMyNDZiNTUyNGQiLCJpZCI6MjU5LCJpYXQiOjE3MjQ4NzE0Nzl9.9SW5vgVpJPLqSJmqAQvVGRMlIwfvmLcJXXxqZJfqpJE';
    
    if (!import.meta.env.VITE_CESIUM_TOKEN) {
      console.warn('⚠️  Using default Cesium token. Get your own at https://ion.cesium.com/ for production use.');
    }

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

      // Add Radiation Belts
      addRadiationBeltsToViewer(viewer);

      // Handle Quick Bird Jump events
      const handleFlyTo = (e: Event) => {
        const customEvent = e as CustomEvent;
        const targetName = customEvent.detail.target;
        console.log('Flying to target:', targetName);
        
        const entities = viewer.entities.values;
        let targetEntity = null;
        
        for (const entity of entities) {
          if (entity.name === targetName) {
            targetEntity = entity;
            break;
          }
        }

        if (targetEntity) {
          viewer.flyTo(targetEntity, {
            duration: 2.0,
            offset: new Cesium.HeadingPitchRange(0, -0.5, 5000000) // View from 5000km away
          });
          viewer.selectedEntity = targetEntity;
        } else {
          console.warn('Target entity not found:', targetName);
        }
      };

      window.addEventListener('ctas-camera-flyto', handleFlyTo);

      const eventBus = worldManager.getEventBus();
      eventBus.addEventListener('entity-selected', ((e: CustomEvent) => {
        console.log('Entity selected:', e.detail);
      }) as EventListener);

      // Load data directly from Supabase
      loadInitialData().then((data) => {
        console.log('Loaded data:', data);

        data.ground_stations.forEach((station) => {
          worldManager.addGroundStation('production', station);
        });

        data.satellites.forEach((satellite) => {
          worldManager.addSatellite('production', satellite);
        });

        data.network_links?.forEach((link) => {
          worldManager.addNetworkLink('production', link);
        });

        setStats({
          groundStations: data.ground_stations.length,
          satellites: data.satellites.length,
          activeLinks: data.network_links?.length || 0,
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
      if (worldManagerRef.current) {
        worldManagerRef.current.destroy();
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  const handleWorldChange = (world: WorldType) => {
    if (worldManagerRef.current) {
      worldManagerRef.current.switchWorld(world);
      setCurrentWorld(world);
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

    // Handle Radiation Belts visibility manually since they are not managed by WorldManager
    if (layerId === 'radiationBelts' && viewerRef.current) {
      const viewer = viewerRef.current;
      viewer.entities.values.forEach(entity => {
        if (entity.name === 'Inner Van Allen Belt' || entity.name === 'Outer Van Allen Belt') {
          entity.show = visible;
        }
      });
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
    <div className="relative w-full h-screen bg-slate-950">
      <LeftPanel
        currentWorld={currentWorld}
        onWorldChange={handleWorldChange}
        stats={stats}
      />

      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ marginLeft: '280px', marginRight: '320px' }}
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


      <RightPanel
        layers={layers}
        onLayerToggle={handleLayerToggle}
        onLayerOpacityChange={handleLayerOpacityChange}
        timeControl={timeControl}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
      />
    </div>
  );
}
