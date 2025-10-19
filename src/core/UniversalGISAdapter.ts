// Universal GIS Adapter - works with ANY Legion world

import { GISEngine } from './GISEngine';
import { GeoEntity, LayerConfig } from './GeoEntity';

export class UniversalGISAdapter {
  private engine: GISEngine;
  private layers: Map<string, { worldId: string; entities: GeoEntity[]; config?: LayerConfig }> = new Map();

  constructor(engine: GISEngine) {
    this.engine = engine;
  }

  initialize(container: HTMLElement | string): void {
    this.engine.initialize(container);
  }

  /**
   * Show entities from any Legion world
   * @param worldId - Identifier for the world (e.g., 'space', 'network', 'ground')
   * @param entities - Array of GeoEntities (world-agnostic geometry + metadata)
   * @param config - Optional layer configuration
   * @returns Layer ID for future updates
   */
  showEntities(worldId: string, entities: GeoEntity[], config?: LayerConfig): string {
    const layerId = `${worldId}-${Date.now()}`;
    
    this.engine.addLayer(layerId, entities, config);
    this.layers.set(layerId, { worldId, entities, config });
    
    return layerId;
  }

  /**
   * Update entities in an existing layer
   */
  updateEntities(layerId: string, entities: GeoEntity[]): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      this.engine.updateLayer(layerId, entities);
      layer.entities = entities;
    }
  }

  /**
   * Hide a layer (keeps data, just hides rendering)
   */
  hideLayer(layerId: string): void {
    this.engine.hideLayer(layerId);
  }

  /**
   * Show a previously hidden layer
   */
  showLayer(layerId: string): void {
    this.engine.showLayer(layerId);
  }

  /**
   * Remove a layer completely
   */
  removeLayer(layerId: string): void {
    this.engine.removeLayer(layerId);
    this.layers.delete(layerId);
  }

  /**
   * Get all layers for a specific world
   */
  getWorldLayers(worldId: string): string[] {
    return Array.from(this.layers.entries())
      .filter(([_, layer]) => layer.worldId === worldId)
      .map(([layerId]) => layerId);
  }

  /**
   * Remove all layers for a specific world
   */
  removeWorld(worldId: string): void {
    const layerIds = this.getWorldLayers(worldId);
    layerIds.forEach(layerId => this.removeLayer(layerId));
  }

  /**
   * Set camera position
   */
  setCamera(position: { lat: number; lon: number; height: number }): void {
    this.engine.setCamera(position);
  }

  /**
   * Destroy the GIS engine
   */
  destroy(): void {
    this.engine.destroy();
    this.layers.clear();
  }
}

