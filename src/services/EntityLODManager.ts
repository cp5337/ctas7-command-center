/**
 * Entity Level-of-Detail Manager
 * Optimizes rendering performance by showing/hiding entities based on camera distance
 */

import * as Cesium from "cesium";

interface LODEntity {
  entity: Cesium.Entity;
  minDistance: number;
  maxDistance: number;
  category: "ground" | "satellite" | "link" | "label";
  priority: "high" | "medium" | "low";
}

export class EntityLODManager {
  private viewer: Cesium.Viewer;
  private lodEntities: Map<string, LODEntity> = new Map();
  private lastCameraHeight: number = 0;
  private updateThreshold: number = 100000; // Only update when camera moves significantly

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.setupCameraChangeHandler();
  }

  /**
   * Register an entity for LOD management
   */
  registerEntity(
    id: string,
    entity: Cesium.Entity,
    category: LODEntity["category"],
    priority: LODEntity["priority"] = "medium"
  ): void {
    const lodConfig = this.getLODConfig(category, priority);

    this.lodEntities.set(id, {
      entity,
      minDistance: lodConfig.minDistance,
      maxDistance: lodConfig.maxDistance,
      category,
      priority,
    });
  }

  /**
   * Get LOD configuration based on entity type and priority
   */
  private getLODConfig(
    category: LODEntity["category"],
    priority: LODEntity["priority"]
  ) {
    const configs = {
      ground: {
        high: { minDistance: 0, maxDistance: 50000000 }, // Always visible for critical stations
        medium: { minDistance: 0, maxDistance: 25000000 },
        low: { minDistance: 0, maxDistance: 10000000 },
      },
      satellite: {
        high: { minDistance: 0, maxDistance: 100000000 },
        medium: { minDistance: 0, maxDistance: 50000000 },
        low: { minDistance: 0, maxDistance: 25000000 },
      },
      link: {
        high: { minDistance: 0, maxDistance: 15000000 }, // Links visible at medium zoom
        medium: { minDistance: 0, maxDistance: 8000000 },
        low: { minDistance: 0, maxDistance: 3000000 },
      },
      label: {
        high: { minDistance: 0, maxDistance: 5000000 }, // Labels only at close zoom
        medium: { minDistance: 0, maxDistance: 2000000 },
        low: { minDistance: 0, maxDistance: 800000 },
      },
    };

    return configs[category][priority];
  }

  /**
   * Setup camera change handler for LOD updates
   */
  private setupCameraChangeHandler(): void {
    this.viewer.camera.changed.addEventListener(() => {
      const currentHeight = this.viewer.camera.positionCartographic.height;

      // Only update if camera moved significantly
      if (
        Math.abs(currentHeight - this.lastCameraHeight) > this.updateThreshold
      ) {
        this.updateEntityVisibility(currentHeight);
        this.lastCameraHeight = currentHeight;
      }
    });
  }

  /**
   * Update entity visibility based on camera distance
   */
  private updateEntityVisibility(cameraHeight: number): void {
    this.lodEntities.forEach((lodEntity) => {
      const shouldShow =
        cameraHeight >= lodEntity.minDistance &&
        cameraHeight <= lodEntity.maxDistance;
      lodEntity.entity.show = shouldShow;
    });
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const visible = Array.from(this.lodEntities.values()).filter(
      (e) => e.entity.show
    ).length;
    const total = this.lodEntities.size;

    return {
      totalEntities: total,
      visibleEntities: visible,
      culledEntities: total - visible,
      cullingRatio: (((total - visible) / total) * 100).toFixed(1) + "%",
    };
  }
}
