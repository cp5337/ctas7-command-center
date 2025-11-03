/**
 * CTAS7 Ontology Expansion Engine
 * Dynamic semantic relationship learning and knowledge graph expansion
 */

import { JulianDate } from 'cesium';
import { FusedEntity, DomainType } from '../core/FusionCore';

export interface OntologyNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'relationship' | 'attribute';
  domain: DomainType;
  properties: Record<string, any>;
  confidence: number;
  createdAt: JulianDate;
  lastUpdated: JulianDate;
  usage_count: number;
}

export interface OntologyRelationship {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  strength: number;
  confidence: number;
  evidence: string[];
  createdAt: JulianDate;
  lastValidated: JulianDate;
  bidirectional: boolean;
}

export interface SemanticPattern {
  id: string;
  pattern: string;
  domains: DomainType[];
  confidence: number;
  examples: string[];
  frequency: number;
  discovered: JulianDate;
}

export interface OntologyMetrics {
  totalNodes: number;
  totalRelationships: number;
  domainCoverage: Record<DomainType, number>;
  averageConfidence: number;
  growthRate: number;
  lastExpansion: JulianDate;
}

export class OntologyEngine {
  private nodes: Map<string, OntologyNode> = new Map();
  private relationships: Map<string, OntologyRelationship> = new Map();
  private patterns: Map<string, SemanticPattern> = new Map();
  private learningQueue: FusedEntity[] = [];
  private eventBus: EventTarget = new EventTarget();
  private expansionInterval: number | null = null;

  constructor() {
    this.initializeFoundationalOntology();
    this.startLearningProcess();
  }

  private initializeFoundationalOntology(): void {
    // Core space domain concepts
    this.addFoundationalNode({
      id: 'space-satellite',
      label: 'Satellite',
      type: 'concept',
      domain: 'space',
      properties: { category: 'orbital_object', mobility: 'orbital' },
      confidence: 1.0
    });

    this.addFoundationalNode({
      id: 'space-constellation',
      label: 'Constellation',
      type: 'concept',
      domain: 'space',
      properties: { category: 'satellite_group', coordination: 'networked' },
      confidence: 1.0
    });

    // Maritime domain concepts
    this.addFoundationalNode({
      id: 'maritime-vessel',
      label: 'Vessel',
      type: 'concept',
      domain: 'maritime',
      properties: { category: 'floating_object', mobility: 'surface' },
      confidence: 1.0
    });

    this.addFoundationalNode({
      id: 'maritime-port',
      label: 'Port',
      type: 'concept',
      domain: 'maritime',
      properties: { category: 'infrastructure', function: 'vessel_interface' },
      confidence: 1.0
    });

    // Geospatial concepts
    this.addFoundationalNode({
      id: 'geo-location',
      label: 'Geographic Location',
      type: 'concept',
      domain: 'geospatial',
      properties: { category: 'spatial_reference', dimensionality: '2D_3D' },
      confidence: 1.0
    });

    // Network concepts
    this.addFoundationalNode({
      id: 'network-node',
      label: 'Network Node',
      type: 'concept',
      domain: 'network',
      properties: { category: 'communication_endpoint', connectivity: 'variable' },
      confidence: 1.0
    });

    // Cross-domain relationships
    this.addFoundationalRelationship({
      id: 'satellite-groundstation-link',
      sourceNodeId: 'space-satellite',
      targetNodeId: 'network-node',
      relationshipType: 'communicates_with',
      strength: 0.9,
      confidence: 1.0,
      evidence: ['RF_communication', 'telemetry_data', 'command_control'],
      bidirectional: true
    });

    this.addFoundationalRelationship({
      id: 'vessel-port-docks',
      sourceNodeId: 'maritime-vessel',
      targetNodeId: 'maritime-port',
      relationshipType: 'docks_at',
      strength: 0.8,
      confidence: 1.0,
      evidence: ['AIS_data', 'port_schedules', 'berth_assignments'],
      bidirectional: false
    });

    console.log('🧠 Foundational ontology initialized with core concepts and relationships');
  }

  private addFoundationalNode(nodeData: Omit<OntologyNode, 'createdAt' | 'lastUpdated' | 'usage_count'>): void {
    const node: OntologyNode = {
      ...nodeData,
      createdAt: JulianDate.now(),
      lastUpdated: JulianDate.now(),
      usage_count: 0
    };
    this.nodes.set(node.id, node);
  }

  private addFoundationalRelationship(relData: Omit<OntologyRelationship, 'createdAt' | 'lastValidated'>): void {
    const relationship: OntologyRelationship = {
      ...relData,
      createdAt: JulianDate.now(),
      lastValidated: JulianDate.now()
    };
    this.relationships.set(relationship.id, relationship);
  }

  /**
   * Add entity to learning queue for ontology expansion
   */
  public learnFromEntity(entity: FusedEntity): void {
    this.learningQueue.push(entity);
    this.emitEvent('entity-queued-for-learning', { entity });
  }

  /**
   * Process learning queue and expand ontology
   */
  private processLearningQueue(): void {
    if (this.learningQueue.length === 0) return;

    const entity = this.learningQueue.shift()!;
    this.analyzeEntityForOntologyExpansion(entity);
  }

  private analyzeEntityForOntologyExpansion(entity: FusedEntity): void {
    // Extract concepts from entity
    const extractedConcepts = this.extractConcepts(entity);

    // Discover new relationships
    const discoveredRelationships = this.discoverRelationships(entity);

    // Learn semantic patterns
    const learnedPatterns = this.learnSemanticPatterns(entity);

    // Update ontology with discoveries
    extractedConcepts.forEach(concept => this.addOrUpdateNode(concept));
    discoveredRelationships.forEach(rel => this.addOrUpdateRelationship(rel));
    learnedPatterns.forEach(pattern => this.addOrUpdatePattern(pattern));

    this.emitEvent('ontology-expanded', {
      entity: entity.globalId,
      newConcepts: extractedConcepts.length,
      newRelationships: discoveredRelationships.length,
      newPatterns: learnedPatterns.length
    });
  }

  private extractConcepts(entity: FusedEntity): Partial<OntologyNode>[] {
    const concepts: Partial<OntologyNode>[] = [];

    // Extract from ontology path
    if (entity.ontologyPath && entity.ontologyPath.length > 0) {
      entity.ontologyPath.forEach((pathElement, index) => {
        const nodeId = `${entity.ontologyPath![0]}-${pathElement}`;

        if (!this.nodes.has(nodeId)) {
          concepts.push({
            id: nodeId,
            label: pathElement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: index === 0 ? 'concept' : 'attribute',
            domain: this.inferDomain(entity),
            properties: this.extractProperties(entity, pathElement),
            confidence: 0.7 + (index * 0.05) // Higher confidence for more specific concepts
          });
        }
      });
    }

    // Extract from entity type
    if (entity.entityType) {
      const typeNodeId = `${this.inferDomain(entity)}-${entity.entityType}`;
      if (!this.nodes.has(typeNodeId)) {
        concepts.push({
          id: typeNodeId,
          label: entity.entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'concept',
          domain: this.inferDomain(entity),
          properties: { category: entity.entityType },
          confidence: 0.8
        });
      }
    }

    return concepts;
  }

  private discoverRelationships(entity: FusedEntity): Partial<OntologyRelationship>[] {
    const relationships: Partial<OntologyRelationship>[] = [];

    // Cross-domain relationships based on entity domains
    if (entity.spaceRepresentation && entity.geoRepresentation) {
      relationships.push({
        id: `space-geo-${entity.globalId}`,
        sourceNodeId: 'space-satellite',
        targetNodeId: 'geo-location',
        relationshipType: 'orbits_over',
        strength: 0.9,
        confidence: 0.8,
        evidence: ['positional_data', 'orbital_mechanics'],
        bidirectional: false
      });
    }

    if (entity.maritimeRepresentation && entity.geoRepresentation) {
      relationships.push({
        id: `maritime-geo-${entity.globalId}`,
        sourceNodeId: 'maritime-vessel',
        targetNodeId: 'geo-location',
        relationshipType: 'navigates_at',
        strength: 0.8,
        confidence: 0.9,
        evidence: ['AIS_position', 'GPS_coordinates'],
        bidirectional: false
      });
    }

    if (entity.networkRepresentation && (entity.spaceRepresentation || entity.maritimeRepresentation)) {
      const sourceNode = entity.spaceRepresentation ? 'space-satellite' : 'maritime-vessel';
      relationships.push({
        id: `network-${sourceNode}-${entity.globalId}`,
        sourceNodeId: sourceNode,
        targetNodeId: 'network-node',
        relationshipType: 'transmits_via',
        strength: 0.7,
        confidence: 0.8,
        evidence: ['communication_logs', 'network_topology'],
        bidirectional: true
      });
    }

    return relationships;
  }

  private learnSemanticPatterns(entity: FusedEntity): Partial<SemanticPattern>[] {
    const patterns: Partial<SemanticPattern>[] = [];

    // Pattern: Satellite constellation membership
    if (entity.spaceRepresentation?.constellation) {
      const patternId = `constellation-${entity.spaceRepresentation.constellation}`;
      const existingPattern = this.patterns.get(patternId);

      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.confidence = Math.min(existingPattern.confidence + 0.05, 1.0);
      } else {
        patterns.push({
          id: patternId,
          pattern: `satellites in ${entity.spaceRepresentation.constellation} constellation share operational characteristics`,
          domains: ['space'],
          confidence: 0.6,
          examples: [entity.globalId],
          frequency: 1
        });
      }
    }

    // Pattern: Vessel type operational patterns
    if (entity.maritimeRepresentation?.vesselType) {
      const patternId = `vessel-type-${entity.maritimeRepresentation.vesselType}`;
      const existingPattern = this.patterns.get(patternId);

      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.confidence = Math.min(existingPattern.confidence + 0.03, 1.0);
      } else {
        patterns.push({
          id: patternId,
          pattern: `${entity.maritimeRepresentation.vesselType} vessels follow similar operational patterns`,
          domains: ['maritime'],
          confidence: 0.5,
          examples: [entity.globalId],
          frequency: 1
        });
      }
    }

    return patterns;
  }

  private inferDomain(entity: FusedEntity): DomainType {
    // Priority order for domain inference
    if (entity.spaceRepresentation) return 'space';
    if (entity.maritimeRepresentation) return 'maritime';
    if (entity.networkRepresentation) return 'network';
    if (entity.cyberRepresentation) return 'cyber';
    if (entity.geoRepresentation) return 'geospatial';

    return 'geospatial'; // Default fallback
  }

  private extractProperties(entity: FusedEntity, pathElement: string): Record<string, any> {
    const properties: Record<string, any> = {};

    // Extract properties based on domain representations
    if (entity.spaceRepresentation) {
      properties.orbital = true;
      if (entity.spaceRepresentation.constellation) {
        properties.constellation = entity.spaceRepresentation.constellation;
      }
    }

    if (entity.maritimeRepresentation) {
      properties.maritime = true;
      if (entity.maritimeRepresentation.vesselType) {
        properties.vessel_type = entity.maritimeRepresentation.vesselType;
      }
    }

    if (entity.geoRepresentation) {
      properties.geographic = true;
      properties.terrain = entity.geoRepresentation.terrain;
    }

    properties.pathElement = pathElement;
    return properties;
  }

  private addOrUpdateNode(nodeData: Partial<OntologyNode>): void {
    if (!nodeData.id) return;

    const existingNode = this.nodes.get(nodeData.id);
    if (existingNode) {
      // Update existing node
      existingNode.usage_count++;
      existingNode.lastUpdated = JulianDate.now();
      existingNode.confidence = Math.min(existingNode.confidence + 0.05, 1.0);
      Object.assign(existingNode.properties, nodeData.properties);
    } else {
      // Add new node
      const newNode: OntologyNode = {
        id: nodeData.id,
        label: nodeData.label || nodeData.id,
        type: nodeData.type || 'concept',
        domain: nodeData.domain || 'geospatial',
        properties: nodeData.properties || {},
        confidence: nodeData.confidence || 0.5,
        createdAt: JulianDate.now(),
        lastUpdated: JulianDate.now(),
        usage_count: 1
      };
      this.nodes.set(newNode.id, newNode);
      this.emitEvent('ontology-node-added', { node: newNode });
    }
  }

  private addOrUpdateRelationship(relData: Partial<OntologyRelationship>): void {
    if (!relData.id || !relData.sourceNodeId || !relData.targetNodeId) return;

    const existingRel = this.relationships.get(relData.id);
    if (existingRel) {
      // Strengthen existing relationship
      existingRel.strength = Math.min(existingRel.strength + 0.1, 1.0);
      existingRel.confidence = Math.min(existingRel.confidence + 0.05, 1.0);
      existingRel.lastValidated = JulianDate.now();
      if (relData.evidence) {
        existingRel.evidence.push(...relData.evidence);
      }
    } else {
      // Add new relationship
      const newRel: OntologyRelationship = {
        id: relData.id,
        sourceNodeId: relData.sourceNodeId,
        targetNodeId: relData.targetNodeId,
        relationshipType: relData.relationshipType || 'related_to',
        strength: relData.strength || 0.5,
        confidence: relData.confidence || 0.5,
        evidence: relData.evidence || [],
        createdAt: JulianDate.now(),
        lastValidated: JulianDate.now(),
        bidirectional: relData.bidirectional || false
      };
      this.relationships.set(newRel.id, newRel);
      this.emitEvent('ontology-relationship-added', { relationship: newRel });
    }
  }

  private addOrUpdatePattern(patternData: Partial<SemanticPattern>): void {
    if (!patternData.id) return;

    const existingPattern = this.patterns.get(patternData.id);
    if (!existingPattern && patternData.pattern) {
      const newPattern: SemanticPattern = {
        id: patternData.id,
        pattern: patternData.pattern,
        domains: patternData.domains || ['geospatial'],
        confidence: patternData.confidence || 0.5,
        examples: patternData.examples || [],
        frequency: patternData.frequency || 1,
        discovered: JulianDate.now()
      };
      this.patterns.set(newPattern.id, newPattern);
      this.emitEvent('semantic-pattern-discovered', { pattern: newPattern });
    }
  }

  /**
   * Query ontology for related concepts
   */
  public findRelatedConcepts(nodeId: string, maxDepth: number = 2): OntologyNode[] {
    const visited = new Set<string>();
    const related: OntologyNode[] = [];

    const traverse = (currentNodeId: string, depth: number) => {
      if (depth > maxDepth || visited.has(currentNodeId)) return;
      visited.add(currentNodeId);

      for (const rel of this.relationships.values()) {
        let nextNodeId: string | null = null;

        if (rel.sourceNodeId === currentNodeId) {
          nextNodeId = rel.targetNodeId;
        } else if (rel.bidirectional && rel.targetNodeId === currentNodeId) {
          nextNodeId = rel.sourceNodeId;
        }

        if (nextNodeId && !visited.has(nextNodeId)) {
          const node = this.nodes.get(nextNodeId);
          if (node) {
            related.push(node);
            traverse(nextNodeId, depth + 1);
          }
        }
      }
    };

    traverse(nodeId, 0);
    return related;
  }

  /**
   * Get ontology metrics
   */
  public getMetrics(): OntologyMetrics {
    const domainCoverage: Record<DomainType, number> = {
      space: 0,
      geospatial: 0,
      maritime: 0,
      network: 0,
      cyber: 0
    };

    let totalConfidence = 0;
    for (const node of this.nodes.values()) {
      domainCoverage[node.domain]++;
      totalConfidence += node.confidence;
    }

    return {
      totalNodes: this.nodes.size,
      totalRelationships: this.relationships.size,
      domainCoverage,
      averageConfidence: this.nodes.size > 0 ? totalConfidence / this.nodes.size : 0,
      growthRate: this.calculateGrowthRate(),
      lastExpansion: JulianDate.now()
    };
  }

  private calculateGrowthRate(): number {
    // Simplified growth rate calculation
    // In production, this would track historical data
    return (this.learningQueue.length + this.patterns.size) / Math.max(this.nodes.size, 1);
  }

  private startLearningProcess(): void {
    this.expansionInterval = window.setInterval(() => {
      this.processLearningQueue();
    }, 5000); // Process every 5 seconds
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
    if (this.expansionInterval) {
      clearInterval(this.expansionInterval);
      this.expansionInterval = null;
    }
    this.learningQueue.length = 0;
  }

  /**
   * Export ontology for Cognetix19 integration
   */
  public exportForCognetix19(): any {
    return {
      nodes: Array.from(this.nodes.values()),
      relationships: Array.from(this.relationships.values()),
      patterns: Array.from(this.patterns.values()),
      metrics: this.getMetrics(),
      timestamp: JulianDate.now()
    };
  }
}

export default OntologyEngine;