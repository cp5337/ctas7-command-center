/**
 * CTAS7 Maritime Domain Handler
 * Specialized processing for vessels, ports, and maritime operations
 */

import { JulianDate } from 'cesium';
import { MaritimeEntity, FusedEntity, DomainType } from '../core/FusionCore';

export interface Port {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  type: 'commercial' | 'military' | 'industrial' | 'fishing';
  capacity: number;
  currentVessels: string[];
  facilities: string[];
}

export interface ShippingRoute {
  id: string;
  name: string;
  waypoints: [number, number][];
  routeType: 'container' | 'tanker' | 'bulk' | 'passenger' | 'military';
  averageTransitTime: number; // hours
  trafficDensity: 'low' | 'medium' | 'high' | 'critical';
  restrictions: string[];
}

export interface MaritimeZone {
  id: string;
  name: string;
  boundary: [number, number][];
  zoneType: 'territorial' | 'contiguous' | 'exclusive_economic' | 'international';
  jurisdiction: string;
  restrictions: string[];
}

export interface VesselMovement {
  vesselId: string;
  timestamp: JulianDate;
  position: [number, number];
  speed: number;
  heading: number;
  destination?: string;
  estimatedArrival?: JulianDate;
}

export interface MaritimeAlert {
  id: string;
  type: 'collision_risk' | 'restricted_area' | 'weather_warning' | 'security_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  vessels: string[];
  location: [number, number];
  radius: number; // nautical miles
  timestamp: JulianDate;
  description: string;
}

export class MaritimeDomain {
  private ports: Map<string, Port> = new Map();
  private routes: Map<string, ShippingRoute> = new Map();
  private zones: Map<string, MaritimeZone> = new Map();
  private movements: Map<string, VesselMovement[]> = new Map();
  private alerts: MaritimeAlert[] = [];
  private eventBus: EventTarget = new EventTarget();

  constructor() {
    this.initializeMaritimeData();
  }

  private initializeMaritimeData(): void {
    // Initialize major world ports
    const majorPorts: Port[] = [
      {
        id: 'port-shanghai',
        name: 'Port of Shanghai',
        country: 'China',
        coordinates: [121.5074, 31.2304],
        type: 'commercial',
        capacity: 47000000,
        currentVessels: [],
        facilities: ['container', 'bulk', 'liquid']
      },
      {
        id: 'port-singapore',
        name: 'Port of Singapore',
        country: 'Singapore',
        coordinates: [103.8515, 1.2899],
        type: 'commercial',
        capacity: 37200000,
        currentVessels: [],
        facilities: ['container', 'bulk', 'liquid', 'cruise']
      },
      {
        id: 'port-rotterdam',
        name: 'Port of Rotterdam',
        country: 'Netherlands',
        coordinates: [4.4777, 51.9225],
        type: 'commercial',
        capacity: 14500000,
        currentVessels: [],
        facilities: ['container', 'bulk', 'liquid', 'automotive']
      },
      {
        id: 'port-norfolk',
        name: 'Naval Station Norfolk',
        country: 'United States',
        coordinates: [-76.2951, 36.9468],
        type: 'military',
        capacity: 500,
        currentVessels: [],
        facilities: ['naval', 'carrier', 'submarine', 'logistics']
      }
    ];

    majorPorts.forEach(port => this.ports.set(port.id, port));

    // Initialize major shipping routes
    const majorRoutes: ShippingRoute[] = [
      {
        id: 'route-suez',
        name: 'Europe-Asia via Suez Canal',
        waypoints: [
          [4.4777, 51.9225],   // Rotterdam
          [32.3498, 29.9527],  // Suez Canal
          [103.8515, 1.2899]   // Singapore
        ],
        routeType: 'container',
        averageTransitTime: 720, // 30 days
        trafficDensity: 'critical',
        restrictions: ['canal_fees', 'size_limits']
      },
      {
        id: 'route-panama',
        name: 'Asia-US East Coast via Panama Canal',
        waypoints: [
          [121.5074, 31.2304], // Shanghai
          [-79.9999, 8.9824],  // Panama Canal
          [-74.0721, 40.7589]  // New York
        ],
        routeType: 'container',
        averageTransitTime: 480, // 20 days
        trafficDensity: 'high',
        restrictions: ['canal_fees', 'size_limits']
      },
      {
        id: 'route-strait-hormuz',
        name: 'Persian Gulf Oil Route',
        waypoints: [
          [51.2567, 26.0667],  // Strait of Hormuz
          [58.3829, 23.6345],  // Arabian Sea
          [103.8515, 1.2899]   // Singapore
        ],
        routeType: 'tanker',
        averageTransitTime: 240, // 10 days
        trafficDensity: 'critical',
        restrictions: ['security_escort', 'environmental']
      }
    ];

    majorRoutes.forEach(route => this.routes.set(route.id, route));

    console.log('🚢 Maritime domain initialized with ports, routes, and zones');
  }

  /**
   * Add vessel to maritime tracking
   */
  public addVessel(vessel: {
    id: string;
    name: string;
    imo?: string;
    mmsi?: string;
    vesselType: string;
    coordinates: [number, number];
    speed?: number;
    heading?: number;
    destination?: string;
  }): FusedEntity {
    const entity: FusedEntity = {
      globalId: `maritime-${vessel.id}`,
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

    // Record initial movement
    this.recordVesselMovement({
      vesselId: vessel.id,
      timestamp: JulianDate.now(),
      position: vessel.coordinates,
      speed: vessel.speed || 0,
      heading: vessel.heading || 0,
      destination: vessel.destination
    });

    this.emitEvent('vessel-added', { vessel: entity });
    return entity;
  }

  /**
   * Update vessel position and create movement record
   */
  public updateVesselPosition(vesselId: string, movement: Omit<VesselMovement, 'vesselId'>): void {
    const fullMovement: VesselMovement = {
      vesselId,
      ...movement
    };

    this.recordVesselMovement(fullMovement);
    this.checkForAlerts(fullMovement);
    this.emitEvent('vessel-updated', { movement: fullMovement });
  }

  private recordVesselMovement(movement: VesselMovement): void {
    if (!this.movements.has(movement.vesselId)) {
      this.movements.set(movement.vesselId, []);
    }

    const movements = this.movements.get(movement.vesselId)!;
    movements.push(movement);

    // Keep only last 100 movements to manage memory
    if (movements.length > 100) {
      movements.splice(0, movements.length - 100);
    }
  }

  /**
   * Check for maritime alerts based on vessel movement
   */
  private checkForAlerts(movement: VesselMovement): void {
    // Check for collision risk
    this.checkCollisionRisk(movement);

    // Check for restricted areas
    this.checkRestrictedAreas(movement);

    // Check route deviation
    this.checkRouteDeviation(movement);
  }

  private checkCollisionRisk(movement: VesselMovement): void {
    const proximityThreshold = 0.5; // nautical miles
    const nearbyVessels: string[] = [];

    for (const [vesselId, movements] of this.movements) {
      if (vesselId === movement.vesselId || movements.length === 0) continue;

      const lastMovement = movements[movements.length - 1];
      const distance = this.calculateNauticalDistance(
        movement.position,
        lastMovement.position
      );

      if (distance < proximityThreshold) {
        nearbyVessels.push(vesselId);
      }
    }

    if (nearbyVessels.length > 0) {
      const alert: MaritimeAlert = {
        id: `collision-${Date.now()}`,
        type: 'collision_risk',
        severity: nearbyVessels.length > 2 ? 'high' : 'medium',
        vessels: [movement.vesselId, ...nearbyVessels],
        location: movement.position,
        radius: proximityThreshold,
        timestamp: movement.timestamp,
        description: `Collision risk detected: ${nearbyVessels.length + 1} vessels in close proximity`
      };

      this.alerts.push(alert);
      this.emitEvent('maritime-alert', { alert });
    }
  }

  private checkRestrictedAreas(movement: VesselMovement): void {
    for (const zone of this.zones.values()) {
      if (zone.zoneType === 'territorial' && zone.restrictions.length > 0) {
        if (this.isPointInPolygon(movement.position, zone.boundary)) {
          const alert: MaritimeAlert = {
            id: `restricted-${Date.now()}`,
            type: 'restricted_area',
            severity: 'medium',
            vessels: [movement.vesselId],
            location: movement.position,
            radius: 1,
            timestamp: movement.timestamp,
            description: `Vessel entered restricted zone: ${zone.name}`
          };

          this.alerts.push(alert);
          this.emitEvent('maritime-alert', { alert });
        }
      }
    }
  }

  private checkRouteDeviation(movement: VesselMovement): void {
    // Check if vessel is significantly off known shipping routes
    let onRoute = false;
    const deviationThreshold = 10; // nautical miles

    for (const route of this.routes.values()) {
      const distanceToRoute = this.distanceToShippingRoute(movement.position, route.waypoints);
      if (distanceToRoute < deviationThreshold) {
        onRoute = true;
        break;
      }
    }

    if (!onRoute) {
      const alert: MaritimeAlert = {
        id: `deviation-${Date.now()}`,
        type: 'security_threat',
        severity: 'low',
        vessels: [movement.vesselId],
        location: movement.position,
        radius: deviationThreshold,
        timestamp: movement.timestamp,
        description: 'Vessel operating off established shipping routes'
      };

      this.alerts.push(alert);
      this.emitEvent('maritime-alert', { alert });
    }
  }

  /**
   * Get vessel movement history
   */
  public getVesselHistory(vesselId: string): VesselMovement[] {
    return this.movements.get(vesselId) || [];
  }

  /**
   * Get vessels in port
   */
  public getVesselsInPort(portId: string): string[] {
    const port = this.ports.get(portId);
    return port ? port.currentVessels : [];
  }

  /**
   * Get active maritime alerts
   */
  public getActiveAlerts(): MaritimeAlert[] {
    const now = JulianDate.now();
    const alertWindow = 3600; // 1 hour in seconds

    return this.alerts.filter(alert => {
      const alertAge = JulianDate.secondsDifference(now, alert.timestamp);
      return alertAge < alertWindow;
    });
  }

  /**
   * Get all ports
   */
  public getPorts(): Port[] {
    return Array.from(this.ports.values());
  }

  /**
   * Get all shipping routes
   */
  public getShippingRoutes(): ShippingRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Calculate distance between two coordinates in nautical miles
   */
  private calculateNauticalDistance(coord1: [number, number], coord2: [number, number]): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 3440; // Earth radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Check if point is inside polygon (for zone checking)
   */
  private isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Calculate distance from point to shipping route
   */
  private distanceToShippingRoute(point: [number, number], waypoints: [number, number][]): number {
    let minDistance = Infinity;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.distanceToLineSegment(point, waypoints[i], waypoints[i + 1]);
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }

  private distanceToLineSegment(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): number {
    // Simplified distance calculation - in production would use proper geodesic calculations
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return this.calculateNauticalDistance(point, lineStart);

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    const projectionX = x1 + t * dx;
    const projectionY = y1 + t * dy;

    return this.calculateNauticalDistance(point, [projectionX, projectionY]);
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
}

export default MaritimeDomain;