import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { physioInterpretationFixture, type BriefInterpretation, type ProjectManifest, type ProjectNode, type ResourceManifest } from '@tessellate/schemas';
import { getAllGoldenBriefs, resourceFulfilsRole, SCREEN_CLASS_GRAMMARS } from '@tessellate/composer';
import { composeFromInterpretation, composeProjectPipeline, rolesForScreen } from '../compose-pipeline.js';
import { isResourceCompositionCapable } from '../capabilities.js';

const catalog: ResourceManifest[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../../apps/site/public/data/catalog.json'), 'utf-8'),
).resources;
const bySlug = new Map(catalog.map((r) => [r.slug, r]));

/** The physio brief reviewed down to WCAG AA, which today's (unverified-AAA) library can satisfy. */
const physioAA: BriefInterpretation = {
  ...physioInterpretationFixture,
  productModel: {
    ...physioInterpretationFixture.productModel,
    constraints: { ...physioInterpretationFixture.productModel.constraints, accessibilityFloor: 'AA' },
  },
};

function sections(node: ProjectNode): ProjectNode[] {
  return [node, ...node.children.flatMap(sections)].filter((n) => n.semanticRole && (n.resourceRef || n.props?.unresolvedRequiredRole));
}

function checkManifest(manifest: ProjectManifest): void {
  for (const screen of manifest.screens) {
    const placed = sections(screen.rootNode);
    const slugs = placed.flatMap((n) => (n.resourceRef ? [n.resourceRef.slug] : []));
    // No resource repeats within a screen.
    expect(new Set(slugs).size, `${screen.name}: ${slugs.join(', ')}`).toBe(slugs.length);
    for (const node of placed) {
      if (node.resourceRef) {
        // Every placed resource genuinely fulfils its role.
        const res = bySlug.get(node.resourceRef.slug)!;
        expect(resourceFulfilsRole(node.semanticRole!, res), `${screen.name}/${node.semanticRole} ← ${res.slug}`).toBe(true);
      } else {
        expect(node.props?.unresolvedRequiredRole).toBe(true);
      }
    }
  }
  // Client output never carries Tessellate's name or copy.
  const text = JSON.stringify({ brand: manifest.brand, name: manifest.name, screens: manifest.screens });
  expect(text).not.toMatch(/tessellate/i);
}

describe('Phase 29 — composition correctness', () => {
  it('physio interpretation: booking and calendar screens, client name everywhere, every role resolved or a gap', () => {
    const result = composeFromInterpretation(physioAA, {
      catalogResources: catalog,
      productName: 'Northside Physio',
      projectIdBase: 'proj_test',
    });
    for (const d of [result.directionA, result.directionB, result.directionC]) {
      checkManifest(d.manifest);
      expect(d.manifest.brand?.name).toBe('Northside Physio');
      expect(d.manifest.name).toMatch(/^Northside Physio — /);
    }
    const m = result.directionA.manifest;
    const screen = (type: string) => {
      const node = m.screenGraph.groups.flatMap((g) => g.screens).find((s) => s.screenType === type);
      return node ? m.screens.find((s) => s.id === node.id) : undefined;
    };
    expect(screen('booking-flow')).toBeDefined();
    const calendar = screen('calendar-schedule')!;
    const calendarSection = sections(calendar.rootNode).find((n) => n.semanticRole === 'calendar-view')!;
    expect(['calendar-week', 'calendar-month', 'schedule-agenda']).toContain(calendarSection.resourceRef?.slug);

    // Content comes from the product: the appointments table is about appointments, with sample rows.
    const appointments = m.screens.find((s) => s.name === 'Appointments')!;
    const table = sections(appointments.rootNode).find((n) => n.semanticRole === 'data-table')!;
    expect(table.props?.entity).toBe('Appointment');
    expect((table.props?.rows as unknown[]).length).toBeGreaterThan(0);
    const nav = sections(appointments.rootNode).find((n) => n.semanticRole === 'app-navigation')!;
    expect(nav.props?.brand).toBe('Northside Physio');
  });

  it('marketing and auth screens use their own grammar, not the dashboard direction grammar', () => {
    const marketing = rolesForScreen({ id: 's', name: 'Home', slug: '/', screenType: 'marketing', purpose: 'x', jobs: [], required: true, navigationVisibility: 'primary', importance: 50, expectedData: [], requiredRoles: [], optionalRoles: [] }, 0);
    expect(marketing.required).toEqual(SCREEN_CLASS_GRAMMARS.marketing!.requiredRoles);
    const auth = rolesForScreen({ id: 'a', name: 'Sign in', slug: '/sign-in', screenType: 'authentication', purpose: 'x', jobs: [], required: true, navigationVisibility: 'hidden', importance: 50, expectedData: [], requiredRoles: [], optionalRoles: [] }, 0);
    expect(auth.required).toEqual(['auth-card']);
  });

  it('an auth screen shows an explicit sign-in gap until the library has a sign-in form, never unrelated filler', () => {
    const result = composeFromInterpretation(physioInterpretationFixture, { catalogResources: catalog, projectIdBase: 'p' });
    const m = result.directionA.manifest;
    const authNode = m.screenGraph.groups.flatMap((g) => g.screens).find((s) => s.screenType === 'authentication')!;
    const auth = m.screens.find((s) => s.id === authNode.id)!;
    const placed = sections(auth.rootNode);
    const card = placed.find((n) => n.semanticRole === 'auth-card')!;
    const hasSignIn = catalog.some((r) => resourceFulfilsRole('auth-card', r));
    if (hasSignIn) expect(card.resourceRef).toBeDefined();
    else expect(card.props?.unresolvedRequiredRole).toBe(true);
    expect(result.directionA.diagnostics?.some((d) => d.role === 'auth-card') ?? false).toBe(!hasSignIn);
  });

  it('six golden briefs compose cleanly in all three directions', () => {
    for (const brief of getAllGoldenBriefs().slice(0, 6)) {
      const result = composeProjectPipeline(brief.input, { catalogResources: catalog, productName: brief.title });
      for (const d of [result.directionA, result.directionB, result.directionC]) checkManifest(d.manifest);
    }
  });

  it('an AAA floor never places an AA-only resource; the gap says why and what to do', () => {
    const r = composeFromInterpretation(physioInterpretationFixture, { catalogResources: catalog, projectIdBase: 'p' });
    const aaOnly = (slug: string) => bySlug.get(slug)?.accessibility.levelTarget !== 'AAA';
    const placed = r.directionA.manifest.screens.flatMap((s) => sections(s.rootNode)).flatMap((n) => (n.resourceRef ? [n.resourceRef.slug] : []));
    expect(placed.filter(aaOnly)).toEqual([]);
    // With only AA-level resources available, the AAA requirement leaves an explicit, actionable gap.
    const aaOnlyCatalog = catalog.filter((res) => res.accessibility.levelTarget !== 'AAA');
    const limited = composeFromInterpretation(physioInterpretationFixture, { catalogResources: aaOnlyCatalog, projectIdBase: 'p' });
    const constraintGap = limited.directionA.diagnostics?.find((d) => /WCAG AAA/.test(d.reason));
    expect(constraintGap?.reason).toMatch(/WCAG AAA requirement.*Lower the requirement in Review/);
    // Contract-v2 resources verified for AAA do fill their roles in an AAA project.
    expect(placed).toContain('advanced-data-table');
  });

  it('directions differ: expressive adds optional sections the conservative direction leaves out', () => {
    const r = composeFromInterpretation(physioAA, { catalogResources: catalog, projectIdBase: 'p' });
    const count = (m: ProjectManifest) => m.screens.reduce((n, s) => n + sections(s.rootNode).length, 0);
    expect(count(r.directionB.manifest)).toBeGreaterThan(count(r.directionA.manifest));
  });

  it('capability check: resources without component source or not renderable are never placed', () => {
    const anyRes = catalog[0]!;
    expect(isResourceCompositionCapable(anyRes)).toBe(true);
    expect(isResourceCompositionCapable({ ...anyRes, files: [] })).toBe(false);
    expect(isResourceCompositionCapable({ ...anyRes, status: 'deprecated' })).toBe(false);
    expect(isResourceCompositionCapable(anyRes, () => false)).toBe(false);

    const r = composeFromInterpretation(physioAA, {
      catalogResources: catalog,
      projectIdBase: 'p',
      isRenderable: (slug) => slug !== 'calendar-week' && slug !== 'calendar-month',
    });
    const used = JSON.stringify(r.directionA.manifest.screens);
    expect(used).not.toContain('"slug":"calendar-week"');
    expect(used).not.toContain('"slug":"calendar-month"');
  });
});
