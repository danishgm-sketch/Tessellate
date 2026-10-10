import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';

export interface CollectedDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/**
 * Traverses all screens and nodes in a ProjectManifest to collect
 * necessary runtime and development dependencies for a standalone project.
 */
export function collectProjectDependencies(manifest: ProjectManifest): CollectedDependencies {
  const dependencies: Record<string, string> = {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    'lucide-react': '^0.475.0',
    clsx: '^2.1.1',
    'tailwind-merge': '^3.0.1',
  };

  const devDependencies: Record<string, string> = {
    '@tailwindcss/vite': '^4.0.0',
    tailwindcss: '^4.0.0',
    vite: '^6.1.0',
    '@vitejs/plugin-react': '^4.3.4',
    typescript: '^5.7.3',
    '@types/react': '^19.0.8',
    '@types/react-dom': '^19.0.3',
  };

  // Check if any node requires motion
  let requiresMotion = false;
  function inspectNode(node: ProjectNode) {
    if (node.props?.['motion'] || (node.dnaOverrides && (node.dnaOverrides.motion ?? 0) > 40)) {
      requiresMotion = true;
    }
    if (node.children) {
      for (const child of node.children) {
        inspectNode(child);
      }
    }
  }

  for (const screen of manifest.screens) {
    inspectNode(screen.rootNode);
  }

  if (requiresMotion || manifest.designDNA.motion > 40) {
    dependencies['motion'] = '^12.4.7';
  }

  return {
    dependencies,
    devDependencies,
  };
}
