// World Transformer interface - converts domain data to GeoEntities

import { GeoEntity } from '../core/GeoEntity';

export interface WorldTransformer<T = any> {
  transform(data: T): GeoEntity[];
}

