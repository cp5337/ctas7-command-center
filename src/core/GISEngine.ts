// GIS Engine interface - any renderer can implement this

import { GeoEntity, LayerConfig } from './GeoEntity';

export interface GISEngine {
  initialize(container: HTMLElement | string): void;
  addLayer(layerId: string, entities: GeoEntity[], config?: LayerConfig): void;
  updateLayer(layerId: string, entities: GeoEntity[]): void;
  hideLayer(layerId: string): void;
  showLayer(layerId: string): void;
  removeLayer(layerId: string): void;
  setCamera(position: { lat: number; lon: number; height: number }): void;
  destroy(): void;
}

