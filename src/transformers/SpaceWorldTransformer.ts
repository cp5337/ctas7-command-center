// Space World Transformer - converts satellites, orbits, radiation belts to GeoEntities

import { WorldTransformer } from './WorldTransformer';
import { GeoEntity } from '../core/GeoEntity';

interface Satellite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  norad_id?: string;
  status: string;
}

interface SpaceWorldData {
  satellites: Satellite[];
}

export class SpaceWorldTransformer implements WorldTransformer<SpaceWorldData> {
  transform(data: SpaceWorldData): GeoEntity[] {
    const entities: GeoEntity[] = [];

    // Transform satellites to points
    data.satellites.forEach(sat => {
      entities.push({
        id: sat.id,
        geometry: {
          type: 'point',
          coordinates: [sat.longitude, sat.latitude, sat.altitude * 1000]
        },
        properties: {
          name: sat.name,
          type: 'satellite',
          norad_id: sat.norad_id,
          status: sat.status,
          altitude_km: sat.altitude
        },
        style: {
          color: '#06b6d4',
          size: 0.8,
          icon: 'satellite',
          label: sat.name
        }
      });
    });

    return entities;
  }
}

