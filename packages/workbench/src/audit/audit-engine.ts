import type {
  ProjectManifest,
  ProjectNode,
  AuditResult,
  AuditCategoryScores,
  AuditIssue,
} from '@tessellate/schemas';
import { AuditResultSchema } from '@tessellate/schemas';

export interface AuditContext {
  manifest: ProjectManifest;
}

/**
 * Runs the deterministic 100-point audit evaluation across 9 categories.
 * Produces structured issues with affected nodeIds and deterministic suggested fixes.
 */
export function auditProjectManifest(manifest: ProjectManifest): AuditResult {
  const issues: AuditIssue[] = [];

  // 1. Cohesion (max 20)
  const cohesionScore = evaluateCohesion(manifest, issues);

  // 2. Accessibility (max 20)
  const accessibilityScore = evaluateAccessibility(manifest, issues);

  // 3. Performance (max 15)
  const performanceScore = evaluatePerformance(manifest, issues);

  // 4. Responsive (max 15)
  const responsiveScore = evaluateResponsive(manifest, issues);

  // 5. Hierarchy (max 10)
  const hierarchyScore = evaluateHierarchy(manifest, issues);

  // 6. Density Consistency (max 5)
  const densityScore = evaluateDensityConsistency(manifest, issues);

  // 7. Motion Consistency (max 5)
  const motionScore = evaluateMotionConsistency(manifest, issues);

  // 8. Design System Compliance (max 5)
  const designSystemScore = evaluateDesignSystemCompliance(manifest, issues);

  // 9. Interaction Consistency (max 5)
  const interactionScore = evaluateInteractionConsistency(manifest, issues);

  const scores: AuditCategoryScores = {
    cohesion: Math.max(0, Math.min(20, cohesionScore)),
    accessibility: Math.max(0, Math.min(20, accessibilityScore)),
    performance: Math.max(0, Math.min(15, performanceScore)),
    responsive: Math.max(0, Math.min(15, responsiveScore)),
    hierarchy: Math.max(0, Math.min(10, hierarchyScore)),
    densityConsistency: Math.max(0, Math.min(5, densityScore)),
    motionConsistency: Math.max(0, Math.min(5, motionScore)),
    designSystemCompliance: Math.max(0, Math.min(5, designSystemScore)),
    interactionConsistency: Math.max(0, Math.min(5, interactionScore)),
  };

  const total =
    scores.cohesion +
    scores.accessibility +
    scores.performance +
    scores.responsive +
    scores.hierarchy +
    scores.densityConsistency +
    scores.motionConsistency +
    scores.designSystemCompliance +
    scores.interactionConsistency;

  const result: AuditResult = {
    total,
    scores,
    issues,
  };

  // Validate output against canonical Zod schema
  return AuditResultSchema.parse(result);
}

// ==========================================
// 1. COHESION (Max 20)
// ==========================================
function evaluateCohesion(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 20;
  const dna = manifest.designDNA;

  // Check 1.1: Archetype alignment
  const primaryArchetype = dna.primaryArchetype;
  const productArchetypes = manifest.productModel.productArchetypes || [];
  if (productArchetypes.length > 0) {
    const topProductArchetype = productArchetypes[0]?.tag;
    if (topProductArchetype && topProductArchetype !== primaryArchetype) {
      score -= 3;
      issues.push({
        id: 'cohesion-archetype-mismatch',
        category: 'cohesion',
        severity: 'warning',
        message: `Design DNA primary archetype "${primaryArchetype}" diverges from Product Model archetype "${topProductArchetype}".`,
        nodeIds: [],
        suggestedFix: {
          description: `Align Design DNA primary archetype to "${topProductArchetype}".`,
          mutations: [
            {
              id: 'fix-archetype-align',
              type: 'SET_DESIGN_TOKEN',
              targetId: 'project',
              payload: {
                key: 'primaryArchetype',
                value: topProductArchetype,
              },
              actor: 'deterministic-engine',
              timestamp: new Date().toISOString(),
              preconditionRevision: manifest.historyMeta.headRevision,
            },
          ],
        },
      });
    }
  }

  // Check 1.2: Excessive Chroma in Analytical/Technical Archetypes
  if ((dna.technicality > 75 || primaryArchetype === 'fintech' || primaryArchetype === 'analytics') && (dna.colourfulness ?? 0) > 75) {
    score -= 3;
    issues.push({
      id: 'cohesion-high-chroma-technical',
      category: 'cohesion',
      severity: 'warning',
      message: 'High colourfulness / chroma conflicts with technical/analytical archetype.',
      nodeIds: [],
      suggestedFix: {
        description: 'Lower colourfulness to 35 for analytical focus.',
        mutations: [
          {
            id: 'fix-chroma-align',
            type: 'SET_INTENT',
            targetId: 'project',
            payload: {
              dimensions: { colourfulness: 35 },
            },
            actor: 'deterministic-engine',
            timestamp: new Date().toISOString(),
            preconditionRevision: manifest.historyMeta.headRevision,
          },
        ],
      },
    });
  }

  // Check 1.3: Node curvature clashes with sharp geometry family
  for (const screen of manifest.screens) {
    traverseNodes(screen.rootNode, (node) => {
      if (dna.geometryFamily === 'sharp' && node.dnaOverrides?.curvature && node.dnaOverrides.curvature > 40) {
        score -= 2;
        issues.push({
          id: `cohesion-curvature-clash-${node.id}`,
          category: 'cohesion',
          severity: 'warning',
          message: `Node "${node.id}" has high curvature (${node.dnaOverrides.curvature}) conflicting with project sharp geometry family.`,
          nodeIds: [node.id],
          suggestedFix: {
            description: 'Reset node curvature to inherit project geometry.',
            mutations: [
              {
                id: `fix-curvature-${node.id}`,
                type: 'SET_INTENT',
                targetId: node.id,
                payload: {
                  dimensions: { curvature: dna.curvature },
                },
                actor: 'deterministic-engine',
                timestamp: new Date().toISOString(),
                preconditionRevision: manifest.historyMeta.headRevision,
              },
            ],
          },
        });
      }
    });
  }

  return Math.max(0, score);
}

// ==========================================
// 2. ACCESSIBILITY (Max 20)
// ==========================================
function evaluateAccessibility(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 20;
  const floor = manifest.constraints.accessibilityFloor;
  const contrast = manifest.designDNA.contrast;

  // Check 2.1: Contrast Floor Compliance
  if (floor === 'AAA' && contrast < 80) {
    score -= 6;
    issues.push({
      id: 'a11y-contrast-floor-aaa',
      category: 'accessibility',
      severity: 'critical',
      message: `Contrast level (${contrast}) fails project WCAG AAA floor requirement (min 80).`,
      nodeIds: [],
      suggestedFix: {
        description: 'Increase contrast to 85 to satisfy WCAG AAA floor.',
        mutations: [
          {
            id: 'fix-contrast-aaa',
            type: 'SET_INTENT',
            targetId: 'project',
            payload: {
              dimensions: { contrast: 85 },
            },
            actor: 'deterministic-engine',
            timestamp: new Date().toISOString(),
            preconditionRevision: manifest.historyMeta.headRevision,
          },
        ],
      },
    });
  } else if (floor === 'AA' && contrast < 50) {
    score -= 6;
    issues.push({
      id: 'a11y-contrast-floor-aa',
      category: 'accessibility',
      severity: 'critical',
      message: `Contrast level (${contrast}) fails project WCAG AA floor requirement (min 50).`,
      nodeIds: [],
      suggestedFix: {
        description: 'Increase contrast to 75 to satisfy WCAG AA floor.',
        mutations: [
          {
            id: 'fix-contrast-aa',
            type: 'SET_INTENT',
            targetId: 'project',
            payload: {
              dimensions: { contrast: 75 },
            },
            actor: 'deterministic-engine',
            timestamp: new Date().toISOString(),
            preconditionRevision: manifest.historyMeta.headRevision,
          },
        ],
      },
    });
  }

  // Check 2.2: Interactive Elements Accessible Labels
  for (const screen of manifest.screens) {
    traverseNodes(screen.rootNode, (node) => {
      if (node.semanticRole === 'action-button') {
        const hasLabel = Boolean(node.props?.['label'] || node.props?.['aria-label'] || node.props?.['children']);
        if (!hasLabel) {
          score -= 4;
          issues.push({
            id: `a11y-missing-button-label-${node.id}`,
            category: 'accessibility',
            severity: 'critical',
            message: `Action button "${node.id}" has no accessible label or title text.`,
            nodeIds: [node.id],
            suggestedFix: {
              description: 'Assign accessible fallback label to action button.',
              mutations: [
                {
                  id: `fix-btn-label-${node.id}`,
                  type: 'SET_PROP',
                  targetId: node.id,
                  payload: {
                    prop: 'label',
                    value: 'Action',
                  },
                  actor: 'deterministic-engine',
                  timestamp: new Date().toISOString(),
                  preconditionRevision: manifest.historyMeta.headRevision,
                },
              ],
            },
          });
        }
      }
    });
  }

  // Check 2.3: Reduced-Motion Safety with High Motion
  if ((manifest.designDNA.motion > 60 || manifest.designDNA.motionPlayfulness > 60) && floor === 'AAA') {
    score -= 3;
    issues.push({
      id: 'a11y-high-motion-aaa',
      category: 'accessibility',
      severity: 'warning',
      message: 'Intense motion with AAA accessibility floor requires restrained default transitions.',
      nodeIds: [],
      suggestedFix: {
        description: 'Set motion intensity to 30 for safe baseline.',
        mutations: [
          {
            id: 'fix-motion-floor',
            type: 'SET_INTENT',
            targetId: 'project',
            payload: {
              dimensions: { motion: 30, motionPlayfulness: 15 },
            },
            actor: 'deterministic-engine',
            timestamp: new Date().toISOString(),
            preconditionRevision: manifest.historyMeta.headRevision,
          },
        ],
      },
    });
  }

  return Math.max(0, score);
}

// ==========================================
// 3. PERFORMANCE (Max 15)
// ==========================================
function evaluatePerformance(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 15;
  const ceiling = manifest.constraints.performanceCeiling ?? 'balanced';
  const dna = manifest.designDNA;

  // Check 3.1: Heavy media in lightweight ceiling
  if (ceiling === 'lightweight') {
    if (dna.threeDIntensity > 0 || dna.videoIntensity > 0) {
      score -= 5;
      issues.push({
        id: 'perf-heavy-media-lightweight',
        category: 'performance',
        severity: 'critical',
        message: '3D or video intensity enabled while project performance ceiling is set to lightweight.',
        nodeIds: [],
        suggestedFix: {
          description: 'Disable 3D and video features to satisfy lightweight ceiling.',
          mutations: [
            {
              id: 'fix-perf-media',
              type: 'SET_INTENT',
              targetId: 'project',
              payload: {
                dimensions: { threeDIntensity: 0, videoIntensity: 0 },
              },
              actor: 'deterministic-engine',
              timestamp: new Date().toISOString(),
              preconditionRevision: manifest.historyMeta.headRevision,
            },
          ],
        },
      });
    }

    if (dna.motion > 60) {
      score -= 3;
      issues.push({
        id: 'perf-excessive-motion-lightweight',
        category: 'performance',
        severity: 'warning',
        message: 'Motion intensity exceeds recommended limit for lightweight performance ceiling.',
        nodeIds: [],
        suggestedFix: {
          description: 'Lower motion intensity to 25.',
          mutations: [
            {
              id: 'fix-perf-motion',
              type: 'SET_INTENT',
              targetId: 'project',
              payload: {
                dimensions: { motion: 25 },
              },
              actor: 'deterministic-engine',
              timestamp: new Date().toISOString(),
              preconditionRevision: manifest.historyMeta.headRevision,
            },
          ],
        },
      });
    }
  }

  // Check 3.2: Tree depth and node budget
  for (const screen of manifest.screens) {
    let nodeCount = 0;
    let maxDepth = 0;
    function measureTree(node: ProjectNode, depth: number) {
      nodeCount++;
      if (depth > maxDepth) maxDepth = depth;
      if (node.children) {
        for (const child of node.children) {
          measureTree(child, depth + 1);
        }
      }
    }
    measureTree(screen.rootNode, 1);

    if (maxDepth > 10 || nodeCount > 150) {
      score -= 2;
      issues.push({
        id: `perf-deep-nesting-${screen.id}`,
        category: 'performance',
        severity: 'warning',
        message: `Screen "${screen.name}" has high DOM tree nesting depth (${maxDepth} levels, ${nodeCount} nodes).`,
        nodeIds: [screen.rootNode.id],
      });
    }
  }

  return Math.max(0, score);
}

// ==========================================
// 4. RESPONSIVE (Max 15)
// ==========================================
function evaluateResponsive(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 15;
  const targetDevices = manifest.constraints.targetDevices ?? ['desktop'];
  const includesMobile = targetDevices.includes('mobile');

  // Check 4.1: Rigid fixed-width or uncollapsed wide grids on mobile target
  if (includesMobile) {
    for (const screen of manifest.screens) {
      traverseNodes(screen.rootNode, (node) => {
        const className = (node.props?.['className'] as string) || '';
        // Unprefixed multi-column grid like "grid-cols-4" without "md:" or "lg:"
        if (className.includes('grid-cols-4') && !className.includes('md:') && !className.includes('sm:')) {
          score -= 4;
          issues.push({
            id: `responsive-uncollapsed-grid-${node.id}`,
            category: 'responsive',
            severity: 'warning',
            message: `Layout node "${node.id}" uses 4-column grid without responsive mobile breakpoint, causing mobile overflow.`,
            nodeIds: [node.id],
            suggestedFix: {
              description: 'Prefix 4-column grid with md: responsive breakpoint.',
              mutations: [
                {
                  id: `fix-responsive-grid-${node.id}`,
                  type: 'SET_PROP',
                  targetId: node.id,
                  payload: {
                    prop: 'className',
                    value: className.replace('grid-cols-4', 'grid-cols-1 md:grid-cols-4'),
                  },
                  actor: 'deterministic-engine',
                  timestamp: new Date().toISOString(),
                  preconditionRevision: manifest.historyMeta.headRevision,
                },
              ],
            },
          });
        }
      });
    }

    // Check 4.2: Philosophy mismatch
    if (manifest.designDNA.responsivePhilosophy === 'desktop-first' && (manifest.productModel.mobileImportance ?? 0) > 75) {
      score -= 3;
      issues.push({
        id: 'responsive-philosophy-mismatch',
        category: 'responsive',
        severity: 'info',
        message: 'Mobile importance is high but responsive philosophy is set to desktop-first.',
        nodeIds: [],
        suggestedFix: {
          description: 'Switch responsive philosophy to fluid-adaptive.',
          mutations: [
            {
              id: 'fix-resp-philosophy',
              type: 'SET_DESIGN_TOKEN',
              targetId: 'project',
              payload: {
                key: 'responsivePhilosophy',
                value: 'fluid-adaptive',
              },
              actor: 'deterministic-engine',
              timestamp: new Date().toISOString(),
              preconditionRevision: manifest.historyMeta.headRevision,
            },
          ],
        },
      });
    }
  }

  return Math.max(0, score);
}

// ==========================================
// 5. HIERARCHY (Max 10)
// ==========================================
function evaluateHierarchy(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 10;

  for (const screen of manifest.screens) {
    let hasHeader = false;
    traverseNodes(screen.rootNode, (node) => {
      if (node.semanticRole === 'navigation-header' || node.semanticRole === 'hero-section') {
        hasHeader = true;
      }
    });

    if (!hasHeader) {
      score -= 3;
      issues.push({
        id: `hierarchy-missing-header-${screen.id}`,
        category: 'hierarchy',
        severity: 'warning',
        message: `Screen "${screen.name}" lacks a primary focal header or navigation landmark.`,
        nodeIds: [screen.rootNode.id],
      });
    }
  }

  return Math.max(0, score);
}

// ==========================================
// 6. DENSITY CONSISTENCY (Max 5)
// ==========================================
function evaluateDensityConsistency(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 5;

  for (const screen of manifest.screens) {
    traverseNodes(screen.rootNode, (node) => {
      if (node.children && node.children.length > 1) {
        const kpiChildren = node.children.filter((c) => c.semanticRole === 'metric-kpi');
        if (kpiChildren.length > 1) {
          const densities = kpiChildren.map((c) => c.dnaOverrides?.dataDensity).filter((d) => d !== undefined);
          if (densities.length > 1) {
            const min = Math.min(...(densities as number[]));
            const max = Math.max(...(densities as number[]));
            if (max - min > 35) {
              score -= 2;
              issues.push({
                id: `density-variance-kpi-${node.id}`,
                category: 'densityConsistency',
                severity: 'warning',
                message: `Sibling metric cards in "${node.id}" exhibit large density variance (${min} vs ${max}).`,
                nodeIds: kpiChildren.map((c) => c.id),
              });
            }
          }
        }
      }
    });
  }

  return Math.max(0, score);
}

// ==========================================
// 7. MOTION CONSISTENCY (Max 5)
// ==========================================
function evaluateMotionConsistency(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 5;
  const projectPersonality = manifest.designDNA.motionPersonality;

  for (const screen of manifest.screens) {
    traverseNodes(screen.rootNode, (node) => {
      if (
        node.dnaOverrides?.motionPersonality &&
        node.dnaOverrides.motionPersonality !== projectPersonality &&
        projectPersonality === 'precise' &&
        node.dnaOverrides.motionPersonality === 'playful'
      ) {
        score -= 2;
        issues.push({
          id: `motion-personality-clash-${node.id}`,
          category: 'motionConsistency',
          severity: 'warning',
          message: `Node "${node.id}" motion personality (${node.dnaOverrides.motionPersonality}) clashes with project personality (${projectPersonality}).`,
          nodeIds: [node.id],
          suggestedFix: {
            description: `Harmonize motion personality to "${projectPersonality}".`,
            mutations: [
              {
                id: `fix-motion-p-${node.id}`,
                type: 'SET_DESIGN_TOKEN',
                targetId: node.id,
                payload: {
                  key: 'motionPersonality',
                  value: projectPersonality,
                },
                actor: 'deterministic-engine',
                timestamp: new Date().toISOString(),
                preconditionRevision: manifest.historyMeta.headRevision,
              },
            ],
          },
        });
      }
    });
  }

  return Math.max(0, score);
}

// ==========================================
// 8. DESIGN SYSTEM COMPLIANCE (Max 5)
// ==========================================
function evaluateDesignSystemCompliance(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 5;

  // Check 8.1: Missing resourceRef on component nodes
  for (const screen of manifest.screens) {
    traverseNodes(screen.rootNode, (node) => {
      if (node.nodeType === 'component' && !node.resourceRef) {
        score -= 1;
        issues.push({
          id: `ds-missing-resourceref-${node.id}`,
          category: 'designSystemCompliance',
          severity: 'info',
          message: `Component node "${node.id}" has no catalog resourceRef assigned.`,
          nodeIds: [node.id],
        });
      }
    });
  }

  // Check 8.2: Forbidden Patterns
  const forbidden = manifest.constraints.forbiddenPatterns || [];
  for (const pattern of forbidden) {
    if (pattern.includes('gamification') && manifest.designDNA.playfulness > 50) {
      score -= 2;
      issues.push({
        id: 'ds-forbidden-gamification',
        category: 'designSystemCompliance',
        severity: 'critical',
        message: `High playfulness (${manifest.designDNA.playfulness}) violates forbidden pattern "${pattern}".`,
        nodeIds: [],
        suggestedFix: {
          description: 'Reduce playfulness to 15.',
          mutations: [
            {
              id: 'fix-forbidden-playfulness',
              type: 'SET_INTENT',
              targetId: 'project',
              payload: {
                dimensions: { playfulness: 15 },
              },
              actor: 'deterministic-engine',
              timestamp: new Date().toISOString(),
              preconditionRevision: manifest.historyMeta.headRevision,
            },
          ],
        },
      });
    }
  }

  return Math.max(0, score);
}

// ==========================================
// 9. INTERACTION CONSISTENCY (Max 5)
// ==========================================
function evaluateInteractionConsistency(manifest: ProjectManifest, issues: AuditIssue[]): number {
  let score = 5;

  for (const screen of manifest.screens) {
    traverseNodes(screen.rootNode, (node) => {
      if (node.children && node.children.length > 1) {
        const primaryBtns = node.children.filter(
          (c) => c.semanticRole === 'action-button' && (c.props?.['variant'] === 'primary' || !c.props?.['variant'])
        );
        if (primaryBtns.length > 1) {
          score -= 2;
          const duplicateBtns = primaryBtns.slice(1);
          issues.push({
            id: `interaction-multiple-primary-btns-${node.id}`,
            category: 'interactionConsistency',
            severity: 'warning',
            message: `Multiple primary action buttons detected in container "${node.id}". Subsequent buttons should be outline or ghost.`,
            nodeIds: duplicateBtns.map((b) => b.id),
            suggestedFix: {
              description: 'Convert duplicate primary button to outline variant.',
              mutations: duplicateBtns.map((btn) => ({
                id: `fix-btn-variant-${btn.id}`,
                type: 'SET_PROP',
                targetId: btn.id,
                payload: {
                  prop: 'variant',
                  value: 'outline',
                },
                actor: 'deterministic-engine',
                timestamp: new Date().toISOString(),
                preconditionRevision: manifest.historyMeta.headRevision,
              })),
            },
          });
        }
      }
    });
  }

  return Math.max(0, score);
}

function traverseNodes(node: ProjectNode, callback: (node: ProjectNode) => void) {
  callback(node);
  if (node.children) {
    for (const child of node.children) {
      traverseNodes(child, callback);
    }
  }
}
