import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';
import { normalizeDesignTokens, tokensToCssVariables } from '@tessellate/renderer';
import { exportProjectManifestToJson } from './manifest-io.js';

export interface AgentHandoffPackage {
  files: Record<string, string>;
}

/**
 * Generates an agent handoff package specifically tailored for autonomous coding agents
 * (Antigravity, Claude, Gemini, Cursor) implementing or extending the project.
 */
export function generateAgentHandoffPackage(manifest: ProjectManifest): AgentHandoffPackage {
  const files: Record<string, string> = {};

  // 1. PROJECT_DNA.json
  const tokens = normalizeDesignTokens(manifest.designDNA);
  const cssVars = tokensToCssVariables(tokens);
  files['PROJECT_DNA.json'] = JSON.stringify(
    {
      designDNA: manifest.designDNA,
      semanticTokens: tokens,
      cssVariables: cssVars,
    },
    null,
    2
  );

  // 2. manifest.tess.json
  files['manifest.tess.json'] = exportProjectManifestToJson(manifest);

  // 3. AGENT_BRIEF.md
  const lockedNodes: Array<{ id: string; role: string; screenName: string; locks: string[] }> = [];

  for (const screen of manifest.screens) {
    inspectNodeLocks(screen.rootNode, screen.name, lockedNodes);
  }

  const lockedSection =
    lockedNodes.length > 0
      ? lockedNodes
          .map(
            (l) =>
              `- **\`${l.id}\`** (Role: \`${l.role}\`, Screen: "${l.screenName}"): Locked dimensions: \`[${l.locks.join(', ')}]\`. Do NOT alter or restructure this component.`
          )
          .join('\n')
      : 'No active node locks in this revision.';

  const screensSection = manifest.screens
    .map(
      (s) =>
        `### ${s.name} (\`${s.slug}\`)
- **Root Node:** \`${s.rootNode.id}\` (\`${s.rootNode.semanticRole}\`)
- **Direct Children:** ${s.rootNode.children.map((c) => `\`${c.semanticRole}\``).join(', ') || 'None'}`
    )
    .join('\n\n');

  files['AGENT_BRIEF.md'] = `# AGENT BRIEF — ${manifest.name}

This handoff document is the operating contract for any autonomous coding agent modifying or implementing this project.

## 1. Product Intent
- **Archetype:** ${manifest.productModel.productArchetypes.map((a) => `${a.tag} (${a.weight}%)`).join(', ') || manifest.designDNA.primaryArchetype}
- **Target Audience:** ${manifest.productModel.primaryAudience}
- **Primary Objective:** ${manifest.productModel.primaryObjective}
- **Jobs to be Done:**
${manifest.productModel.jobsToBeDone.map((j) => `  - ${j}`).join('\n')}

## 2. Hard Constraints & Locks
Autonomous agents must obey these non-negotiables:
- **Accessibility Floor:** Target WCAG ${manifest.constraints.accessibilityFloor}.
- **Performance Ceiling:** ${manifest.constraints.performanceCeiling ?? 'balanced'}.
- **Forbidden Patterns:** ${manifest.productModel.forbiddenPatterns.join(', ') || 'None'}.

### Active Node Locks (DO NOT ALTER):
${lockedSection}

## 3. Design DNA Rules
All user interface code must resolve styling through the semantic CSS variables defined in \`PROJECT_DNA.json\`:
- **Visual Mode:** \`${manifest.designDNA.visualMode}\`
- **Geometry Family:** \`${manifest.designDNA.geometryFamily}\` (Curvature stop: ${manifest.designDNA.curvature}/100)
- **Surface Personality:** \`${manifest.designDNA.surfacePersonality}\`
- **Motion Personality:** \`${manifest.designDNA.motionPersonality}\` (Intensity: ${manifest.designDNA.motion}/100)
- **Data Density:** ${manifest.designDNA.dataDensity}/100

## 4. Screen Hierarchy & Architecture
${screensSection}

## 5. Working Guidelines for the Agent
1. Do not introduce arbitrary inline hex colors; use \`var(--tess-accent-primary)\`, \`var(--tess-canvas)\`, \`var(--tess-ink)\`, etc.
2. Maintain keyboard focus and ARIA landmarks.
3. Preserve the exact semantic IDs of existing nodes.
`;

  return { files };
}

function inspectNodeLocks(
  node: ProjectNode,
  screenName: string,
  acc: Array<{ id: string; role: string; screenName: string; locks: string[] }>
) {
  if (node.locks) {
    const active = Object.entries(node.locks)
      .filter(([_, v]) => Boolean(v))
      .map(([k]) => k);
    if (active.length > 0) {
      acc.push({
        id: node.id,
        role: node.semanticRole,
        screenName,
        locks: active,
      });
    }
  }

  if (node.children) {
    for (const child of node.children) {
      inspectNodeLocks(child, screenName, acc);
    }
  }
}
