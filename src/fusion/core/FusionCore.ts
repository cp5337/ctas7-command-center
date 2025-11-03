/**
 * CTAS7 Information Fusion System - Core Orchestrator
 * Manages multi-domain data fusion with maritime, space, geo, network, and cyber worlds
 */

import { JulianDate, BoundingVolume, ReferenceFrame } from 'cesium';

export type DomainType = 'space' | 'geospatial' | 'maritime' | 'network' | 'cyber';

export interface FusionContext {
  timestamp: JulianDate;
  referenceFrame: ReferenceFrame;
  boundingVolume: BoundingVolume;
  correlationRadius: number;
  activeDomains: DomainType[];
}

export interface CrossDomainEntity {
  globalId: string;
  domains: DomainType[];
  spatialCorrelation: SpatialCorrelation;
  temporalCorrelation: TemporalCorrelation;
  attributes: Record<string, any>;
  ontologyTags: string[];
}

export interface SpatialCorrelation {
  position: Cesium.Cartesian3;
  velocity?: Cesium.Cartesian3;
  orientation?: Cesium.Quaternion;
  boundingVolume: BoundingVolume;
  confidence: number;
}

export interface TemporalCorrelation {
  timestamp: JulianDate;
  duration?: number;
  frequency?: number;
  lifecycle: 'active' | 'inactive' | 'predicted' | 'historical';
  confidence: number;
}

export interface FusedEntity {
  // Core identification
  globalId: string;
  entityType: string;

  // Multi-domain representations
  spaceRepresentation?: SpaceEntity;
  geoRepresentation?: GeospatialEntity;
  maritimeRepresentation?: MaritimeEntity;
  networkRepresentation?: NetworkEntity;
  cyberRepresentation?: CyberEntity;

  // Fusion metadata
  correlationConfidence: number;
  lastUpdateTime: JulianDate;
  fusionRules: FusionRule[];
  ontologyPath: string[];
}

export interface SpaceEntity {
  noradId?: string;
  tle?: string;
  orbitalElements?: OrbitalElements;
  satelliteType: string;
  constellation?: string;
}

export interface GeospatialEntity {
  coordinates: [number, number, number?];
  elevation?: number;
  terrain: string;
  climate: string;
  infrastructure?: string[];
}

export interface MaritimeEntity {
  imo?: string;
  mmsi?: string;
  vesselType: string;
  port?: string;
  route?: [number, number][];
  speed?: number;
  heading?: number;
}

export interface NetworkEntity {
  nodeId: string;
  protocol: string;
  bandwidth: number;
  latency: number;
  status: 'active' | 'degraded' | 'offline';
  connections: string[];
}

export interface CyberEntity {
  digitalTwinId: string;
  modelType: string;
  confidence: number;
  predictions: Record<string, any>;
  simulations: string[];
}

export interface OrbitalElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  raan: number;
  argumentOfPeriapsis: number;
  meanAnomaly: number;
  epoch: JulianDate;
}

export interface FusionRule {
  id: string;
  domains: DomainType[];
  conditions: string;
  actions: string[];
  priority: number;
  enabled: boolean;
}

export class FusionCore {
  private entities: Map<string, FusedEntity> = new Map();
  private activeContext: FusionContext;
  private eventBus: EventTarget = new EventTarget();

  constructor() {
    this.activeContext = this.createDefaultContext();
  }

  private createDefaultContext(): FusionContext {
    return {
      timestamp: JulianDate.now(),
      referenceFrame: ReferenceFrame.FIXED,
      boundingVolume: new Cesium.BoundingSphere(),
      correlationRadius: 10000, // 10km default
      activeDomains: ['space', 'geospatial', 'maritime', 'network', 'cyber']
    };
  }

  /**
   * Register a new entity from any domain
   */
  public registerEntity(entity: FusedEntity): void {
    this.entities.set(entity.globalId, entity);
    this.triggerCorrelationUpdate(entity);
    this.emitEvent('entity-registered', { entity });
  }

  /**
   * Update existing entity with new domain data
   */
  public updateEntity(globalId: string, domainData: Partial<FusedEntity>): void {
    const entity = this.entities.get(globalId);
    if (entity) {
      Object.assign(entity, domainData);
      entity.lastUpdateTime = JulianDate.now();
      this.triggerCorrelationUpdate(entity);
      this.emitEvent('entity-updated', { entity });
    }
  }

  /**
   * Find entities within correlation radius
   */
  public findCorrelatedEntities(targetEntity: FusedEntity): FusedEntity[] {
    const correlated: FusedEntity[] = [];

    for (const [id, entity] of this.entities) {
      if (id === targetEntity.globalId) continue;

      if (this.areEntitiesCorrelated(targetEntity, entity)) {
        correlated.push(entity);
      }
    }

    return correlated;
  }

  private areEntitiesCorrelated(entity1: FusedEntity, entity2: FusedEntity): boolean {
    // Spatial correlation check
    if (entity1.spaceRepresentation && entity2.spaceRepresentation) {
      // Both in space domain - check orbital proximity
      return this.checkOrbitalProximity(entity1.spaceRepresentation, entity2.spaceRepresentation);
    }

    if (entity1.geoRepresentation && entity2.geoRepresentation) {
      // Both in geo domain - check geographic proximity
      return this.checkGeographicProximity(entity1.geoRepresentation, entity2.geoRepresentation);
    }

    if (entity1.maritimeRepresentation && entity2.maritimeRepresentation) {
      // Both in maritime domain - check vessel proximity
      return this.checkMaritimeProximity(entity1.maritimeRepresentation, entity2.maritimeRepresentation);
    }

    if (entity1.networkRepresentation && entity2.networkRepresentation) {
      // Both in network domain - check connectivity
      return this.checkNetworkConnectivity(entity1.networkRepresentation, entity2.networkRepresentation);
    }

    return false;
  }

  private checkOrbitalProximity(space1: SpaceEntity, space2: SpaceEntity): boolean {
    // Simplified orbital proximity check
    if (!space1.orbitalElements || !space2.orbitalElements) return false;

    const altitudeDiff = Math.abs(space1.orbitalElements.semiMajorAxis - space2.orbitalElements.semiMajorAxis);
    const inclinationDiff = Math.abs(space1.orbitalElements.inclination - space2.orbitalElements.inclination);

    return altitudeDiff < 50000 && inclinationDiff < 5; // 50km altitude, 5° inclination tolerance
  }

  private checkGeographicProximity(geo1: GeospatialEntity, geo2: GeospatialEntity): boolean {
    const [lon1, lat1] = geo1.coordinates;
    const [lon2, lat2] = geo2.coordinates;

    const distance = this.haversineDistance(lat1, lon1, lat2, lon2);
    return distance < this.activeContext.correlationRadius;
  }

  private checkMaritimeProximity(maritime1: MaritimeEntity, maritime2: MaritimeEntity): boolean {
    // Check if vessels are in same port or nearby routes
    if (maritime1.port && maritime2.port && maritime1.port === maritime2.port) {
      return true;
    }

    // Check route proximity if available
    if (maritime1.route && maritime2.route) {
      // Simplified route proximity check
      return this.checkRouteProximity(maritime1.route, maritime2.route);
    }

    return false;
  }

  private checkNetworkConnectivity(network1: NetworkEntity, network2: NetworkEntity): boolean {
    return network1.connections.includes(network2.nodeId) ||
           network2.connections.includes(network1.nodeId);
  }

  private checkRouteProximity(route1: [number, number][], route2: [number, number][]): boolean {
    // Check if any points in route1 are within correlation radius of route2
    for (const point1 of route1) {
      for (const point2 of route2) {
        const distance = this.haversineDistance(point1[1], point1[0], point2[1], point2[0]);
        if (distance < this.activeContext.correlationRadius) {
          return true;
        }
      }
    }
    return false;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private triggerCorrelationUpdate(entity: FusedEntity): void {
    const correlated = this.findCorrelatedEntities(entity);
    if (correlated.length > 0) {
      this.emitEvent('correlation-found', { entity, correlated });
    }
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
   * Set correlation context for fusion operations
   */
  public setContext(context: Partial<FusionContext>): void {
    this.activeContext = { ...this.activeContext, ...context };
    this.emitEvent('context-changed', { context: this.activeContext });
  }

  /**
   * Get all entities for a specific domain
   */
  public getEntitiesByDomain(domain: DomainType): FusedEntity[] {
    return Array.from(this.entities.values()).filter(entity =>
      entity.domains?.includes(domain) ||
      (domain === 'space' && entity.spaceRepresentation) ||
      (domain === 'geospatial' && entity.geoRepresentation) ||
      (domain === 'maritime' && entity.maritimeRepresentation) ||
      (domain === 'network' && entity.networkRepresentation) ||
      (domain === 'cyber' && entity.cyberRepresentation)
    );
  }

  /**
   * Output to Cognetix19 system
   */
  public outputToCognetix19(): any {
    const output = {
      timestamp: JulianDate.now(),
      domains: this.activeContext.activeDomains,
      entityCount: this.entities.size,
      correlations: this.generateCorrelationSummary(),
      context: this.activeContext
    };

    this.emitEvent('cognetix19-output', { output });
    return output;
  }

  private generateCorrelationSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    for (const entity of this.entities.values()) {
      const correlated = this.findCorrelatedEntities(entity);
      summary[entity.globalId] = correlated.length;
    }

    return summary;
  }
}

export default FusionCore;