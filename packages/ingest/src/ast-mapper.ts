import * as path from 'node:path';
import * as ts from 'typescript';
import type { ProjectManifest, ProjectNode, ProjectScreen, ScreenNode } from '@tessellate/schemas';
import { ProjectManifestSchema, ProductModelSchema } from '@tessellate/schemas';
import type { IngestionResult, IngestedScreen } from './types.js';
import { reverseEngineerDna } from './dna-reverse-engineer.js';

interface ParsedSource {
  filePath: string;
  code: string;
  sourceFile: ts.SourceFile;
}

interface ScreenCandidate extends ParsedSource {
  componentName: string;
  componentNode: ts.Node;
  route: string;
}

type RouteKind = 'app' | 'pages' | 'routes' | 'vite';

const ignoredComponentDirectories = new Set([
  'component',
  'components',
  'ui',
  '__tests__',
  'test',
  'tests',
  'stories',
]);

function normalizeFilePath(filePath: string): string {
  return filePath.replaceAll('\\', '/').replace(/^\.\//, '');
}

function scriptKindFor(filePath: string): ts.ScriptKind {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.jsx') return ts.ScriptKind.JSX;
  if (extension === '.js' || extension === '.mjs' || extension === '.cjs') return ts.ScriptKind.JS;
  if (extension === '.ts' || extension === '.mts' || extension === '.cts') return ts.ScriptKind.TS;
  return ts.ScriptKind.TSX;
}

function parseSource(filePath: string, code: string): ParsedSource {
  const transpiled = ts.transpileModule(code, {
    fileName: filePath,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });
  const syntaxErrors = (transpiled.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
  );
  if (syntaxErrors.length > 0) {
    const messages = syntaxErrors.map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')
    );
    throw new Error(`Unable to parse React source "${filePath}": ${messages.join('; ')}`);
  }

  return {
    filePath: normalizeFilePath(filePath),
    code,
    sourceFile: ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true,
      scriptKindFor(filePath)
    ),
  };
}

function nodeContainsJsx(node: ts.Node): boolean {
  let found = false;
  const visit = (current: ts.Node) => {
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) {
      found = true;
      return;
    }
    if (!found) ts.forEachChild(current, visit);
  };
  visit(node);
  return found;
}

function collectComponentNames(sourceFile: ts.SourceFile): string[] {
  const names: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name && node.body && nodeContainsJsx(node.body)) {
      names.push(node.name.text);
    } else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) &&
      nodeContainsJsx(node.initializer)
    ) {
      names.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...new Set(names)];
}

function getComponentDetails(
  sourceFile: ts.SourceFile,
  requireDefaultExport = false
): { name: string; node: ts.Node } | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && nodeContainsJsx(statement)) {
      const isDefault = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
      );
      if (isDefault) return { name: statement.name.text, node: statement };
    }
    if (ts.isExportAssignment(statement)) {
      if (ts.isIdentifier(statement.expression)) {
        const exportedName = statement.expression.text;
        const node = findComponentNode(sourceFile, exportedName);
        if (node && nodeContainsJsx(node)) return { name: exportedName, node };
      } else if (nodeContainsJsx(statement.expression)) {
        const fileBase = path.basename(sourceFile.fileName, path.extname(sourceFile.fileName));
        const name = /^[A-Za-z_$][\w$]*$/.test(fileBase) ? fileBase : 'DefaultPage';
        return { name: name === 'page' ? 'DefaultPage' : name, node: statement.expression };
      }
    }
  }

  if (requireDefaultExport) return undefined;

  const names = collectComponentNames(sourceFile);
  const name =
    names.find((candidate) => /^(App|Home|Index|Dashboard|Screen|Page)$/i.test(candidate)) ??
    names[0];
  const node = name ? findComponentNode(sourceFile, name) : undefined;
  return name && node ? { name, node } : undefined;
}

function routeSegments(filePath: string): { kind: RouteKind; segments: string[] } | undefined {
  const normalized = normalizeFilePath(filePath);
  const parts = normalized.split('/').filter(Boolean);
  const fileName = parts.at(-1) ?? '';
  const extension = path.extname(fileName);
  if (!['.tsx', '.jsx', '.ts', '.js'].includes(extension.toLowerCase())) return undefined;
  const lowerParts = parts.map((part) => part.toLowerCase());

  const appIndex = lowerParts.lastIndexOf('app');
  if (appIndex >= 0 && /^page\.(?:tsx|jsx|ts|js)$/i.test(fileName)) {
    const segments = parts
      .slice(appIndex + 1, -1)
      .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));
    return { kind: 'app', segments };
  }

  const routeDirectoryIndex = lowerParts.lastIndexOf('routes');
  if (
    routeDirectoryIndex >= 0 &&
    !ignoredComponentDirectories.has(lowerParts[routeDirectoryIndex + 1] ?? '')
  ) {
    let routeParts = parts.slice(routeDirectoryIndex + 1);
    routeParts[routeParts.length - 1] = path.basename(routeParts.at(-1) ?? '', extension);
    if (routeParts.at(-1)?.toLowerCase() === 'index') routeParts = routeParts.slice(0, -1);
    return { kind: 'routes', segments: routeParts };
  }

  const pagesIndex = lowerParts.lastIndexOf('pages');
  if (
    pagesIndex >= 0 &&
    !['_app', '_document', '_error'].includes(path.basename(fileName, extension).toLowerCase())
  ) {
    let routeParts = parts.slice(pagesIndex + 1);
    routeParts[routeParts.length - 1] = path.basename(routeParts.at(-1) ?? '', extension);
    if (routeParts.at(-1)?.toLowerCase() === 'index') routeParts = routeParts.slice(0, -1);
    return { kind: 'pages', segments: routeParts };
  }

  if (/^app\.(?:tsx|jsx|ts|js)$/i.test(fileName)) return { kind: 'vite', segments: [] };
  return undefined;
}

function routePathFor(kind: RouteKind, segments: string[]): string {
  const converted = segments
    .map((segment) => {
      if (/^\[\.\.\.[^\]]+\]$/.test(segment) || /^\[\[\.\.\.[^\]]+\]\]$/.test(segment))
        return segment;
      if (segment.startsWith('[') && segment.endsWith(']')) return `:${segment.slice(1, -1)}`;
      return segment.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    })
    .filter(Boolean);
  if (kind === 'vite' || converted.length === 0) return '/';
  return `/${converted.join('/')}`;
}

function isLayoutPath(filePath: string): boolean {
  const normalized = normalizeFilePath(filePath).toLowerCase();
  return /(?:^|\/)app\/(?:.*\/)?layout\.(?:tsx|jsx|ts|js)$/.test(normalized);
}

function layoutPathsForRoute(routeFilePath: string, layoutPaths: string[]): string[] {
  const routeDirectory = path.posix.dirname(normalizeFilePath(routeFilePath)).toLowerCase();
  return layoutPaths
    .filter((layoutPath) => {
      const layoutDirectory = path.posix.dirname(normalizeFilePath(layoutPath)).toLowerCase();
      return routeDirectory === layoutDirectory || routeDirectory.startsWith(`${layoutDirectory}/`);
    })
    .sort(
      (a, b) =>
        path.posix.dirname(normalizeFilePath(a)).split('/').length -
        path.posix.dirname(normalizeFilePath(b)).split('/').length
    );
}

function isIgnoredComponentPath(filePath: string): boolean {
  const parts = normalizeFilePath(filePath).toLowerCase().split('/');
  return parts.some((part) => ignoredComponentDirectories.has(part));
}

function findScreenCandidates(parsed: ParsedSource[]): {
  candidates: ScreenCandidate[];
  layouts: string[];
} {
  const layouts = parsed
    .filter((file) => isLayoutPath(file.filePath) && nodeContainsJsx(file.sourceFile))
    .map((file) => file.filePath);
  const withRoutes = parsed.flatMap((file) => {
    if (isLayoutPath(file.filePath) || !nodeContainsJsx(file.sourceFile)) return [];
    const route = routeSegments(file.filePath);
    if (!route) return [];
    if (isIgnoredComponentPath(file.filePath) && route.kind === 'vite') return [];
    const component = getComponentDetails(
      file.sourceFile,
      route.kind === 'app' || route.kind === 'pages' || route.kind === 'routes'
    );
    if (!component) return [];
    return [
      {
        ...file,
        componentName: component.name,
        componentNode: component.node,
        route: routePathFor(route.kind, route.segments),
      },
    ];
  });
  return { candidates: withRoutes, layouts };
}

function getJsxTagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
  const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
  return tag.getText();
}

function jsxChildren(node: ts.JsxElement): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
  const elements: Array<ts.JsxElement | ts.JsxSelfClosingElement> = [];
  const visit = (child: ts.Node) => {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      elements.push(child);
      return;
    }
    if (ts.isJsxFragment(child)) {
      child.children.forEach(visit);
      return;
    }
    if (ts.isJsxExpression(child)) {
      if (child.expression) visit(child.expression);
      return;
    }
    if (
      ts.isCallExpression(child) ||
      ts.isArrowFunction(child) ||
      ts.isConditionalExpression(child) ||
      ts.isArrayLiteralExpression(child)
    ) {
      ts.forEachChild(child, visit);
    }
  };
  node.children.forEach(visit);
  return elements;
}

function jsxRoots(component: ts.Node): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
  const elements: Array<ts.JsxElement | ts.JsxSelfClosingElement> = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      elements.push(node);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(component);
  return elements.filter((element) => {
    let parent = element.parent;
    while (parent && parent !== component) {
      if (ts.isJsxElement(parent)) return false;
      parent = parent.parent;
    }
    return parent === component || Boolean(parent && parent !== element.parent);
  });
}

function findComponentNode(sourceFile: ts.SourceFile, name: string): ts.Node | undefined {
  let found: ts.Node | undefined;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    )
      found = node.initializer;
    if (!found) ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function nodeTypeFor(tag: string): ProjectNode['nodeType'] {
  if (/^(main|header|nav|aside|footer)$/.test(tag)) return 'layout';
  if (/^(section|article|form)$/.test(tag)) return 'section';
  if (/^[A-Z]/.test(tag)) return 'component';
  if (/^(button|input|textarea|select|a|label|option|th|td)$/.test(tag)) return 'element';
  return 'block';
}

function makeProjectNode(
  element: ts.JsxElement | ts.JsxSelfClosingElement,
  screenSlug: string,
  nextId: () => number
): ProjectNode {
  const tag = getJsxTagName(element);
  return {
    id: `${screenSlug}-node-${nextId()}`,
    nodeType: nodeTypeFor(tag),
    semanticRole: tag,
    variant: 'imported-structure',
    children: ts.isJsxElement(element)
      ? jsxChildren(element).map((child) => makeProjectNode(child, screenSlug, nextId))
      : [],
    slots: {},
    props: {},
  };
}

function collectRoles(node: ProjectNode, roles = new Set<string>()): string[] {
  roles.add(node.semanticRole);
  node.children.forEach((child) => collectRoles(child, roles));
  return [...roles];
}

function titleFromRoute(route: string, componentName: string): string {
  if (route === '/') return 'Home';
  const routeSegment = route.split('/').filter(Boolean).at(-1) ?? componentName;
  const finalSegment = routeSegment.startsWith('[[...')
    ? routeSegment.slice(5, -2)
    : routeSegment.startsWith('[...')
      ? routeSegment.slice(4, -1)
      : routeSegment.startsWith('[') && routeSegment.endsWith(']')
        ? routeSegment.slice(1, -1)
        : routeSegment.startsWith(':')
          ? routeSegment.slice(1)
          : routeSegment;
  return finalSegment
    .replace(/^:/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function screenSlug(route: string, index: number): string {
  const slug = route
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || (index === 0 ? 'home' : `screen-${index + 1}`);
}

function findJsxRootsForComponent(
  candidate: ScreenCandidate
): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
  return jsxRoots(candidate.componentNode);
}

export function mapSourceFilesToProject(
  files: Array<{ filePath: string; code: string }>,
  projectName = 'Ingested Project'
): IngestionResult {
  if (files.length === 0) throw new Error('No React source files were provided for ingestion.');
  const parsed = files.map((file) => parseSource(file.filePath, file.code));
  const inferredDna = reverseEngineerDna(files.map((file) => file.code));
  const { candidates, layouts } = findScreenCandidates(parsed);
  if (candidates.length === 0) {
    throw new Error(
      'No supported React route entrypoints were found. Expected a Vite App component or Next.js app/pages route file.'
    );
  }

  const seenRoutes = new Set<string>();
  for (const candidate of candidates) {
    if (seenRoutes.has(candidate.route))
      throw new Error(
        `Duplicate inferred route "${candidate.route}" from "${candidate.filePath}".`
      );
    seenRoutes.add(candidate.route);
  }

  const screens: IngestedScreen[] = [];
  const manifestScreens: ProjectScreen[] = [];
  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index]!;
    const name = titleFromRoute(candidate.route, candidate.componentName);
    const slug = screenSlug(candidate.route, index);
    let nodeIndex = 0;
    const rootNode: ProjectNode = {
      id: `${slug}-root`,
      nodeType: 'layout',
      semanticRole: 'screen-root',
      variant: 'imported-structure',
      children: findJsxRootsForComponent(candidate).map((element) =>
        makeProjectNode(element, slug, () => ++nodeIndex)
      ),
      slots: {},
      props: {},
    };

    const id = `screen-${slug}`;
    const detectedRoles = [...new Set(rootNode.children.flatMap((node) => collectRoles(node)))];
    screens.push({
      id,
      name,
      slug,
      route: candidate.route,
      componentName: candidate.componentName,
      filePath: candidate.filePath,
      layoutFilePaths: layoutPathsForRoute(candidate.filePath, layouts),
      rootNode,
      detectedRoles,
    });
    manifestScreens.push({ id, name, slug: candidate.route, screenNodeId: id, rootNode });
  }

  const screenNodes: ScreenNode[] = screens.map((screen) => ({
    id: screen.id,
    name: screen.name,
    slug: screen.route,
    screenType: 'inferred-route',
    purpose: 'Imported route structure; verify product intent before composition.',
    jobs: [],
    required: true,
    navigationVisibility: 'hidden',
    importance: 50,
    expectedData: [],
    requiredRoles: screen.detectedRoles,
    optionalRoles: [],
  }));

  const timestamp = new Date().toISOString();
  const routeSummary = screens.map((screen) => screen.route).join(', ');
  const layoutLimitation =
    layouts.length > 0
      ? ' Next.js layout wrappers are not included in this ProjectManifest; their file paths are associated with routes.'
      : '';
  const productModel = ProductModelSchema.parse({
    schemaVersion: '1.0.0',
    productArchetypes: [{ tag: 'unknown', weight: 1 }],
    primaryAudience: 'unspecified',
    userSophistication: 50,
    primaryObjective: 'Imported interface structure; review product intent before editing.',
    jobsToBeDone: ['Inspect the imported interface structure'],
    trustRequirement: 50,
    informationComplexity: 50,
    dataDensity: 50,
    collaborationLevel: 50,
    transactionCriticality: 50,
    navigationComplexity: 50,
    mobileImportance: 50,
    constraints: {
      accessibilityFloor: 'AA',
      performanceCeiling: 'balanced',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    },
  });
  const projectManifest: ProjectManifest = ProjectManifestSchema.parse({
    schemaVersion: '1.0.0',
    id: `proj_ingested_${Date.now()}`,
    name: projectName,
    description: `Partial structural analysis of ${screens.length} React route(s): ${routeSummary}. Source files are not modified.${layoutLimitation} Design DNA evidence: ${inferredDna.inferredFields.length > 0 ? inferredDna.inferredFields.join(', ') : 'none'}. Other required Design DNA values are schema defaults, not inferred.`,
    createdAt: timestamp,
    updatedAt: timestamp,
    catalogVersion: '1.0.0',
    seed: `tess-ingest-${Date.now()}`,
    productModel,
    designDNA: inferredDna.dna,
    constraints: productModel.constraints,
    screenGraph: {
      id: `sg_${Date.now()}`,
      groups: [{ id: 'grp-imported', name: 'Imported Routes', screens: screenNodes }],
      edges: [],
    },
    screens: manifestScreens,
    navigation: { model: 'unspecified-imported', primaryItems: [] },
    assets: [],
    locks: [],
    historyMeta: { totalOperations: 0, headRevision: 0 },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  });

  const includedPaths = new Set([...screens.map((screen) => screen.filePath), ...layouts]);
  return {
    projectManifest,
    screens,
    inferredDna,
    sourceFileCount: files.length,
    layoutFilePaths: layouts,
    ignoredSourceFilePaths: parsed
      .map((file) => file.filePath)
      .filter((filePath) => !includedPaths.has(filePath)),
    warnings: [
      'Beta analysis: route and JSX structure are inferred from TypeScript AST; source files remain untouched.',
      'Product intent, data bindings, navigation behavior, business logic, CSS Modules, and dynamic style values are not inferred. The product archetype is unknown; review this manifest before using composition or export.',
      `Design DNA evidence: ${inferredDna.inferredFields.length > 0 ? inferredDna.inferredFields.join(', ') : 'none'}. ${inferredDna.defaultedFields.length} required Design DNA fields use schema defaults and are not inferred.`,
      ...(layouts.length > 0
        ? [
            'Next.js layout wrappers are associated with route files in the ingestion result but are not merged into ProjectManifest route trees.',
          ]
        : []),
    ],
    productIntentInferred: false,
  };
}
