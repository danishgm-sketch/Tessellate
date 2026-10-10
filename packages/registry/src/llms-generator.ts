import type { CatalogueArtifact } from '@tessellate/catalog';

/**
 * Generates /llms.txt: A concise, structured overview of Tessellate for LLMs and autonomous agents.
 */
export function generateLlmsTxt(catalog: CatalogueArtifact, siteUrl = 'https://tessellate.design'): string {
  const resourceLines = catalog.resources
    .map((r) => `- [${r.name}](${siteUrl}/r/${r.slug}): ${r.description} (${r.categories.join(', ')})`)
    .join('\n');

  return `# Tessellate

> Deterministic UI composition engine and interface intelligence platform. Composes coherent web interfaces from an open, validated resource vocabulary using 10-dimensional Design DNA vectors.

Tessellate does not sell a pile of disconnected components. It understands product topology, matches components using semantic layout grammars, normalises disparate source files into a unified token system, and allows humans and agents to export production-ready React + Tailwind CSS code without framework lock-in.

## Documentation & Machine Endpoints

- Full Documentation for Agents: ${siteUrl}/llms-full.txt
- Complete Catalog JSON: ${siteUrl}/data/catalog.json
- Minified Catalog JSON: ${siteUrl}/data/catalog.min.json
- OpenAPI Specification: ${siteUrl}/openapi.json
- Shadcn Registry Index: ${siteUrl}/r/index.json
- Individual Resource Schema: ${siteUrl}/r/{slug}.json

## Core Principles

1. **Deterministic Composition**: Mathematical compatibility scoring and layout grammars guarantee coherent results without mandatory LLM hallucinations.
2. **10-Dimensional Design DNA**: Every resource and project specifies a 10D vector:
   - Density: compact | regular | comfortable | dense
   - Chroma: monochrome | minimal | nuanced | vibrant | expressive
   - Contrast: soft | normal | high | max
   - Radii: sharp | subtle | rounded | pill
   - Depth: flat | border | shadow | layered
   - Motion: none | subtle | functional | expressive
   - Scale: major-second | minor-third | major-third | perfect-fourth | golden
   - Pattern: none | dots | grid | mesh
   - Glass: none | subtle | heavy
   - Color Mode: dark | light | system
3. **Guest-First Architecture**: Core browsing, composition, editing, audit, and export operate 100% in-browser with zero mandatory account barrier.
4. **Agent-Native Distribution**: Native shadcn-compatible registry endpoints and Model Context Protocol (MCP) server for direct IDE/agent integration.

## Installation & Distribution

### Shadcn CLI
\`\`\`bash
npx shadcn@latest add ${siteUrl}/r/button-primary.json
\`\`\`

### Tessellate CLI (@tessellate/cli)
\`\`\`bash
# Install CLI
npm install -g @tessellate/cli

# Initialize project with Tessellate design tokens
tess init

# Search component catalog
tess search "hero bold"

# Add resource to local project
tess add button-primary

# Validate manifest
tess validate project.json

# Export composed manifest to React + Tailwind
tess export project.json --output ./src
\`\`\`

### Model Context Protocol (MCP)
Run the Tessellate MCP server locally for Cursor, Claude Desktop, Windsurf, or Antigravity:
\`\`\`bash
npx @tessellate/mcp
\`\`\`

Tools provided:
- \`search_resources\`: Search resources by query, category, and DNA vectors.
- \`get_resource\`: Retrieve complete manifest for a resource.
- \`get_resource_code\`: Retrieve raw TSX component code.
- \`get_resource_metadata\`: Retrieve slots, dependencies, and WCAG accessibility ratings.
- \`find_alternatives\`: Discover structurally compatible substitutes.
- \`recommend_resources\`: Proactively recommend resources based on page intent.
- \`compose_screen\`: Deterministically generate a \`ProjectManifest\` from grammar and intent.
- \`validate_project\`: Validate a \`ProjectManifest\` against canonical schemas.
- \`audit_project\`: Audit contrast, motion, performance, and token coherence.
- \`get_design_dna\`: Inspect Design DNA presets and vectors.
- \`list_design_directions\`: Return visual reference directions (Editorial Precision, Kinetic Monolith, Atmospheric Depth).

## Resources in Catalogue (${catalog.count})

${resourceLines}
`;
}

/**
 * Generates /llms-full.txt: Complete exhaustive specification, catalog schema, and code examples for agents.
 */
export function generateLlmsFullTxt(catalog: CatalogueArtifact, siteUrl = 'https://tessellate.design'): string {
  const shortIntro = generateLlmsTxt(catalog, siteUrl);

  const resourceSections = catalog.resources
    .map((r) => {
      const deps = r.registry.dependencies?.join(', ') || 'none';
      const devDeps = r.registry.devDependencies?.join(', ') || 'none';
      const dna = Object.entries(r.visualDNA ?? {})
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n') || '  - default';

      return `### ${r.name} (\`${r.slug}\`)
- **Type**: ${r.resourceType}
- **Categories**: ${r.categories.join(', ')}
- **Description**: ${r.description}
- **License**: ${r.license.spdx}
- **Dependencies**: ${deps}
- **Dev Dependencies**: ${devDeps}
- **Shadcn URL**: ${siteUrl}/r/${r.slug}.json
- **Design DNA**:
${dna}
`;
    })
    .join('\n');

  return `${shortIntro}

---

## Complete Resource Reference

${resourceSections}

---

## Semantic Token Contract

All Tessellate resources conform to the unified CSS variable contract:

### Colors
- \`--tess-canvas\`: Base background canvas color.
- \`--tess-surface\`: Primary card and container surface.
- \`--tess-surface-raised\`: Elevated container surface.
- \`--tess-surface-overlay\`: Modal and dialog overlay surface.
- \`--tess-border\`: Subtle dividing borders.
- \`--tess-border-strong\`: Prominent interactive borders.
- \`--tess-ink\`: High-contrast body text.
- \`--tess-ink-secondary\`: Supporting label and meta text.
- \`--tess-ink-tertiary\`: Placeholder and disabled text.
- \`--tess-cobalt\`: Primary accent / brand interactive color.
- \`--tess-cobalt-hover\`: Hover accent state.
- \`--tess-focus-ring\`: High-visibility focus indicator (minimum 3:1 contrast against background).

### Spacing & Metrics
- \`--tess-radius\`: Border radius derived from DNA Radii dimension.
- \`--tess-space-unit\`: Base spacing scale unit (derived from Density dimension).
- \`--tess-font-sans\`: Primary sans-serif font family.
- \`--tess-font-mono\`: Monospace tabular figures font family.
`;
}
