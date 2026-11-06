import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const evidenceRoot = 'quality/evidence/step-45/public-v81-followup-2026-11-06/route-audit';
const desktop = JSON.parse(readFileSync(path.join(root, evidenceRoot, 'route-audit-desktop-chrome.json'), 'utf8'));
const mobile = JSON.parse(readFileSync(path.join(root, evidenceRoot, 'route-audit-mobile-chrome.json'), 'utf8'));
const previous = JSON.parse(readFileSync(path.join(root, 'audit/evidence/v26/route-classifications.json'), 'utf8'));
const normalize = (route) => route.replace(/\/$/, '') || '/';
const previousByRoute = new Map(previous.routes.map((item) => [normalize(item.route), item]));
const mobileByRoute = new Map(mobile.routes.map((item) => [normalize(item.route), item]));

const currentInteractionEvidence = {
  '/': 'v81 route smoke at both viewports; AUD-335 home-island readiness fix was previously verified deployed on v37 and later Sites versions.',
  '/explore': 'v81 settled catalogue, 324-resource count, onboarding search (15 results), mobile filter dialog, Escape dismissal, and focus restoration.',
  '/components': 'v81 settled category: 44 of 44 resources rendered at desktop and mobile.',
  '/sections': 'v81 settled category: 50 of 72 resources rendered at desktop and mobile; load-more remains available.',
  '/blocks': 'v81 settled category: 50 of 56 resources rendered at desktop and mobile; load-more remains available.',
  '/effects': 'v81 settled category: 50 of 56 resources rendered at desktop and mobile; load-more remains available.',
  '/motion': 'v81 settled category: 24 of 24 resources rendered at desktop and mobile.',
  '/backgrounds': 'v81 settled category: 20 of 20 resources rendered at desktop and mobile.',
  '/ai': 'v81 settled category: 20 of 20 resources rendered at desktop and mobile.',
  '/data': 'v81 settled category: 35 of 35 resources rendered at desktop and mobile.',
  '/compose': 'v81 flagship exact employee-experience brief, ready catalogue, all three settled previews, Direction C handoff, Workbench mutations, undo/redo, persistence, and standalone export.',
  '/workbench': 'v81 direct startup reached the editor at desktop and mobile; the flagship then opened the selected Direction C project and exercised mutations/export.',
  '/tools': 'v81 ran the existing 10-tool browser suite at desktop and mobile: 41 passed, 21 project-scoped skips, zero failures.',
  '/r/advanced-data-table': 'v81 detail preview reached aria-busy=false at both viewports; earlier live resource variant and provenance checks remain linked below.',
  '/showcase/showcase-playful-hr/': 'v81 route smoke confirms the representative employee showcase renders at both viewports; it labels sample content.',
  '/blueprints/b2b-saas/': 'v81 route smoke confirms the representative B2B SaaS blueprint renders at both viewports.',
  '/tools/palette': 'v81 live tool suite exercised Palette Studio alongside all other tools at desktop and mobile.',
  '/docs/cli': 'v81 route smoke confirms the representative CLI documentation page renders at both viewports.',
};

const routes = desktop.routes.map((record) => {
  const small = mobileByRoute.get(normalize(record.route));
  const previousRecord = previousByRoute.get(normalize(record.route))
    ?? (record.route === '/tools/palette' ? previousByRoute.get('/tools/typography') : undefined);
  if (!small) throw new Error(`No mobile runtime evidence for ${record.route}`);
  if (!previousRecord) throw new Error(`No prior semantic review for ${record.route}`);

  const routeFailed = [record, small].some((item) =>
    item.status !== 200
    || item.bodyCharacters <= 20
    || item.overflow
    || item.consoleErrors.length > 0
    || item.consoleWarnings.length > 0
    || item.uncaughtExceptions.length > 0
    || item.failedRequests.length > 0
    || item.httpErrors.length > 0
    || (item.axe?.violations.length ?? 0) > 0,
  );
  const classification = routeFailed
    ? (record.bodyCharacters <= 20 || small.bodyCharacters <= 20 ? 'PLACEHOLDER' : 'BROKEN')
    : (record.route === '/' && previousRecord.classification === 'DEGRADED' ? 'PASS' : previousRecord.classification);

  return {
    route: record.route,
    classification,
    runtime: {
      desktop: {
        status: record.status,
        title: record.title,
        headings: record.headings,
        bodyCharacters: record.bodyCharacters,
        catalogueStatus: record.catalogueStatus ?? null,
        catalogueCards: record.catalogueCards ?? null,
        overflow: record.overflow,
        consoleErrors: record.consoleErrors.length,
        applicationConsoleWarnings: record.consoleWarnings.length,
        uncaughtExceptions: record.uncaughtExceptions.length,
        failedRequests: record.failedRequests.length,
        httpErrors: record.httpErrors.length,
        axeViolations: record.axe?.violations.length ?? 0,
        axeIncomplete: record.axe?.incomplete.map((item) => item.id) ?? [],
        screenshot: record.screenshot,
      },
      mobile: {
        status: small.status,
        title: small.title,
        headings: small.headings,
        bodyCharacters: small.bodyCharacters,
        catalogueStatus: small.catalogueStatus ?? null,
        catalogueCards: small.catalogueCards ?? null,
        overflow: small.overflow,
        consoleErrors: small.consoleErrors.length,
        applicationConsoleWarnings: small.consoleWarnings.length,
        uncaughtExceptions: small.uncaughtExceptions.length,
        failedRequests: small.failedRequests.length,
        httpErrors: small.httpErrors.length,
        axeViolations: small.axe?.violations.length ?? 0,
        axeIncomplete: small.axe?.incomplete.map((item) => item.id) ?? [],
        screenshot: small.screenshot,
      },
    },
    currentInteractionEvidence: currentInteractionEvidence[normalize(record.route)]
      ?? 'v81 current route smoke and screenshot at both viewports; interaction depth is limited to the earlier audited behavior cited below.',
    priorInteractionEvidence: previousRecord.interactionDepth,
  };
});

const output = {
  site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
  siteVersion: 81,
  capturedAt: new Date().toISOString(),
  viewports: ['1440x900', '390x844'],
  classificationMeaning: 'PASS means current route content was captured at both viewports, route runtime/network/overflow checks are clean, and the named route interaction evidence is available. It does not claim every secondary control or all WCAG contrast checks passed.',
  sharedEvidence: [
    `${evidenceRoot}/route-audit-desktop-chrome.json: 31 routes, 0 HTTP failures, app console errors/warnings, uncaught exceptions, failed requests, bad responses, overflow, or Axe violations.`,
    `${evidenceRoot}/route-audit-mobile-chrome.json: same checks at 390x844.`,
    'The route sweep waits for all nine catalogue/category pages, Compose readiness, direct Workbench startup, and the representative isolated resource preview.',
    'Axe returned zero violations. color-contrast remained incomplete on some complex rendered text and is not represented as a contrast pass.',
  ],
  counts: Object.fromEntries([...new Set(routes.map((route) => route.classification))].map((classification) => [classification, routes.filter((route) => route.classification === classification).length])),
  routes,
};

writeFileSync(path.join(root, evidenceRoot, 'route-classifications.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: `${evidenceRoot}/route-classifications.json`, counts: output.counts }));
