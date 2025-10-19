// Simple text-based GIS engine for testing
// Renders entities as a list with their properties

import { GISEngine } from '../core/GISEngine';
import { GeoEntity, LayerConfig } from '../core/GeoEntity';

export class TextGISEngine implements GISEngine {
  private container: HTMLElement | null = null;
  private layers: Map<string, { entities: GeoEntity[]; visible: boolean; config?: LayerConfig }> = new Map();

  initialize(container: HTMLElement | string): void {
    if (typeof container === 'string') {
      this.container = document.getElementById(container) || document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      throw new Error('Container not found');
    }

    // Style the container
    this.container.style.padding = '20px';
    this.container.style.backgroundColor = '#0f172a';
    this.container.style.color = '#e2e8f0';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.overflowY = 'auto';
    this.container.style.height = '100%';
  }

  addLayer(layerId: string, entities: GeoEntity[], config?: LayerConfig): void {
    this.layers.set(layerId, { entities, visible: config?.visible !== false, config });
    this.render();
  }

  updateLayer(layerId: string, entities: GeoEntity[]): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.entities = entities;
      this.render();
    }
  }

  hideLayer(layerId: string): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible = false;
      this.render();
    }
  }

  showLayer(layerId: string): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible = true;
      this.render();
    }
  }

  removeLayer(layerId: string): void {
    this.layers.delete(layerId);
    this.render();
  }

  setCamera(position: { lat: number; lon: number; height: number }): void {
    console.log('Camera set to:', position);
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.layers.clear();
  }

  private render(): void {
    if (!this.container) return;

    let html = '<div style="margin-bottom: 20px; padding: 10px; background: #1e293b; border-left: 4px solid #06b6d4;">';
    html += '<h2 style="margin: 0 0 10px 0; color: #06b6d4;">Universal GIS - Text Renderer</h2>';
    html += '<p style="margin: 0; color: #94a3b8; font-size: 11px;">Proof of concept: All Legion worlds visualized through one adapter</p>';
    html += '</div>';

    this.layers.forEach((layer, layerId) => {
      if (!layer.visible) return;

      html += `<div style="margin-bottom: 20px; padding: 15px; background: #1e293b; border-radius: 8px;">`;
      html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">`;
      html += `<h3 style="margin: 0; color: #22d3ee; font-size: 14px;">📍 Layer: ${layerId}</h3>`;
      html += `<span style="color: #94a3b8; font-size: 11px;">${layer.entities.length} entities</span>`;
      html += `</div>`;

      layer.entities.forEach((entity, index) => {
        const color = entity.style?.color || '#ffffff';
        const coords = this.formatCoordinates(entity.geometry);
        
        html += `<div style="margin: 8px 0; padding: 10px; background: #0f172a; border-left: 3px solid ${color}; border-radius: 4px;">`;
        html += `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">`;
        html += `<span style="color: ${color}; font-weight: bold;">${entity.properties.name || entity.id}</span>`;
        html += `<span style="color: #64748b; font-size: 10px;">${entity.geometry.type.toUpperCase()}</span>`;
        html += `</div>`;
        html += `<div style="color: #94a3b8; font-size: 11px; margin-bottom: 5px;">${coords}</div>`;
        
        // Show properties
        const props = Object.entries(entity.properties)
          .filter(([key]) => key !== 'name')
          .slice(0, 3); // Show first 3 properties
        
        if (props.length > 0) {
          html += `<div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #334155;">`;
          props.forEach(([key, value]) => {
            html += `<div style="color: #64748b; font-size: 10px;">`;
            html += `<span style="color: #94a3b8;">${key}:</span> ${this.formatValue(value)}`;
            html += `</div>`;
          });
          html += `</div>`;
        }
        
        html += `</div>`;
      });

      html += `</div>`;
    });

    this.container.innerHTML = html;
  }

  private formatCoordinates(geometry: GeoEntity['geometry']): string {
    switch (geometry.type) {
      case 'point':
        const [lon, lat, alt] = geometry.coordinates;
        return alt !== undefined
          ? `${lat.toFixed(4)}°, ${lon.toFixed(4)}°, ${(alt / 1000).toFixed(1)}km`
          : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
      
      case 'line':
        return `${geometry.coordinates.length} points`;
      
      case 'polygon':
        return `${geometry.coordinates[0].length} vertices`;
      
      case 'volume':
        return `${geometry.shape} at ${geometry.center[0].toFixed(2)}°, ${geometry.center[1].toFixed(2)}°`;
      
      default:
        return 'unknown';
    }
  }

  private formatValue(value: any): string {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    return String(value);
  }
}

