// Universal GIS Demo - Proof of Concept
// Shows how ONE GIS adapter works with multiple Legion worlds

import { useEffect, useRef, useState } from 'react';
import { UniversalGISAdapter } from '../core/UniversalGISAdapter';
import { TextGISEngine } from '../engines/TextGISEngine';
import { SpaceWorldTransformer } from '../transformers/SpaceWorldTransformer';
import { NetworkWorldTransformer } from '../transformers/NetworkWorldTransformer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function UniversalGISDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gisRef = useRef<UniversalGISAdapter | null>(null);
  const [activeWorld, setActiveWorld] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Universal GIS with Text Engine
    const engine = new TextGISEngine();
    const gis = new UniversalGISAdapter(engine);
    gis.initialize(containerRef.current);
    gisRef.current = gis;

    return () => {
      gis.destroy();
    };
  }, []);

  const showSpaceWorld = () => {
    if (!gisRef.current) return;

    // Remove other worlds
    if (activeWorld) {
      gisRef.current.removeWorld(activeWorld);
    }

    // Mock space world data
    const spaceData = {
      satellites: [
        {
          id: 'sat-001',
          name: 'CTAS-Alpha',
          latitude: 45.5,
          longitude: -122.6,
          altitude: 550,
          norad_id: '12345',
          status: 'active'
        },
        {
          id: 'sat-002',
          name: 'CTAS-Beta',
          latitude: -33.8,
          longitude: 151.2,
          altitude: 575,
          norad_id: '12346',
          status: 'active'
        },
        {
          id: 'sat-003',
          name: 'CTAS-Gamma',
          latitude: 51.5,
          longitude: -0.1,
          altitude: 560,
          norad_id: '12347',
          status: 'commissioning'
        }
      ]
    };

    // Transform and visualize
    const transformer = new SpaceWorldTransformer();
    const entities = transformer.transform(spaceData);
    gisRef.current.showEntities('space', entities);
    setActiveWorld('space');
  };

  const showNetworkWorld = () => {
    if (!gisRef.current) return;

    // Remove other worlds
    if (activeWorld) {
      gisRef.current.removeWorld(activeWorld);
    }

    // Mock network world data
    const networkData = {
      groundStations: [
        {
          id: 'gs-001',
          name: 'Dubai Strategic Hub',
          latitude: 25.2048,
          longitude: 55.2708,
          tier: 1,
          display_tag: 'GN-001-Dubai-T1',
          status: 'active'
        },
        {
          id: 'gs-002',
          name: 'Johannesburg Hub',
          latitude: -26.2041,
          longitude: 28.0473,
          tier: 1,
          display_tag: 'GN-002-JNB-T1',
          status: 'active'
        },
        {
          id: 'gs-003',
          name: 'Fortaleza Hub',
          latitude: -3.7319,
          longitude: -38.5267,
          tier: 2,
          display_tag: 'GN-003-FOR-T2',
          status: 'active'
        },
        {
          id: 'gs-004',
          name: 'Tokyo Relay',
          latitude: 35.6762,
          longitude: 139.6503,
          tier: 2,
          display_tag: 'GN-004-TYO-T2',
          status: 'active'
        }
      ],
      links: [
        {
          id: 'link-001',
          from_id: 'gs-001',
          to_id: 'gs-002',
          from_lat: 25.2048,
          from_lon: 55.2708,
          to_lat: -26.2041,
          to_lon: 28.0473,
          status: 'active',
          bandwidth_gbps: 100,
          latency_ms: 45
        },
        {
          id: 'link-002',
          from_id: 'gs-002',
          to_id: 'gs-003',
          from_lat: -26.2041,
          from_lon: 28.0473,
          to_lat: -3.7319,
          to_lon: -38.5267,
          status: 'congested',
          bandwidth_gbps: 80,
          latency_ms: 120
        }
      ]
    };

    // Transform and visualize
    const transformer = new NetworkWorldTransformer();
    const entities = transformer.transform(networkData);
    gisRef.current.showEntities('network', entities);
    setActiveWorld('network');
  };

  const showBothWorlds = () => {
    if (!gisRef.current) return;

    // Remove existing
    if (activeWorld) {
      gisRef.current.removeWorld(activeWorld);
    }

    // Show both worlds simultaneously
    showSpaceWorld();
    showNetworkWorld();
    setActiveWorld('fusion');
  };

  const clearAll = () => {
    if (!gisRef.current || !activeWorld) return;
    gisRef.current.removeWorld(activeWorld);
    setActiveWorld(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-900 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">
              Universal GIS Infrastructure - Proof of Concept
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              One GIS adapter, multiple Legion worlds. No recoding needed for new worlds.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={showSpaceWorld}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                🛰️ Show Space World
              </Button>
              <Button
                onClick={showNetworkWorld}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                🌐 Show Network World
              </Button>
              <Button
                onClick={showBothWorlds}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🔀 Show Fusion (Both)
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="border-slate-600 hover:bg-slate-800"
              >
                Clear All
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">How it works:</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>✅ <strong>Space World</strong>: Satellites → Points with altitude</li>
                <li>✅ <strong>Network World</strong>: Ground stations → Points, Links → Lines</li>
                <li>✅ <strong>Same GIS adapter</strong>: No recoding, just different transformers</li>
                <li>✅ <strong>Fusion World</strong>: Multiple worlds visualized together</li>
                <li>🔄 <strong>Next</strong>: Replace TextGISEngine with CesiumEngine for 3D</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div
          ref={containerRef}
          className="w-full h-[600px] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
        />
      </div>
    </div>
  );
}

