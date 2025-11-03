/**
 * CTAS7 Multi-World Manager - Phase 1 Implementation
 * Manages multiple operational worlds with fusion capabilities
 */

import { JulianDate } from 'cesium';
import { FusionCore, FusedEntity, DomainType, FusionContext } from '../core/FusionCore';

export type WorldType = 'production' | 'staging' | 'sandbox' | 'fusion';

export interface WorldConfiguration {
  id: WorldType;
  name: string;
  description: string;
  fusionEnabled: boolean;
  domains: DomainType[];
  maxEntities: number;
  correlationRadius: number;
  updateFrequency: number; // ms
}

export interface WorldState {
  id: WorldType;
  entityCount: number;
  lastUpdate: JulianDate;
  status: 'active' | 'suspended' | 'maintenance';
  performance: {
    renderTime: number;
    correlationTime: number;
    memoryUsage: number;
  };
}

export interface CrossWorldCorrelation {
  sourceWorld: WorldType;
  targetWorld: WorldType;
  correlatedEntities: string[];
  confidence: number;
  timestamp: JulianDate;
}

export class WorldManager {
  private worlds: Map<WorldType, FusionCore> = new Map();
  private configurations: Map<WorldType, WorldConfiguration> = new Map();
  private activeWorld: WorldType = 'production';
  private crossWorldCorrelations: CrossWorldCorrelation[] = [];
  private eventBus: EventTarget = new EventTarget();

  constructor() {
    this.initializeWorlds();
    this.startPerformanceMonitoring();
  }

  private initializeWorlds(): void {
    const configs: WorldConfiguration[] = [
      {
        id: 'production',
        name: 'Production Environment',
        description: 'Live operational data with full fusion capabilities',
        fusionEnabled: true,
        domains: ['space', 'geospatial', 'maritime', 'network', 'cyber'],
        maxEntities: 50000,
        correlationRadius: 10000,
        updateFrequency: 1000
      },
      {
        id: 'staging',
        name: 'Staging Environment',
        description: 'Pre-production testing with limited fusion',
        fusionEnabled: true,
        domains: ['space', 'geospatial', 'maritime'],
        maxEntities: 10000,
        correlationRadius: 15000,
        updateFrequency: 2000
      },
      {
        id: 'sandbox',
        name: 'Sandbox Environment',
        description: 'Experimental environment for testing new algorithms',
        fusionEnabled: false,
        domains: ['space', 'geospatial'],
        maxEntities: 5000,
        correlationRadius: 20000,
        updateFrequency: 5000
      },
      {
        id: 'fusion',
        name: 'Cross-Domain Fusion Lab',
        description: 'Advanced fusion research with all domains',
        fusionEnabled: true,
        domains: ['space', 'geospatial', 'maritime', 'network', 'cyber'],
        maxEntities: 100000,
        correlationRadius: 5000,
        updateFrequency: 500
      }
    ];

    configs.forEach(config => {
      this.configurations.set(config.id, config);
      const fusionCore = new FusionCore();

      // Configure fusion context based on world settings
      const context: Partial<FusionContext> = {
        correlationRadius: config.correlationRadius,
        activeDomains: config.domains
      };
      fusionCore.setContext(context);

      // Set up event listeners for cross-world correlation
      fusionCore.addEventListener('entity-registered', this.handleEntityEvent.bind(this, config.id));
      fusionCore.addEventListener('entity-updated', this.handleEntityEvent.bind(this, config.id));
      fusionCore.addEventListener('correlation-found', this.handleCorrelationEvent.bind(this, config.id));

      this.worlds.set(config.id, fusionCore);
    });

    console.log('✅ Initialized all operational worlds with fusion capabilities');
  }

  /**
   * Switch active world and update UI context
   */
  public switchWorld(worldId: WorldType): void {
    if (!this.worlds.has(worldId)) {
      throw new Error(`World ${worldId} does not exist`);
    }

    const previousWorld = this.activeWorld;
    this.activeWorld = worldId;

    this.emitEvent('world-switched', {
      from: previousWorld,
      to: worldId,
      timestamp: JulianDate.now()
    });

    console.log(`🌍 Switched from ${previousWorld} to ${worldId} world`);
  }

  /**
   * Get active fusion core for current world
   */
  public getActiveFusionCore(): FusionCore {
    const core = this.worlds.get(this.activeWorld);
    if (!core) {
      throw new Error(`Active world ${this.activeWorld} fusion core not found`);
    }
    return core;
  }

  /**
   * Get fusion core for specific world
   */
  public getFusionCore(worldId: WorldType): FusionCore | undefined {
    return this.worlds.get(worldId);
  }

  /**
   * Add entity to specific world
   */
  public addEntityToWorld(worldId: WorldType, entity: FusedEntity): void {
    const world = this.worlds.get(worldId);
    const config = this.configurations.get(worldId);

    if (!world || !config) {
      throw new Error(`World ${worldId} not found`);
    }

    // Check entity limit
    const currentCount = this.getWorldEntityCount(worldId);
    if (currentCount >= config.maxEntities) {
      console.warn(`⚠️ World ${worldId} at entity limit (${config.maxEntities})`);
      return;
    }

    world.registerEntity(entity);

    // Trigger cross-world correlation if fusion enabled
    if (config.fusionEnabled) {
      this.performCrossWorldCorrelation(worldId, entity);
    }
  }

  /**
   * Update entity in specific world
   */
  public updateEntityInWorld(worldId: WorldType, globalId: string, domainData: Partial<FusedEntity>): void {
    const world = this.worlds.get(worldId);
    if (world) {
      world.updateEntity(globalId, domainData);
    }
  }

  /**
   * Perform cross-world correlation analysis
   */
  private performCrossWorldCorrelation(sourceWorldId: WorldType, entity: FusedEntity): void {
    const sourceConfig = this.configurations.get(sourceWorldId);
    if (!sourceConfig?.fusionEnabled) return;

    for (const [targetWorldId, targetWorld] of this.worlds) {
      if (targetWorldId === sourceWorldId) continue;

      const targetConfig = this.configurations.get(targetWorldId);
      if (!targetConfig?.fusionEnabled) continue;

      // Find similar entities in target world
      const targetEntities = targetWorld.getEntitiesByDomain(entity.domains?.[0] || 'space');
      const correlatedIds: string[] = [];

      targetEntities.forEach(targetEntity => {
        if (this.areEntitiesSimilar(entity, targetEntity)) {
          correlatedIds.push(targetEntity.globalId);
        }
      });

      if (correlatedIds.length > 0) {
        const correlation: CrossWorldCorrelation = {
          sourceWorld: sourceWorldId,
          targetWorld: targetWorldId,
          correlatedEntities: correlatedIds,
          confidence: this.calculateCorrelationConfidence(entity, correlatedIds.length),
          timestamp: JulianDate.now()
        };

        this.crossWorldCorrelations.push(correlation);
        this.emitEvent('cross-world-correlation', { correlation });
      }
    }
  }

  private areEntitiesSimilar(entity1: FusedEntity, entity2: FusedEntity): boolean {
    // Compare based on domain-specific attributes
    if (entity1.spaceRepresentation && entity2.spaceRepresentation) {
      return entity1.spaceRepresentation.noradId === entity2.spaceRepresentation.noradId ||
             entity1.spaceRepresentation.constellation === entity2.spaceRepresentation.constellation;
    }

    if (entity1.maritimeRepresentation && entity2.maritimeRepresentation) {
      return entity1.maritimeRepresentation.imo === entity2.maritimeRepresentation.imo ||
             entity1.maritimeRepresentation.mmsi === entity2.maritimeRepresentation.mmsi;
    }

    if (entity1.networkRepresentation && entity2.networkRepresentation) {
      return entity1.networkRepresentation.nodeId === entity2.networkRepresentation.nodeId;
    }

    return false;
  }

  private calculateCorrelationConfidence(entity: FusedEntity, correlatedCount: number): number {
    // Base confidence on entity completeness and correlation count
    let confidence = 0.5;

    // Boost confidence based on available domains
    const domainCount = [
      entity.spaceRepresentation,
      entity.geoRepresentation,
      entity.maritimeRepresentation,
      entity.networkRepresentation,
      entity.cyberRepresentation
    ].filter(Boolean).length;

    confidence += domainCount * 0.1;

    // Adjust based on correlation count
    confidence += Math.min(correlatedCount * 0.05, 0.3);

    return Math.min(confidence, 1.0);
  }

  /**
   * Get world performance statistics
   */
  public getWorldState(worldId: WorldType): WorldState | undefined {
    const world = this.worlds.get(worldId);
    if (!world) return undefined;

    return {
      id: worldId,
      entityCount: this.getWorldEntityCount(worldId),
      lastUpdate: JulianDate.now(),
      status: 'active',
      performance: {
        renderTime: 16, // Mock data - would be measured in real implementation
        correlationTime: 5,
        memoryUsage: this.getWorldEntityCount(worldId) * 0.1 // MB estimate
      }
    };
  }

  private getWorldEntityCount(worldId: WorldType): number {
    const world = this.worlds.get(worldId);
    if (!world) return 0;

    // Access private entities map through a public method
    return world.getEntitiesByDomain('space').length +
           world.getEntitiesByDomain('geospatial').length +
           world.getEntitiesByDomain('maritime').length +
           world.getEntitiesByDomain('network').length +
           world.getEntitiesByDomain('cyber').length;
  }

  /**
   * Get all world states for dashboard
   */
  public getAllWorldStates(): WorldState[] {
    const states: WorldState[] = [];
    for (const worldId of this.worlds.keys()) {
      const state = this.getWorldState(worldId);
      if (state) states.push(state);
    }
    return states;
  }

  /**
   * Get cross-world correlations
   */
  public getCrossWorldCorrelations(): CrossWorldCorrelation[] {
    return [...this.crossWorldCorrelations];
  }

  /**
   * Maritime domain specific methods
   */
  public addMaritimeVessel(worldId: WorldType, vessel: {
    imo?: string;
    mmsi?: string;
    name: string;
    coordinates: [number, number];
    vesselType: string;
    speed?: number;
    heading?: number;
  }): void {
    const entity: FusedEntity = {
      globalId: `maritime-${vessel.imo || vessel.mmsi || vessel.name}`,
      entityType: 'vessel',
      maritimeRepresentation: {
        imo: vessel.imo,
        mmsi: vessel.mmsi,
        vesselType: vessel.vesselType,
        speed: vessel.speed,
        heading: vessel.heading
      },
      geoRepresentation: {
        coordinates: vessel.coordinates,
        terrain: 'ocean',
        climate: 'maritime'
      },
      correlationConfidence: 0.8,
      lastUpdateTime: JulianDate.now(),
      fusionRules: [],
      ontologyPath: ['maritime', 'vessel', vessel.vesselType]
    };

    this.addEntityToWorld(worldId, entity);
  }

  private handleEntityEvent(worldId: WorldType, event: Event): void {
    const customEvent = event as CustomEvent;
    this.emitEvent('world-entity-event', {
      worldId,
      eventType: event.type,
      entity: customEvent.detail.entity
    });
  }

  private handleCorrelationEvent(worldId: WorldType, event: Event): void {
    const customEvent = event as CustomEvent;
    this.emitEvent('world-correlation-event', {
      worldId,
      correlation: customEvent.detail
    });
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const states = this.getAllWorldStates();
      this.emitEvent('performance-update', { states });
    }, 5000); // Update every 5 seconds
  }

  private emitEvent(type: string, detail: any): void {
    this.eventBus.dispatchEvent(new CustomEvent(type, { detail }));
  }

  public addEventListener(type: string, listener: EventListener): void {
    this.eventBus.addEventListener(type, listener);
  }

  public removeEventListener(type: string, listener: EventListener): void {
    this.eventBus.removeEventListener(type, listener);
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    for (const world of this.worlds.values()) {
      // Cleanup would go here if FusionCore had destroy method
    }
    this.worlds.clear();
    this.configurations.clear();
    this.crossWorldCorrelations.length = 0;
  }
}

export default WorldManager;