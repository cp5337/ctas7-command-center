import { supabase } from '@/lib/supabase';
import { GroundStationData, SatelliteData, NetworkLinkData } from './cesiumWorldManager';

export interface InitialDataPayload {
  ground_stations: GroundStationData[];
  satellites: SatelliteData[];
  network_links: NetworkLinkData[];
}

// Mock data for demo when Supabase is not configured
function getMockData(): InitialDataPayload {
  return {
    ground_stations: [
      { id: 'gs-1', name: 'New York', latitude: 40.7128, longitude: -74.0060, altitude: 100, status: 'operational' as const },
      { id: 'gs-2', name: 'London', latitude: 51.5074, longitude: -0.1278, altitude: 100, status: 'operational' as const },
      { id: 'gs-3', name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, altitude: 100, status: 'operational' as const },
      { id: 'gs-4', name: 'Sydney', latitude: -33.8688, longitude: 151.2093, altitude: 100, status: 'operational' as const },
      { id: 'gs-5', name: 'São Paulo', latitude: -23.5505, longitude: -46.6333, altitude: 100, status: 'operational' as const },
      { id: 'gs-6', name: 'Dubai', latitude: 25.2048, longitude: 55.2708, altitude: 100, status: 'operational' as const },
    ],
    satellites: [
      { id: 'sat-1', name: 'SAT-ALPHA', latitude: 0, longitude: 0, altitude: 550000, inclination: 53, status: 'operational' },
      { id: 'sat-2', name: 'SAT-BETA', latitude: 20, longitude: 45, altitude: 550000, inclination: 53, status: 'operational' },
      { id: 'sat-3', name: 'SAT-GAMMA', latitude: -15, longitude: 90, altitude: 550000, inclination: 53, status: 'operational' },
      { id: 'sat-4', name: 'SAT-DELTA', latitude: 30, longitude: -120, altitude: 550000, inclination: 53, status: 'operational' },
      { id: 'sat-5', name: 'SAT-EPSILON', latitude: -25, longitude: -60, altitude: 550000, inclination: 53, status: 'operational' },
      { id: 'sat-6', name: 'SAT-ZETA', latitude: 10, longitude: 135, altitude: 550000, inclination: 53, status: 'operational' },
    ],
    network_links: [
      { id: 'link-1', source_id: 'gs-1', target_id: 'sat-1', status: 'active' as const },
      { id: 'link-2', source_id: 'gs-2', target_id: 'sat-2', status: 'active' as const },
      { id: 'link-3', source_id: 'gs-3', target_id: 'sat-3', status: 'active' as const },
      { id: 'link-4', source_id: 'gs-4', target_id: 'sat-4', status: 'active' as const },
    ]
  };
}

export async function loadInitialData(): Promise<InitialDataPayload> {
  try {
    const [groundStations, satellites, links] = await Promise.all([
      supabase.from('ground_nodes').select('*'),
      supabase.from('satellites').select('*'),
      supabase.from('beams').select('*')
    ]);

    const payload = {
      ground_stations: (groundStations.data || []).map(station => ({
        id: station.id,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        altitude: station.altitude || 0,
        status: station.status || 'operational',
        type: station.type || 'ground_station'
      })),
      satellites: (satellites.data || []).map(sat => ({
        id: sat.id,
        name: sat.name,
        norad_id: sat.norad_id,
        latitude: sat.latitude || 0,
        longitude: sat.longitude || 0,
        altitude: sat.altitude || 400000,
        velocity: sat.velocity || 7660,
        inclination: sat.inclination || 51.6,
        status: sat.status || 'operational'
      })),
      network_links: (links.data || []).map(link => ({
        id: link.id,
        source_id: link.source_node_id,
        target_id: link.target_node_id,
        type: link.beam_type || 'active',
        bandwidth: link.throughput_gbps || 0,
        latency: link.latency_ms || 0,
        status: link.beam_status || 'active'
      }))
    };
    
    // If no data from Supabase, use mock data for demo
    if (payload.ground_stations.length === 0 && payload.satellites.length === 0) {
      console.log('📦 Using mock data for demo (Supabase not configured)');
      return getMockData();
    }
    
    return payload;
  } catch (error) {
    console.error('Failed to load initial data:', error);
    console.log('📦 Using mock data for demo');
    return getMockData();
  }
}

export function generateSatellitePosition(satellite: SatelliteData, time: Date = new Date()) {
  const now = time.getTime();
  const orbitalPeriod = 5400000;
  const phase = (now % orbitalPeriod) / orbitalPeriod * 2 * Math.PI;

  const inclination = satellite.inclination || 51.6;
  const altitude = satellite.altitude || 400000;

  return {
    latitude: Math.sin(phase) * inclination,
    longitude: (phase * 180 / Math.PI) % 360 - 180,
    altitude: altitude
  };
}
