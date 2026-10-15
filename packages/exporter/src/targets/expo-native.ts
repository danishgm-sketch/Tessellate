import type { ProjectManifest, ProjectScreen, ProjectNode } from '@tessellate/schemas';
import { normalizeDesignTokens } from '@tessellate/renderer';

function sanitizeName(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join('') || 'Screen';
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

  // 7. components/ui/Button.tsx
  files['components/ui/Button.tsx'] = `import React from 'react';
import { Pressable, Text } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function Button({ label, onPress, variant = 'primary', className = '' }: ButtonProps) {
  const baseClass = "px-4 py-2.5 rounded-lg flex-row items-center justify-center";
  const variantClasses = {
    primary: "bg-accent-primary",
    secondary: "bg-surface-secondary",
    outline: "border border-hairline bg-transparent",
  };
  const textClasses = {
    primary: "text-white font-semibold text-sm",
    secondary: "text-ink-primary font-medium text-sm",
    outline: "text-ink-primary font-medium text-sm",
  };

  return (
    <Pressable onPress={onPress} className={\`\${baseClass} \${variantClasses[variant]} \${className}\`}>
      <Text className={textClasses[variant]}>{label}</Text>
    </Pressable>
  );
}
`;

  // 8. components/ui/MetricCard.tsx
  files['components/ui/MetricCard.tsx'] = `import React from 'react';
import { View, Text } from 'react-native';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export function MetricCard({ title, value, change, isPositive }: MetricCardProps) {
  return (
    <View className="p-4 rounded-xl border border-hairline bg-surface-secondary mb-3">
      <Text className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-1">{title}</Text>
      <Text className="text-2xl font-bold text-ink-primary mb-1">{value}</Text>
      {change && (
        <Text className={\`text-xs font-medium \${isPositive ? 'text-emerald-500' : 'text-rose-500'}\`}>
          {change}
        </Text>
      )}
    </View>
  );
}
`;

  // 9. Generate screen components
  const screenEntries: Array<{ id: string; name: string; componentName: string }> = [];

  for (const screen of manifest.screens) {
    const compName = `${sanitizeName(screen.name)}Screen`;
    screenEntries.push({ id: screen.id, name: screen.name, componentName: compName });

    files[`components/screens/${compName}.tsx`] = `import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../ui/Button';
import { MetricCard } from '../ui/MetricCard';

export function ${compName}() {
  return (
    <ScrollView className="flex-1 bg-surface-primary p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-ink-primary tracking-tight">${screen.name}</Text>
        <Text className="text-sm text-ink-muted mt-1">Exported mobile screen from Tessellate AST.</Text>
      </View>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <MetricCard title="Activity" value="98.4%" change="+2.1%" isPositive={true} />
        </View>
        <View className="flex-1">
          <MetricCard title="Latency" value="24ms" change="-4ms" isPositive={true} />
        </View>
      </View>

      <View className="p-4 rounded-xl border border-hairline bg-surface-secondary mb-6">
        <Text className="text-base font-semibold text-ink-primary mb-2">Screen Hierarchy</Text>
        <Text className="text-xs text-ink-muted mb-4">
          Node ID: ${screen.rootNode.id} · Role: ${screen.rootNode.semanticRole}
        </Text>
        <Button label="Execute Action" onPress={() => console.log('Action triggered in ${screen.name}')} />
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
  const defaultScreen = screenEntries[0]?.componentName || 'HomeScreen';
  const importStatements = screenEntries
    .map((s) => `import { ${s.componentName} } from '../components/screens/${s.componentName}';`)
    .join('\n');

  const screenBranches = screenEntries
    .map(
      (s) => `if (activeScreen === '${s.id}') {
    return <${s.componentName} />;
  }`
    )
    .join('\n  ');

  const tabButtons = screenEntries
    .map(
      (s) => `<Pressable
          key="${s.id}"
          onPress={() => setActiveScreen('${s.id}')}
          className={\`flex-1 py-3 items-center justify-center \${activeScreen === '${s.id}' ? 'border-t-2 border-accent-primary' : ''}\`}
        >
          <Text className={\`text-xs font-semibold \${activeScreen === '${s.id}' ? 'text-accent-primary' : 'text-ink-muted'}\`}>
            ${s.name}
          </Text>
        </Pressable>`
    )
    .join('\n        ');

  files['app/index.tsx'] = `import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
${importStatements}

export default function Index() {
  const [activeScreen, setActiveScreen] = useState('${screenEntries[0]?.id || ''}');

  const renderScreen = () => {
    ${screenBranches}
    return <View className="flex-1 bg-surface-primary" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-primary">
      {/* Top App Header */}
      <View className="px-4 py-3 border-b border-hairline flex-row items-center justify-between">
        <Text className="font-bold text-base text-ink-primary tracking-tight">${manifest.name}</Text>
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

Exported from [Tessellate](https://github.com/danishgm-sketch/Tessellate) on ${new Date().toISOString()}.
Universal mobile application target built with Expo SDK 52 and NativeWind v4 (Tailwind CSS for React Native).

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
