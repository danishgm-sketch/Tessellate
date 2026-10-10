import { ProjectManifestSchema, type ProjectManifest, type ProjectNode } from '@tessellate/schemas';

export interface PreExportValidation {
  canExport: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Runs pre-flight validation against a ProjectManifest before exporting code or archives.
 * Returns blocking errors (which prevent export) and actionable warnings (which may be bypassed).
 */
export function validatePreExport(manifest: ProjectManifest): PreExportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Strict schema validation
  const parseResult = ProjectManifestSchema.safeParse(manifest);
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      errors.push(`[${issue.path.join('.')}]: ${issue.message}`);
    }
  }

  // 2. Screen validation
  if (!manifest.screens || manifest.screens.length === 0) {
    errors.push('Project must define at least one screen before export.');
  }

  const slugs = new Set<string>();
  for (const screen of manifest.screens || []) {
    if (!screen.slug) {
      errors.push(`Screen "${screen.name}" is missing a route slug.`);
    } else if (slugs.has(screen.slug)) {
      errors.push(`Duplicate screen route slug detected: "${screen.slug}".`);
    } else {
      slugs.add(screen.slug);
    }

    // Inspect nodes in screen
    inspectNodePreExport(screen.rootNode, screen.name, warnings);
  }

  // 3. Accessibility warnings
  if (manifest.constraints.accessibilityFloor === 'AAA' && manifest.designDNA.contrast < 80) {
    warnings.push('Contrast score is under 80 while project accessibility floor is set to AAA.');
  }

  return {
    canExport: errors.length === 0,
    errors,
    warnings,
  };
}

function inspectNodePreExport(node: ProjectNode, screenName: string, warnings: string[]) {
  if (node.nodeType === 'component' && !node.resourceRef) {
    warnings.push(`Node "${node.id}" (${node.semanticRole}) on screen "${screenName}" has no catalog resourceRef assigned.`);
  }

  if (node.children) {
    for (const child of node.children) {
      inspectNodePreExport(child, screenName, warnings);
    }
  }
}
