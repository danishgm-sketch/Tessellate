import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const VERSO_COLLECTIONS = [
  'fields',
  'type',
  'pointers',
  'depth',
  'objects',
  'sections',
  'desk',
  'editions',
  'hybrids',
  'originals',
] as const;

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface VersoInventoryResource {
  id: string;
  name: string;
  component: string;
  sourceExport: string;
  summary: string;
  functionalPurpose: string;
  lineage: string[];
  tags: string[];
  mix: string[];
  collection: (typeof VERSO_COLLECTIONS)[number];
  sourcePath: string;
  sourceHash: string;
  sourceFiles: Array<{ path: string; sha256: string }>;
  exportedComponent: boolean;
  props: Array<{ name: string; type: string; required: boolean }>;
  slotHints: string[];
  imports: { local: string[]; external: string[] };
  dependencies: Array<{ package: string; declaredRange: string | null; usage: 'imported' }>;
  signals: {
    jsxElements: string[];
    eventProps: string[];
    ariaAttributes: string[];
    roles: string[];
    reactHooks: string[];
    browserApis: string[];
    visualApis: string[];
    responsiveHints: string[];
    reducedMotionHints: string[];
    visualCharacter: string[];
    controls: string[];
    statefulPatterns: string[];
    riskSignals: string[];
  };
  suggestedSemanticRoles: string[];
  semanticRoleAssessment: 'heuristic-candidates-only';
  suggestedProductArchetypes: string[];
  productArchetypeAssessment: 'heuristic-candidates-only';
  themeRequirements: {
    usesVersoContext: boolean;
    usesVersoCssTokens: boolean;
    remoteFontReference: boolean;
    observedStyleHints: string[];
    assessment: 'not-adapted-to-tessellate-dna';
  };
  interactionAssessment: 'source-signals-only-not-tested';
  performanceAssessment: 'source-signals-only-not-profiled';
  accessibilityAssessment: 'source-signals-only-not-audited';
  responsivenessAssessment: 'source-signals-only-not-tested';
  previewSupport: 'not-integrated';
  exportSupport: 'not-integrated';
  provenance: {
    sourcePath: string;
    sourceHash: string;
    declaredLineage: string[];
    sourcePackageLicense: string;
    redistribution: 'blocked-unlicensed';
  };
  similarTessellateResources: Array<{ slug: string; score: number }>;
  integrationStatus: 'local-source-inventoried';
  certification: 'unverified';
  redistributionStatus: 'blocked-unlicensed';
  blockers: string[];
}

export interface VersoInventory {
  schemaVersion: 1;
  generatedAt: string;
  source: {
    root: string;
    packageName: string | null;
    packageVersion: string | null;
    license: string;
    archive: string | null;
    archiveSha256: string | null;
  };
  tessellateCatalogue: { path: string | null; count: number };
  totals: {
    declaredResources: number;
    byCollection: Record<string, number>;
    staticMetadataFailures: number;
    duplicateIds: string[];
  };
  resources: VersoInventoryResource[];
  warnings: string[];
}

export interface CatalogueEntry {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  categories?: string[];
  roles?: string[];
  purposes?: string[];
  tags?: string[];
  productArchetypes?: string[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'is', 'it', 'of', 'on', 'or',
  'the', 'this', 'to', 'with', 'your', 'you', 'that', 'when', 'where', 'which', 'their', 'them', 'they',
]);

const ROLE_HINTS: Array<[RegExp, string]> = [
  [/\b(hero|masthead|headline|landing)\b/i, 'marketing-hero'],
  [/\b(nav|navigation|sidebar|menu|breadcrumb)\b/i, 'navigation'],
  [/\b(dashboard|overview|kpi|metric|summary)\b/i, 'dashboard-summary'],
  [/\b(table|grid|list|directory|roster)\b/i, 'data-list'],
  [/\b(chart|graph|analytics|visuali[sz]ation|trend)\b/i, 'data-visualization'],
  [/\b(form|field|input|picker|select|search)\b/i, 'form-control'],
  [/\b(dialog|modal|drawer|popover|tooltip)\b/i, 'overlay'],
  [/\b(card|panel|tile|widget)\b/i, 'content-panel'],
  [/\b(onboarding|welcome|setup|getting.started)\b/i, 'onboarding'],
  [/\b(settings|preferences|configuration)\b/i, 'settings'],
  [/\b(pricing|checkout|cart|product|commerce)\b/i, 'commerce'],
  [/\b(editor|canvas|timeline|workspace|workbench)\b/i, 'editor-workspace'],
  [/\b(activity|notification|inbox|feed|event)\b/i, 'activity-feed'],
  [/\b(approval|review|request|sign.off)\b/i, 'approval-workflow'],
  [/\b(chat|assistant|agent|prompt|conversation)\b/i, 'assistant-interaction'],
];

const ARCHETYPE_HINTS: Array<[RegExp, string]> = [
  [/\b(marketing|landing|campaign|hero|pricing|brand|editorial)\b/i, 'marketing'],
  [/\b(dashboard|analytics|chart|metric|report|observability)\b/i, 'analytics'],
  [/\b(admin|operations|approval|workflow|settings|table|team|people|employee)\b/i, 'business-operations'],
  [/\b(shop|checkout|cart|product|commerce|catalogue|catalog)\b/i, 'ecommerce'],
  [/\b(chat|assistant|agent|ai|prompt|conversation)\b/i, 'ai-product'],
  [/\b(profile|account|user|identity|onboarding)\b/i, 'consumer-product'],
  [/\b(editor|canvas|code|developer|terminal|api)\b/i, 'developer-tool'],
];

function unwrapExpression(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function readStaticLiteral(node: ts.Expression): JsonValue | undefined {
  const expression = unwrapExpression(node);
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(expression)) {
    const items = expression.elements.map((item) => readStaticLiteral(item as ts.Expression));
    if (items.some((item) => item === undefined)) return undefined;
    return items as JsonValue[];
  }
  if (ts.isObjectLiteralExpression(expression)) {
    const value: Record<string, JsonValue> = {};
    for (const property of expression.properties) {
      if (!ts.isPropertyAssignment(property)) return undefined;
      const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
        ? property.name.text
        : undefined;
      if (!key) return undefined;
      const propertyValue = readStaticLiteral(property.initializer);
      if (propertyValue === undefined) return undefined;
      value[key] = propertyValue;
    }
    return value;
  }
  return undefined;
}

function hasExportModifier(node: ts.Node): boolean {
  return !!ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false);
}

export function parseVersoMetadata(
  sourceText: string,
  fileName = 'resource.tsx',
  resolveImportedLineage?: (name: string) => string[] | undefined,
):
  | { ok: true; metadata: { id: string; name: string; component: string; summary: string; lineage: string[]; tags: string[]; mix: string[] }; exportedNames: string[] }
  | { ok: false; reason: string } {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  if (((sourceFile as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics?.length ?? 0) > 0) {
    return { ok: false, reason: 'TypeScript syntax could not be parsed.' };
  }

  const exportedNames: string[] = [];
  let metaInitializer: ts.Expression | undefined;
  for (const statement of sourceFile.statements) {
    if (hasExportModifier(statement) && (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))) {
      if (statement.name) exportedNames.push(statement.name.text);
    }
    if (hasExportModifier(statement) && ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exportedNames.push(declaration.name.text);
          if (declaration.name.text === 'meta') metaInitializer = declaration.initializer;
        }
      }
    }
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) exportedNames.push(element.name.text);
    }
  }
  if (!metaInitializer) return { ok: false, reason: 'No exported meta declaration was found.' };
  const objectLiteral = unwrapExpression(metaInitializer);
  if (!ts.isObjectLiteralExpression(objectLiteral)) {
    return { ok: false, reason: 'Exported meta is not a static object literal; source was not executed.' };
  }
  const meta: Record<string, JsonValue | undefined> = {};
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      return { ok: false, reason: 'Exported meta contains a non-literal property; source was not executed.' };
    }
    const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : undefined;
    if (!key) return { ok: false, reason: 'Exported meta contains a computed property; source was not executed.' };
    if (key === 'lineage' && ts.isCallExpression(unwrapExpression(property.initializer))) {
      const call = unwrapExpression(property.initializer) as ts.CallExpression;
      if (ts.isIdentifier(call.expression) && call.expression.text === 'lineageOf' && resolveImportedLineage) {
        const lineageParts = call.arguments.map((argument) => {
          const unwrappedArgument = unwrapExpression(argument);
          return ts.isIdentifier(unwrappedArgument) ? resolveImportedLineage(unwrappedArgument.text) : undefined;
        });
        if (lineageParts.every((part) => part !== undefined)) {
          meta[key] = [...new Set(lineageParts.flatMap((part) => part!))];
          continue;
        }
      }
    }
    meta[key] = readStaticLiteral(property.initializer);
  }
  const required = ['id', 'name', 'component', 'summary', 'lineage'];
  if (required.some((key) => typeof meta[key] !== 'string' && key !== 'lineage')) {
    return { ok: false, reason: 'Metadata is missing a required string field.' };
  }
  if (!Array.isArray(meta.lineage) || !meta.lineage.every((item) => typeof item === 'string')) {
    return { ok: false, reason: 'Metadata lineage must be a static string array.' };
  }
  if (meta.tags !== undefined && (!Array.isArray(meta.tags) || !meta.tags.every((item) => typeof item === 'string'))) {
    return { ok: false, reason: 'Metadata tags must be a static string array.' };
  }
  if (meta.mix !== undefined && (!Array.isArray(meta.mix) || !meta.mix.every((item) => typeof item === 'string'))) {
    return { ok: false, reason: 'Metadata mix must be a static string array.' };
  }
  return {
    ok: true,
    metadata: {
      id: meta.id as string,
      name: meta.name as string,
      component: meta.component as string,
      summary: meta.summary as string,
      lineage: meta.lineage as string[],
      tags: (meta.tags as string[] | undefined) ?? [],
      mix: (meta.mix as string[] | undefined) ?? [],
    },
    exportedNames,
  };
}

function collectNodes(sourceFile: ts.SourceFile, predicate: (node: ts.Node) => boolean): ts.Node[] {
  const results: ts.Node[] = [];
  const visit = (node: ts.Node) => {
    if (predicate(node)) results.push(node);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return results;
}

function packageName(specifier: string): string {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0] ?? specifier;
}

function words(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) ?? []);
}

function scoreCatalogueEntry(query: string[], entry: CatalogueEntry): number {
  const resourceText = [entry.name, entry.description, ...(entry.categories ?? []), ...(entry.roles ?? []), ...(entry.purposes ?? []), ...(entry.tags ?? []), ...(entry.productArchetypes ?? [])]
    .filter(Boolean).join(' ');
  const resourceTokens = words(resourceText);
  if (resourceTokens.size === 0 || query.length === 0) return 0;
  const queryTokens = new Set(query);
  let overlap = 0;
  for (const token of queryTokens) if (resourceTokens.has(token)) overlap++;
  return Math.round((overlap / Math.sqrt(queryTokens.size * resourceTokens.size)) * 1000) / 1000;
}

function suggestedValues(value: string, hints: Array<[RegExp, string]>): string[] {
  return [...new Set(hints.filter(([pattern]) => pattern.test(value)).map(([, result]) => result))];
}

function resolveLocalImport(root: string, fromFile: string, specifier: string): string | null {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [base, `${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.js`, path.join(base, 'index.tsx'), path.join(base, 'index.ts')];
  for (const candidate of candidates) {
    if (!candidate.startsWith(`${root}${path.sep}`)) continue;
    let isFile = false;
    try {
      isFile = fs.statSync(candidate).isFile();
    } catch {
      // Continue through known TypeScript/JavaScript extensions only.
    }
    if (!isFile) continue;
    const canonical = fs.realpathSync(candidate);
    if (!isWithin(root, canonical)) throw new Error(`Local import escapes the Verso source root: ${specifier}`);
    return canonical;
  }
  return null;
}

function resolveImportedMetaLineage(root: string, fromFile: string, importedName: string, visited = new Set<string>()): string[] | undefined {
  if (visited.has(fromFile)) return undefined;
  visited.add(fromFile);
  const sourceFile = ts.createSourceFile(fromFile, fs.readFileSync(fromFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const namedBindings = statement.importClause.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;
    for (const importSpecifier of namedBindings.elements) {
      const localName = importSpecifier.name.text;
      const upstreamName = importSpecifier.propertyName?.text ?? localName;
      if (localName !== importedName || upstreamName !== 'meta') continue;
      const importedFile = resolveLocalImport(root, fromFile, statement.moduleSpecifier.text);
      if (!importedFile) return undefined;
      const importedSource = fs.readFileSync(importedFile, 'utf8');
      const parsed = parseVersoMetadata(
        importedSource,
        importedFile,
        (name) => resolveImportedMetaLineage(root, importedFile, name, new Set(visited)),
      );
      return parsed.ok ? parsed.metadata.lineage : undefined;
    }
  }
  return undefined;
}

function typeProperties(sourceFile: ts.SourceFile, typeNode: ts.TypeNode, visited = new Set<string>(), depth = 0): ts.PropertySignature[] {
  if (depth > 8) return [];
  if (ts.isTypeLiteralNode(typeNode)) return typeNode.members.filter(ts.isPropertySignature);
  if (ts.isIntersectionTypeNode(typeNode) || ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.flatMap((member) => typeProperties(sourceFile, member, new Set(visited), depth + 1));
  }
  if (!ts.isTypeReferenceNode(typeNode)) return [];
  const typeName = typeNode.typeName.getText(sourceFile);
  if (visited.has(typeName)) return [];
  visited.add(typeName);
  const declaration = sourceFile.statements.find((statement) =>
    (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === typeName,
  );
  if (declaration && ts.isInterfaceDeclaration(declaration)) {
    return declaration.members.filter(ts.isPropertySignature);
  }
  if (declaration && ts.isTypeAliasDeclaration(declaration)) {
    return typeProperties(sourceFile, declaration.type, visited, depth + 1);
  }
  if (typeNode.typeArguments?.length) {
    return typeNode.typeArguments.flatMap((argument) => typeProperties(sourceFile, argument, new Set(visited), depth + 1));
  }
  return [];
}

function inspectSource(filePath: string): {
  imports: { local: string[]; external: string[] };
  props: Array<{ name: string; type: string; required: boolean }>;
  signals: VersoInventoryResource['signals'];
  themeRequirements: VersoInventoryResource['themeRequirements'];
} {
  const text = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const importSpecifiers: string[] = [];
  for (const node of collectNodes(sourceFile, (item) =>
    (ts.isImportDeclaration(item) || ts.isExportDeclaration(item)) && !!item.moduleSpecifier && ts.isStringLiteral(item.moduleSpecifier),
  )) {
    const moduleSpecifier = (node as ts.ImportDeclaration | ts.ExportDeclaration).moduleSpecifier;
    if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) importSpecifiers.push(moduleSpecifier.text);
  }
  for (const node of collectNodes(sourceFile, ts.isCallExpression)) {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      importSpecifiers.push(node.arguments[0].text);
    }
  }
  const local: string[] = [];
  const external: string[] = [];
  for (const specifier of [...new Set(importSpecifiers)]) {
    if (specifier.startsWith('.')) local.push(specifier);
    else external.push(packageName(specifier));
  }

  const componentNodes = sourceFile.statements.filter((statement) =>
    hasExportModifier(statement) && (ts.isFunctionDeclaration(statement) || ts.isVariableStatement(statement)),
  );
  const props: Array<{ name: string; type: string; required: boolean }> = [];
  const seenProps = new Set<string>();
  for (const componentNode of componentNodes) {
    const declarations: ts.Node[] = ts.isVariableStatement(componentNode) ? [...componentNode.declarationList.declarations] : [componentNode];
    for (const declaration of declarations) {
      if (!ts.isFunctionDeclaration(declaration) && !ts.isVariableDeclaration(declaration)) continue;
      if (!declaration.name || !ts.isIdentifier(declaration.name)) continue;
      const initializer = ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
      let parameters: readonly ts.ParameterDeclaration[] = [];
      if (ts.isFunctionDeclaration(declaration)) parameters = declaration.parameters;
      else if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) parameters = initializer.parameters;
      const firstParameter = parameters[0];
      const parameterType = firstParameter?.type;
      if (parameterType) {
        for (const member of typeProperties(sourceFile, parameterType)) {
          if (!member.name || !(ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) continue;
          const name = member.name.text;
          if (seenProps.has(name)) continue;
          seenProps.add(name);
          props.push({ name, type: member.type?.getText(sourceFile) ?? 'unknown', required: !member.questionToken });
        }
      }
    }
  }

  const jsxElements = new Set<string>();
  const eventProps = new Set<string>();
  const ariaAttributes = new Set<string>();
  const roles = new Set<string>();
  for (const node of collectNodes(sourceFile, (item) => ts.isJsxOpeningElement(item) || ts.isJsxSelfClosingElement(item))) {
    const jsx = node as ts.JsxOpeningLikeElement;
    jsxElements.add(jsx.tagName.getText(sourceFile));
    for (const attribute of jsx.attributes.properties) {
      if (!ts.isJsxAttribute(attribute) || !ts.isIdentifier(attribute.name)) continue;
      const name = attribute.name.text;
      if (/^on[A-Z]/.test(name)) eventProps.add(name);
      if (/^aria-/.test(name)) ariaAttributes.add(name);
      if (name === 'role' && attribute.initializer && ts.isStringLiteral(attribute.initializer)) roles.add(attribute.initializer.text);
    }
  }
  const identifiers = new Set(collectNodes(sourceFile, ts.isIdentifier).map((node) => (node as ts.Identifier).text));
  const sourceLower = text.toLowerCase();
  const browserApis = ['document', 'window', 'localStorage', 'sessionStorage', 'navigator', 'matchMedia', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'setInterval', 'requestAnimationFrame']
    .filter((name) => identifiers.has(name));
  const visualApis = ['WebGL', 'WebGL2', 'getContext', 'canvas', 'AudioContext', 'WebSocket'].filter((name) =>
    identifiers.has(name) || sourceLower.includes(name.toLowerCase()),
  );
  const reactHooks = [...identifiers].filter((name) => /^use[A-Z]/.test(name) && ['useState', 'useEffect', 'useLayoutEffect', 'useMemo', 'useCallback', 'useRef', 'useReducer', 'useId', 'useTransition'].includes(name));
  const responsiveHints = [
    ...(sourceLower.includes('@media') ? ['css-media-query'] : []),
    ...(sourceLower.includes('matchmedia') ? ['matchMedia'] : []),
    ...(sourceLower.includes('resizeobserver') ? ['ResizeObserver'] : []),
    ...(sourceLower.includes('prefers-reduced-motion') ? ['reduced-motion-media-query'] : []),
    ...(sourceLower.includes('pointer:') || sourceLower.includes('ontouch') ? ['touch-or-pointer'] : []),
  ];
  const reducedMotionHints = [
    ...(sourceLower.includes('prefers-reduced-motion') ? ['prefers-reduced-motion'] : []),
    ...(sourceLower.includes('reducedmotion') ? ['reducedMotion-prop-or-state'] : []),
    ...(sourceLower.includes('motion-safe') ? ['motion-safe-class'] : []),
  ];
  const visualCharacter = [
    ...(sourceLower.includes('font-display') || sourceLower.includes('font-serif') ? ['serif-display-type'] : []),
    ...(sourceLower.includes('font-mono') ? ['monospaced-labels'] : []),
    ...(sourceLower.includes('backdrop-blur') || sourceLower.includes('backdrop-filter') ? ['backdrop-blur'] : []),
    ...(sourceLower.includes('shadow-') || sourceLower.includes('box-shadow') ? ['shadow-depth'] : []),
    ...(sourceLower.includes('rotate3d') || sourceLower.includes('preserve-3d') || sourceLower.includes('perspective-') ? ['three-dimensional-depth'] : []),
    ...(sourceLower.includes('gradient') || /bg-(?:linear|radial|conic)-/.test(sourceLower) ? ['gradient-treatment'] : []),
    ...(sourceLower.includes('rounded-full') || /rounded-\[\d+px\]/.test(sourceLower) ? ['large-radius-shapes'] : []),
    ...(sourceLower.includes('text-accent') || sourceLower.includes('bg-accent') ? ['atlas-accent-token'] : []),
    ...(sourceLower.includes('text-muted') || sourceLower.includes('bg-sunken') ? ['atlas-paper-ink-tokens'] : []),
    ...(sourceLower.includes('shader') || sourceLower.includes('webgl') || sourceLower.includes('canvas') ? ['canvas-or-shader-rendering'] : []),
    ...(sourceLower.includes('pointermove') || sourceLower.includes('onpointermove') || sourceLower.includes('mousemove') ? ['pointer-reactive'] : []),
  ];
  const controls = [...jsxElements].filter((name) =>
    ['button', 'input', 'select', 'textarea', 'form', 'a', 'summary', 'details'].includes(name.toLowerCase()),
  );
  const statefulPatterns = [
    ...reactHooks,
    ...(eventProps.size > 0 ? ['jsx-event-handlers'] : []),
    ...(sourceLower.includes('contenteditable') ? ['contenteditable'] : []),
  ];
  const riskSignals = [
    ...(sourceLower.includes('dangerouslysetinnerhtml') || sourceLower.includes('innerhtml') ? ['direct-html-injection-sink'] : []),
    ...(sourceLower.includes('eval(') || sourceLower.includes('new function(') ? ['dynamic-code-execution-pattern'] : []),
    ...(sourceLower.includes('fetch(') || sourceLower.includes('xmlhttprequest') || sourceLower.includes('websocket') ? ['network-or-socket-request'] : []),
    ...(sourceLower.includes('localstorage') || sourceLower.includes('sessionstorage') ? ['browser-persistence'] : []),
    ...(sourceLower.includes('.current.style') || sourceLower.includes('document.') || sourceLower.includes('window.') ? ['direct-dom-or-global-browser-api'] : []),
    ...(identifiers.has('setInterval') || identifiers.has('requestAnimationFrame') ? ['continuous-or-repeated-animation-lifecycle-review'] : []),
    ...(sourceLower.includes('prefers-reduced-motion') || sourceLower.includes('reducedmotion') ? [] : (identifiers.has('requestAnimationFrame') || identifiers.has('setInterval') ? ['reduced-motion-implementation-not-observed'] : [])),
    ...(controls.includes('form') && !eventProps.has('onSubmit') ? ['form-without-observed-submit-handler'] : []),
  ];
  const usesVersoContext = [...identifiers].includes('useVerso');
  const usesVersoCssTokens = sourceLower.includes('--v-') || sourceLower.includes('var(--v-');
  const remoteFontReference = sourceLower.includes('fonts.googleapis.com') || sourceLower.includes('fonts.gstatic.com');
  const observedStyleHints = [
    ...(sourceLower.includes('var(--v-') ? ['Verso CSS custom properties'] : []),
    ...(sourceLower.includes('font-serif') || sourceLower.includes('font-display') ? ['display serif'] : []),
    ...(sourceLower.includes('font-mono') ? ['monospaced labels'] : []),
    ...(remoteFontReference ? ['remote Google Fonts reference'] : []),
  ];
  return {
    imports: { local, external: [...new Set(external)].sort() },
    props: props.sort((a, b) => a.name.localeCompare(b.name)),
    themeRequirements: {
      usesVersoContext,
      usesVersoCssTokens,
      remoteFontReference,
      observedStyleHints,
      assessment: 'not-adapted-to-tessellate-dna',
    },
    signals: {
      jsxElements: [...jsxElements].sort(),
      eventProps: [...eventProps].sort(),
      ariaAttributes: [...ariaAttributes].sort(),
      roles: [...roles].sort(),
      reactHooks: [...new Set(reactHooks)].sort(),
      browserApis,
      visualApis,
      responsiveHints,
      reducedMotionHints,
      visualCharacter: [...new Set(visualCharacter)].sort(),
      controls: controls.sort(),
      statefulPatterns: [...new Set(statefulPatterns)].sort(),
      riskSignals: [...new Set(riskSignals)].sort(),
    },
  };
}

function resolveImportClosure(root: string, entry: string): string[] {
  const visited = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const sourceFile = ts.createSourceFile(current, fs.readFileSync(current, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const node of sourceFile.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier) || !node.moduleSpecifier.text.startsWith('.')) continue;
      const localPath = resolveLocalImport(root, current, node.moduleSpecifier.text);
      if (localPath) queue.push(localPath);
    }
  }
  return [...visited].sort();
}

function sha256(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function isWithin(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export function assertPrivatePaths(repositoryRoot: string, sourceRoot: string, outputPath: string): void {
  const repo = fs.realpathSync(repositoryRoot);
  const source = fs.realpathSync(sourceRoot);
  let outputParent = path.dirname(path.resolve(outputPath));
  const unresolved: string[] = [];
  while (!fs.existsSync(outputParent)) {
    unresolved.unshift(path.basename(outputParent));
    const parent = path.dirname(outputParent);
    if (parent === outputParent) throw new Error('Inventory output has no existing ancestor.');
    outputParent = parent;
  }
  const canonicalParent = fs.realpathSync(outputParent);
  const output = path.join(canonicalParent, ...unresolved, path.basename(outputPath));
  if (isWithin(repo, source) || isWithin(repo, output) || isWithin(source, output)) {
    throw new Error('Verso source and inventory output must stay outside both the Tessellate repository and each other.');
  }
}

export function buildVersoInventory(options: {
  repositoryRoot: string;
  sourceRoot: string;
  outputPath: string;
  cataloguePath?: string;
  archivePath?: string;
}): VersoInventory {
  const repositoryRoot = fs.realpathSync(options.repositoryRoot);
  const sourceRoot = fs.realpathSync(options.sourceRoot);
  const outputPath = path.resolve(options.outputPath);
  assertPrivatePaths(repositoryRoot, sourceRoot, outputPath);

  const packagePath = path.join(sourceRoot, 'package.json');
  const packageJson = fs.existsSync(packagePath) ? JSON.parse(fs.readFileSync(packagePath, 'utf8')) as Record<string, unknown> : {};
  const cataloguePath = options.cataloguePath ? path.resolve(options.cataloguePath) : null;
  const catalogue: CatalogueEntry[] = cataloguePath
    ? (JSON.parse(fs.readFileSync(cataloguePath, 'utf8')) as { resources?: CatalogueEntry[] }).resources ?? []
    : [];
  const resources: VersoInventoryResource[] = [];
  const staticMetadataFailures: Array<{ path: string; reason: string }> = [];
  const byCollection: Record<string, number> = {};
  const warnings: string[] = [];

  for (const collection of VERSO_COLLECTIONS) {
    const collectionRoot = path.join(sourceRoot, 'src', collection);
    byCollection[collection] = 0;
    if (!fs.existsSync(collectionRoot)) {
      warnings.push(`Collection directory is missing: src/${collection}`);
      continue;
    }
    const componentFiles: string[] = [];
    const walk = (directory: string) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed in source inventory: ${path.relative(sourceRoot, absolute)}`);
        if (entry.isDirectory()) walk(absolute);
        else if (entry.isFile() && entry.name.endsWith('.tsx')) componentFiles.push(absolute);
      }
    };
    walk(collectionRoot);
    for (const filePath of componentFiles.sort()) {
      const relativePath = path.relative(sourceRoot, filePath).replace(/\\/g, '/');
      const sourceText = fs.readFileSync(filePath, 'utf8');
      const parsed = parseVersoMetadata(
        sourceText,
        filePath,
        (name) => resolveImportedMetaLineage(sourceRoot, filePath, name),
      );
      if (parsed.ok === false) {
        if (sourceText.includes('export const meta') || sourceText.includes('export { meta')) {
          staticMetadataFailures.push({ path: relativePath, reason: parsed.reason });
        }
        continue;
      }
      const { metadata, exportedNames } = parsed;
      const closure = resolveImportClosure(sourceRoot, filePath);
      const sourceFiles = closure.map((sourceFile) => ({
        path: path.relative(sourceRoot, sourceFile).replace(/\\/g, '/'),
        sha256: sha256(fs.readFileSync(sourceFile)),
      }));
      const inspection = inspectSource(filePath);
      const catalogueQuery = words(`${metadata.name} ${metadata.summary} ${metadata.tags.join(' ')}`);
      const similarTessellateResources = catalogue
        .map((entry) => ({ slug: entry.slug ?? entry.id ?? 'unknown', score: scoreCatalogueEntry([...catalogueQuery], entry) }))
        .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
        .slice(0, 3)
        .filter((entry) => entry.score > 0);
      const combinedText = `${metadata.name} ${metadata.summary} ${metadata.tags.join(' ')}`;
      const blockers: string[] = ['Source distribution is blocked until the Verso license and upstream lineage rights are resolved.'];
      if (!exportedNames.includes(metadata.component)) blockers.push(`Metadata names '${metadata.component}', but that named export was not found in the component module.`);
      if (inspection.signals.visualApis.length > 0) blockers.push('Visual or device API requires capability and cleanup testing before certification.');
      if (inspection.themeRequirements.usesVersoContext || inspection.themeRequirements.usesVersoCssTokens) blockers.push('Component depends on Verso Atlas theme context/tokens and needs an isolated Design DNA adapter.');
      if (inspection.themeRequirements.remoteFontReference) blockers.push('Remote font usage needs removal or an approved self-hosted font source before certification.');
      if (inspection.signals.riskSignals.length > 0) blockers.push('Static source risk signals require manual behavior and security review.');
      const dependencyRanges = {
        ...(typeof packageJson.dependencies === 'object' && packageJson.dependencies !== null ? packageJson.dependencies : {}),
        ...(typeof packageJson.peerDependencies === 'object' && packageJson.peerDependencies !== null ? packageJson.peerDependencies : {}),
        ...(typeof packageJson.devDependencies === 'object' && packageJson.devDependencies !== null ? packageJson.devDependencies : {}),
      } as Record<string, unknown>;
      resources.push({
        ...metadata,
        sourceExport: metadata.component,
        functionalPurpose: metadata.summary,
        collection,
        sourcePath: relativePath,
        sourceHash: sha256(sourceFiles.map((file) => `${file.path}\0${file.sha256}`).join('\n')),
        sourceFiles,
        exportedComponent: exportedNames.includes(metadata.component),
        props: inspection.props,
        slotHints: inspection.props
          .filter((property) => /^(children|content|items|rows|data|files|steps|options)$/i.test(property.name))
          .map((property) => property.name),
        imports: inspection.imports,
        dependencies: inspection.imports.external.map((externalPackage) => ({
          package: externalPackage,
          declaredRange: typeof dependencyRanges[externalPackage] === 'string' ? dependencyRanges[externalPackage] as string : null,
          usage: 'imported' as const,
        })),
        signals: inspection.signals,
        suggestedSemanticRoles: suggestedValues(combinedText, ROLE_HINTS),
        semanticRoleAssessment: 'heuristic-candidates-only',
        suggestedProductArchetypes: suggestedValues(combinedText, ARCHETYPE_HINTS),
        productArchetypeAssessment: 'heuristic-candidates-only',
        themeRequirements: inspection.themeRequirements,
        interactionAssessment: 'source-signals-only-not-tested',
        performanceAssessment: 'source-signals-only-not-profiled',
        accessibilityAssessment: 'source-signals-only-not-audited',
        responsivenessAssessment: 'source-signals-only-not-tested',
        previewSupport: 'not-integrated',
        exportSupport: 'not-integrated',
        provenance: {
          sourcePath: relativePath,
          sourceHash: sha256(sourceFiles.map((file) => `${file.path}\0${file.sha256}`).join('\n')),
          declaredLineage: metadata.lineage,
          sourcePackageLicense: typeof packageJson.license === 'string' ? packageJson.license : 'UNLICENSED',
          redistribution: 'blocked-unlicensed',
        },
        similarTessellateResources,
        integrationStatus: 'local-source-inventoried',
        certification: 'unverified',
        redistributionStatus: 'blocked-unlicensed',
        blockers,
      });
      byCollection[collection]++;
    }
  }

  const ids = resources.map((resource) => resource.id);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
  if (staticMetadataFailures.length > 0) {
    warnings.push(`${staticMetadataFailures.length} TSX files with a meta declaration could not be statically interpreted.`);
  }
  if (duplicates.length > 0) warnings.push(`${duplicates.length} duplicate resource IDs found.`);
  if (catalogue.length === 0) warnings.push('No Tessellate catalogue was supplied; overlap recommendations are unavailable.');

  const archive = options.archivePath ? path.resolve(options.archivePath) : null;
  let archiveSha256: string | null = null;
  if (archive && fs.existsSync(archive)) archiveSha256 = sha256(fs.readFileSync(archive));
  else if (archive) warnings.push('The supplied archive path was not found.');

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      root: sourceRoot,
      packageName: typeof packageJson.name === 'string' ? packageJson.name : null,
      packageVersion: typeof packageJson.version === 'string' ? packageJson.version : null,
      license: typeof packageJson.license === 'string' ? packageJson.license : 'UNLICENSED',
      archive,
      archiveSha256,
    },
    tessellateCatalogue: { path: cataloguePath, count: catalogue.length },
    totals: { declaredResources: resources.length, byCollection, staticMetadataFailures: staticMetadataFailures.length, duplicateIds: duplicates },
    resources: resources.sort((a, b) => a.collection.localeCompare(b.collection) || a.id.localeCompare(b.id)),
    warnings: [
      ...warnings,
      ...staticMetadataFailures.map((failure) => `Metadata parse failure in ${failure.path}: ${failure.reason}`),
    ],
  };
}

function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    args.set(token.slice(2), value);
    index++;
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const sourceRoot = args.get('source') ?? process.env.VERSO_SOURCE;
  const outputPath = args.get('output');
  if (!sourceRoot || !outputPath) {
    throw new Error('Usage: pnpm exec tsx scripts/verso-inventory.ts --source <private-verso-src-root> --output <private-path-outside-repo> [--catalog <catalog.json>] [--archive <verso.zip>]');
  }
  const inventory = buildVersoInventory({
    repositoryRoot,
    sourceRoot,
    outputPath,
    cataloguePath: args.get('catalog'),
    archivePath: args.get('archive'),
  });
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  assertPrivatePaths(repositoryRoot, sourceRoot, outputPath);
  await fs.promises.writeFile(outputPath, JSON.stringify(inventory, null, 2), { encoding: 'utf8', flag: 'wx' });
  console.log(`[verso-inventory] Wrote ${inventory.totals.declaredResources} private resource records to ${outputPath}`);
  console.log(`[verso-inventory] ${inventory.warnings.length} warnings; all source certification and redistribution remain blocked pending review.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((error: unknown) => {
    console.error('[verso-inventory] Refusing to continue:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
