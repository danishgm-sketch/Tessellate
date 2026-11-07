import type { ProjectManifest } from '@tessellate/schemas';
import { normalizeDesignTokens } from '@tessellate/renderer';

function sanitizeName(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join('') || 'Screen';
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

export function generateExpoNativeSourceTree(manifest: ProjectManifest): Record<string, string> {
  const files: Record<string, string> = {};
  const norm = normalizeDesignTokens(manifest.designDNA);
  const slug = manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tessellate-native';

  // 1. package.json
  files['package.json'] = JSON.stringify(
    {
      name: slug,
      version: '1.0.0',
      main: 'expo-router/entry',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
      },
      dependencies: {
        expo: '~52.0.0',
        'expo-constants': '~17.0.0',
        'expo-linking': '~7.0.0',
        'expo-router': '~4.0.0',
        'expo-status-bar': '~2.0.0',
        'lucide-react-native': '^0.475.0',
        nativewind: '^4.0.1',
        react: '18.3.1',
        'react-dom': '18.3.1',
        'react-native': '0.76.5',
        'react-native-safe-area-context': '4.12.0',
        'react-native-screens': '~4.4.0',
        tailwindcss: '^3.4.17',
      },
      devDependencies: {
        '@babel/core': '^7.25.2',
        '@types/react': '~18.3.12',
        typescript: '^5.3.3',
      },
      private: true,
    },
    null,
    2
  );

  // 2. app.json
  files['app.json'] = JSON.stringify(
    {
      expo: {
        name: manifest.name,
        slug,
        version: '1.0.0',
        orientation: 'portrait',
        userInterfaceStyle: manifest.designDNA.visualMode === 'dark' ? 'dark' : 'automatic',
        scheme: slug,
        plugins: ['expo-router'],
      },
    },
    null,
    2
  );

  // 3. babel.config.js
  files['babel.config.js'] = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
`;

  // 4. metro.config.js
  files['metro.config.js'] = `const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
`;

  // 5. tailwind.config.js
  files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '${norm.colors.accent}',
          secondary: '${norm.colors.accentHover}',
        },
        surface: {
          primary: '${norm.colors.canvas}',
          secondary: '${norm.colors.surface}',
        },
        ink: {
          primary: '${norm.colors.textPrimary}',
          secondary: '${norm.colors.textSecondary}',
          muted: '${norm.colors.textMuted}',
        },
        hairline: '${norm.colors.border}',
      },
      borderRadius: {
        sm: '${norm.radius.sm}',
        md: '${norm.radius.md}',
        lg: '${norm.radius.lg}',
      },
    },
  },
  plugins: [],
};
`;

  // 6. global.css
  files['global.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  // 7. Generate truthful, explicitly experimental screen scaffolds.
  const screenEntries: Array<{ id: string; name: string; componentName: string }> = [];

  for (const screen of manifest.screens) {
    const compName = `${sanitizeName(screen.name)}Screen`;
    screenEntries.push({ id: screen.id, name: screen.name, componentName: compName });

    files[`components/screens/${compName}.tsx`] = `import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export function ${compName}() {
  return (
    <ScrollView className="flex-1 bg-surface-primary p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-ink-primary tracking-tight">{${tsString(screen.name)}}</Text>
        <Text className="text-sm text-ink-muted mt-1">Screen scaffold from Tessellate manifest data.</Text>
      </View>

      <View className="p-4 rounded-xl border border-hairline bg-surface-secondary mb-6">
        <Text className="text-base font-semibold text-ink-primary mb-2">LAB PREVIEW</Text>
        <Text className="text-xs text-ink-muted">
          This screen name and root-node metadata come from the manifest. Tessellate resources, content, layout, navigation, and actions have not been translated to React Native.
        </Text>
        <Text className="text-xs text-ink-muted mt-3">
          Root node: {${tsString(screen.rootNode.id)}} · Role: {${tsString(screen.rootNode.semanticRole)}}
        </Text>
      </View>
    </ScrollView>
  );
}
`;
  }

  // 10. app/_layout.tsx
  files['app/_layout.tsx'] = `import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
`;

  // 11. app/index.tsx
  const importStatements = screenEntries
      .map((s) => `import { ${s.componentName} } from '../components/screens/${s.componentName}';`)
    .join('\n');

  const screenBranches = screenEntries
      .map(
      (s) => `if (activeScreen === ${tsString(s.id)}) {
    return <${s.componentName} />;
  }`
    )
    .join('\n  ');

  const tabButtons = screenEntries
    .map(
      (s) => `<Pressable
          key={${tsString(s.id)}}
          onPress={() => setActiveScreen(${tsString(s.id)})}
          className={\`flex-1 py-3 items-center justify-center \${activeScreen === ${tsString(s.id)} ? 'border-t-2 border-accent-primary' : ''}\`}
        >
        <Text className={\`text-xs font-semibold \${activeScreen === ${tsString(s.id)} ? 'text-accent-primary' : 'text-ink-muted'}\`}>
          {${tsString(s.name)}}
          </Text>
        </Pressable>`
    )
    .join('\n        ');

  files['app/index.tsx'] = `import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
${importStatements}

export default function Index() {
  const [activeScreen, setActiveScreen] = useState(${tsString(screenEntries[0]?.id || '')});

  const renderScreen = () => {
    ${screenBranches}
    return <View className="flex-1 bg-surface-primary" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      {/* Top App Header */}
      <View className="px-4 py-3 border-b border-hairline flex-row items-center justify-between">
        <Text className="font-bold text-base text-ink-primary tracking-tight">{${tsString(manifest.name)}}</Text>
        <View className="px-2 py-0.5 rounded-full bg-surface-secondary">
          <Text className="text-[10px] font-mono text-ink-muted">React Native</Text>
        </View>
      </View>

      {/* Screen Body */}
      <View className="flex-1">
        {renderScreen()}
      </View>

      {/* Bottom Navigation Dock */}
      <View className="flex-row border-t border-hairline bg-surface-secondary">
        ${tabButtons}
      </View>
    </SafeAreaView>
  );
}
`;

  // 12. README.md
  files['README.md'] = `# ${manifest.name} (Expo / React Native)

Generated by [Tessellate](https://github.com/danishgm-sketch/Tessellate).
LAB scaffold using Expo SDK 52 and NativeWind v4. It is not a production-ready React Native export.

## Fidelity limits

This scaffold preserves the project name, screen names, root-node IDs, root semantic roles, and normalized Design DNA tokens. It does not translate Tessellate resources, nested nodes, props, slots, authored content, responsive strategies, navigation semantics, or interactions. The generated tabs are scaffold navigation over manifest screens, not the product's declared navigation model. Every screen is labelled as a lab preview so it cannot be mistaken for a faithful export.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   pnpm install
   # or: npm install / yarn install
   \`\`\`

2. Run Expo development server:
   \`\`\`bash
   npx expo start
   \`\`\`

3. Press \`i\` for iOS Simulator, \`a\` for Android Emulator, or scan the QR code with Expo Go.
`;

  return files;
}
