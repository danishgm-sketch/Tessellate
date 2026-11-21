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
    inspectNodePreExport(screen.rootNode, screen.name, warnings, errors);
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

/**
 * Runnable exports must not turn unresolved required interface roles into blank
 * containers. Manifest and agent-handoff exports remain available so the
 * requirement can be preserved and completed later.
 */
export function assertRunnableExportable(manifest: ProjectManifest): void {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const screen of manifest.screens ?? []) {
    inspectNodePreExport(screen.rootNode, screen.name, warnings, errors);
  }
  if (errors.length === 0) return;

  const roleSummaries = errors.map((message) => {
    const match = /^Required interface role "([^"]+)" on screen "([^"]+)"/.exec(message);
    return match ? { role: match[1]!, screen: match[2]! } : null;
  });
  const affectedScreens = new Set(roleSummaries.flatMap((summary) => summary ? [summary.screen] : [])).size;
  const roleCount = `${errors.length} required interface ${errors.length === 1 ? 'role is' : 'roles are'} unresolved`;
  const screenCount = `${affectedScreens} ${affectedScreens === 1 ? 'screen' : 'screens'}`;
  const details = roleSummaries.map((summary, index) =>
    summary ? `${summary.role} — ${summary.screen}` : errors[index]!
  );
  const error = new Error(
    `Cannot generate a runnable application export: ${roleCount} across ${screenCount}. Resolve each role before exporting.\n${details.join('\n')}`
  );
  error.name = 'ExportValidationError';
  throw error;
}

function inspectNodePreExport(node: ProjectNode, screenName: string, warnings: string[], errors: string[]) {
  if (node.props['unresolvedRequiredRole'] === true) {
    errors.push(
      `Required interface role "${node.semanticRole}" on screen "${screenName}" is unresolved. Resolve it before generating a runnable application export.`
    );
  }

  if (node.nodeType === 'component' && !node.resourceRef) {
    warnings.push(`Node "${node.id}" (${node.semanticRole}) on screen "${screenName}" has no catalog resourceRef assigned.`);
  }

  if (node.children) {
    for (const child of node.children) {
      inspectNodePreExport(child, screenName, warnings, errors);
    }
  }
}
