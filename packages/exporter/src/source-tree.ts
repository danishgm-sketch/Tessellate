import type { ProjectManifest, ProjectNode, ProjectScreen, PartialDesignDNA } from '@tessellate/schemas';
import { normalizeDesignTokens, tokensToCssVariables, MANIFEST_LAYOUT_CSS, nodeLayoutClass, nodeRuntimeVariant } from '@tessellate/renderer';
import { collectProjectDependencies } from './dependencies.js';
import { getGoldResourceSource } from './generated-gold-sources.js';

export interface ResolvedResource {
  slug: string;
  componentName: string;
  fileName: string;
  code: string;
  acceptedProps: Set<string> | null;
  dependencies?: string[];
}

export type ResourceResolver = (slug: string) => ResolvedResource | null;
let customDiskResolver: ResourceResolver | null = null;
export function setDiskResourceResolver(resolver: ResourceResolver | null) {
  customDiskResolver = resolver;
}

function resolveResource(slug: string, semanticRole: string, nodeId: string): ResolvedResource {
  const goldSource = getGoldResourceSource(slug);
  if (goldSource) {
    const acceptedProps = new Set(goldSource.acceptedProps);
    return {
      slug,
      componentName: goldSource.componentName,
      fileName: `${goldSource.componentName}.tsx`,
      code: goldSource.code,
      acceptedProps,
      dependencies: Object.keys(goldSource.dependencies),
    };
  }

  if (customDiskResolver) {
    const diskResolved = customDiskResolver(slug);
    if (diskResolved) {
      return diskResolved;
    }
  }

  throw new Error(
    `Unresolved resource in export: "${slug}" (referenced by node "${nodeId}", role "${semanticRole}"). In production exports, all resources must resolve to their actual implementations rather than synthetic fallbacks.`
  );
}

/**
 * Converts a ProjectManifest into a clean, complete, standalone
 * Vite + React + TypeScript + Tailwind CSS 4 project source tree.
 */
export function generateSourceTree(manifest: ProjectManifest): Record<string, string> {
  const files: Record<string, string> = {};
  const slugName = manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tessellate-app';

  const { dependencies, devDependencies } = collectProjectDependencies(manifest);

  // 1. package.json
  files['package.json'] = JSON.stringify(
    {
      name: slugName,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      },
      dependencies,
      devDependencies,
    },
    null,
    2
  );

  // 2. vite.config.ts
  files['vite.config.ts'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

  // 3. tsconfig.json
  files['tsconfig.json'] = JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: false,
        resolveJsonModule: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src'],
    },
    null,
    2
  );

  // 4. index.html
  files['index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest.name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</title>
  </head>
  <body class="bg-[#FAF9F6] text-[#111217] antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  // 5. src/index.css (Tailwind 4 + Normalized CSS variables)
  const tokens = normalizeDesignTokens(manifest.designDNA);
  const cssVars = tokensToCssVariables(tokens);
  const cssVarDeclarations = Object.entries(cssVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  files['src/index.css'] = `@import "tailwindcss";

:root {
${cssVarDeclarations}
}
@custom-variant dark (&:where(.dark,.dark *):not(.tess-screen *), &:where([data-resource-variant="nocturne"], [data-resource-variant="nocturne"] *));
${MANIFEST_LAYOUT_CSS}
${manifest.designDNA.visualMode==='adaptive'?`@media(prefers-color-scheme:dark){:root{${Object.entries(tokensToCssVariables(normalizeDesignTokens(manifest.designDNA,{activeMode:'dark'}))).map(([key,value])=>`${key}:${value};`).join('')}}}`:''}
`;

  // 6. src/main.tsx
  files['src/main.tsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  // 7. Baseline Component Primitives in src/components/
  files['src/components/Button.tsx'] = `import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'quiet' | 'expressive' | 'nocturne';
  label?: string;
}

export function Button({ variant = 'primary', label, children, className = '', ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none text-xs px-3.5 py-1.5 rounded-[var(--tess-radius-sm,6px)]";
  const styles: Record<string, string> = {
    primary: "bg-[var(--tess-accent-primary,#2547E8)] text-white hover:opacity-90 shadow-xs",
    outline: "border border-[var(--tess-hairline,#D9D6CF)] text-[var(--tess-ink,#111217)] hover:bg-[var(--tess-surface-secondary,#F2EFE9)]",
    ghost: "text-[var(--tess-ink-secondary,#62666F)] hover:bg-[var(--tess-surface-secondary,#F2EFE9)]",
    quiet: "bg-neutral-900 text-white hover:opacity-90",
    expressive: "bg-[#2547E8] text-white shadow-md hover:bg-blue-700",
    nocturne: "bg-[#06B6D4] text-neutral-950 font-bold hover:bg-cyan-400",
  };
  return (
    <button className={\`\${base} \${styles[variant] ?? styles.primary} \${className}\`} {...props}>
      {label || children}
    </button>
  );
}
`;

  files['src/components/MetricCard.tsx'] = `import React from 'react';

export interface MetricCardProps {
  title?: string;
  value?: string | number;
  change?: string;
  isPositive?: boolean;
}

export function MetricCard({ title, value, change, isPositive }: MetricCardProps) {
  return (
    <div className="p-5 rounded-[var(--tess-radius-md,12px)] bg-white dark:bg-[#171B21] border border-[var(--tess-hairline,#D9D6CF)] shadow-xs flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-[var(--tess-ink-secondary,#62666F)] font-medium">
        <span>{title}</span>
        {change && (
          <span className={\`px-1.5 py-0.5 rounded text-[11px] font-semibold \${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }\`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-[var(--tess-ink,#111217)]">
        {value}
      </div>
    </div>
  );
}
`;

  files['src/components/AppHeader.tsx'] = `import React from 'react';

export interface AppHeaderProps {
  title?: string;
  navItems?: Array<{ label: string; href?: string; active?: boolean }>;
}

export function AppHeader({ title = 'Application', navItems = [] }: AppHeaderProps) {
  return (
    <header className="h-16 px-6 border-b border-[var(--tess-hairline,#D9D6CF)] bg-white dark:bg-[#171B21] flex items-center justify-between">
      <div className="text-sm font-bold tracking-tight text-[var(--tess-ink,#111217)]">
        {title}
      </div>
      {navItems.length > 0 && (
        <nav className="flex items-center gap-4 text-xs font-medium">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href || '#'}
              className={\`transition-colors \${item.active ? 'text-[var(--tess-accent-primary,#2547E8)] font-semibold' : 'text-[var(--tess-ink-secondary,#62666F)] hover:text-[var(--tess-ink,#111217)]'}\`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
`;

  // 8. Resource Resolution: Collect all unique resourceRefs across all screens
  const resourceMap: Record<string, ResolvedResource> = {
    button: {
      slug: 'button',
      componentName: 'Button',
      fileName: 'Button.tsx',
      code: files['src/components/Button.tsx'],
      acceptedProps: new Set(['variant', 'label', 'className', 'children', 'disabled', 'onClick', 'type']),
    },
    'metric-card': {
      slug: 'metric-card',
      componentName: 'MetricCard',
      fileName: 'MetricCard.tsx',
      code: files['src/components/MetricCard.tsx'],
      acceptedProps: new Set(['title', 'value', 'change', 'isPositive']),
    },
  };

  function collectNodes(node: ProjectNode) {
    if (node.resourceRef?.slug) {
      const slug = node.resourceRef.slug;
      if (!resourceMap[slug]) {
        const resolved = resolveResource(slug, node.semanticRole, node.id);
        resourceMap[slug] = resolved;
        files[`src/components/${resolved.fileName}`] = resolved.code;
      }
    }
    if (node.children) {
      for (const child of node.children) {
        collectNodes(child);
      }
    }
  }

  for (const screen of manifest.screens) {
    collectNodes(screen.rootNode);
  }

  // 9. Screen components in src/screens/
  const screenSlugs: Array<{ id: string; name: string; componentName: string; file: string }> = [];

  manifest.screens.forEach((screen, index) => {
    const baseName=sanitizeComponentName(screen.name || `Screen${index + 1}`);
    const duplicateName=manifest.screens.slice(0,index).some(previous=>sanitizeComponentName(previous.name)===baseName);
    const componentName=duplicateName?`${baseName}${index+1}`:baseName;
    const fileName = `${componentName}.tsx`;
    screenSlugs.push({
      id: screen.id,
      name: screen.name,
      componentName,
      file: fileName,
    });

    files[`src/screens/${fileName}`] = generateScreenCode(screen, componentName, resourceMap, manifest.designDNA);
  });

  // 10. src/App.tsx with Screen Navigation
  const importsStr = screenSlugs
    .map((s) => `import { ${s.componentName} } from './screens/${s.componentName}';`)
    .join('\n');

  const navButtonsStr = screenSlugs
    .map(
      (s) => `<button
            aria-pressed={activeScreenId===${JSON.stringify(s.id)}} onClick={() => navigate(${JSON.stringify(s.id)})}
            className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors \${
              activeScreenId === ${JSON.stringify(s.id)}
                ? 'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)] shadow-xs'
                : 'text-[var(--tess-ink-secondary,#62666F)] hover:bg-[var(--tess-surface-secondary,#F2EFE9)]'
            }\`}
          >
            {${JSON.stringify(s.name)}}
          </button>`
    )
    .join('\n          ');

  const screenSwitchStr = screenSlugs
    .map((s) => `case ${JSON.stringify(s.id)}: return <${s.componentName} />;`)
    .join('\n      ');

  files['src/App.tsx'] = `import React, { useState, useEffect } from 'react';
${importsStr}

export default function App() {
  const screens = ${JSON.stringify(screenSlugs.map(item=>item.id))};
  const readScreen=()=>screens.includes(location.hash.slice(1)) ? location.hash.slice(1) : screens[0];
  const [activeScreenId,setActiveScreenId]=useState(readScreen);
  const navigate=(id:string)=>{location.hash=id;setActiveScreenId(id);};
  useEffect(()=>{const handle=()=>setActiveScreenId(readScreen());window.addEventListener('hashchange',handle);return ()=>window.removeEventListener('hashchange',handle);},[]);


  const renderActiveScreen = () => {
    switch (activeScreenId) {
      ${screenSwitchStr}
      default:
        return <${screenSlugs[0]?.componentName || 'div'} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--tess-canvas,#FAF9F6)] text-[var(--tess-ink,#111217)] font-sans">
      {/* Top Navigation */}
      <div className="border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface)] px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="font-bold text-sm tracking-tight">{${JSON.stringify(manifest.name)}}</div>
        <div aria-label="Project screens" className="flex flex-wrap items-center gap-2">
          ${navButtonsStr}
        </div>
      </div>

      {/* Screen Container */}
      <main className="flex-1">
        {renderActiveScreen()}
      </main>
    </div>
  );
}
`;

  // 11. README.md
  files['README.md'] = `# ${manifest.name}

Exported from [Tessellate](https://github.com/danishgm-sketch/Tessellate) on ${new Date().toISOString()}.

${manifest.description || 'Interface composition system generated from Product Intent and Design DNA.'}

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Bundler:** Vite 6

## Getting Started

Install dependencies:
\`\`\`bash
pnpm install
# or: npm install / yarn install
\`\`\`

Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

Build for production:
\`\`\`bash
pnpm build
\`\`\`

## Design DNA
- **Archetype:** ${manifest.designDNA.primaryArchetype}
- **Visual Mode:** ${manifest.designDNA.visualMode}
- **Geometry:** ${manifest.designDNA.geometryFamily}
- **Visual Ambition:** ${manifest.designDNA.visualAmbition}/100
- **Surface:** ${manifest.designDNA.surfacePersonality}
`;

  files['project.tess.json'] = JSON.stringify(manifest,null,2);
  return files;
}

function sanitizeComponentName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const words = clean.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const res = words.join('');
  return res || 'ScreenComponent';
}

function generateScreenCode(
  screen: ProjectScreen,
  componentName: string,
  resourceMap: Record<string, ResolvedResource>,
  dna: PartialDesignDNA
): string {
  const usedComponents = new Set<string>();
  let adaptive=dna.visualMode==='adaptive';

  function scanNode(node: ProjectNode) {
    if(node.dnaOverrides?.visualMode==='adaptive')adaptive=true;
    if (node.resourceRef?.slug && resourceMap[node.resourceRef.slug]) {
      usedComponents.add(resourceMap[node.resourceRef.slug]!.componentName);
    } else if (node.semanticRole === 'navigation-header') {
      usedComponents.add('AppHeader');
    } else if (node.semanticRole === 'metric-kpi') {
      usedComponents.add('MetricCard');
    } else if (node.semanticRole === 'action-button') {
      usedComponents.add('Button');
    }

    if (node.children) {
      for (const child of node.children) {
        scanNode(child);
      }
    }
  }

  scanNode(screen.rootNode);

  const importLines = Array.from(usedComponents)
    .sort()
    .map((name) => `import { ${name} } from '../components/${name}';`)
    .join('\n');

  return `import React${adaptive?', {useEffect,useState}':''} from 'react';
${importLines}

export function ${componentName}() {
  ${adaptive?`const [systemDark,setSystemDark]=useState(()=>window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const update=()=>setSystemDark(media.matches);media.addEventListener('change',update);return ()=>media.removeEventListener('change',update);},[]);`:''}
  return (
    <div className="tess-screen w-full min-h-screen" data-screen-id={${JSON.stringify(screen.id)}}>
      ${renderNodeToJsx(screen.rootNode, 3, resourceMap, dna)}
    </div>
  );
}
`;
}

function renderNodeToJsx(
  node: ProjectNode,
  indentLevel: number,
  resourceMap: Record<string, ResolvedResource>,
  inheritedDNA: PartialDesignDNA = {},
  inheritedTokens:Record<string,string|number> = {}
): string {
  const dna = {...inheritedDNA,...node.dnaOverrides};
  const tokens={...inheritedTokens,...node.tokenOverrides};
  const localStyle = node.dnaOverrides || node.tokenOverrides ? tokensToCssVariables(normalizeDesignTokens(dna,{tokenOverrides:tokens})) : {};
  const staticVariant=nodeRuntimeVariant(node,dna);
  const variantExpression=dna.visualMode==='adaptive'?`systemDark ? 'nocturne' : ${JSON.stringify(staticVariant ?? null)}`:JSON.stringify(staticVariant ?? null);
  const darkStyle=tokensToCssVariables(normalizeDesignTokens(dna,{tokenOverrides:tokens,activeMode:'dark'}));
  const styleExpression=dna.visualMode==='adaptive' && (node.dnaOverrides || node.tokenOverrides)?`systemDark ? ${JSON.stringify(darkStyle)} : ${JSON.stringify(localStyle)}`:JSON.stringify(localStyle);
  const wrapperAttributes = `data-resource-variant={${variantExpression}} data-node-id={${JSON.stringify(node.id)}} data-semantic-role={${JSON.stringify(node.semanticRole)}} style={(${styleExpression}) as React.CSSProperties}`;
  const indent = '  '.repeat(indentLevel);
  const className = (node.props['className'] as string) || '';

  // 1. Resolved Resource
  if (node.resourceRef?.slug && resourceMap[node.resourceRef.slug]) {
    const resolved = resourceMap[node.resourceRef.slug]!;
    const compName = resolved.componentName;
    const acceptedProps = resolved.acceptedProps;

    const attributes: string[] = [];
    const runtimeVariant = nodeRuntimeVariant(node,dna);
    if (runtimeVariant && (!acceptedProps || acceptedProps.has('variant'))) {
      attributes.push(`variant={${variantExpression}}`);
    }

    const candidateProps = {
      ...(node.slots || {}),
      ...(node.props || {}),
    };

    for (const [key, val] of Object.entries(candidateProps)) {
      if (key === 'className' || key === 'variant' || key === 'children') continue;
      if (acceptedProps && !acceptedProps.has(key)) continue;

      if (val !== undefined && typeof val !== 'function') attributes.push(`${key}={${JSON.stringify(val)}}`);
    }

    const attrStr = attributes.length > 0 ? ' ' + attributes.join(' ') : '';

    if (node.children && node.children.length > 0) {
      const childJsx = '\n' + node.children.map((c) => renderNodeToJsx(c, indentLevel + 1, resourceMap, dna, tokens)).join('\n') + '\n' + indent;
      return `${indent}<div className={${JSON.stringify("@container "+nodeLayoutClass(node))}} ${wrapperAttributes}><${compName}${attrStr}>${childJsx}</${compName}></div>`;
    }
    if (candidateProps.children !== undefined && (!acceptedProps || acceptedProps.has('children'))) {
      return `${indent}<div className={${JSON.stringify("@container "+nodeLayoutClass(node))}} ${wrapperAttributes}><${compName}${attrStr}>{${JSON.stringify(candidateProps.children)}}</${compName}></div>`;
    }

    return `${indent}<div className={${JSON.stringify("@container "+nodeLayoutClass(node))}} ${wrapperAttributes}><${compName}${attrStr} /></div>`;
  }

  // 2. Built-in Semantic Roles
  if (node.semanticRole === 'navigation-header') {
    const title = (node.props['title'] as string) || 'Header';
    return `${indent}<AppHeader title="${title}" />`;
  }

  if (node.semanticRole === 'metric-kpi') {
    const title = (node.props['title'] as string) || (node.slots?.['title'] as string) || 'Metric';
    const value = (node.props['value'] as string) || (node.slots?.['value'] as string) || '0';
    const change = (node.props['change'] as string) || '';
    const isPositive = Boolean(node.props['isPositive']);
    return `${indent}<MetricCard title="${title}" value="${value}" change="${change}" isPositive={${isPositive}} />`;
  }

  if (node.semanticRole === 'action-button') {
    const label = (node.props['label'] as string) || (node.slots?.['label'] as string) || 'Action';
    const variant = (node.props['variant'] as string) || 'primary';
    return `${indent}<Button variant="${variant}" label="${label}" />`;
  }

  if (node.semanticRole === 'status-indicator') {
    const text = (node.props['children'] as string) || 'Active';
    return `${indent}<div className="${className}">${text}</div>`;
  }

  // 3. Layout / Generic Containers
  const childJsx = node.children && node.children.length > 0
    ? '\n' + node.children.map((c) => renderNodeToJsx(c, indentLevel + 1, resourceMap, dna, tokens)).join('\n') + '\n' + indent
    : '';

  return `${indent}<div className={${JSON.stringify(nodeLayoutClass(node)+" "+className)}} ${wrapperAttributes}>${childJsx || `{${JSON.stringify(node.props.children ?? null)}}`}</div>`;
}
