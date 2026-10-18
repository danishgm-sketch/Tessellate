import { describe, expect, it } from 'vitest';
import type { ProjectManifest, ProjectNode } from '@tessellate/schemas';
import { ProjectManifestSchema, ProductModelSchema, ScreenGraphSchema } from '@tessellate/schemas';
import { isGoldResource } from '@tessellate/catalog/gold';
import { generateViteSourceTree } from '@tessellate/exporter';
import { composeProjectPipeline } from '../compose-pipeline.js';
import { isResourceComposerEligible } from '../capabilities.js';
import { loadTestCatalog } from './test-catalog-loader.js';
import compositionBenchmark from '../../../../quality/COMPOSITION_QUALITY_BENCHMARK.json';
import interpretationBenchmark from '../../../../quality/PRODUCT_INTERPRETATION_BENCHMARK.json';

type CompositionBrief = {
  id: string;
  industry: string;
  brief: string;
  expectedPrimaryArchetype: string;
  acceptableArchetypes: string[];
  semanticProfile: string;
  requiredContentAnyOf?: string[];
  forbiddenContentAnyOf?: string[];
};

type SemanticProfile = {
  audienceAnyOf: string[];
  objectiveAnyOf: string[];
  entityAnyOf: string[];
  workflowAnyOf: string[];
  screenAnyOf: string[];
  forbiddenAnyOf: string[];
};

type DirectionName = 'directionA' | 'directionB' | 'directionC';

const briefs = compositionBenchmark.briefs as CompositionBrief[];
const sourceProfiles = interpretationBenchmark.semanticProfiles as Record<string, SemanticProfile>;
const catalog = loadTestCatalog();

function includesAny(actual: string, expected: string[]): boolean {
  const normalized = actual.toLocaleLowerCase();
  return expected.some((term) => normalized.includes(term.toLocaleLowerCase()));
}

function collectResourceSlugs(node: ProjectNode, output: string[] = []): string[] {
  if (node.resourceRef?.slug) output.push(node.resourceRef.slug);
  for (const child of node.children) collectResourceSlugs(child, output);
  return output;
}

function collectNodes(node: ProjectNode, output: ProjectNode[] = []): ProjectNode[] {
  output.push(node);
  for (const child of node.children) collectNodes(child, output);
  return output;
}

function structureSignature(manifest: ProjectManifest): string {
  const visit = (node: ProjectNode): string =>
    `${node.nodeType}:${node.semanticRole}[${node.children.map(visit).join(',')}]`;
  return manifest.screens
    .map((screen) => `${screen.screenNodeId}:${visit(screen.rootNode)}`)
    .join('|');
}

describe('COMPOSITION_QUALITY_BENCHMARK', () => {
  it('contains the 100 reviewed product briefs across all 18 shipped industries', () => {
    expect(briefs).toHaveLength(100);
    expect(new Set(briefs.map((brief) => brief.id)).size).toBe(100);
    expect(new Set(briefs.map((brief) => brief.industry)).size).toBe(18);
    expect(briefs.every((brief) => brief.brief.trim().length >= 60)).toBe(true);
    expect(
      briefs.every((brief) => brief.acceptableArchetypes.includes(brief.expectedPrimaryArchetype))
    ).toBe(true);
  });

  for (const brief of briefs) {
    it(`${brief.id} composes three semantically coherent, resolvable directions`, () => {
      const result = composeProjectPipeline(
        { description: brief.brief },
        { catalogResources: catalog, seed: `composition-quality-${brief.id}` }
      );
      const model = ProductModelSchema.safeParse(result.productModel);
      const graph = ScreenGraphSchema.safeParse(result.screenGraph);
      const profile = sourceProfiles[brief.semanticProfile];

      expect(model.success, `${brief.id} ProductModel must satisfy its schema`).toBe(true);
      expect(graph.success, `${brief.id} ScreenGraph must satisfy its schema`).toBe(true);
      expect(profile, `${brief.id} must point to a reviewed semantic profile`).toBeDefined();
      expect(result.productModel.productArchetypes[0]?.tag).toBe(brief.expectedPrimaryArchetype);
      expect(
        result.productModel.productArchetypes.every((entry) =>
          brief.acceptableArchetypes.includes(entry.tag)
        )
      ).toBe(true);

      expect(includesAny(result.productModel.primaryAudience, profile!.audienceAnyOf)).toBe(true);
      expect(includesAny(result.productModel.primaryObjective, profile!.objectiveAnyOf)).toBe(true);
      expect(includesAny(JSON.stringify(result.productModel.entities), profile!.entityAnyOf)).toBe(
        true
      );
      expect(
        includesAny(JSON.stringify(result.productModel.workflows), profile!.workflowAnyOf)
      ).toBe(true);
      expect(includesAny(JSON.stringify(result.screenGraph), profile!.screenAnyOf)).toBe(true);
      if (brief.id === 'ECOM-06') {
        const screenNames = result.screenGraph.groups.flatMap((group) =>
          group.screens.map((screen) => screen.name)
        );
        expect(result.productModel.primaryObjective).toMatch(/return|refund/i);
        expect(JSON.stringify(result.productModel.workflows)).toMatch(/return|refund/i);
        expect(screenNames).toEqual(
          expect.arrayContaining(['Order Lookup', 'Return Request', 'Refund Status'])
        );
        expect(screenNames).not.toEqual(
          expect.arrayContaining(['Storefront Catalog', 'Product Detail', 'Checkout'])
        );
      }
      if (brief.id === 'CON-04') {
        const activityScreen = result.screenGraph.groups
          .flatMap((group) => group.screens)
          .find((screen) => screen.name === 'Activity Stream');
        expect(activityScreen, 'CON-04 should plan an Activity Stream screen').toBeDefined();
        expect(activityScreen?.requiredRoles).not.toContain('metric-cards');
      }
      const directionNames: DirectionName[] = ['directionA', 'directionB', 'directionC'];
      const signatures = new Map<DirectionName, string>();
      const resourceSets = new Map<DirectionName, Set<string>>();

      for (const name of directionNames) {
        const output = result[name];
        const manifest = ProjectManifestSchema.safeParse(output.manifest);
        expect(manifest.success, `${brief.id} ${name} manifest must satisfy its schema`).toBe(true);
        const standaloneTree = generateViteSourceTree(output.manifest);
        const standalonePackage = JSON.parse(standaloneTree['package.json']!) as {
          dependencies: Record<string, string>;
        };
        expect(standaloneTree['src/main.tsx']).toBeDefined();
        expect(standaloneTree['src/App.tsx']).toBeDefined();
        expect(JSON.parse(standaloneTree['project.tess.json']!).id).toBe(output.manifest.id);
        expect(
          Object.keys(standalonePackage.dependencies).filter((dependency) =>
            dependency.startsWith('@tessellate/')
          ),
          `${brief.id} ${name} standalone export must not depend on Tessellate runtime packages`
        ).toEqual([]);
        expect(
          output.diagnostics ?? [],
          `${brief.id} ${name} unresolved required roles: ${JSON.stringify(output.diagnostics ?? [])}`
        ).toEqual([]);
        expect(output.manifest.screens).not.toHaveLength(0);
        if (brief.id === 'ECOM-06') {
          const returnScreen = output.manifest.screens.find(
            (screen) => screen.name === 'Return Request'
          );
          expect(returnScreen).toBeDefined();
          expect(
            returnScreen
              ? collectNodes(returnScreen.rootNode).filter(
                  (node) => node.semanticRole === 'settings-nav'
                )
              : []
          ).toHaveLength(0);
          const submitAction = returnScreen
            ? collectNodes(returnScreen.rootNode).find(
                (node) => node.semanticRole === 'save-footer'
              )
            : undefined;
          expect(submitAction?.props.disabled).toBe(true);
          expect(submitAction?.props.title).toBe(
            'Connect a returns service before submitting requests.'
          );
        }
        const generatedProductCopy = JSON.stringify({
          model: result.productModel,
          graph: result.screenGraph,
          manifest: output.manifest,
        }).toLocaleLowerCase();
        for (const forbidden of profile!.forbiddenAnyOf) {
          expect(
            generatedProductCopy,
            `${brief.id} ${name} must not include cross-domain copy: ${forbidden}`
          ).not.toContain(forbidden.toLocaleLowerCase());
        }
        if (brief.requiredContentAnyOf?.length) {
          expect(
            brief.requiredContentAnyOf.some((term) =>
              generatedProductCopy.includes(term.toLocaleLowerCase())
            ),
            `${brief.id} ${name} must contain product-specific reviewed copy`
          ).toBe(true);
        }
        for (const forbidden of brief.forbiddenContentAnyOf ?? []) {
          expect(
            generatedProductCopy,
            `${brief.id} ${name} must not inherit unrelated copy: ${forbidden}`
          ).not.toContain(forbidden.toLocaleLowerCase());
        }
        expect(
          output.manifest.screens.every(
            (screen) => screen.rootNode.id === `root-${screen.screenNodeId}`
          )
        ).toBe(true);

        const slugs = output.manifest.screens.flatMap((screen) =>
          collectResourceSlugs(screen.rootNode)
        );
        expect(slugs.length, `${brief.id} ${name} must contain real resources`).toBeGreaterThan(0);
        for (const slug of slugs) {
          const resource = catalog.find((candidate) => candidate.slug === slug);
          expect(isGoldResource(slug), `${brief.id} ${name} ${slug} must be Gold`).toBe(true);
          expect(
            resource,
            `${brief.id} ${name} ${slug} must resolve in the catalogue`
          ).toBeDefined();
          expect(
            isResourceComposerEligible(resource!),
            `${brief.id} ${name} ${slug} must be Core eligible`
          ).toBe(true);
          const mobileStrategy =
            resource!.responsive.verifiedWidths.some((width) => width <= 480) ||
            (resource!.responsive.breakpointStrategies ?? []).some(
              (breakpoint) => breakpoint.maxWidth >= 360
            ) ||
            resource!.responsive.defaultStrategy !== 'compress';
          expect(
            mobileStrategy,
            `${brief.id} ${name} ${slug} must have a usable mobile strategy`
          ).toBe(true);
        }

        const nodes = output.manifest.screens.flatMap((screen) => collectNodes(screen.rootNode));
        if (brief.id === 'TRV-01') {
          const destinationHero = nodes.find((node) => node.semanticRole === 'hero');
          expect(destinationHero?.props.subheadline).not.toContain(
            result.productModel.primaryObjective
          );
        }
        if (brief.id === 'REA-01') {
          const propertySearch = output.manifest.screens.find(
            (screen) => screen.name === 'Property Search'
          );
          expect(propertySearch, `${name} must include the real-estate search screen`).toBeDefined();
          const searchNodes = propertySearch ? collectNodes(propertySearch.rootNode) : [];
          const searchInput = searchNodes.find((node) => node.semanticRole === 'search-header');
          const resultGrid = searchNodes.find((node) => node.semanticRole === 'results-grid');
          expect(searchInput?.props.label, `${name} property search must be labelled by its task`).toBe(
            'Search property listings'
          );
          expect(
            resultGrid?.resourceRef?.slug,
            `${name} search results must render listings, not marketing features`
          ).toBe('advanced-data-table');
          expect(resultGrid?.props.title).toBe('Available property listings');
          expect(resultGrid?.props.columnLabels).toEqual({
            name: 'Property',
            type: 'Location and features',
            quality: 'Price',
            status: 'Availability',
          });
          expect(resultGrid?.props.rows).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                name: 'Example property A',
                displayValue: 'Price not connected',
                status: 'Availability not connected',
              }),
            ])
          );
          expect(JSON.stringify(resultGrid?.props).toLowerCase()).not.toMatch(
            /latency|telemetry|portfolio/
          );
        }
        if (brief.id === 'MKT-01') {
          const listingSearch = output.manifest.screens.find(
            (screen) => screen.name === 'Explore Listings'
          );
          const listingResults = listingSearch
            ? collectNodes(listingSearch.rootNode).find(
                (node) => node.semanticRole === 'results-grid'
              )
            : undefined;
          const rows = listingResults?.props.rows as
            | Array<{ name: string; displayValue?: string }>
            | undefined;
          expect(rows?.length).toBeGreaterThan(0);
          expect(rows?.every((row) => /listing/i.test(row.name))).toBe(true);
          expect(JSON.stringify(rows).toLowerCase()).not.toMatch(/proposal|review/);
        }
        for (const node of nodes.filter((candidate) => candidate.semanticRole === 'search-header')) {
          expect(node.props.label).not.toBe('Continue onboarding');
          expect(node.props.helperText).not.toBe(
            'Example field. Connect persistence and your backend in the exported application.'
          );
        }
        for (const node of nodes.filter(
          (candidate) => candidate.resourceRef?.slug === 'advanced-data-table'
        )) {
          const rows = node.props.rows as Array<{ displayValue?: string }> | undefined;
          expect(rows?.every((row) => typeof row.displayValue === 'string')).toBe(true);
          expect(JSON.stringify(rows)).not.toMatch(/\b\d+\/100\b/);
        }
        const conversionCtas = nodes.filter((node) => node.resourceRef?.slug === 'cta-minimal');
        for (const node of conversionCtas) {
          expect(
            node.props.label,
            `${brief.id} ${name} conversion CTA must not carry generic onboarding copy`
          ).not.toBe('Continue onboarding');
          if (brief.expectedPrimaryArchetype === 'ecommerce') {
            expect(node.props.label).toBe('View product details');
          }
          const href = typeof node.props.href === 'string' ? node.props.href : '';
          const target = href.startsWith('#') ? href.slice(1) : '';
          const availableScreenIds = new Set(
            output.manifest.screens.map((screen) => screen.screenNodeId)
          );
          expect(
            availableScreenIds.has(target),
            `${brief.id} ${name} conversion CTA target ${href || '(missing)'} must name a screen in this project`
          ).toBe(true);
          if (brief.expectedPrimaryArchetype === 'ecommerce') {
            expect(
              output.manifest.screens.find((screen) => screen.screenNodeId === target)?.name
            ).toBe('Product Detail');
          }
        }
        const metricNodes = nodes.filter((node) => node.resourceRef?.slug === 'dashboard-kpi-grid');
        if (!result.productModel.entities.some((entity) => entity.name === 'Employee')) {
          for (const node of metricNodes) {
            const cards = node.props.cards as Array<{ val: string; status: string }> | undefined;
            expect(cards, `${brief.id} ${name} metric cards must be explicit`).toBeDefined();
            expect(
              cards?.every(
                (card) =>
                  card.val === '—' &&
                  /^(?:No connected data|Market data not connected)$/i.test(card.status)
              ),
              `${brief.id} ${name} must not present placeholder words as metric values`
            ).toBe(true);
          }
        } else {
          for (const node of metricNodes) {
            const cards = node.props.cards as Array<{ label: string; val: string; status: string }>;
            expect(cards.length).toBeGreaterThan(0);
            expect(
              cards.every(
                (card) =>
                  (card.val === '—' && card.status === 'No connected data') ||
                  (card.label === 'People' && card.status === 'From your brief')
              ),
              `${brief.id} ${name} employee summary cards must not invent counts or outcomes`
            ).toBe(true);
          }
        }
        const brandedNodes = nodes.filter((node) => typeof node.props.brand === 'string');
        for (const node of brandedNodes) {
          expect(
            node.props.brand,
            `${brief.id} ${name} navigation branding must retain product context`
          ).not.toMatch(/^Example\s+(?:AI|Fintech)$/i);
        }
        const profileHeaders = nodes.filter(
          (node) => node.resourceRef?.slug === 'entity-profile-header'
        );
        for (const node of profileHeaders) {
          expect(
            node.props.initials,
            `${brief.id} ${name} profile initials must remain a two-character mark`
          ).toMatch(/^[A-Z0-9]{2}$/);
        }
        const channelRails = nodes.filter((node) => node.semanticRole === 'channels-rail');
        const messageThreads = nodes.filter((node) => node.semanticRole === 'message-thread');
        const messageComposers = nodes.filter((node) => node.semanticRole === 'message-composer');
        for (const node of channelRails) {
          expect(
            node.resourceRef?.slug,
            `${brief.id} ${name} channels rail must use the Gold sidebar`
          ).toBe('collapsible-sidebar');
          expect(node.props.brand).toBe('Example channels');
        }
        for (const node of messageThreads) {
          expect(
            node.resourceRef?.slug,
            `${brief.id} ${name} thread must use a Gold chronological resource`
          ).toBe('timeline');
          expect(
            output.manifest.screens.some((screen) => node.props.title === `Example ${screen.name}`),
            `${brief.id} ${name} message thread heading should identify its screen as an example`
          ).toBe(true);
        }
        for (const node of messageComposers) {
          expect(
            node.resourceRef?.slug,
            `${brief.id} ${name} composer must use the Gold input`
          ).toBe('input');
          expect(node.props.label).toBe('Write a message');
          expect(node.props.placeholder).toBe('Write a message…');
          expect(node.props.helperText).toBe(
            'Example input. Connect a messaging backend to send messages.'
          );
        }
        for (const screen of output.manifest.screens) {
          const screenNodes = collectNodes(screen.rootNode);
          const metricSections = screenNodes.filter(
            (node) => node.semanticRole === 'metric-cards' || node.semanticRole === 'summary-kpis'
          );
          for (const node of metricSections) {
            expect(
              node.props.title,
              `${brief.id} ${name} ${screen.name} metric section must not repeat the page heading`
            ).not.toBe(screen.name);
          }
          const activity = screenNodes.find((node) => node.semanticRole === 'activity-feed');
          if (activity) {
            const activityEvents = activity.props.events as
              | Array<{ time: string; title: string; desc: string }>
              | undefined;
            expect(
              activityEvents?.every((event) => !/^example$/i.test(event.time)),
              `${brief.id} ${name} ${screen.name} activity timestamps must read like user-facing time labels`
            ).toBe(true);
            const isNotificationScreen = /notifications?|inbox|alerts/i.test(screen.name);
            expect(
              activity.resourceRef?.slug,
              `${brief.id} ${name} ${screen.name} must use the resource matching its activity semantics`
            ).toBe(isNotificationScreen ? 'notification-centre' : 'timeline');
            expect(
              activity.props.title,
              `${brief.id} ${name} ${screen.name} activity heading must add context instead of repeating the screen title`
            ).not.toBe(screen.name);
            const events = activity.props.events as
              Array<{ time: string; title: string; desc: string }> | undefined;
            expect(
              events?.length,
              `${brief.id} ${name} ${screen.name} needs example events`
            ).toBeGreaterThan(0);
            expect(JSON.stringify(events)).not.toMatch(/\bStep\s+\d+\b/i);
            for (const step of result.productModel.workflows.flatMap(
              (workflow) => workflow.steps
            )) {
              expect(
                JSON.stringify(events),
                `${brief.id} ${name} ${screen.name} must not expose the internal workflow step ${step}`
              ).not.toContain(step);
            }
            for (const identifier of result.productModel.workflows.flatMap((workflow) => [
              workflow.name,
              ...workflow.steps,
            ])) {
              if (/[_-]|[a-z][A-Z]/.test(identifier)) {
                expect(
                  JSON.stringify(events),
                  `${brief.id} ${name} ${screen.name} must not expose internal workflow identifier ${identifier}`
                ).not.toContain(identifier);
              }
            }
          }
          const conversation = screenNodes.find((node) => node.semanticRole === 'message-thread');
          if (conversation) {
            const messages = conversation.props.events as
              | Array<{ time: string; title: string; desc: string }>
              | undefined;
            expect(
              messages?.every((message) => !/^example(?:\s+exchange)?$/i.test(message.time)),
              `${brief.id} ${name} ${screen.name} conversation timestamps must be readable`
            ).toBe(true);
          }
          for (const board of screenNodes.filter((node) => node.semanticRole === 'canvas-viewport')) {
            const columns = board.props.columns as
              | Array<{ title: string; tasks: string[] }>
              | undefined;
            expect(columns?.length, `${brief.id} ${name} ${screen.name} canvas needs workflow content`).toBeGreaterThan(0);
            const boardCopy = JSON.stringify(columns);
            for (const identifier of result.productModel.workflows.flatMap((workflow) => [
              workflow.name,
              ...workflow.steps,
            ])) {
              if (/[_-]|[a-z][A-Z]/.test(identifier)) {
                expect(
                  boardCopy,
                  `${brief.id} ${name} ${screen.name} canvas must humanise workflow identifier ${identifier}`
                ).not.toContain(identifier);
              }
            }
          }
          if (brief.expectedPrimaryArchetype === 'consumer' && screen.name === 'Activity Stream') {
            expect(
              activity?.resourceRef?.slug,
              `${brief.id} ${name} activity stream should use a chronological feed`
            ).toBe('timeline');
            if (result.productModel.entities.some((entity) => entity.name === 'Community Update')) {
              expect(
                screenNodes.filter((node) => node.resourceRef?.slug === 'dashboard-kpi-grid'),
                `${brief.id} ${name} community updates should not carry generic dashboard metrics`
              ).toHaveLength(0);
            }
            if (brief.id === 'CON-04') {
              const activity = screenNodes.find((node) => node.semanticRole === 'activity-feed');
              expect(activity?.props.title).toBe('Latest community updates');
              const events = activity?.props.events as
                Array<{ time: string; title: string; desc: string }> | undefined;
              expect(events?.length).toBeGreaterThan(0);
              expect(events?.map((event) => event.time)).toEqual(['Today', 'Yesterday']);
              expect(JSON.stringify(events)).not.toMatch(
                /(?:choose|write|reply|welcome|publish|organize)-[a-z-]+/i
              );
            }
          }
          if (screenNodes.some((node) => node.semanticRole === 'channels-rail')) {
            expect(screenNodes.filter((node) => node.semanticRole === 'navigation')).toHaveLength(
              0
            );
          }
        }

        const routeTargets = [
          ...(output.manifest.navigation.primaryItems ?? []),
          ...(output.manifest.navigation.secondaryItems ?? []),
        ].map((item) => item.targetScreenId);
        const screenIds = new Set(output.manifest.screens.map((screen) => screen.screenNodeId));
        expect(routeTargets.every((target) => screenIds.has(target))).toBe(true);

        signatures.set(name, structureSignature(output.manifest));
        resourceSets.set(name, new Set(slugs));
      }

      for (const [leftIndex, leftName] of directionNames.entries()) {
        for (const rightName of directionNames.slice(leftIndex + 1)) {
          const left = result[leftName].direction;
          const right = result[rightName].direction;
          const structuralAxes = [
            left.navigationModel !== right.navigationModel,
            left.primaryGrammarId !== right.primaryGrammarId,
            signatures.get(leftName) !== signatures.get(rightName),
            [...resourceSets.get(leftName)!].some(
              (slug) => !resourceSets.get(rightName)!.has(slug)
            ) ||
              [...resourceSets.get(rightName)!].some(
                (slug) => !resourceSets.get(leftName)!.has(slug)
              ),
          ].filter(Boolean).length;

          expect(
            structuralAxes,
            `${brief.id} ${leftName}/${rightName} must differ across at least two structural axes`
          ).toBeGreaterThanOrEqual(2);
        }
      }
    });
  }
});
