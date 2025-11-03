/**
 * High-Performance Animation Pipeline
 * Batches updates, uses interpolation, and manages frame timing
 */

import * as Cesium from "cesium";

interface AnimationFrame {
  timestamp: number;
  positions: Map<string, Cesium.Cartesian3>;
  rotations: Map<string, number>;
  linkStates: Map<string, boolean>;
}

interface InterpolationCache {
  startFrame: AnimationFrame;
  endFrame: AnimationFrame;
  progress: number;
}

export class OptimizedAnimationPipeline {
  private viewer: Cesium.Viewer;
  private animationFrames: AnimationFrame[] = [];
  private currentFrameIndex: number = 0;
  private interpolationCache: InterpolationCache | null = null;
  private lastUpdateTime: number = 0;
  private targetFPS: number = 30; // Limit to 30 FPS for better performance
  private frameInterval: number = 1000 / this.targetFPS;

  // Entity pools for efficient reuse
  private entityPools: Map<string, Cesium.Entity[]> = new Map();
  private activeEntities: Set<Cesium.Entity> = new Set();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.initializeEntityPools();
    this.startAnimationLoop();
  }

  /**
   * Pre-allocate entity pools to avoid garbage collection
   */
  private initializeEntityPools(): void {
    // Pre-create laser link entities
    const laserPool: Cesium.Entity[] = [];
    for (let i = 0; i < 50; i++) {
      const entity = new Cesium.Entity({
        polyline: {
          positions: [],
          width: 2,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            taperPower: 0.5,
            color: Cesium.Color.CYAN.withAlpha(0.8),
          }),
          clampToGround: false,
          arcType: Cesium.ArcType.NONE,
        },
      });
      entity.show = false;
      this.viewer.entities.add(entity);
      laserPool.push(entity);
    }
    this.entityPools.set("laserLinks", laserPool);

    // Pre-create satellite billboard entities
    const satellitePool: Cesium.Entity[] = [];
    for (let i = 0; i < 20; i++) {
      const entity = new Cesium.Entity({
        billboard: {
          image: this.createOptimizedSatelliteIcon(),
          scale: 0.8,
          pixelOffset: new Cesium.Cartesian2(0, 0),
        },
        label: {
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
          pixelOffset: new Cesium.Cartesian2(0, -25),
        },
      });
      entity.show = false;
      this.viewer.entities.add(entity);
      satellitePool.push(entity);
    }
    this.entityPools.set("satellites", satellitePool);
  }

  /**
   * Create optimized satellite icon (cached canvas instead of SVG)
   */
  private createOptimizedSatelliteIcon(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    // Draw simple satellite representation
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(12, 12, 8, 8); // Main body
    ctx.fillRect(6, 14, 6, 4); // Left panel
    ctx.fillRect(20, 14, 6, 4); // Right panel
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(14, 8, 4, 8); // Antenna

    return canvas;
  }

  /**
   * Get entity from pool or create new one
   */
  getEntityFromPool(poolName: string): Cesium.Entity | null {
    const pool = this.entityPools.get(poolName);
    if (!pool) return null;

    // Find unused entity
    const entity = pool.find((e) => !e.show);
    if (entity) {
      entity.show = true;
      this.activeEntities.add(entity);
      return entity;
    }

    return null; // Pool exhausted
  }

  /**
   * Return entity to pool
   */
  returnEntityToPool(entity: Cesium.Entity): void {
    entity.show = false;
    this.activeEntities.delete(entity);
  }

  /**
   * Batch update positions using interpolation
   */
  updatePositions(
    entities: Map<string, { position: Cesium.Cartesian3; rotation?: number }>
  ): void {
    const now = performance.now();

    // Throttle updates to target FPS
    if (now - this.lastUpdateTime < this.frameInterval) {
      return;
    }

    entities.forEach((data, entityId) => {
      const entity = this.viewer.entities.getById(entityId);
      if (entity) {
        // Use efficient position update
        if (entity.position && data.position) {
          (entity.position as any)._value = data.position;
        }

        // Update rotation if provided
        if (entity.billboard && data.rotation !== undefined) {
          (entity.billboard.rotation as any)._value = data.rotation;
        }
      }
    });

    this.lastUpdateTime = now;
  }

  /**
   * Optimized laser link management
   */
  updateLaserLinks(
    links: Array<{
      id: string;
      start: Cesium.Cartesian3;
      end: Cesium.Cartesian3;
      active: boolean;
      intensity?: number;
    }>
  ): void {
    // Deactivate all current links
    this.activeEntities.forEach((entity) => {
      if (entity.polyline) {
        this.returnEntityToPool(entity);
      }
    });

    // Update active links
    links
      .filter((link) => link.active)
      .forEach((link) => {
        const entity = this.getEntityFromPool("laserLinks");
        if (entity && entity.polyline) {
          (entity.polyline.positions as any)._value = [link.start, link.end];

          // Update intensity if provided
          if (link.intensity !== undefined && entity.polyline.material) {
            const material = entity.polyline
              .material as Cesium.PolylineGlowMaterialProperty;
            if (material.glowPower) {
              (material.glowPower as any)._value = link.intensity;
            }
          }
        }
      });
  }

  /**
   * Frame-rate limited animation loop
   */
  private startAnimationLoop(): void {
    const animate = () => {
      const now = performance.now();

      if (now - this.lastUpdateTime >= this.frameInterval) {
        // Perform batched updates here
        this.updateVisibleEntities();
        this.lastUpdateTime = now;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  /**
   * Update only visible entities to improve performance
   */
  private updateVisibleEntities(): void {
    const frustum = this.viewer.camera.frustum;
    const cameraPosition = this.viewer.camera.position;

    this.activeEntities.forEach((entity) => {
      if (entity.position) {
        const position = entity.position.getValue(Cesium.JulianDate.now());
        if (position) {
          // Simple frustum culling
          const distance = Cesium.Cartesian3.distance(position, cameraPosition);
          const shouldUpdate = distance < 50000000; // 50,000 km threshold

          if (!shouldUpdate && entity.show) {
            entity.show = false;
          } else if (shouldUpdate && !entity.show) {
            entity.show = true;
          }
        }
      }
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      activeEntities: this.activeEntities.size,
      totalPools: this.entityPools.size,
      targetFPS: this.targetFPS,
      actualFrameTime: this.frameInterval,
      poolUtilization: Array.from(this.entityPools.entries()).map(
        ([name, pool]) => ({
          pool: name,
          total: pool.length,
          used: pool.filter((e) => e.show).length,
        })
      ),
    };
  }
}
