import type { ProjectManifest } from '@tessellate/schemas';
import { normalizeDesignTokens } from '@tessellate/renderer';

function sanitizeSwiftName(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join('') || 'Screen';
}

function swiftStringLiteral(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
  return `"${escaped}"`;
}

function hexToSwiftColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 'Color.blue';
  const r = (parseInt(clean.slice(0, 2), 16) / 255).toFixed(3);
  const g = (parseInt(clean.slice(2, 4), 16) / 255).toFixed(3);
  const b = (parseInt(clean.slice(4, 6), 16) / 255).toFixed(3);
  return `Color(red: ${r}, green: ${g}, blue: ${b})`;
}

function parsePx(val: string, fallback = 8): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

export function generateSwiftUiSourceTree(manifest: ProjectManifest): Record<string, string> {
  const files: Record<string, string> = {};
  const norm = normalizeDesignTokens(manifest.designDNA);
  const appName = sanitizeSwiftName(manifest.name) || 'TessellateApp';

  // 1. Package.swift
  files['Package.swift'] = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "${appName}",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "${appName}", targets: ["${appName}"])
    ],
    targets: [
        .target(name: "${appName}")
    ]
)
`;

  // 2. Sources/DesignTokens.swift
  files['Sources/DesignTokens.swift'] = `import SwiftUI

public struct TessellateTheme {
    public static let accentPrimary = ${hexToSwiftColor(norm.colors.accent)}
    public static let accentSecondary = ${hexToSwiftColor(norm.colors.accentHover)}
    public static let surfacePrimary = ${hexToSwiftColor(norm.colors.canvas)}
    public static let surfaceSecondary = ${hexToSwiftColor(norm.colors.surface)}
    public static let inkPrimary = ${hexToSwiftColor(norm.colors.textPrimary)}
    public static let inkSecondary = ${hexToSwiftColor(norm.colors.textSecondary)}
    public static let inkMuted = ${hexToSwiftColor(norm.colors.textMuted)}
    public static let hairline = ${hexToSwiftColor(norm.colors.border)}

    public static let radiusSm: CGFloat = ${parsePx(norm.radius.sm, 4)}
    public static let radiusMd: CGFloat = ${parsePx(norm.radius.md, 8)}
    public static let radiusLg: CGFloat = ${parsePx(norm.radius.lg, 16)}
    public static let spacingUnit: CGFloat = ${norm.spacing.baseUnit}
}
`;

  // 3. Generate explicitly experimental screen scaffolds.
  const screenViews: Array<{ id: string; name: string; viewName: string }> = [];

  for (const screen of manifest.screens) {
    const viewName = `${sanitizeSwiftName(screen.name)}View`;
    screenViews.push({ id: screen.id, name: screen.name, viewName });

    files[`Sources/Views/${viewName}.swift`] = `import SwiftUI

public struct ${viewName}: View {
    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(${swiftStringLiteral(screen.name)})
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(TessellateTheme.inkPrimary)

                    Text("Screen scaffold from Tessellate manifest data.")
                        .font(.subheadline)
                        .foregroundColor(TessellateTheme.inkMuted)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("LAB PREVIEW")
                        .font(.headline)
                        .foregroundColor(TessellateTheme.inkPrimary)

                    Text("This scaffold preserves screen names and root-node metadata only. Tessellate resources, nested nodes, props, slots, authored content, navigation, and interactions have not been translated to SwiftUI.")
                        .font(.subheadline)
                        .foregroundColor(TessellateTheme.inkSecondary)

                    Text("Root node: ${swiftStringLiteral(screen.rootNode.id)} · Role: ${swiftStringLiteral(screen.rootNode.semanticRole)}")
                        .font(.caption)
                        .foregroundColor(TessellateTheme.inkMuted)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(TessellateTheme.surfaceSecondary)
                .cornerRadius(TessellateTheme.radiusMd)
                .overlay(
                    RoundedRectangle(cornerRadius: TessellateTheme.radiusMd)
                        .stroke(TessellateTheme.hairline, lineWidth: 1)
                )
            }
            .padding(16)
        }
        .background(TessellateTheme.surfacePrimary)
    }
}
`;
  }

  // 4. Sources/ContentView.swift
  const tabCases = screenViews
    .map(
      (s) => `            ${s.viewName}()
                .tabItem {
                    Label("${s.name}", systemImage: "square.grid.2x2")
                }`
    )
    .join('\n');

  files['Sources/ContentView.swift'] = `import SwiftUI

public struct ContentView: View {
    public init() {}

    public var body: some View {
        TabView {
${tabCases}
        }
    }
}

#Preview {
    ContentView()
}
`;

  // 5. README.md
  files['README.md'] = `# ${appName} (SwiftUI Target)

Generated by [Tessellate](https://github.com/danishgm-sketch/Tessellate).
LAB scaffold for SwiftUI. It is not a production-ready native export.

## Structure

- \`Sources/DesignTokens.swift\`: normalized Design DNA colors, corner radii, and spacing constants.
- \`Sources/Views/\`: labelled screen scaffolds generated from screen names and root-node metadata.
- \`Sources/ContentView.swift\`: a SwiftUI view composing the generated screens.

## Fidelity limits

This package preserves project name, screen names, root-node IDs, root semantic roles, and normalized Design DNA tokens. It does not translate Tessellate resources, nested nodes, props, slots, authored content, responsive strategies, declared navigation, or interactions. Its tabs are scaffolding over manifest screens, not the product navigation model.

The generated \`Package.swift\` defines a Swift Package library only. It has no executable application or simulator launch target, so this export cannot be opened and run as an app in the iOS Simulator.
`;

  return files;
}
