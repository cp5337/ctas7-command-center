// Universal geometry types - works for ANY Legion world

export interface Point {
  type: 'point';
  coordinates: [lon: number, lat: number, alt?: number];
}

export interface Line {
  type: 'line';
  coordinates: [lon: number, lat: number, alt?: number][];
}

export interface Polygon {
  type: 'polygon';
  coordinates: [lon: number, lat: number, alt?: number][][];
}

export interface Volume {
  type: 'volume';
  shape: 'sphere' | 'ellipsoid' | 'cylinder' | 'box';
  center: [lon: number, lat: number, alt: number];
  dimensions: any;
}

export type Geometry = Point | Line | Polygon | Volume;

export interface RenderStyle {
  color?: string;
  size?: number;
  width?: number;
  opacity?: number;
  icon?: string;
  label?: string;
  animated?: boolean;
  dashed?: boolean;
}

export interface GeoEntity {
  id: string;
  geometry: Geometry;
  properties: Record<string, any>;
  style?: RenderStyle;
}

export interface LayerConfig {
  visible?: boolean;
  interactive?: boolean;
  zIndex?: number;
}

