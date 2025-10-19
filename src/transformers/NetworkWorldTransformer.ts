// Network World Transformer - converts ground stations and links to GeoEntities

import { WorldTransformer } from './WorldTransformer';
import { GeoEntity } from '../core/GeoEntity';

interface GroundStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  tier: number;
  display_tag?: string;
  status: string;
}

interface NetworkLink {
  id: string;
  from_id: string;
  to_id: string;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  status: string;
  bandwidth_gbps: number;
  latency_ms: number;
}

interface NetworkWorldData {
  groundStations: GroundStation[];
  links?: NetworkLink[];
}

export class NetworkWorldTransformer implements WorldTransformer<NetworkWorldData> {
  transform(data: NetworkWorldData): GeoEntity[] {
    const entities: GeoEntity[] = [];

    // Transform ground stations to points
    data.groundStations.forEach(station => {
      const tierColors = {
        1: '#10b981',
        2: '#3b82f6',
        3: '#6b7280'
      };

      entities.push({
        id: station.id,
        geometry: {
          type: 'point',
          coordinates: [station.longitude, station.latitude]
        },
        properties: {
          name: station.name,
          type: 'ground-station',
          tier: station.tier,
          display_tag: station.display_tag,
          status: station.status
        },
        style: {
          color: tierColors[station.tier as keyof typeof tierColors] || '#6b7280',
          size: 10 - station.tier * 2,
          label: station.display_tag || station.name
        }
      });
    });

    // Transform network links to lines
    if (data.links) {
      data.links.forEach(link => {
        const statusColors = {
          active: '#10b981',
          congested: '#f59e0b',
          degraded: '#fb923c',
          offline: '#ef4444'
        };

        entities.push({
          id: link.id,
          geometry: {
            type: 'line',
            coordinates: [
              [link.from_lon, link.from_lat],
              [link.to_lon, link.to_lat]
            ]
          },
          properties: {
            type: 'network-link',
            status: link.status,
            bandwidth_gbps: link.bandwidth_gbps,
            latency_ms: link.latency_ms
          },
          style: {
            color: statusColors[link.status as keyof typeof statusColors] || '#ef4444',
            width: 2,
            animated: true
          }
        });
      });
    }

    return entities;
  }
}

