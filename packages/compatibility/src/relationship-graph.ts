import type {
  ResourceManifest,
  RelationshipType,
} from '@tessellate/schemas';

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  strength: number;
  notes?: string;
}

export class ResourceRelationshipGraph {
  private resources: Map<string, ResourceManifest> = new Map();
  private outgoingEdges: Map<string, GraphEdge[]> = new Map();
  private incomingEdges: Map<string, GraphEdge[]> = new Map();

  constructor(initialResources: ResourceManifest[] = []) {
    for (const res of initialResources) {
      this.addResource(res);
    }
  }

  public addResource(resource: ResourceManifest): void {
    this.resources.set(resource.id, resource);
    this.resources.set(resource.slug, resource); // Allow indexing by slug as well

    if (!this.outgoingEdges.has(resource.id)) {
      this.outgoingEdges.set(resource.id, []);
    }

    for (const rel of resource.relationships) {
      const edge: GraphEdge = {
        sourceId: resource.id,
        targetId: rel.target,
        type: rel.type,
        strength: rel.strength ?? 1.0,
        notes: rel.notes,
      };

      this.outgoingEdges.get(resource.id)!.push(edge);

      if (!this.incomingEdges.has(rel.target)) {
        this.incomingEdges.set(rel.target, []);
      }
      this.incomingEdges.get(rel.target)!.push(edge);
    }
  }

  public getResource(idOrSlug: string): ResourceManifest | undefined {
    return this.resources.get(idOrSlug);
  }

  public getOutgoing(idOrSlug: string): GraphEdge[] {
    return this.outgoingEdges.get(idOrSlug) ?? [];
  }

  public getIncoming(idOrSlug: string): GraphEdge[] {
    return this.incomingEdges.get(idOrSlug) ?? [];
  }

  public hasRelationship(sourceId: string, targetId: string, type: RelationshipType): boolean {
    const edges = this.getOutgoing(sourceId);
    return edges.some((e) => e.targetId === targetId && e.type === type);
  }

  public getRelated(idOrSlug: string, type?: RelationshipType): string[] {
    const edges = this.getOutgoing(idOrSlug);
    const filtered = type ? edges.filter((e) => e.type === type) : edges;
    return filtered.map((e) => e.targetId);
  }

  /**
   * Evaluates compatibility and conflicts between two resource IDs.
   */
  public evaluatePairCompatibility(
    idA: string,
    idB: string
  ): { compatible: boolean; conflictReason?: string } {
    const aAvoidsB = this.hasRelationship(idA, idB, 'AVOID_FOR');
    if (aAvoidsB) {
      return { compatible: false, conflictReason: `'${idA}' explicitly declares AVOID_FOR '${idB}'.` };
    }

    const bAvoidsA = this.hasRelationship(idB, idA, 'AVOID_FOR');
    if (bAvoidsA) {
      return { compatible: false, conflictReason: `'${idB}' explicitly declares AVOID_FOR '${idA}'.` };
    }

    return { compatible: true };
  }

  /**
   * Finds substitution candidates (e.g. mobile alternatives, low cost, high ambition).
   */
  public findSubstitutes(
    resourceId: string,
    kind: 'mobile' | 'low-cost' | 'high-ambition' | 'any'
  ): string[] {
    const edges = this.getOutgoing(resourceId);
    switch (kind) {
      case 'mobile':
        return edges.filter((e) => e.type === 'MOBILE_ALTERNATIVE').map((e) => e.targetId);
      case 'low-cost':
        return edges.filter((e) => e.type === 'LOW_COST_ALTERNATIVE').map((e) => e.targetId);
      case 'high-ambition':
        return edges.filter((e) => e.type === 'HIGH_AMBITION_ALTERNATIVE').map((e) => e.targetId);
      case 'any':
      default:
        return edges
          .filter(
            (e) =>
              e.type === 'ALTERNATIVE_TO' ||
              e.type === 'REPLACES' ||
              e.type === 'MOBILE_ALTERNATIVE' ||
              e.type === 'LOW_COST_ALTERNATIVE' ||
              e.type === 'HIGH_AMBITION_ALTERNATIVE'
          )
          .map((e) => e.targetId);
    }
  }
}
