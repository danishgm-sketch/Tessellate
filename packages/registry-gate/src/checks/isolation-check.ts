import type { GateCheckResult } from '../types.js';
import * as path from 'node:path';
import * as ts from 'typescript';

const staticResourceTags = new Set([
  'audio',
  'button',
  'embed',
  'feimage',
  'form',
  'iframe',
  'img',
  'input',
  'image',
  'link',
  'object',
  'script',
  'source',
  'track',
  'use',
  'video',
]);

const caseSensitiveSvgResourceTags = new Set(['feimage']);

const urlAttributeNames = new Set([
  'action',
  'data',
  'formaction',
  'href',
  'poster',
  'ping',
  'src',
  'srcset',
  'xlinkhref',
]);

const isolationSensitiveMemberNames = new Set([
  'action',
  'addmodule',
  'assign',
  'audio',
  'cookie',
  'cookiestore',
  'credentials',
  'data',
  'document',
  'eval',
  'eventsource',
  'fetch',
  'formaction',
  'function',
  'href',
  'indexeddb',
  'image',
  'innerhtml',
  'location',
  'localstorage',
  'navigator',
  'open',
  'outerhtml',
  'poster',
  'register',
  'replace',
  'sessionstorage',
  'srcdoc',
  'sendbeacon',
  'serviceworker',
  'setinterval',
  'settimeout',
  'src',
  'srcset',
  'websocket',
  'worker',
  'sharedworker',
  'writeln',
  'write',
  'xmlhttprequest',
  'xlinkhref',
]);

const browserWindowProxyMemberNames = new Set(['frames', 'opener', 'parent', 'self', 'top', 'window']);
const networkCapabilityMemberNames = new Set([
  'addmodule',
  'axios',
  'eventsource',
  'fetch',
  'importscripts',
  'rtcppeerconnection',
  'sendbeacon',
  'websocket',
  'webtransport',
  'xmlhttprequest',
]);

function isExecutableUrl(value: string): boolean {
  // URL parsing trims surrounding C0/space characters and removes tabs/newlines.
  const normalized = normalizeUrlForScheme(value);
  return /^(?:javascript|vbscript):/.test(normalized);
}

function hasUnverifiedProgrammaticNavigation(
  expression: ts.Expression | undefined,
  checker: ts.TypeChecker
): boolean {
  if (!expression) return true;
  const destinations = resolveStaticStrings(expression, checker);
  return (
    destinations.length === 0 ||
    destinations.some((destination) => !normalizeUrlForScheme(destination).startsWith('#'))
  );
}

function isActiveDataDocumentUrl(value: string): boolean {
  const normalized = normalizeUrlForScheme(value);
  return /^data:(?:text\/html|application\/xhtml\+xml|image\/svg\+xml)(?:[;,]|$)/.test(normalized);
}

function normalizeUrlForScheme(value: string): string {
  return value.trim().replaceAll('\t', '').replaceAll('\n', '').replaceAll('\r', '').toLowerCase();
}

function isRemoteWebUrl(value: string): boolean {
  return /^(?:https?:|\/\/)/i.test(normalizeUrlForScheme(value));
}

function isRemoteResourceUrl(attributeName: string, value: string): boolean {
  const normalizedAttribute = attributeName.toLowerCase();
  const candidates =
    normalizedAttribute === 'srcset'
      ? value.split(',').map((candidate) => candidate.trim().split(/\s+/, 1)[0] ?? '')
      : normalizedAttribute === 'ping'
        ? value.trim().split(/\s+/)
        : [value];
  return candidates.some(isRemoteWebUrl);
}

function isBrowserWindowReference(expression: ts.Expression, checker?: ts.TypeChecker): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isBrowserWindowReference(expression.expression, checker);
  }
  if (ts.isIdentifier(expression)) {
    return [
      'document',
      'frames',
      'globalThis',
      'opener',
      'parent',
      'self',
      'top',
      'window',
    ].includes(expression.text);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name === 'defaultView') {
    return checker !== undefined && isDocumentObject(member.receiver, checker);
  }
  return (
    member !== undefined &&
    browserWindowProxyMemberNames.has(member.name) &&
    isBrowserWindowReference(member.receiver, checker)
  );
}

function getStaticMemberAccess(
  expression: ts.Expression,
  checker?: ts.TypeChecker
): { receiver: ts.Expression; name: string } | undefined {
  if (ts.isPropertyAccessExpression(expression)) {
    return { receiver: expression.expression, name: expression.name.text };
  }
  if (ts.isElementAccessExpression(expression) && expression.argumentExpression) {
    const names = checker
      ? resolveStaticStrings(expression.argumentExpression, checker)
      : resolveInlineStaticStrings(expression.argumentExpression);
    const name =
      names.length === 1
        ? names[0]
        : names.find((candidate) => isolationSensitiveMemberNames.has(candidate.toLowerCase()));
    if (name !== undefined) return { receiver: expression.expression, name };
  }
  return undefined;
}

function resolveInlineStaticStrings(expression: ts.Expression): string[] {
  if (ts.isStringLiteralLike(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return [expression.text];
  }
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return resolveInlineStaticStrings(expression.expression);
  }
  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = resolveInlineStaticStrings(expression.left);
    const right = resolveInlineStaticStrings(expression.right);
    return left.flatMap((prefix) => right.map((suffix) => `${prefix}${suffix}`));
  }
  return [];
}

type IdentifierAssignment = { right: ts.Expression; start: number; propertyName?: string };

const assignmentsByChecker = new WeakMap<
  ts.TypeChecker,
  WeakMap<ts.SourceFile, Map<ts.Symbol, IdentifierAssignment[]>>
>();

function getIdentifierAssignments(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): Map<ts.Symbol, IdentifierAssignment[]> {
  let assignmentsByFile = assignmentsByChecker.get(checker);
  if (!assignmentsByFile) {
    assignmentsByFile = new WeakMap();
    assignmentsByChecker.set(checker, assignmentsByFile);
  }
  const cached = assignmentsByFile.get(sourceFile);
  if (cached) return cached;

  const assignments = new Map<ts.Symbol, IdentifierAssignment[]>();
  const addAssignment = (
    identifier: ts.Identifier,
    right: ts.Expression,
    start: number,
    propertyName?: string
  ): void => {
    const symbol = checker.getSymbolAtLocation(identifier);
    if (!symbol) return;
    const current = assignments.get(symbol) ?? [];
    current.push({ right, start, propertyName });
    assignments.set(symbol, current);
  };
  const propertyName = (name: ts.PropertyName): string | undefined => {
    if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
      return name.text;
    }
    if (!ts.isComputedPropertyName(name)) return undefined;
    return resolveStaticStrings(name.expression, checker)[0];
  };
  const visit = (node: ts.Node): void => {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      if (ts.isIdentifier(node.left)) {
        addAssignment(node.left, node.right, node.getStart(sourceFile));
      } else if (ts.isObjectLiteralExpression(node.left)) {
        for (const property of node.left.properties) {
          if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.initializer)) {
            addAssignment(
              property.initializer,
              node.right,
              node.getStart(sourceFile),
              propertyName(property.name)
            );
          } else if (ts.isShorthandPropertyAssignment(property)) {
            addAssignment(
              property.name,
              node.right,
              node.getStart(sourceFile),
              property.name.text
            );
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  assignmentsByFile.set(sourceFile, assignments);
  return assignments;
}

function isBrowserWindowOrAliasReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (isBrowserWindowReference(expression, checker)) return true;
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isBrowserWindowOrAliasReference(expression.expression, checker, seen);
  }
  if (!ts.isIdentifier(expression)) return false;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  const declaredAsWindow = (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isBrowserWindowOrAliasReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    const propertyName = getBindingElementPropertyName(declaration)?.toLowerCase();
    if (!ts.isVariableDeclaration(variable) || variable.initializer === undefined) return false;
    if (propertyName === 'defaultview' && isDocumentObject(variable.initializer, checker)) {
      return true;
    }
    return (
      propertyName !== undefined &&
      browserWindowProxyMemberNames.has(propertyName) &&
      isBrowserWindowOrAliasReference(variable.initializer, checker, nextSeen)
    );
  });
  if (declaredAsWindow) return true;

  const sourceFile = expression.getSourceFile();
  const priorAssignments = getIdentifierAssignments(checker, sourceFile).get(symbol) ?? [];
  return priorAssignments.some(
    (assignment) => {
      if (assignment.start >= expression.getStart(sourceFile)) return false;
      if (assignment.propertyName !== undefined) {
        const assignedProperty = assignment.propertyName.toLowerCase();
        if (assignedProperty === 'defaultview') {
          return isDocumentObject(assignment.right, checker);
        }
        return (
          browserWindowProxyMemberNames.has(assignedProperty) &&
          isBrowserWindowOrAliasReference(assignment.right, checker, nextSeen)
        );
      }
      return isBrowserWindowOrAliasReference(assignment.right, checker, nextSeen);
    }
  );
}

function isLocationObject(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isLocationObject(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name === 'location' && isBrowserWindowOrAliasReference(member.receiver, checker)) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const locationSymbol = checker.getSymbolAtLocation(expression);
  if (expression.text === 'location' && !locationSymbol) return true;
  let symbol = locationSymbol;
  if (locationSymbol && (locationSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(locationSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      ts.isVariableDeclarationList(declaration.parent) &&
      isLocationObject(declaration.initializer, checker, nextSeen)
  );
}

function isDocumentObject(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isDocumentObject(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name === 'document' && isBrowserWindowOrAliasReference(member.receiver, checker)) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const documentSymbol = checker.getSymbolAtLocation(expression);
  if (expression.text === 'document' && !documentSymbol) return true;
  let symbol = documentSymbol;
  if (documentSymbol && (documentSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(documentSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isDocumentObject(declaration.initializer, checker, nextSeen)
  );
}

function isDocumentMarkupWriterReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isDocumentMarkupWriterReference(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    ['write', 'writeln'].includes(member.name.toLowerCase()) &&
    isDocumentObject(member.receiver, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isDocumentMarkupWriterReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      ['write', 'writeln'].includes(
        getBindingElementPropertyName(declaration)?.toLowerCase() ?? ''
      ) &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isDocumentObject(variable.initializer, checker)
    );
  });
}

function isFetchFunction(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isFetchFunction(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name === 'fetch' && isBrowserWindowOrAliasReference(member.receiver, checker)) {
    return true;
  }
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name) &&
    isFetchFunction(member.receiver, checker, seen)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  if (expression.text === 'fetch') return true;

  const fetchSymbol = checker.getSymbolAtLocation(expression);
  let symbol = fetchSymbol;
  if (fetchSymbol && (fetchSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(fetchSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isFetchFunction(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    const property = declaration.propertyName ?? declaration.name;
    const propertyName = ts.isIdentifier(property)
      ? property.text
      : ts.isStringLiteralLike(property)
        ? property.text
        : undefined;
    return (
      propertyName === 'fetch' &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isBrowserWindowOrAliasReference(variable.initializer, checker)
    );
  });
}

function isBrowserNavigatorOrAliasReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isBrowserNavigatorOrAliasReference(expression.expression, checker, seen);
  }
  if (ts.isIdentifier(expression) && expression.text === 'navigator') return true;
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name === 'navigator' && isBrowserWindowOrAliasReference(member.receiver, checker)) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const navigatorSymbol = checker.getSymbolAtLocation(expression);
  let symbol = navigatorSymbol;
  if (navigatorSymbol && (navigatorSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(navigatorSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isBrowserNavigatorOrAliasReference(declaration.initializer, checker, nextSeen)
  );
}

function getBindingElementPropertyName(declaration: ts.BindingElement): string | undefined {
  const property = declaration.propertyName ?? declaration.name;
  return ts.isIdentifier(property)
    ? property.text
    : ts.isStringLiteralLike(property)
      ? property.text
      : undefined;
}

function isNetworkConstructorReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isNetworkConstructorReference(expression.expression, checker, seen);
  }
  const constructors = new Set([
    'eventsource',
    'sharedworker',
    'websocket',
    'worker',
    'xmlhttprequest',
  ]);
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    isBrowserWindowOrAliasReference(reflected.target, checker) &&
    reflected.names.some((name) => constructors.has(name.toLowerCase()))
  ) {
    return true;
  }
  if (ts.isIdentifier(expression) && constructors.has(expression.text.toLowerCase())) return true;
  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    constructors.has(member.name.toLowerCase()) &&
    isBrowserWindowOrAliasReference(member.receiver, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const constructorSymbol = checker.getSymbolAtLocation(expression);
  let symbol = constructorSymbol;
  if (constructorSymbol && (constructorSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(constructorSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isNetworkConstructorReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    const propertyName = getBindingElementPropertyName(declaration)?.toLowerCase();
    return (
      propertyName !== undefined &&
      constructors.has(propertyName) &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isBrowserWindowOrAliasReference(variable.initializer, checker)
    );
  });
}

function isServiceWorkerContainerReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isServiceWorkerContainerReference(expression.expression, checker, seen);
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    isBrowserNavigatorOrAliasReference(reflected.target, checker) &&
    reflected.names.some((name) => name.toLowerCase() === 'serviceworker')
  ) {
    return true;
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === 'serviceworker' &&
    isBrowserNavigatorOrAliasReference(member.receiver, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isServiceWorkerContainerReference(declaration.initializer, checker, nextSeen)
  );
}

function isServiceWorkerRegisterFunction(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isServiceWorkerRegisterFunction(expression.expression, checker, seen);
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    isServiceWorkerContainerReference(reflected.target, checker) &&
    reflected.names.some((name) => name.toLowerCase() === 'register')
  ) {
    return true;
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === 'register' &&
    isServiceWorkerContainerReference(member.receiver, checker)
  ) {
    return true;
  }
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name) &&
    isServiceWorkerRegisterFunction(member.receiver, checker, seen)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isServiceWorkerRegisterFunction(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      getBindingElementPropertyName(declaration)?.toLowerCase() === 'register' &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isServiceWorkerContainerReference(variable.initializer, checker)
    );
  });
}

function isImportScriptsFunction(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isImportScriptsFunction(expression.expression, checker, seen);
  }
  if (ts.isIdentifier(expression) && expression.text.toLowerCase() === 'importscripts') {
    return true;
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    isBrowserWindowOrAliasReference(reflected.target, checker) &&
    reflected.names.some((name) => name.toLowerCase() === 'importscripts')
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isImportScriptsFunction(declaration.initializer, checker, nextSeen)
  );
}

function isSendBeaconFunction(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isSendBeaconFunction(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name === 'sendBeacon' &&
    isBrowserNavigatorOrAliasReference(member.receiver, checker)
  ) {
    return true;
  }
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name) &&
    isSendBeaconFunction(member.receiver, checker, seen)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const beaconSymbol = checker.getSymbolAtLocation(expression);
  let symbol = beaconSymbol;
  if (beaconSymbol && (beaconSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(beaconSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isSendBeaconFunction(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      getBindingElementPropertyName(declaration) === 'sendBeacon' &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isBrowserNavigatorOrAliasReference(variable.initializer, checker)
    );
  });
}

function isAxiosClientReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isAxiosClientReference(expression.expression, checker, seen);
  }
  if (ts.isCallExpression(expression)) {
    const clientFactory = getStaticMemberAccess(expression.expression, checker);
    if (
      clientFactory?.name === 'create' &&
      isAxiosClientReference(clientFactory.receiver, checker, seen)
    ) {
      return true;
    }
  }
  if (ts.isIdentifier(expression) && expression.text.toLowerCase() === 'axios') return true;
  if (!ts.isIdentifier(expression)) return false;

  const axiosSymbol = checker.getSymbolAtLocation(expression);
  let symbol = axiosSymbol;
  if (axiosSymbol && (axiosSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(axiosSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isAxiosClientReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    let parent: ts.Node | undefined = declaration;
    while (parent && !ts.isImportDeclaration(parent)) parent = parent.parent;
    return (
      parent !== undefined &&
      ts.isImportDeclaration(parent) &&
      ts.isStringLiteralLike(parent.moduleSpecifier) &&
      (parent.moduleSpecifier.text === 'axios' || parent.moduleSpecifier.text.startsWith('axios/'))
    );
  });
}

function isAxiosRequestFunction(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isAxiosRequestFunction(expression.expression, checker, seen);
  }
  if (isAxiosClientReference(expression, checker)) return true;
  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    ['delete', 'get', 'patch', 'post', 'put', 'request'].includes(member.name.toLowerCase()) &&
    isAxiosClientReference(member.receiver, checker)
  ) {
    return true;
  }
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name) &&
    isAxiosRequestFunction(member.receiver, checker, seen)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const requestSymbol = checker.getSymbolAtLocation(expression);
  let symbol = requestSymbol;
  if (requestSymbol && (requestSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(requestSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isAxiosRequestFunction(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    const propertyName = getBindingElementPropertyName(declaration)?.toLowerCase();
    return (
      propertyName !== undefined &&
      ['delete', 'get', 'patch', 'post', 'put', 'request'].includes(propertyName) &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isAxiosClientReference(variable.initializer, checker)
    );
  });
}

function hasRemoteCssUrl(code: string): boolean {
  const normalizedCode = code
    .replace(/\\{1,2}([0-9a-f]{1,6})\s?/gi, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/\\{1,2}([^\r\n])/g, '$1')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const remoteUrlPattern = /\burl\s*\(\s*['"]?(?:https?:|\/\/)/gi;
  for (const match of normalizedCode.matchAll(remoteUrlPattern)) {
    const prefix = normalizedCode.slice(0, match.index ?? 0);
    if (/\bnew\s*$/i.test(prefix)) continue;
    return true;
  }
  return false;
}

function resolveStaticStrings(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): string[] {
  if (ts.isStringLiteralLike(expression)) return [expression.text];
  if (ts.isNoSubstitutionTemplateLiteral(expression)) return [expression.text];
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return resolveStaticStrings(expression.expression, checker, seen);
  }
  if (ts.isTemplateExpression(expression)) {
    let values = [expression.head.text];
    for (const span of expression.templateSpans) {
      const substitutions = resolveStaticStrings(span.expression, checker, seen);
      if (substitutions.length === 0) return [];
      values = values.flatMap((prefix) =>
        substitutions.map((substitution) => `${prefix}${substitution}${span.literal.text}`)
      );
    }
    return values;
  }
  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = resolveStaticStrings(expression.left, checker, seen);
    const right = resolveStaticStrings(expression.right, checker, seen);
    return left.flatMap((prefix) => right.map((suffix) => `${prefix}${suffix}`));
  }
  if (ts.isConditionalExpression(expression)) {
    return [
      ...resolveStaticStrings(expression.whenTrue, checker, seen),
      ...resolveStaticStrings(expression.whenFalse, checker, seen),
    ];
  }
  if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'href') {
    return resolveStaticStrings(expression.expression, checker, seen);
  }
  if (
    ts.isNewExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === 'URL' &&
    expression.arguments?.[0]
  ) {
    return resolveStaticStrings(expression.arguments[0], checker, seen);
  }
  if (!ts.isIdentifier(expression)) return [];

  const locationSymbol = checker.getSymbolAtLocation(expression);
  let symbol = locationSymbol;
  if (locationSymbol && (locationSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(locationSymbol);
    } catch {
      return [];
    }
  }
  if (!symbol || seen.has(symbol)) return [];
  const nextSeen = new Set(seen).add(symbol);
  const values: string[] = [];
  for (const declaration of symbol.declarations ?? []) {
    if (
      !ts.isVariableDeclaration(declaration) ||
      !declaration.initializer ||
      !ts.isVariableDeclarationList(declaration.parent) ||
      (declaration.parent.flags & ts.NodeFlags.Const) === 0
    ) {
      continue;
    }
    values.push(...resolveStaticStrings(declaration.initializer, checker, nextSeen));
  }
  return values;
}

function isBuiltinObjectReference(
  expression: ts.Expression,
  name: string,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isBuiltinObjectReference(expression.expression, name, checker, seen);
  }
  if (!ts.isIdentifier(expression)) return false;
  if (expression.text === name) {
    const symbol = checker.getSymbolAtLocation(expression);
    if (!symbol) return true;
    const declarations = symbol.declarations ?? [];
    if (!declarations.some(ts.isVariableDeclaration)) return true;
  }

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isBuiltinObjectReference(declaration.initializer, name, checker, nextSeen)
  );
}

function isBuiltinMethodReference(
  expression: ts.Expression,
  objectName: string,
  methodName: string,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isBuiltinMethodReference(expression.expression, objectName, methodName, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === methodName.toLowerCase() &&
    isBuiltinObjectReference(member.receiver, objectName, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isBuiltinMethodReference(declaration.initializer, objectName, methodName, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      getBindingElementPropertyName(declaration)?.toLowerCase() === methodName.toLowerCase() &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isBuiltinObjectReference(variable.initializer, objectName, checker)
    );
  });
}

function getReflectedPropertyLookup(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): { target: ts.Expression; names: string[]; returnsPropertyValue: boolean } | undefined {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return getReflectedPropertyLookup(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member && ['get', 'set', 'value'].includes(member.name.toLowerCase())) {
    const descriptor = getReflectedPropertyLookup(member.receiver, checker, seen);
    if (descriptor && !descriptor.returnsPropertyValue) {
      return { ...descriptor, returnsPropertyValue: true };
    }
  }
  if (ts.isCallExpression(expression)) {
    const isReflectGet = isBuiltinMethodReference(expression.expression, 'Reflect', 'get', checker);
    const isDescriptorRead = isBuiltinMethodReference(
      expression.expression,
      'Object',
      'getOwnPropertyDescriptor',
      checker
    );
    if (isReflectGet || isDescriptorRead) {
      const target = expression.arguments[0];
      const property = expression.arguments[1];
      if (target && property) {
        return {
          target,
          names: resolveStaticStrings(property, checker),
          returnsPropertyValue: isReflectGet,
        };
      }
    }
  }
  if (!ts.isIdentifier(expression)) return undefined;
  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return undefined;
    }
  }
  if (!symbol || seen.has(symbol)) return undefined;
  const nextSeen = new Set(seen).add(symbol);
  for (const declaration of symbol.declarations ?? []) {
    if (!ts.isVariableDeclaration(declaration) || !declaration.initializer) continue;
    const lookup = getReflectedPropertyLookup(declaration.initializer, checker, nextSeen);
    if (lookup) return lookup;
  }
  return undefined;
}

function isDocumentPrototypeReference(expression: ts.Expression, checker: ts.TypeChecker): boolean {
  const member = getStaticMemberAccess(expression, checker);
  return (
    member?.name === 'prototype' && isBuiltinObjectReference(member.receiver, 'Document', checker)
  );
}

function isCredentialStorageMutation(expression: ts.Expression, checker: ts.TypeChecker): boolean {
  if (!ts.isCallExpression(expression)) return false;
  const isSensitiveHostRoot = (target: ts.Expression) =>
    isDocumentObject(target, checker) ||
    isDocumentPrototypeReference(target, checker) ||
    isBrowserWindowOrAliasReference(target, checker) ||
    isBrowserNavigatorOrAliasReference(target, checker);
  const isSensitiveProperty = (target: ts.Expression, name: string) => {
    const propertyName = name.toLowerCase();
    return (
      (propertyName === 'cookie' &&
        (isDocumentObject(target, checker) || isDocumentPrototypeReference(target, checker))) ||
      (['caches', 'cookiestore', 'indexeddb', 'localstorage', 'sessionstorage'].includes(
        propertyName
      ) &&
        isBrowserWindowOrAliasReference(target, checker)) ||
      (propertyName === 'credentials' && isBrowserNavigatorOrAliasReference(target, checker))
    );
  };
  const objectHasSensitiveProperty = (
    target: ts.Expression,
    properties: ts.Expression,
    seen = new Set<ts.Symbol>()
  ): boolean => {
    if (ts.isParenthesizedExpression(properties) || ts.isAsExpression(properties)) {
      return objectHasSensitiveProperty(target, properties.expression, seen);
    }
    if (ts.isObjectLiteralExpression(properties)) {
      return properties.properties.some((property) => {
        if (ts.isSpreadAssignment(property)) return true;
        const name =
          ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)
            ? property.name
            : ts.isMethodDeclaration(property) ||
                ts.isGetAccessorDeclaration(property) ||
                ts.isSetAccessorDeclaration(property)
              ? property.name
              : undefined;
        if (!name) return false;
        const names = ts.isComputedPropertyName(name)
          ? resolveStaticStrings(name.expression, checker)
          : ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)
            ? [name.text]
            : [];
        return names.length === 0
          ? isSensitiveHostRoot(target)
          : names.some((candidate) => isSensitiveProperty(target, candidate));
      });
    }
    if (!ts.isIdentifier(properties)) return isSensitiveHostRoot(target);
    const symbol = checker.getSymbolAtLocation(properties);
    if (!symbol || seen.has(symbol)) return isSensitiveHostRoot(target);
    const nextSeen = new Set(seen).add(symbol);
    const initializers = (symbol.declarations ?? [])
      .filter(ts.isVariableDeclaration)
      .flatMap((declaration) => (declaration.initializer ? [declaration.initializer] : []));
    return initializers.length === 0
      ? isSensitiveHostRoot(target)
      : initializers.some((initializer) =>
          objectHasSensitiveProperty(target, initializer, nextSeen)
        );
  };
  const methodIs = (objectName: string, methodName: string) =>
    isBuiltinMethodReference(expression.expression, objectName, methodName, checker);

  if (
    methodIs('Reflect', 'set') ||
    methodIs('Reflect', 'defineProperty') ||
    methodIs('Object', 'defineProperty')
  ) {
    const target = expression.arguments[0];
    const property = expression.arguments[1];
    if (!target || !property) return false;
    const names = resolveStaticStrings(property, checker);
    return names.length === 0
      ? isSensitiveHostRoot(target)
      : names.some((name) => isSensitiveProperty(target, name));
  }

  if (methodIs('Object', 'assign') || methodIs('Object', 'defineProperties')) {
    const target = expression.arguments[0];
    const properties = expression.arguments[1];
    return (
      target !== undefined &&
      properties !== undefined &&
      objectHasSensitiveProperty(target, properties)
    );
  }

  return false;
}

function isCredentialStorageReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return isCredentialStorageReference(expression.expression, checker, seen);
  }
  if (isCredentialStorageMutation(expression, checker)) return true;

  const sensitiveGlobal = (name: string) =>
    ['caches', 'cookiestore', 'indexeddb', 'localstorage', 'sessionstorage'].includes(
      name.toLowerCase()
    );
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (reflected) {
    const names = reflected.names.map((name) => name.toLowerCase());
    if (
      (names.includes('cookie') &&
        (isDocumentObject(reflected.target, checker) ||
          isDocumentPrototypeReference(reflected.target, checker))) ||
      (names.some((name) =>
        ['caches', 'cookiestore', 'indexeddb', 'localstorage', 'sessionstorage'].includes(name)
      ) &&
        isBrowserWindowOrAliasReference(reflected.target, checker)) ||
      (names.includes('credentials') &&
        isBrowserNavigatorOrAliasReference(reflected.target, checker)) ||
      (names.length === 0 &&
        (isDocumentObject(reflected.target, checker) ||
          isDocumentPrototypeReference(reflected.target, checker) ||
          isBrowserWindowOrAliasReference(reflected.target, checker) ||
          isBrowserNavigatorOrAliasReference(reflected.target, checker)))
    ) {
      return true;
    }
  }

  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    ((['caches', 'cookiestore', 'indexeddb', 'localstorage', 'sessionstorage'].includes(
      member.name.toLowerCase()
    ) &&
      isBrowserWindowOrAliasReference(member.receiver, checker)) ||
      (member.name.toLowerCase() === 'credentials' &&
        isBrowserNavigatorOrAliasReference(member.receiver, checker)) ||
      (member.name.toLowerCase() === 'cookie' &&
        (isDocumentObject(member.receiver, checker) ||
          isDocumentPrototypeReference(member.receiver, checker))))
  ) {
    return true;
  }

  if (ts.isBindingElement(expression)) {
    const propertyName = getBindingElementPropertyName(expression)?.toLowerCase();
    const variable = expression.parent.parent;
    if (
      propertyName &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer &&
      ((propertyName === 'cookie' && isDocumentObject(variable.initializer, checker)) ||
        (sensitiveGlobal(propertyName) &&
          isBrowserWindowOrAliasReference(variable.initializer, checker)) ||
        (propertyName === 'credentials' &&
          isBrowserNavigatorOrAliasReference(variable.initializer, checker)))
    ) {
      return true;
    }
  }

  if (!ts.isIdentifier(expression)) return false;
  const symbolAtReference = checker.getSymbolAtLocation(expression);
  if (
    sensitiveGlobal(expression.text) &&
    (!symbolAtReference || !(symbolAtReference.declarations ?? []).some(ts.isVariableDeclaration))
  ) {
    return true;
  }
  let symbol = symbolAtReference;
  if (symbolAtReference && (symbolAtReference.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(symbolAtReference);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      isCredentialStorageReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const propertyName = getBindingElementPropertyName(declaration)?.toLowerCase();
    const variable = declaration.parent.parent;
    return (
      propertyName !== undefined &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      ((propertyName === 'cookie' && isDocumentObject(variable.initializer, checker)) ||
        (sensitiveGlobal(propertyName) &&
          isBrowserWindowOrAliasReference(variable.initializer, checker)) ||
        (propertyName === 'credentials' &&
          isBrowserNavigatorOrAliasReference(variable.initializer, checker)))
    );
  });
}

function isOutboundNetworkReflection(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const reflectedProperty = (
    target: ts.Expression | undefined,
    property: ts.Expression | undefined
  ) => {
    if (!target || !property) return false;
    const names = resolveStaticStrings(property, checker).map((name) => name.toLowerCase());
    return (
      names.includes('addmodule') ||
      (isBrowserWindowOrAliasReference(target, checker) &&
        names.some((name) =>
          [
            'audio',
            'eventsource',
            'fetch',
            'image',
            'importscripts',
            'sharedworker',
            'websocket',
            'worker',
            'xmlhttprequest',
          ].includes(name)
        )) ||
      (isBrowserNavigatorOrAliasReference(target, checker) &&
        names.some((name) => ['sendbeacon', 'serviceworker'].includes(name))) ||
      (isServiceWorkerContainerReference(target, checker) && names.includes('register')) ||
      (isAxiosClientReference(target, checker) &&
        names.some((name) => ['delete', 'get', 'patch', 'post', 'put', 'request'].includes(name)))
    );
  };

  if (isBuiltinMethodReference(call.expression, 'Reflect', 'get', checker)) {
    return reflectedProperty(call.arguments[0], call.arguments[1]);
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] &&
    (isFetchFunction(call.arguments[0], checker) ||
      isSendBeaconFunction(call.arguments[0], checker) ||
      isAxiosRequestFunction(call.arguments[0], checker) ||
      isServiceWorkerRegisterFunction(call.arguments[0], checker))
  ) {
    return true;
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] &&
    isImportScriptsFunction(call.arguments[0], checker) &&
    call.arguments[2] &&
    ts.isArrayLiteralExpression(call.arguments[2]) &&
    call.arguments[2].elements.some((argument) =>
      resolveStaticStrings(argument, checker).some(isRemoteWebUrl)
    )
  ) {
    return true;
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'construct', checker) &&
    call.arguments[0]
  ) {
    if (isNetworkConstructorReference(call.arguments[0], checker)) return true;
    const constructorTags = resolveResourceElementTag(call.arguments[0], checker);
    const constructorArguments = call.arguments[1];
    return (
      constructorArguments !== undefined &&
      ts.isArrayLiteralExpression(constructorArguments) &&
      constructorArguments.elements[0] !== undefined &&
      constructorTags.some((tag) => tag === 'img' || tag === 'audio') &&
      resolveStaticStrings(constructorArguments.elements[0], checker).some((value) =>
        isRemoteWebUrl(value)
      )
    );
  }
  if (isBuiltinMethodReference(call.expression, 'Object', 'getOwnPropertyDescriptor', checker)) {
    return reflectedProperty(call.arguments[0], call.arguments[1]);
  }
  return false;
}

function isDynamicCodeFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker
): boolean {
  if (
    isBuiltinObjectReference(expression, 'eval', checker) ||
    isBuiltinObjectReference(expression, 'Function', checker)
  ) {
    return true;
  }
  const member = getStaticMemberAccess(expression, checker);
  return (
    member !== undefined &&
    ['eval', 'function'].includes(member.name.toLowerCase()) &&
    isBrowserWindowOrAliasReference(member.receiver, checker)
  );
}

function isDynamicCodeReflection(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const reflectedProperty = (
    target: ts.Expression | undefined,
    property: ts.Expression | undefined
  ) =>
    target !== undefined &&
    property !== undefined &&
    isBrowserWindowOrAliasReference(target, checker) &&
    resolveStaticStrings(property, checker).some((name) =>
      ['eval', 'function'].includes(name.toLowerCase())
    );

  if (
    (isBuiltinMethodReference(call.expression, 'Reflect', 'get', checker) ||
      isBuiltinMethodReference(call.expression, 'Object', 'getOwnPropertyDescriptor', checker)) &&
    reflectedProperty(call.arguments[0], call.arguments[1])
  ) {
    return true;
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] &&
    isDynamicCodeFunctionReference(call.arguments[0], checker)
  ) {
    return true;
  }
  return (
    isBuiltinMethodReference(call.expression, 'Reflect', 'construct', checker) &&
    call.arguments[0] !== undefined &&
    isDynamicCodeFunctionReference(call.arguments[0], checker)
  );
}

function isStringTimerFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isStringTimerFunctionReference(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    ['settimeout', 'setinterval'].includes(member.name.toLowerCase()) &&
    isBrowserWindowOrAliasReference(member.receiver, checker)
  ) {
    return true;
  }
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name.toLowerCase()) &&
    isStringTimerFunctionReference(member.receiver, checker, seen)
  ) {
    return true;
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    isBrowserWindowOrAliasReference(reflected.target, checker) &&
    reflected.names.some((name) => ['settimeout', 'setinterval'].includes(name.toLowerCase()))
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  if (['settimeout', 'setinterval'].includes(expression.text.toLowerCase())) return true;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isStringTimerFunctionReference(declaration.initializer, checker, nextSeen)
  );
}

function isStringTimerCodeExecution(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const isStaticCode = (expression: ts.Expression | undefined) =>
    expression !== undefined && resolveStaticStrings(expression, checker).length > 0;
  if (isStringTimerFunctionReference(call.expression, checker) && isStaticCode(call.arguments[0])) {
    return true;
  }
  const access = getStaticMemberAccess(call.expression, checker);
  if (
    access &&
    ['call', 'apply'].includes(access.name.toLowerCase()) &&
    isStringTimerFunctionReference(access.receiver, checker)
  ) {
    if (access.name.toLowerCase() === 'call') return isStaticCode(call.arguments[1]);
    return (
      call.arguments[1] !== undefined &&
      ts.isArrayLiteralExpression(call.arguments[1]) &&
      isStaticCode(call.arguments[1].elements[0])
    );
  }
  return (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] !== undefined &&
    isStringTimerFunctionReference(call.arguments[0], checker) &&
    call.arguments[2] !== undefined &&
    ts.isArrayLiteralExpression(call.arguments[2]) &&
    isStaticCode(call.arguments[2].elements[0])
  );
}

function isReflectedMarkupSink(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const reflectedProperty = (
    target: ts.Expression | undefined,
    property: ts.Expression | undefined
  ) => {
    if (!target || !property) return false;
    const names = resolveStaticStrings(property, checker).map((name) => name.toLowerCase());
    return (
      (isDocumentObject(target, checker) &&
        names.some((name) => ['write', 'writeln'].includes(name))) ||
      names.some((name) => ['innerhtml', 'outerhtml'].includes(name))
    );
  };

  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] &&
    isDocumentMarkupWriterReference(call.arguments[0], checker)
  ) {
    return true;
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'get', checker) &&
    reflectedProperty(call.arguments[0], call.arguments[1])
  ) {
    return true;
  }
  if (
    (isBuiltinMethodReference(call.expression, 'Reflect', 'set', checker) ||
      isBuiltinMethodReference(call.expression, 'Object', 'defineProperty', checker)) &&
    reflectedProperty(call.arguments[0], call.arguments[1])
  ) {
    return true;
  }
  return false;
}

function isDocumentRangeReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isDocumentRangeReference(expression.expression, checker, seen);
  }
  if (ts.isCallExpression(expression)) {
    const member = getStaticMemberAccess(expression.expression, checker);
    if (
      member?.name.toLowerCase() === 'createrange' &&
      isDocumentObject(member.receiver, checker)
    ) {
      return true;
    }
  }
  if (!ts.isIdentifier(expression)) return false;
  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isDocumentRangeReference(declaration.initializer, checker, nextSeen)
  );
}

function isDomParserConstructorReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isDomParserConstructorReference(expression.expression, checker, seen);
  }
  if (isBuiltinObjectReference(expression, 'DOMParser', checker)) return true;
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === 'domparser' &&
    isBrowserWindowOrAliasReference(member.receiver, checker)
  ) {
    return true;
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    reflected.names.some((name) => name.toLowerCase() === 'domparser') &&
    isBrowserWindowOrAliasReference(reflected.target, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isDomParserConstructorReference(declaration.initializer, checker, nextSeen)
  );
}

function isDomParserInstanceReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isDomParserInstanceReference(expression.expression, checker, seen);
  }
  if (
    ts.isNewExpression(expression) &&
    isDomParserConstructorReference(expression.expression, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isDomParserInstanceReference(declaration.initializer, checker, nextSeen)
  );
}

function isUnsafeMarkupFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return isUnsafeMarkupFunctionReference(expression.expression, checker, seen);
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    ((reflected.names.some((name) => name.toLowerCase() === 'createcontextualfragment') &&
      isDocumentRangeReference(reflected.target, checker)) ||
      (reflected.names.some((name) => name.toLowerCase() === 'parsefromstring') &&
        isDomParserInstanceReference(reflected.target, checker)) ||
      reflected.names.some((name) => name.toLowerCase() === 'sethtmlunsafe'))
  ) {
    return true;
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === 'createcontextualfragment' &&
    isDocumentRangeReference(member.receiver, checker)
  ) {
    return true;
  }
  if (
    member?.name.toLowerCase() === 'parsefromstring' &&
    isDomParserInstanceReference(member.receiver, checker)
  ) {
    return true;
  }
  if (member?.name.toLowerCase() === 'sethtmlunsafe') return true;
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name.toLowerCase()) &&
    isUnsafeMarkupFunctionReference(member.receiver, checker, seen)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isUnsafeMarkupFunctionReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const propertyName = getBindingElementPropertyName(declaration)?.toLowerCase();
    const variable = declaration.parent.parent;
    if (!ts.isVariableDeclaration(variable) || !variable.initializer) return false;
    return (
      (propertyName === 'createcontextualfragment' &&
        isDocumentRangeReference(variable.initializer, checker)) ||
      (propertyName === 'parsefromstring' &&
        isDomParserInstanceReference(variable.initializer, checker)) ||
      propertyName === 'sethtmlunsafe'
    );
  });
}

function isDocumentCreateElementFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>(),
  factoryName = 'createelement'
): boolean {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return isDocumentCreateElementFunctionReference(
      expression.expression,
      checker,
      seen,
      factoryName
    );
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name.toLowerCase() === factoryName && isDocumentObject(member.receiver, checker)) {
    return true;
  }
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name.toLowerCase()) &&
    isDocumentCreateElementFunctionReference(member.receiver, checker, seen, factoryName)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isDocumentCreateElementFunctionReference(
        declaration.initializer,
        checker,
        nextSeen,
        factoryName
      )
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      getBindingElementPropertyName(declaration)?.toLowerCase() === factoryName &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isDocumentObject(variable.initializer, checker)
    );
  });
}

function getReactImportBinding(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): { moduleName: string; importedName: string } | undefined {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return getReactImportBinding(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member?.name.toLowerCase() === 'createelement') {
    const namespace = getReactImportBinding(member.receiver, checker, seen);
    if (namespace?.moduleName === 'react' && ['*', 'default'].includes(namespace.importedName)) {
      return { moduleName: 'react', importedName: 'createElement' };
    }
  }
  if (!ts.isIdentifier(expression)) return undefined;
  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return undefined;
  const nextSeen = new Set(seen).add(symbol);
  for (const declaration of symbol.declarations ?? []) {
    let current: ts.Node | undefined = declaration;
    while (current && !ts.isImportDeclaration(current)) current = current.parent;
    if (current && ts.isStringLiteralLike(current.moduleSpecifier)) {
      const moduleName = current.moduleSpecifier.text;
      let importedName: string | undefined;
      if (ts.isImportSpecifier(declaration)) {
        const imported = declaration.propertyName ?? declaration.name;
        importedName = imported.text;
      } else if (ts.isNamespaceImport(declaration)) {
        importedName = '*';
      } else if (ts.isImportClause(declaration)) {
        importedName = 'default';
      }
      if (importedName !== undefined) return { moduleName, importedName };
    }
    if (ts.isVariableDeclaration(declaration) && declaration.initializer !== undefined) {
      const imported = getReactImportBinding(declaration.initializer, checker, nextSeen);
      if (imported) return imported;
    }
  }
  return undefined;
}

function isReactElementFactoryReference(
  expression: ts.Expression,
  checker: ts.TypeChecker
): boolean {
  const imported = getReactImportBinding(expression, checker);
  return (
    (imported?.moduleName === 'react' && imported.importedName === 'createElement') ||
    (['react/jsx-runtime', 'react/jsx-dev-runtime'].includes(imported?.moduleName ?? '') &&
      ['jsx', 'jsxs', 'jsxDEV'].includes(imported?.importedName ?? ''))
  );
}

function isUnresolvedIntrinsicElementType(
  expression: ts.Expression,
  checker: ts.TypeChecker
): boolean {
  if (resolveStaticStrings(expression, checker).length > 0) return false;
  const type = checker.getTypeAtLocation(expression);
  const candidates = type.isUnion() ? type.types : [type];
  return candidates.some(
    (candidate) =>
      (candidate.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0
  );
}

function resolveResourceElementTag(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): string[] {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return resolveResourceElementTag(expression.expression, checker, seen);
  }
  if (ts.isNewExpression(expression)) {
    return resolveResourceElementTag(expression.expression, checker, seen);
  }
  const constructorExpression = expression;
  if (ts.isIdentifier(constructorExpression)) {
    const constructor = constructorExpression.text.toLowerCase();
    if (constructor === 'image') return ['img'];
    if (constructor === 'audio') return ['audio'];
  }
  const constructorAccess = getStaticMemberAccess(constructorExpression, checker);
  if (
    constructorAccess &&
    isBrowserWindowOrAliasReference(constructorAccess.receiver, checker) &&
    constructorAccess.name.toLowerCase() === 'image'
  ) {
    return ['img'];
  }
  if (
    constructorAccess &&
    isBrowserWindowOrAliasReference(constructorAccess.receiver, checker) &&
    constructorAccess.name.toLowerCase() === 'audio'
  ) {
    return ['audio'];
  }
  if (ts.isCallExpression(expression)) {
    const isCreateElement = isDocumentCreateElementFunctionReference(
      expression.expression,
      checker
    );
    const isCreateElementNs = isDocumentCreateElementFunctionReference(
      expression.expression,
      checker,
      new Set<ts.Symbol>(),
      'createelementns'
    );
    const isReactElement = isReactElementFactoryReference(expression.expression, checker);
    const tagArgument = expression.arguments[isCreateElementNs ? 1 : 0];
    if ((isCreateElement || isCreateElementNs || isReactElement) && tagArgument) {
      return resolveStaticStrings(tagArgument, checker).map((tag) => tag.toLowerCase());
    }
  }
  if (!ts.isIdentifier(expression)) return [];
  if (expression.text.toLowerCase() === 'image') return ['img'];
  if (expression.text.toLowerCase() === 'audio') return ['audio'];

  const locationSymbol = checker.getSymbolAtLocation(expression);
  if (!locationSymbol) return [];
  let symbol = locationSymbol;
  if ((locationSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(locationSymbol);
    } catch {
      return [];
    }
  }
  if (seen.has(symbol)) return [];
  const nextSeen = new Set(seen).add(symbol);
  const tags: string[] = [];
  for (const declaration of symbol.declarations ?? []) {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.isVariableDeclarationList(declaration.parent) &&
      (declaration.parent.flags & ts.NodeFlags.Const) !== 0
    ) {
      tags.push(...resolveResourceElementTag(declaration.initializer, checker, nextSeen));
      continue;
    }
    if (!ts.isBindingElement(declaration)) continue;
    const variable = declaration.parent.parent;
    const property = declaration.propertyName ?? declaration.name;
    const propertyName = ts.isIdentifier(property)
      ? property.text.toLowerCase()
      : ts.isStringLiteralLike(property)
        ? property.text.toLowerCase()
        : undefined;
    if (
      propertyName &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer &&
      isBrowserWindowOrAliasReference(variable.initializer, checker)
    ) {
      if (propertyName === 'image') tags.push('img');
      if (propertyName === 'audio') tags.push('audio');
    }
  }
  return tags;
}

function isUnresolvedDynamicApiFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return isUnresolvedDynamicApiFunctionReference(expression.expression, checker, seen);
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    reflected.names.length === 0 &&
    (isBrowserWindowOrAliasReference(reflected.target, checker) ||
      isDocumentObject(reflected.target, checker) ||
      isLocationObject(reflected.target, checker) ||
      isBrowserNavigatorOrAliasReference(reflected.target, checker) ||
      isWorkletReference(reflected.target, checker))
  ) {
    return true;
  }
  if (ts.isElementAccessExpression(expression) && expression.argumentExpression) {
    const names = resolveStaticStrings(expression.argumentExpression, checker);
    if (names.length > 0) return false;
    const receiver = expression.expression;
    return (
      isBrowserWindowOrAliasReference(receiver, checker) ||
      isDocumentObject(receiver, checker) ||
      isLocationObject(receiver, checker) ||
      isBrowserNavigatorOrAliasReference(receiver, checker) ||
      isWorkletReference(receiver, checker) ||
      resolveResourceElementTag(receiver, checker).length > 0
    );
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    ['apply', 'bind', 'call'].includes(member.name.toLowerCase()) &&
    isUnresolvedDynamicApiFunctionReference(member.receiver, checker, seen)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some(
    (declaration) =>
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isUnresolvedDynamicApiFunctionReference(declaration.initializer, checker, nextSeen)
  );
}

function isWorkletReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isWorkletReference(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (member && ['audioworklet', 'paintworklet', 'worklet'].includes(member.name.toLowerCase())) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;

  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  const declarations = symbol.declarations ?? [];
  if (
    declarations.some((declaration) => {
      if (ts.isVariableDeclaration(declaration)) {
        return (
          declaration.initializer !== undefined &&
          isWorkletReference(declaration.initializer, checker, nextSeen)
        );
      }
      if (ts.isBindingElement(declaration)) {
        const propertyName = getBindingElementPropertyName(declaration)?.toLowerCase();
        const variable = declaration.parent.parent;
        return (
          propertyName !== undefined &&
          ['audioworklet', 'paintworklet', 'worklet'].includes(propertyName) &&
          ts.isVariableDeclaration(variable) &&
          variable.initializer !== undefined
        );
      }
      if (ts.isParameter(declaration) && declaration.type) {
        return /\b(?:audio)?worklet\b/i.test(declaration.type.getText());
      }
      return false;
    })
  ) {
    return true;
  }

  const sourceFile = expression.getSourceFile();
  const priorAssignments = getIdentifierAssignments(checker, sourceFile).get(symbol) ?? [];
  return priorAssignments.some(
    (assignment) =>
      assignment.start < expression.getStart(sourceFile) &&
      (['audioworklet', 'paintworklet', 'worklet'].includes(
        assignment.propertyName?.toLowerCase() ?? ''
      ) || isWorkletReference(assignment.right, checker, nextSeen))
  );
}

function isRequestingResourceAttribute(tagName: string, attributeName: string): boolean {
  return (
    (['src', 'srcset', 'poster'].includes(attributeName) && staticResourceTags.has(tagName)) ||
    (attributeName === 'ping' && ['a', 'area'].includes(tagName)) ||
    (attributeName === 'href' && ['feimage', 'image', 'link', 'use'].includes(tagName)) ||
    (attributeName === 'data' && tagName === 'object') ||
    (attributeName === 'action' && tagName === 'form') ||
    (attributeName === 'formaction' && ['button', 'input'].includes(tagName))
  );
}

function getObjectLiteralProperty(
  expression: ts.Expression | undefined,
  propertyName: string,
  checker: ts.TypeChecker
): ts.Expression | undefined {
  const resolved = resolveObjectPropertyValues(expression, propertyName, checker);
  return resolved.unresolved ? undefined : resolved.values.at(-1);
}

interface ObjectPropertyResolution {
  values: ts.Expression[];
  unresolved: boolean;
}

function resolveObjectPropertyValues(
  expression: ts.Expression | undefined,
  propertyName: string,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): ObjectPropertyResolution {
  if (!expression) return { values: [], unresolved: false };
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return resolveObjectPropertyValues(expression.expression, propertyName, checker, seen);
  }
  if (ts.isObjectLiteralExpression(expression)) {
    const result: ObjectPropertyResolution = { values: [], unresolved: false };
    for (const property of expression.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = resolveObjectPropertyValues(
          property.expression,
          propertyName,
          checker,
          seen
        );
        result.values.push(...spread.values);
        result.unresolved ||= spread.unresolved;
        continue;
      }
      if (ts.isPropertyAssignment(property)) {
        const names = ts.isComputedPropertyName(property.name)
          ? resolveStaticStrings(property.name.expression, checker)
          : ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)
            ? [property.name.text]
            : [];
        if (names.length === 0) {
          result.unresolved = true;
          continue;
        }
        if (names.some((name) => name.toLowerCase() === propertyName.toLowerCase())) {
          result.values.push(property.initializer);
          if (resolveStaticStrings(property.initializer, checker).length === 0) {
            result.unresolved = true;
          }
        }
        continue;
      }
      if (ts.isShorthandPropertyAssignment(property)) {
        if (property.name.text.toLowerCase() === propertyName.toLowerCase()) {
          result.values.push(property.name);
          if (resolveStaticStrings(property.name, checker).length === 0) result.unresolved = true;
        }
        continue;
      }
      const name =
        'name' in property && property.name
          ? ts.isComputedPropertyName(property.name)
            ? resolveStaticStrings(property.name.expression, checker)
            : ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)
              ? [property.name.text]
              : []
          : [];
      if (
        name.length === 0 ||
        name.some((value) => value.toLowerCase() === propertyName.toLowerCase())
      ) {
        result.unresolved = true;
      }
    }
    return result;
  }
  if (!ts.isIdentifier(expression)) return { values: [], unresolved: true };
  const symbol = checker.getSymbolAtLocation(expression);
  if (!symbol || seen.has(symbol)) return { values: [], unresolved: true };
  const nextSeen = new Set(seen).add(symbol);
  for (const declaration of symbol.declarations ?? []) {
    if (ts.isBindingElement(declaration) && declaration.dotDotDotToken) {
      const pattern = declaration.parent;
      if (!ts.isObjectBindingPattern(pattern)) {
        return { values: [], unresolved: true };
      }
      const isExplicitlyExcluded = pattern.elements.some(
        (element) =>
          !element.dotDotDotToken &&
          getBindingElementPropertyName(element)?.toLowerCase() === propertyName.toLowerCase()
      );
      return isExplicitlyExcluded
        ? { values: [], unresolved: false }
        : { values: [], unresolved: true };
    }
    if (
      !ts.isVariableDeclaration(declaration) ||
      declaration.initializer === undefined ||
      !ts.isVariableDeclarationList(declaration.parent) ||
      (declaration.parent.flags & ts.NodeFlags.Const) === 0
    ) {
      continue;
    }
    return resolveObjectPropertyValues(declaration.initializer, propertyName, checker, nextSeen);
  }
  return { values: [], unresolved: true };
}

function mayRequestExternalResource(tagName: string): boolean {
  return Array.from(urlAttributeNames).some((attributeName) =>
    isRequestingResourceAttribute(tagName, attributeName)
  );
}

function loadsExternalResourceAutomatically(tagName: string): boolean {
  return mayRequestExternalResource(tagName) && !['button', 'form', 'input'].includes(tagName);
}

function isInteractiveOutboundAttribute(attributeName: string): boolean {
  return ['action', 'formaction', 'ping'].includes(attributeName);
}

function shouldRejectUnresolvedRemoteAttribute(tagName: string, attributeName: string): boolean {
  return (
    isRequestingResourceAttribute(tagName, attributeName) &&
    (loadsExternalResourceAutomatically(tagName) || isInteractiveOutboundAttribute(attributeName))
  );
}

function isLocationNavigationFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return isLocationNavigationFunctionReference(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member &&
    ['assign', 'replace'].includes(member.name.toLowerCase()) &&
    isLocationObject(member.receiver, checker)
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isLocationNavigationFunctionReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      ['assign', 'replace'].includes(
        getBindingElementPropertyName(declaration)?.toLowerCase() ?? ''
      ) &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isLocationObject(variable.initializer, checker)
    );
  });
}

function isWindowOpenFunctionReference(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return isWindowOpenFunctionReference(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === 'open' &&
    isBrowserWindowOrAliasReference(member.receiver, checker)
  ) {
    return true;
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    isBrowserWindowOrAliasReference(reflected.target, checker) &&
    reflected.names.some((name) => name.toLowerCase() === 'open')
  ) {
    return true;
  }
  if (!ts.isIdentifier(expression)) return false;
  if (expression.text.toLowerCase() === 'open' && !checker.getSymbolAtLocation(expression)) {
    return true;
  }

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return false;
    }
  }
  if (!symbol || seen.has(symbol)) return false;
  const nextSeen = new Set(seen).add(symbol);
  return (symbol.declarations ?? []).some((declaration) => {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined &&
      isWindowOpenFunctionReference(declaration.initializer, checker, nextSeen)
    ) {
      return true;
    }
    if (!ts.isBindingElement(declaration)) return false;
    const variable = declaration.parent.parent;
    return (
      getBindingElementPropertyName(declaration)?.toLowerCase() === 'open' &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      isBrowserWindowOrAliasReference(variable.initializer, checker)
    );
  });
}

function isProgrammaticWindowOpen(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const isUnverifiedDestination = (destination: ts.Expression | undefined) =>
    hasUnverifiedProgrammaticNavigation(destination, checker);
  if (isWindowOpenFunctionReference(call.expression, checker)) {
    return isUnverifiedDestination(call.arguments[0]);
  }

  const invocation = getStaticMemberAccess(call.expression, checker);
  if (
    invocation?.name.toLowerCase() === 'call' &&
    isWindowOpenFunctionReference(invocation.receiver, checker)
  ) {
    return isUnverifiedDestination(call.arguments[1]);
  }
  if (
    invocation?.name.toLowerCase() === 'apply' &&
    isWindowOpenFunctionReference(invocation.receiver, checker) &&
    call.arguments[1] !== undefined &&
    ts.isArrayLiteralExpression(call.arguments[1])
  ) {
    return isUnverifiedDestination(call.arguments[1].elements[0]);
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] !== undefined &&
    isWindowOpenFunctionReference(call.arguments[0], checker) &&
    call.arguments[2] !== undefined &&
    ts.isArrayLiteralExpression(call.arguments[2])
  ) {
    return isUnverifiedDestination(call.arguments[2].elements[0]);
  }
  return false;
}

function collectReferenceSymbols(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  symbols = new Set<ts.Symbol>(),
  visited = new Set<ts.Symbol>()
): Set<ts.Symbol> {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return collectReferenceSymbols(expression.expression, checker, symbols, visited);
  }
  if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'current') {
    return collectReferenceSymbols(expression.expression, checker, symbols, visited);
  }
  if (!ts.isIdentifier(expression)) return symbols;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return symbols;
    }
  }
  if (!symbol) return symbols;
  symbols.add(symbol);
  if (visited.has(symbol)) return symbols;
  const nextVisited = new Set(visited).add(symbol);
  for (const declaration of symbol.declarations ?? []) {
    if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
      collectReferenceSymbols(declaration.initializer, checker, symbols, nextVisited);
    } else if (ts.isBindingElement(declaration)) {
      const variable = declaration.parent.parent;
      if (ts.isVariableDeclaration(variable) && variable.initializer) {
        collectReferenceSymbols(variable.initializer, checker, symbols, nextVisited);
      }
    }
  }
  return symbols;
}

function isSameElementReference(
  left: ts.Expression,
  right: ts.Expression,
  checker: ts.TypeChecker
): boolean {
  const leftSymbols = collectReferenceSymbols(left, checker);
  return Array.from(collectReferenceSymbols(right, checker)).some((symbol) =>
    leftSymbols.has(symbol)
  );
}

function resolveAnchorClickReceiver(
  expression: ts.Expression,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): ts.Expression | undefined {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    return resolveAnchorClickReceiver(expression.expression, checker, seen);
  }
  const member = getStaticMemberAccess(expression, checker);
  if (
    member?.name.toLowerCase() === 'click' &&
    resolveResourceElementTag(member.receiver, checker).some((tag) => ['a', 'area'].includes(tag))
  ) {
    return member.receiver;
  }
  const reflected = getReflectedPropertyLookup(expression, checker);
  if (
    reflected?.returnsPropertyValue &&
    resolveResourceElementTag(reflected.target, checker).some((tag) => ['a', 'area'].includes(tag)) &&
    reflected.names.some((name) => name.toLowerCase() === 'click')
  ) {
    return reflected.target;
  }
  if (!ts.isIdentifier(expression)) return undefined;

  const referenceSymbol = checker.getSymbolAtLocation(expression);
  let symbol = referenceSymbol;
  if (referenceSymbol && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
    try {
      symbol = checker.getAliasedSymbol(referenceSymbol);
    } catch {
      return undefined;
    }
  }
  if (!symbol || seen.has(symbol)) return undefined;
  const nextSeen = new Set(seen).add(symbol);
  for (const declaration of symbol.declarations ?? []) {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer !== undefined
    ) {
      const receiver = resolveAnchorClickReceiver(declaration.initializer, checker, nextSeen);
      if (receiver) return receiver;
    }
    if (!ts.isBindingElement(declaration)) continue;
    const variable = declaration.parent.parent;
    if (
      getBindingElementPropertyName(declaration)?.toLowerCase() === 'click' &&
      ts.isVariableDeclaration(variable) &&
      variable.initializer !== undefined &&
      resolveResourceElementTag(variable.initializer, checker).some((tag) =>
        ['a', 'area'].includes(tag)
      )
    ) {
      return variable.initializer;
    }
  }
  return undefined;
}

function isProgrammaticAnchorNavigation(
  call: ts.CallExpression,
  source: ts.SourceFile,
  checker: ts.TypeChecker
): boolean {
  let target = resolveAnchorClickReceiver(call.expression, checker);
  let destination: ts.Expression | undefined;
  if (target) {
    destination = call.arguments[0];
  } else {
    const invocation = getStaticMemberAccess(call.expression, checker);
    if (invocation?.name.toLowerCase() === 'call') {
      target = resolveAnchorClickReceiver(invocation.receiver, checker);
      destination = call.arguments[1];
    } else if (
      invocation?.name.toLowerCase() === 'apply' &&
      call.arguments[1] !== undefined &&
      ts.isArrayLiteralExpression(call.arguments[1])
    ) {
      target = resolveAnchorClickReceiver(invocation.receiver, checker);
      destination = call.arguments[1].elements[0];
    } else if (
      isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
      call.arguments[0] !== undefined &&
      call.arguments[2] !== undefined &&
      ts.isArrayLiteralExpression(call.arguments[2])
    ) {
      target = resolveAnchorClickReceiver(call.arguments[0], checker);
      destination = call.arguments[2].elements[0];
    }
  }
  if (!target) return false;
  if (destination && hasUnverifiedProgrammaticNavigation(destination, checker)) return true;

  const destinations: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const assignment = getStaticMemberAccess(node.left, checker);
      if (
        assignment?.name.toLowerCase() === 'href' &&
        resolveResourceElementTag(assignment.receiver, checker).some((tag) =>
          ['a', 'area'].includes(tag)
        ) &&
        isSameElementReference(target!, assignment.receiver, checker)
      ) {
        destinations.push(node.right);
      }
    }

    if (ts.isCallExpression(node)) {
      const method = getStaticMemberAccess(node.expression, checker);
      if (
        method &&
        ['setattribute', 'setattributens'].includes(method.name.toLowerCase()) &&
        isSameElementReference(target!, method.receiver, checker)
      ) {
        const attributeIndex = method.name.toLowerCase() === 'setattributens' ? 1 : 0;
        const valueIndex = attributeIndex + 1;
        const attribute = node.arguments[attributeIndex];
        const value = node.arguments[valueIndex];
        if (
          attribute &&
          value &&
          resolveStaticStrings(attribute, checker).some(
            (name) => name.toLowerCase() === 'href'
          )
        ) {
          destinations.push(value);
        }
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(source);

  return (
    destinations.length === 0 ||
    destinations.some((destination) => hasUnverifiedProgrammaticNavigation(destination, checker))
  );
}

function isRemoteResourceMutation(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const method = call.expression;
  const access = getStaticMemberAccess(method, checker);
  if (isBuiltinMethodReference(method, 'Object', 'assign', checker)) {
    const target = call.arguments[0];
    if (!target) return false;
    const tagNames = resolveResourceElementTag(target, checker);
    return tagNames.some((tagName) =>
      Array.from(urlAttributeNames).some((attributeName) => {
        if (!isRequestingResourceAttribute(tagName, attributeName)) return false;
        return call.arguments
          .slice(1)
          .some((source) =>
            resolveObjectPropertyValues(source, attributeName, checker).values.some((value) =>
              resolveStaticStrings(value, checker).some((url) =>
                isRemoteResourceUrl(attributeName, url)
              )
            )
          );
      })
    );
  }
  let target: ts.Expression | undefined;
  let attribute: ts.Expression | undefined;
  let value: ts.Expression | undefined;

  if (access?.name.toLowerCase() === 'setattribute') {
    target = access.receiver;
    attribute = call.arguments[0];
    value = call.arguments[1];
  } else if (access?.name.toLowerCase() === 'setattributens') {
    target = access.receiver;
    attribute = call.arguments[1];
    value = call.arguments[2];
  } else if (isBuiltinMethodReference(method, 'Reflect', 'set', checker)) {
    target = call.arguments[0];
    attribute = call.arguments[1];
    value = call.arguments[2];
  } else if (isBuiltinMethodReference(method, 'Object', 'defineProperty', checker)) {
    target = call.arguments[0];
    attribute = call.arguments[1];
    value = getObjectLiteralProperty(call.arguments[2], 'value', checker);
  }

  if (!target || !attribute || !value) return false;
  const names = resolveStaticStrings(attribute, checker).map((name) => name.toLowerCase());
  const values = resolveStaticStrings(value, checker);
  return (
    resolveResourceElementTag(target, checker).some((tagName) =>
      names.some((attributeName) => isRequestingResourceAttribute(tagName, attributeName))
    ) && values.some((url) => names.some((name) => isRemoteResourceUrl(name, url)))
  );
}

function isUnresolvedRemoteResourceMutation(
  call: ts.CallExpression,
  checker: ts.TypeChecker
): boolean {
  const method = call.expression;
  const access = getStaticMemberAccess(method, checker);
  const objectAssign = isBuiltinMethodReference(method, 'Object', 'assign', checker);
  const staticValues = (expression: ts.Expression | undefined) =>
    expression ? resolveStaticStrings(expression, checker) : [];
  let target: ts.Expression | undefined;
  let attributes: string[] = [];
  let unresolvedValue = false;

  if (objectAssign) {
    target = call.arguments[0];
    if (!target) return false;
    const tagNames = resolveResourceElementTag(target, checker);
    return tagNames.some((tagName) =>
      Array.from(urlAttributeNames).some(
        (attributeName) =>
          shouldRejectUnresolvedRemoteAttribute(tagName, attributeName) &&
          call.arguments.slice(1).some((source) => {
            const resolved = resolveObjectPropertyValues(source, attributeName, checker);
            return (
              resolved.unresolved ||
              resolved.values.some((value) => resolveStaticStrings(value, checker).length === 0)
            );
          })
      )
    );
  }

  if (access?.name.toLowerCase() === 'setattribute') {
    target = access.receiver;
    attributes = staticValues(call.arguments[0]).map((name) => name.toLowerCase());
    unresolvedValue = staticValues(call.arguments[1]).length === 0;
  } else if (access?.name.toLowerCase() === 'setattributens') {
    target = access.receiver;
    attributes = staticValues(call.arguments[1]).map((name) => name.toLowerCase());
    unresolvedValue = staticValues(call.arguments[2]).length === 0;
  } else if (isBuiltinMethodReference(method, 'Reflect', 'set', checker)) {
    target = call.arguments[0];
    attributes = staticValues(call.arguments[1]).map((name) => name.toLowerCase());
    unresolvedValue = staticValues(call.arguments[2]).length === 0;
  } else if (isBuiltinMethodReference(method, 'Object', 'defineProperty', checker)) {
    target = call.arguments[0];
    attributes = staticValues(call.arguments[1]).map((name) => name.toLowerCase());
    const resolved = resolveObjectPropertyValues(call.arguments[2], 'value', checker);
    unresolvedValue =
      resolved.unresolved ||
      resolved.values.some((value) => resolveStaticStrings(value, checker).length === 0);
  }

  if (!target || attributes.length === 0 || !unresolvedValue) return false;
  return resolveResourceElementTag(target, checker).some((tagName) =>
    attributes.some((attributeName) =>
      shouldRejectUnresolvedRemoteAttribute(tagName, attributeName)
    )
  );
}

function isPotentialMetaRefreshValue(value: ts.Expression, checker: ts.TypeChecker): boolean {
  const values = resolveStaticStrings(value, checker);
  return (
    values.length === 0 || values.some((candidate) => candidate.trim().toLowerCase() === 'refresh')
  );
}

function hasMetaRefreshProperty(
  expression: ts.Expression | undefined,
  checker: ts.TypeChecker
): boolean {
  const httpEquiv = resolveObjectPropertyValues(expression, 'httpEquiv', checker);
  const legacyHttpEquiv = resolveObjectPropertyValues(expression, 'http-equiv', checker);
  return (
    httpEquiv.unresolved ||
    legacyHttpEquiv.unresolved ||
    [...httpEquiv.values, ...legacyHttpEquiv.values].some((value) =>
      isPotentialMetaRefreshValue(value, checker)
    )
  );
}

function isMetaRefreshMutation(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const method = call.expression;
  const access = getStaticMemberAccess(method, checker);
  if (isBuiltinMethodReference(method, 'Object', 'assign', checker)) {
    const target = call.arguments[0];
    return (
      target !== undefined &&
      resolveResourceElementTag(target, checker).includes('meta') &&
      call.arguments.slice(1).some((source) => hasMetaRefreshProperty(source, checker))
    );
  }

  let target: ts.Expression | undefined;
  let attribute: ts.Expression | undefined;
  let value: ts.Expression | undefined;
  if (access?.name.toLowerCase() === 'setattribute') {
    target = access.receiver;
    attribute = call.arguments[0];
    value = call.arguments[1];
  } else if (access?.name.toLowerCase() === 'setattributens') {
    target = access.receiver;
    attribute = call.arguments[1];
    value = call.arguments[2];
  } else if (isBuiltinMethodReference(method, 'Reflect', 'set', checker)) {
    target = call.arguments[0];
    attribute = call.arguments[1];
    value = call.arguments[2];
  } else if (isBuiltinMethodReference(method, 'Object', 'defineProperty', checker)) {
    target = call.arguments[0];
    attribute = call.arguments[1];
    value = getObjectLiteralProperty(call.arguments[2], 'value', checker);
  }

  const names = attribute
    ? resolveStaticStrings(attribute, checker).map((name) => name.toLowerCase().replaceAll('-', ''))
    : [];
  return (
    target !== undefined &&
    resolveResourceElementTag(target, checker).includes('meta') &&
    names.includes('httpequiv') &&
    (value === undefined || isPotentialMetaRefreshValue(value, checker))
  );
}

function isReflectedUnsafeUrlMutation(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const isUnsafe = (expression: ts.Expression | undefined) =>
    expression !== undefined &&
    resolveStaticStrings(expression, checker).some(
      (value) => isExecutableUrl(value) || isActiveDataDocumentUrl(value)
    );

  if (
    (isBuiltinMethodReference(call.expression, 'Reflect', 'set', checker) ||
      isBuiltinMethodReference(call.expression, 'Object', 'defineProperty', checker)) &&
    call.arguments[0] &&
    call.arguments[1]
  ) {
    const value = isBuiltinMethodReference(call.expression, 'Reflect', 'set', checker)
      ? call.arguments[2]
      : getObjectLiteralProperty(call.arguments[2], 'value', checker);
    const attributes = resolveStaticStrings(call.arguments[1], checker).map((name) =>
      name.toLowerCase()
    );
    const values = value ? resolveStaticStrings(value, checker) : [];
    if (
      isLocationObject(call.arguments[0], checker) &&
      attributes.includes('href') &&
      values.some((url) => isExecutableUrl(url) || isActiveDataDocumentUrl(url))
    ) {
      return true;
    }
    return resolveResourceElementTag(call.arguments[0], checker).some(
      (tagName) =>
        attributes.some((attributeName) => urlAttributeNames.has(attributeName)) &&
        values.some(
          (url) =>
            isExecutableUrl(url) ||
            (['a', 'area', 'embed', 'iframe', 'object', 'use'].includes(tagName) &&
              attributes.some((attributeName) =>
                ['data', 'href', 'src', 'xlinkhref'].includes(attributeName)
              ) &&
              isActiveDataDocumentUrl(url))
        )
    );
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] &&
    isLocationNavigationFunctionReference(call.arguments[0], checker) &&
    call.arguments[2] &&
    ts.isArrayLiteralExpression(call.arguments[2])
  ) {
    const destination = call.arguments[2].elements[0];
    return isUnsafe(destination) || hasUnverifiedProgrammaticNavigation(destination, checker);
  }
  return false;
}

function isProgrammaticLocationNavigation(
  call: ts.CallExpression,
  checker: ts.TypeChecker
): boolean {
  const navigationMethod = getStaticMemberAccess(call.expression, checker);
  if (
    navigationMethod &&
    ['assign', 'replace'].includes(navigationMethod.name.toLowerCase()) &&
    isLocationObject(navigationMethod.receiver, checker)
  ) {
    return hasUnverifiedProgrammaticNavigation(call.arguments[0], checker);
  }
  if (
    isBuiltinMethodReference(call.expression, 'Reflect', 'apply', checker) &&
    call.arguments[0] &&
    isLocationNavigationFunctionReference(call.arguments[0], checker) &&
    call.arguments[2] &&
    ts.isArrayLiteralExpression(call.arguments[2])
  ) {
    return hasUnverifiedProgrammaticNavigation(call.arguments[2].elements[0], checker);
  }
  if (
    (isBuiltinMethodReference(call.expression, 'Reflect', 'set', checker) ||
      isBuiltinMethodReference(call.expression, 'Object', 'defineProperty', checker)) &&
    call.arguments[0] &&
    isLocationObject(call.arguments[0], checker) &&
    call.arguments[1] &&
    resolveStaticStrings(call.arguments[1], checker).some(
      (name) => name.toLowerCase() === 'href'
    )
  ) {
    const value = isBuiltinMethodReference(call.expression, 'Reflect', 'set', checker)
      ? call.arguments[2]
      : getObjectLiteralProperty(call.arguments[2], 'value', checker);
    return hasUnverifiedProgrammaticNavigation(value, checker);
  }
  if (
    isBuiltinMethodReference(call.expression, 'Object', 'assign', checker) &&
    call.arguments[0] &&
    isLocationObject(call.arguments[0], checker) &&
    call.arguments.length > 1
  ) {
    return true;
  }
  return false;
}

interface SecuritySourceFile {
  fileName: string;
  code: string;
}

function scanRemoteAssetOrUnsafeUrl(sourceFiles: readonly SecuritySourceFile[]): {
  hasAmbiguousSourcePaths: boolean;
  hasRemoteRequest: boolean;
  hasUnsafeUrl: boolean;
  hasProgrammaticNavigation: boolean;
  hasDocumentWrite: boolean;
  hasDynamicCode: boolean;
  hasUnresolvedDynamicApi: boolean;
  hasCredentialAccess: boolean;
  hasDynamicScript: boolean;
  hasProgrammaticIframe: boolean;
  hasUncertifiedResourceElement: boolean;
  hasMetaRefresh: boolean;
  hasIframeSrcDoc: boolean;
} {
  if (sourceFiles.length === 0) {
    return {
      hasAmbiguousSourcePaths: false,
      hasRemoteRequest: false,
      hasUnsafeUrl: false,
      hasProgrammaticNavigation: false,
      hasDocumentWrite: false,
      hasDynamicCode: false,
      hasUnresolvedDynamicApi: false,
      hasCredentialAccess: false,
      hasDynamicScript: false,
      hasProgrammaticIframe: false,
      hasUncertifiedResourceElement: false,
      hasMetaRefresh: false,
      hasIframeSrcDoc: false,
    };
  }
  const virtualRoot = path.resolve(process.cwd(), '.tessellate-registry-scan');
  const canonical = (fileName: string) => {
    const absolute = path.resolve(fileName);
    const extension = path.extname(absolute);
    // TypeScript ignores uppercase source extensions when loading project roots.
    const normalizedExtensionPath = extension
      ? `${absolute.slice(0, -extension.length)}${extension.toLowerCase()}`
      : absolute;
    const normalized = path.normalize(normalizedExtensionPath);
    return ts.sys.useCaseSensitiveFileNames ? normalized : normalized.toLowerCase();
  };
  const files = new Map<
    string,
    { fileName: string; sourceName: string; code: string; scriptKind: ts.ScriptKind }
  >();
  let hasAmbiguousSourcePaths = false;
  for (const { fileName, code } of sourceFiles) {
    const relativeName = fileName.replaceAll('\\', '/').replace(/^\/+/, '');
    const originalExtension = path.extname(relativeName);
    const extension = originalExtension.toLowerCase();
    const normalizedRelativeName = originalExtension
      ? `${relativeName.slice(0, -originalExtension.length)}${extension}`
      : relativeName;
    const virtualName = path.resolve(virtualRoot, normalizedRelativeName);
    const scriptKind =
      extension === '.tsx'
        ? ts.ScriptKind.TSX
        : extension === '.jsx'
          ? ts.ScriptKind.JSX
          : extension === '.js' || extension === '.mjs' || extension === '.cjs'
            ? ts.ScriptKind.JS
            : ts.ScriptKind.TS;
    const key = canonical(virtualName);
    const existing = files.get(key);
    if (existing && existing.sourceName !== relativeName) {
      hasAmbiguousSourcePaths = true;
      continue;
    }
    files.set(key, { fileName: virtualName, sourceName: relativeName, code, scriptKind });
  }
  const directories = new Set<string>();
  const rootName = canonical(virtualRoot);
  for (const { fileName } of files.values()) {
    let directory = path.dirname(fileName);
    while (true) {
      const directoryName = canonical(directory);
      directories.add(directoryName);
      if (directoryName === rootName) break;
      const parent = path.dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  }
  const options: ts.CompilerOptions = {
    allowJs: true,
    jsx: ts.JsxEmit.Preserve,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noLib: true,
    target: ts.ScriptTarget.Latest,
  };
  const host = ts.createCompilerHost(options);
  host.fileExists = (name) => files.has(canonical(name));
  host.directoryExists = (name) => directories.has(canonical(name));
  host.readFile = (name) => files.get(canonical(name))?.code;
  host.getSourceFile = (name, languageVersion) => {
    const key = canonical(name);
    const file = files.get(key);
    return file === undefined
      ? undefined
      : ts.createSourceFile(name, file.code, languageVersion, true, file.scriptKind);
  };

  const program = ts.createProgram(
    [...files.values()].map(({ fileName }) => fileName),
    options,
    host
  );
  const checker = program.getTypeChecker();
  let hasRemoteRequest = false;
  let hasUnsafeUrl = false;
  let hasProgrammaticNavigation = false;
  let hasDocumentWrite = false;
  let hasDynamicCode = false;
  let hasUnresolvedDynamicApi = false;
  let hasCredentialAccess = false;
  let hasDynamicScript = false;
  let hasProgrammaticIframe = false;
  let hasUncertifiedResourceElement = false;
  let hasMetaRefresh = false;
  let hasIframeSrcDoc = false;
  for (const { fileName } of files.values()) {
    const source = program.getSourceFile(fileName);
    if (!source) continue;
    let found = false;
    let unsafeUrlFound = false;
    let programmaticNavigationFound = false;
    let documentWriteFound = false;
    let dynamicCodeFound = false;
    let unresolvedDynamicApiFound = false;
    let credentialAccessFound = false;
    let dynamicScriptFound = false;
    let programmaticIframeFound = false;
    let uncertifiedResourceElementFound = false;
    let metaRefreshFound = false;
    let iframeSrcDocFound = false;

    const visit = (node: ts.Node) => {
      if ((found && unsafeUrlFound) || programmaticNavigationFound) return;
      if (
        (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
        networkCapabilityMemberNames.has(
          getStaticMemberAccess(node, checker)?.name.toLowerCase() ?? ''
        )
      ) {
        found = true;
        return;
      }
      if (
        ts.isBindingElement(node) &&
        networkCapabilityMemberNames.has(getBindingElementPropertyName(node)?.toLowerCase() ?? '')
      ) {
        found = true;
        return;
      }
      if (
        ts.isIdentifier(node) &&
        networkCapabilityMemberNames.has(node.text.toLowerCase())
      ) {
        found = true;
        return;
      }
      if (
        (ts.isExpression(node) || ts.isBindingElement(node)) &&
        isCredentialStorageReference(node as ts.Expression, checker)
      ) {
        credentialAccessFound = true;
      }
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        getStaticMemberAccess(node.left, checker)?.name.toLowerCase() === 'srcdoc'
      ) {
        iframeSrcDocFound = true;
      }
      if (ts.isCallExpression(node)) {
        const member = getStaticMemberAccess(node.expression, checker);
        const attributeArgument =
          member?.name.toLowerCase() === 'setattribute'
            ? node.arguments[0]
            : member?.name.toLowerCase() === 'setattributens'
              ? node.arguments[1]
              : isBuiltinMethodReference(node.expression, 'Reflect', 'set', checker) ||
                  isBuiltinMethodReference(node.expression, 'Object', 'defineProperty', checker)
                ? node.arguments[1]
                : undefined;
        if (
          attributeArgument &&
          resolveStaticStrings(attributeArgument, checker).some(
            (name) => name.toLowerCase().replaceAll('-', '') === 'srcdoc'
          )
        ) {
          iframeSrcDocFound = true;
        }
      }
      if (
        ts.isCallExpression(node) &&
        resolveResourceElementTag(node, checker).includes('script')
      ) {
        dynamicScriptFound = true;
      }
      if (
        ts.isCallExpression(node) &&
        resolveResourceElementTag(node, checker).includes('iframe')
      ) {
        programmaticIframeFound = true;
      }
      const navigationMethod = ts.isCallExpression(node)
        ? getStaticMemberAccess(node.expression, checker)
        : undefined;
      if (
        ts.isCallExpression(node) &&
        ((navigationMethod !== undefined &&
          ['write', 'writeln'].includes(navigationMethod.name) &&
          isDocumentObject(navigationMethod.receiver, checker)) ||
          isReflectedMarkupSink(node, checker) ||
          isUnsafeMarkupFunctionReference(node.expression, checker) ||
          (isBuiltinMethodReference(node.expression, 'Reflect', 'apply', checker) &&
            node.arguments[0] !== undefined &&
            isUnsafeMarkupFunctionReference(node.arguments[0], checker)))
      ) {
        documentWriteFound = true;
      }
      if (
        (ts.isCallExpression(node) &&
          (isDynamicCodeFunctionReference(node.expression, checker) ||
            isDynamicCodeReflection(node, checker))) ||
        (ts.isNewExpression(node) && isDynamicCodeFunctionReference(node.expression, checker))
      ) {
        dynamicCodeFound = true;
      }
      if (ts.isCallExpression(node) && isStringTimerCodeExecution(node, checker)) {
        dynamicCodeFound = true;
      }
      if (
        ((ts.isCallExpression(node) || ts.isNewExpression(node)) &&
          isUnresolvedDynamicApiFunctionReference(node.expression, checker)) ||
        (ts.isCallExpression(node) &&
          (isBuiltinMethodReference(node.expression, 'Reflect', 'apply', checker) ||
            isBuiltinMethodReference(node.expression, 'Reflect', 'construct', checker)) &&
          node.arguments[0] !== undefined &&
          isUnresolvedDynamicApiFunctionReference(node.arguments[0], checker))
      ) {
        unresolvedDynamicApiFound = true;
      }
      if (ts.isCallExpression(node) && isUnresolvedRemoteResourceMutation(node, checker)) {
        uncertifiedResourceElementFound = true;
      }
      if (ts.isCallExpression(node) && isMetaRefreshMutation(node, checker)) {
        metaRefreshFound = true;
      }
      const moduleRequest =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isCallExpression(node) &&
              (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
            ? node.arguments[0]
            : undefined;
      if (
        ts.isCallExpression(node) &&
        (isFetchFunction(node.expression, checker) ||
          isSendBeaconFunction(node.expression, checker) ||
          isAxiosRequestFunction(node.expression, checker) ||
          isOutboundNetworkReflection(node, checker) ||
          isServiceWorkerRegisterFunction(node.expression, checker) ||
          isRemoteResourceMutation(node, checker))
      ) {
        found = true;
        return;
      }
      if (
        ts.isCallExpression(node) &&
        isImportScriptsFunction(node.expression, checker) &&
        node.arguments.some((argument) =>
          resolveStaticStrings(argument, checker).some((value) => isRemoteWebUrl(value))
        )
      ) {
        found = true;
        return;
      }
      if (ts.isNewExpression(node) && isNetworkConstructorReference(node.expression, checker)) {
        found = true;
        return;
      }
      if (
        moduleRequest &&
        resolveStaticStrings(moduleRequest, checker).some((value) => isRemoteWebUrl(value))
      ) {
        found = true;
        return;
      }
      if (
        ts.isNewExpression(node) &&
        node.arguments?.[0] &&
        resolveResourceElementTag(node, checker).some((tag) => ['audio', 'img'].includes(tag)) &&
        resolveStaticStrings(node.arguments[0], checker).some((value) => isRemoteWebUrl(value))
      ) {
        found = true;
        return;
      }
      if (
        ts.isCallExpression(node) &&
        navigationMethod !== undefined &&
        ['assign', 'replace'].includes(navigationMethod.name) &&
        isLocationObject(navigationMethod.receiver, checker) &&
        node.arguments[0] &&
        resolveStaticStrings(node.arguments[0], checker).some(
          (value) => isExecutableUrl(value) || isActiveDataDocumentUrl(value)
        )
      ) {
        unsafeUrlFound = true;
      }
      if (
        ts.isCallExpression(node) &&
        (isProgrammaticLocationNavigation(node, checker) ||
          isProgrammaticWindowOpen(node, checker) ||
          isProgrammaticAnchorNavigation(node, source, checker))
      ) {
        programmaticNavigationFound = true;
      }
      if (ts.isCallExpression(node) && isReflectedUnsafeUrlMutation(node, checker)) {
        unsafeUrlFound = true;
      }
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        isLocationObject(node.left, checker) &&
        resolveStaticStrings(node.right, checker).some(
          (value) => isExecutableUrl(value) || isActiveDataDocumentUrl(value)
        )
      ) {
        unsafeUrlFound = true;
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        const assignment = getStaticMemberAccess(node.left, checker);
        const assignsLocation =
          isLocationObject(node.left, checker) ||
          (assignment?.name.toLowerCase() === 'href' &&
            isLocationObject(assignment.receiver, checker));
        if (assignsLocation && hasUnverifiedProgrammaticNavigation(node.right, checker)) {
          programmaticNavigationFound = true;
        }
      }
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        getStaticMemberAccess(node.left, checker) !== undefined
      ) {
        const assignmentMember = getStaticMemberAccess(node.left, checker)!;
        const tagNames = resolveResourceElementTag(assignmentMember.receiver, checker);
        const assignedObject = assignmentMember.receiver;
        const attributeName = assignmentMember.name.toLowerCase();
        const values = resolveStaticStrings(node.right, checker);
        if (
          tagNames.includes('meta') &&
          attributeName.replaceAll('-', '') === 'httpequiv' &&
          isPotentialMetaRefreshValue(node.right, checker)
        ) {
          metaRefreshFound = true;
        }
        if (
          (urlAttributeNames.has(attributeName) || isLocationObject(node.left, checker)) &&
          values.some(
            (value) =>
              isExecutableUrl(value) ||
              ((tagNames.some((tagName) =>
                ['a', 'area', 'embed', 'iframe', 'object', 'use'].includes(tagName)
              ) ||
                isLocationObject(node.left, checker) ||
                (attributeName === 'href' && isLocationObject(assignedObject, checker))) &&
                isActiveDataDocumentUrl(value))
          )
        ) {
          unsafeUrlFound = true;
        }
        const isResourceAttribute = tagNames.some(
          (tagName) =>
            (['src', 'srcset', 'poster'].includes(attributeName) &&
              staticResourceTags.has(tagName)) ||
            (attributeName === 'href' && ['image', 'link', 'use'].includes(tagName)) ||
            (attributeName === 'data' && tagName === 'object') ||
            (attributeName === 'action' && tagName === 'form') ||
            (attributeName === 'ping' && ['a', 'area'].includes(tagName)) ||
            (attributeName === 'formaction' && ['button', 'input'].includes(tagName))
        );
        if (
          isResourceAttribute &&
          values.some((value) => isRemoteResourceUrl(attributeName, value))
        ) {
          found = true;
          return;
        }
      }
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isElementAccessExpression(node.left) &&
        node.left.argumentExpression !== undefined &&
        resolveStaticStrings(node.left.argumentExpression, checker).length === 0 &&
        resolveResourceElementTag(node.left.expression, checker).length > 0 &&
        resolveStaticStrings(node.right, checker).some(
          (value) =>
            isRemoteWebUrl(value) || isExecutableUrl(value) || isActiveDataDocumentUrl(value)
        )
      ) {
        unresolvedDynamicApiFound = true;
      }
      if (ts.isCallExpression(node) && isReactElementFactoryReference(node.expression, checker)) {
        const tagNames = resolveResourceElementTag(node, checker);
        const tagArgument = node.arguments[0];
        if (
          tagArgument &&
          tagNames.length === 0 &&
          isUnresolvedIntrinsicElementType(tagArgument, checker)
        ) {
          uncertifiedResourceElementFound = true;
        }
        const props = node.arguments[1];
        if (tagNames.includes('meta') && hasMetaRefreshProperty(props, checker)) {
          metaRefreshFound = true;
        }
        if (props) {
          for (const tagName of tagNames.filter(mayRequestExternalResource)) {
            for (const attributeName of urlAttributeNames) {
              const requestsResource = isRequestingResourceAttribute(tagName, attributeName);
              const resolution = resolveObjectPropertyValues(props, attributeName, checker);
              if (
                resolution.unresolved &&
                shouldRejectUnresolvedRemoteAttribute(tagName, attributeName)
              ) {
                uncertifiedResourceElementFound = true;
              }
              for (const value of resolution.values) {
                const values = resolveStaticStrings(value, checker);
                const activeDocumentContext =
                  ['a', 'area', 'embed', 'iframe', 'object', 'use'].includes(tagName) &&
                  ['data', 'href', 'src', 'xlinkhref'].includes(attributeName);
                if (
                  values.some(
                    (candidate) =>
                      isExecutableUrl(candidate) ||
                      (activeDocumentContext && isActiveDataDocumentUrl(candidate))
                  )
                ) {
                  unsafeUrlFound = true;
                }
                if (
                  requestsResource &&
                  values.some((candidate) => isRemoteResourceUrl(attributeName, candidate))
                ) {
                  found = true;
                }
              }
            }
          }
        }
      }
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const rawTagName = ts.isIdentifier(node.tagName) ? node.tagName.text : '';
        const normalizedTagName = rawTagName.toLowerCase();
        const tagName =
          rawTagName &&
          (rawTagName === normalizedTagName || caseSensitiveSvgResourceTags.has(normalizedTagName))
            ? normalizedTagName
            : '';
        if (tagName === 'meta') {
          for (const property of node.attributes.properties) {
            if (ts.isJsxSpreadAttribute(property)) {
              if (hasMetaRefreshProperty(property.expression, checker)) metaRefreshFound = true;
              continue;
            }
            if (!ts.isJsxAttribute(property)) continue;
            const attributeName = property.name.getText(source).toLowerCase().replaceAll('-', '');
            if (attributeName !== 'httpequiv') continue;
            const initializer = property.initializer;
            const expression = initializer
              ? ts.isJsxExpression(initializer)
                ? initializer.expression
                : initializer
              : undefined;
            if (!expression || isPotentialMetaRefreshValue(expression, checker)) {
              metaRefreshFound = true;
            }
          }
        }
        if (tagName === 'iframe') {
          for (const property of node.attributes.properties) {
            if (ts.isJsxSpreadAttribute(property)) {
              const resolution = resolveObjectPropertyValues(
                property.expression,
                'srcDoc',
                checker
              );
              if (resolution.unresolved || resolution.values.length > 0) {
                iframeSrcDocFound = true;
              }
              continue;
            }
            if (
              ts.isJsxAttribute(property) &&
              property.name.getText(source).toLowerCase().replaceAll('-', '') === 'srcdoc'
            ) {
              iframeSrcDocFound = true;
            }
          }
        }
        for (const property of node.attributes.properties) {
          if (ts.isJsxSpreadAttribute(property)) {
            if (!mayRequestExternalResource(tagName)) continue;
            for (const attributeName of urlAttributeNames) {
              const requestsResource = isRequestingResourceAttribute(tagName, attributeName);
              const resolution = resolveObjectPropertyValues(
                property.expression,
                attributeName,
                checker
              );
              if (
                resolution.unresolved &&
                shouldRejectUnresolvedRemoteAttribute(tagName, attributeName)
              ) {
                uncertifiedResourceElementFound = true;
              }
              for (const value of resolution.values) {
                const values = resolveStaticStrings(value, checker);
                const activeDocumentContext =
                  ['a', 'area', 'embed', 'iframe', 'object', 'use'].includes(tagName) &&
                  ['data', 'href', 'src', 'xlinkhref'].includes(attributeName);
                if (
                  values.some(
                    (candidate) =>
                      isExecutableUrl(candidate) ||
                      (activeDocumentContext && isActiveDataDocumentUrl(candidate))
                  )
                ) {
                  unsafeUrlFound = true;
                }
                if (
                  requestsResource &&
                  values.some((candidate) => isRemoteResourceUrl(attributeName, candidate))
                ) {
                  found = true;
                }
              }
            }
            continue;
          }
          if (!ts.isJsxAttribute(property) || !property.initializer) continue;
          const attributeName = property.name.getText(source).toLowerCase();
          const initializer = property.initializer;
          const expression = ts.isJsxExpression(initializer) ? initializer.expression : initializer;
          const values = expression ? resolveStaticStrings(expression, checker) : [];
          if (urlAttributeNames.has(attributeName)) {
            const activeDocumentContext =
              ['a', 'area', 'embed', 'iframe', 'object', 'use'].includes(tagName) &&
              ['data', 'href', 'src', 'xlinkhref'].includes(attributeName);
            if (
              values.some(
                (value) =>
                  isExecutableUrl(value) ||
                  (activeDocumentContext && isActiveDataDocumentUrl(value))
              )
            ) {
              unsafeUrlFound = true;
            }
          }
          if (['a', 'area'].includes(tagName) && attributeName === 'ping') {
            if (values.some((value) => isRemoteResourceUrl(attributeName, value))) {
              found = true;
              return;
            }
            if (expression && values.length === 0) {
              uncertifiedResourceElementFound = true;
            }
          }
          if (staticResourceTags.has(tagName)) {
            const isResourceAttribute = isRequestingResourceAttribute(tagName, attributeName);
            if (!isResourceAttribute) continue;
            if (expression) {
              if (values.length === 0 && isInteractiveOutboundAttribute(attributeName)) {
                uncertifiedResourceElementFound = true;
              } else if (values.some((value) => isRemoteResourceUrl(attributeName, value))) {
                found = true;
                return;
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(source);
    hasRemoteRequest ||= found;
    hasUnsafeUrl ||= unsafeUrlFound;
    hasProgrammaticNavigation ||= programmaticNavigationFound;
    hasDocumentWrite ||= documentWriteFound;
    hasDynamicCode ||= dynamicCodeFound;
    hasUnresolvedDynamicApi ||= unresolvedDynamicApiFound;
    hasCredentialAccess ||= credentialAccessFound;
    hasDynamicScript ||= dynamicScriptFound;
    hasProgrammaticIframe ||= programmaticIframeFound;
    hasUncertifiedResourceElement ||= uncertifiedResourceElementFound;
    hasMetaRefresh ||= metaRefreshFound;
    hasIframeSrcDoc ||= iframeSrcDocFound;
  }
  return {
    hasAmbiguousSourcePaths,
    hasRemoteRequest,
    hasUnsafeUrl,
    hasProgrammaticNavigation,
    hasDocumentWrite,
    hasDynamicCode,
    hasUnresolvedDynamicApi,
    hasCredentialAccess,
    hasDynamicScript,
    hasProgrammaticIframe,
    hasUncertifiedResourceElement,
    hasMetaRefresh,
    hasIframeSrcDoc,
  };
}

export function checkSecurityIsolationGate(
  code: string,
  treeViolations: string[] = [],
  sourceFiles: readonly SecuritySourceFile[] = [{ fileName: 'resource.tsx', code }]
): GateCheckResult {
  const violations: string[] = [...treeViolations];
  const sourceScan = scanRemoteAssetOrUnsafeUrl(sourceFiles);
  if (sourceScan.hasAmbiguousSourcePaths) {
    violations.push(
      'Resource source filenames collide after TypeScript extension normalization and cannot be safely certified'
    );
  }

  const evalPattern = new RegExp('\\b' + 'ev' + 'al\\s*\\(');
  if (evalPattern.test(code) || sourceScan.hasDynamicCode) {
    violations.push('Use of dynamic code execution (eval or Function constructor)');
  }
  if (/\b(?:setTimeout|setInterval)\s*\(\s*['"`]/.test(code)) {
    violations.push('Dynamic code execution through a string timer');
  }
  if (/dangerouslySetInnerHTML/.test(code))
    violations.push('Raw HTML injection via dangerouslySetInnerHTML');
  if (/\b(?:innerHTML|outerHTML)\s*=|\binsertAdjacentHTML\s*\(/i.test(code)) {
    violations.push('Direct DOM HTML injection sink');
  }
  if (/<script\b/i.test(code) || sourceScan.hasDynamicScript) {
    violations.push('Inline, external, or dynamically inserted script');
  }

  const outboundNetworkPatterns = [
    /\bfetch\s*\(/i,
    /\baxios(?:\s*\.\s*(?:get|post|put|patch|delete|request))?\s*\(/i,
    /\bnew\s+XMLHttpRequest\s*\(/i,
    /\bnavigator\s*\.\s*sendBeacon\s*\(/i,
    /\bnew\s+(?:WebSocket|EventSource)\s*\(/i,
    /@import\s+(?:url\s*\()?\s*['"]?https?:/i,
    /<(?:img|video|audio|source|iframe)\b[^>]*\b(?:src|poster)\s*=\s*(?:['"]https?:|\{\s*['"`]https?:)/i,
  ];
  if (
    outboundNetworkPatterns.some((pattern) => pattern.test(code)) ||
    hasRemoteCssUrl(code) ||
    sourceScan.hasRemoteRequest
  ) {
    violations.push(
      'Direct outbound network, remote asset, or remote module request inside resource source'
    );
  }
  if (sourceScan.hasUnsafeUrl) {
    violations.push(
      'Executable or active-document URL scheme in a navigation or resource attribute'
    );
  }
  if (sourceScan.hasProgrammaticNavigation) {
    violations.push(
      'Programmatic navigation can send resource data outside the isolated preview; use a user-activated link instead'
    );
  }
  if (sourceScan.hasDocumentWrite) {
    violations.push('Dynamic HTML injection or markup writing through an unsafe DOM sink');
  }
  if (sourceScan.hasUnresolvedDynamicApi) {
    violations.push('Unresolved computed browser or DOM API call cannot be certified');
  }
  if (sourceScan.hasUncertifiedResourceElement) {
    violations.push('Dynamic native element tags or resource props cannot be certified');
  }
  if (sourceScan.hasMetaRefresh) {
    violations.push('Automatic meta refresh navigation is not allowed in registry resources');
  }
  if (sourceScan.hasIframeSrcDoc) {
    violations.push('Inline iframe srcDoc documents are not allowed in registry resources');
  }
  if (sourceScan.hasCredentialAccess) {
    violations.push('Access to browser cookies, credential APIs, or persistent browser storage');
  }

  const iframeTags = code.match(/<iframe\b[^>]*>/gi) ?? [];
  for (const tag of iframeTags) {
    const sandbox = tag.match(/\bsandbox(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/i);
    if (!sandbox) {
      violations.push('Embedded iframe is missing a sandbox attribute');
      continue;
    }
    if (sandbox[3]) {
      violations.push('Embedded iframe sandbox flags are dynamic and cannot be verified');
      continue;
    }
    const flags = (sandbox[1] ?? sandbox[2] ?? '').split(/\s+/).filter(Boolean);
    if (
      flags.some((flag) =>
        [
          'allow-same-origin',
          'allow-top-navigation',
          'allow-top-navigation-by-user-activation',
          'allow-popups-to-escape-sandbox',
        ].includes(flag)
      )
    ) {
      violations.push('Embedded iframe sandbox grants unsafe origin or navigation privileges');
    }
  }
  if (sourceScan.hasProgrammaticIframe) {
    violations.push(
      'Programmatically created iframe cannot be certified against the sandbox contract'
    );
  }

  if (/\b(?:process\s*\.\s*env|import\s*\.\s*meta\s*\.\s*env)\b/i.test(code)) {
    violations.push('Access to host environment variables');
  }
  if (
    /(?:api[_-]?key|secret[_-]?key|auth[_-]?token|password)\s*=\s*['"][a-zA-Z0-9_-]{16,}['"]/i.test(
      code
    )
  ) {
    violations.push('Hardcoded credential or API secret token detected');
  }

  if (violations.length > 0) {
    return {
      id: 'security-isolation',
      name: 'Source Safety & Preview Isolation',
      category: 'isolation',
      status: 'fail',
      score: 0,
      details: `Critical security invariant violation(s): ${violations.join(', ')}.`,
      remediation:
        'Remove dynamic code, raw HTML, outbound requests, remote module references, unsafe iframes, host credential access, and hardcoded secrets. Community resources must be pure and sandbox-isolated.',
    };
  }

  return {
    id: 'security-isolation',
    name: 'Source Safety & Preview Isolation',
    category: 'isolation',
    status: 'pass',
    score: 100,
    details:
      'Static source scan found no listed high-risk patterns; preview sandbox policy is enforced by the hosting application, not by this source check.',
  };
}
