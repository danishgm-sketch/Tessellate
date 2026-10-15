import type { ProjectManifest } from '@tessellate/schemas';
import { normalizeDesignTokens } from '@tessellate/renderer';

function sanitizeSwiftName(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join('') || 'Screen';
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

  // 3. Sources/Components/TessButton.swift
  files['Sources/Components/TessButton.swift'] = `import SwiftUI

public struct TessButton: View {
    public let title: String
    public var action: () -> Void

    public init(title: String, action: @escaping () -> Void = {}) {
        self.title = title
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(TessellateTheme.accentPrimary)
                .cornerRadius(TessellateTheme.radiusMd)
        }
        .buttonStyle(.plain)
    }
}
`;

  // 4. Sources/Components/TessMetricCard.swift
  files['Sources/Components/TessMetricCard.swift'] = `import SwiftUI

public struct TessMetricCard: View {
    public let title: String
    public let value: String
    public let change: String?
    public let isPositive: Bool

    public init(title: String, value: String, change: String? = nil, isPositive: Bool = true) {
        self.title = title
        self.value = value
        self.change = change
        self.isPositive = isPositive
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(TessellateTheme.inkMuted)

            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(TessellateTheme.inkPrimary)

            if let change = change {
                Text(change)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(isPositive ? .green : .red)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(TessellateTheme.surfaceSecondary)
        .cornerRadius(TessellateTheme.radiusMd)
        .overlay(
            RoundedRectangle(cornerRadius: TessellateTheme.radiusMd)
                .stroke(TessellateTheme.hairline, lineWidth: 1)
        )
    }
}
`;

  // 5. Generate screen views
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
                    Text("${screen.name}")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(TessellateTheme.inkPrimary)

                    Text("Native SwiftUI screen exported from Tessellate AST.")
                        .font(.subheadline)
                        .foregroundColor(TessellateTheme.inkMuted)
                }

                HStack(spacing: 12) {
                    TessMetricCard(title: "Throughput", value: "99.2%", change: "+1.4%", isPositive: true)
                    TessMetricCard(title: "Response", value: "32ms", change: "-8ms", isPositive: true)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Component Details")
                        .font(.headline)
                        .foregroundColor(TessellateTheme.inkPrimary)

                    Text("Root Node: ${screen.rootNode.id} · Role: ${screen.rootNode.semanticRole}")
                        .font(.caption)
                        .foregroundColor(TessellateTheme.inkMuted)

                    TessButton(title: "Trigger Action")
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

  // 6. Sources/ContentView.swift
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

  // 7. README.md
  files['README.md'] = `# ${appName} (SwiftUI Target)

Exported from [Tessellate](https://github.com/danishgm-sketch/Tessellate) on ${new Date().toISOString()}.
Idiomatic native SwiftUI 6 target for iOS 17+ and macOS 14+.

## Structure

- \`Sources/DesignTokens.swift\`: Design DNA colors, corner radii, and spacing constants.
- \`Sources/Components/\`: Reusable accessible native components (\`TessButton\`, \`TessMetricCard\`).
- \`Sources/Views/\`: Declarative SwiftUI views generated for each screen in the ScreenGraph.
- \`Sources/ContentView.swift\`: Root TabView application coordinator.

## Open in Xcode

Double-click \`Package.swift\` or open folder in Xcode to build and run in iOS Simulator.
`;

  return files;
}
