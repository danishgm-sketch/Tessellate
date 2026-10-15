import type { ProjectManifest } from '@tessellate/schemas';
import { normalizeDesignTokens } from '@tessellate/renderer';

/**
 * Generates standard W3C Design Tokens Community Group format (tokens.json)
 * compatible with Figma Tokens Studio, Penpot, and Style Dictionary.
 */
export function generateW3cTokensTree(manifest: ProjectManifest): Record<string, string> {
  const norm = normalizeDesignTokens(manifest.designDNA);
  const files: Record<string, string> = {};

  const tokens = {
    $name: manifest.name,
    $description: `W3C Design Tokens exported from Tessellate for ${manifest.name}`,
    color: {
      accent: {
        primary: {
          $type: 'color',
          $value: norm.colors.accent,
          $description: 'Primary brand accent color',
        },
        hover: {
          $type: 'color',
          $value: norm.colors.accentHover,
          $description: 'Accent hover color',
        },
        soft: {
          $type: 'color',
          $value: norm.colors.accentSoft,
          $description: 'Accent subtle tint',
        },
      },
      surface: {
        primary: {
          $type: 'color',
          $value: norm.colors.canvas,
          $description: 'Base canvas background',
        },
        raised: {
          $type: 'color',
          $value: norm.colors.surfaceRaised,
          $description: 'Elevated card surface',
        },
        base: {
          $type: 'color',
          $value: norm.colors.surface,
          $description: 'Standard card surface',
        },
      },
      text: {
        primary: {
          $type: 'color',
          $value: norm.colors.textPrimary,
          $description: 'Primary text content',
        },
        secondary: {
          $type: 'color',
          $value: norm.colors.textSecondary,
          $description: 'Secondary text and labels',
        },
        muted: {
          $type: 'color',
          $value: norm.colors.textMuted,
          $description: 'Subtle captions and timestamps',
        },
      },
      border: {
        default: {
          $type: 'color',
          $value: norm.colors.border,
          $description: 'Dividers and default borders',
        },
        strong: {
          $type: 'color',
          $value: norm.colors.borderStrong,
          $description: 'High contrast borders',
        },
      },
    },
    dimension: {
      radius: {
        sm: { $type: 'dimension', $value: norm.radius.sm },
        md: { $type: 'dimension', $value: norm.radius.md },
        lg: { $type: 'dimension', $value: norm.radius.lg },
        full: { $type: 'dimension', $value: norm.radius.full },
      },
      spacing: {
        unit: { $type: 'dimension', $value: `${norm.spacing.baseUnit}px` },
        gutter: { $type: 'dimension', $value: norm.spacing.gutterDesktop },
      },
    },
    typography: {
      fontFamily: {
        display: { $type: 'fontFamily', $value: norm.typography.displayFont },
        heading: { $type: 'fontFamily', $value: norm.typography.headingFont },
        body: { $type: 'fontFamily', $value: norm.typography.bodyFont },
        mono: { $type: 'fontFamily', $value: norm.typography.monoFont },
      },
    },
  };

  files['tokens.json'] = JSON.stringify(tokens, null, 2);
  files['README.md'] = `# Design Tokens: ${manifest.name}

Exported from [Tessellate](https://github.com/danishgm-sketch/Tessellate) on ${new Date().toISOString()}.
Format: W3C Design Tokens Community Group specification.

## Usage

- **Figma:** Import directly using [Tokens Studio for Figma](https://tokens.studio/).
- **Penpot:** Import \`tokens.json\` into your Penpot Shared Library.
- **Style Dictionary:** Build multi-platform iOS/Android/Web token bundles:
  \`\`\`bash
  npx style-dictionary build
  \`\`\`
`;

  return files;
}
