import { describe, expect, it } from 'vitest';
import benchmark from '../../../../quality/PRODUCT_INTERPRETATION_BENCHMARK.json';
import { interpretProductBrief } from '../interpreter.js';
import { planScreenGraph } from '../planner.js';

describe('Screen Planner domain fidelity benchmark', () => {
  it('preserves each archetype-recommended screen across 100 no-override briefs', () => {
    const failures: Array<{ id: string; missing: string[] }> = [];

    for (const brief of benchmark.briefs) {
      const { productModel } = interpretProductBrief({ description: brief.description });
      const { screenGraph } = planScreenGraph(productModel);
      const plannedNames = new Set(
        screenGraph.groups.flatMap((group) =>
          group.screens.map((screen) => screen.name.toLocaleLowerCase())
        )
      );
      const missing = productModel.likelyScreens
        .map((screen) => screen.name)
        .filter((name) => !plannedNames.has(name.toLocaleLowerCase()));

      if (missing.length > 0) failures.push({ id: brief.id, missing });
    }

    expect(
      failures,
      `${failures.length}/100 ScreenGraphs omit recommended screens; first failures: ${JSON.stringify(failures.slice(0, 8))}`
    ).toEqual([]);
  });

  it('preserves screen semantics and keeps every visible recommendation reachable across 100 briefs', () => {
    const failures: Array<{ id: string; detail: string }> = [];

    for (const brief of benchmark.briefs) {
      const { productModel } = interpretProductBrief({ description: brief.description });
      const { screenGraph } = planScreenGraph(productModel);
      const screens = screenGraph.groups.flatMap((group) => group.screens);
      const byName = new Map(screens.map((screen) => [screen.name, screen]));

      for (const suggestion of productModel.likelyScreens) {
        const planned = byName.get(suggestion.name);
        if (
          !planned ||
          planned.screenType !== suggestion.screenType ||
          planned.purpose !== suggestion.purpose ||
          JSON.stringify(planned.jobs) !== JSON.stringify(suggestion.jobs ?? []) ||
          planned.required !== (suggestion.required ?? false) ||
          JSON.stringify(planned.deviceRelevance) !==
            JSON.stringify(productModel.constraints.targetDevices)
        ) {
          failures.push({ id: brief.id, detail: `semantic fields drifted for ${suggestion.name}` });
          continue;
        }
      }

      const entry =
        screens.find((screen) => screen.slug === '/') ??
        screens.find(
          (screen) =>
            screen.navigationVisibility === 'primary' &&
            !['marketing', 'documentation'].includes(screen.screenType)
        ) ??
        screens.find((screen) => screen.navigationVisibility === 'primary') ??
        screens[0];
      const outgoing = new Map<string, string[]>();
      for (const edge of screenGraph.edges) {
        outgoing.set(edge.fromScreenId, [
          ...(outgoing.get(edge.fromScreenId) ?? []),
          edge.toScreenId,
        ]);
      }
      const reachable = new Set<string>();
      const pending = entry ? [entry.id] : [];
      while (pending.length > 0) {
        const screenId = pending.pop()!;
        if (reachable.has(screenId)) continue;
        reachable.add(screenId);
        pending.push(...(outgoing.get(screenId) ?? []));
      }
      const unreachable = screens.filter(
        (screen) => screen.navigationVisibility !== 'hidden' && !reachable.has(screen.id)
      );
      if (unreachable.length > 0) {
        failures.push({
          id: brief.id,
          detail: `unreachable screens: ${unreachable.map((screen) => screen.name).join(', ')}`,
        });
      }
    }

    expect(failures, JSON.stringify(failures.slice(0, 8))).toEqual([]);
  });

  it('keeps screen routes unique and connects the public entry to the planned application', () => {
    const brief = benchmark.briefs.find((candidate) => candidate.id === 'REC-02');
    expect(brief).toBeDefined();
    const { productModel } = interpretProductBrief({ description: brief!.description });
    const { screenGraph } = planScreenGraph(productModel);
    const screens = screenGraph.groups.flatMap((group) => group.screens);
    const slugs = screens.map((screen) => screen.slug.toLocaleLowerCase());
    const ids = new Set(screens.map((screen) => screen.id));

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(
      screenGraph.edges.every((edge) => ids.has(edge.fromScreenId) && ids.has(edge.toScreenId))
    ).toBe(true);

    const edges = new Map<string, string[]>();
    for (const edge of screenGraph.edges) {
      const targets = edges.get(edge.fromScreenId) ?? [];
      targets.push(edge.toScreenId);
      edges.set(edge.fromScreenId, targets);
    }
    const entryId = screens.find((screen) => screen.slug === '/')?.id;
    const reachable = new Set<string>();
    const pending = entryId ? [entryId] : [];
    while (pending.length > 0) {
      const current = pending.pop()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      pending.push(...(edges.get(current) ?? []));
    }
    const visibleAppScreens = screens.filter(
      (screen) => screen.navigationVisibility === 'primary' && screen.screenType !== 'marketing'
    );
    expect(visibleAppScreens.every((screen) => reachable.has(screen.id))).toBe(true);
  });

  it('does not add billing to a B2B workspace brief that never mentions commerce', () => {
    const { productModel } = interpretProductBrief({
      description:
        'A free community workspace helps volunteers coordinate events and share local resources.',
    });
    const { screenGraph } = planScreenGraph(productModel);
    const names = screenGraph.groups.flatMap((group) =>
      group.screens.map((screen) => screen.name.toLocaleLowerCase())
    );

    expect(names.some((name) => name.includes('billing') || name.includes('subscription'))).toBe(
      false
    );
  });

  it('does not turn read-only financial analysis into a transfer flow', () => {
    const analysis = interpretProductBrief({
      description:
        'A financial intelligence trading terminal for equity analysts with market data and order book depth.',
      archetypeOverride: 'fintech',
    });
    const analysisScreens = planScreenGraph(analysis.productModel).screenGraph.groups.flatMap(
      (group) => group.screens.map((screen) => screen.name)
    );

    expect(analysisScreens).not.toContain('Transfer Funds');
    expect(analysis.productModel.workflows.some((workflow) => workflow.id === 'transfer-funds')).toBe(
      false
    );

    const transfers = interpretProductBrief({
      description: 'A fintech app that lets members transfer funds and send money between accounts.',
      archetypeOverride: 'fintech',
    });
    const transferScreens = planScreenGraph(transfers.productModel).screenGraph.groups.flatMap(
      (group) => group.screens.map((screen) => screen.name)
    );

    expect(transferScreens).toContain('Transfer Funds');
    expect(transfers.productModel.workflows.some((workflow) => workflow.id === 'transfer-funds')).toBe(
      true
    );
  });

  it('preserves required flags, device targets, and domain data from the ProductModel', () => {
    const brief = benchmark.briefs.find((candidate) => candidate.id === 'REC-02');
    expect(brief).toBeDefined();
    const { productModel } = interpretProductBrief({
      description: brief!.description,
      targetDevices: ['desktop', 'mobile'],
    });
    const screens = planScreenGraph(productModel).screenGraph.groups.flatMap(
      (group) => group.screens
    );

    for (const recommendation of productModel.likelyScreens) {
      const planned = screens.find((screen) => screen.name === recommendation.name);
      expect(planned?.required).toBe(recommendation.required ?? false);
      expect(planned?.deviceRelevance).toEqual(['desktop', 'mobile']);
    }
    expect(screens.find((screen) => screen.name === 'People Directory')?.expectedData).toContain(
      'Employee.name'
    );
  });

  it('keeps mobile navigation concise without hiding recommended screens', () => {
    const brief = benchmark.briefs.find((candidate) => candidate.id === 'REC-02');
    expect(brief).toBeDefined();
    const { productModel } = interpretProductBrief({
      description: brief!.description,
      targetDevices: ['desktop', 'tablet', 'mobile'],
    });
    const screens = planScreenGraph(productModel).screenGraph.groups.flatMap(
      (group) => group.screens
    );
    const primaryCount = screens.filter(
      (screen) => screen.navigationVisibility === 'primary'
    ).length;

    expect(primaryCount).toBeLessThanOrEqual(5);
    expect(screens.map((screen) => screen.name)).toEqual(
      expect.arrayContaining(productModel.likelyScreens.map((screen) => screen.name))
    );
    expect(screens.every((screen) => screen.deviceRelevance?.includes('mobile'))).toBe(true);
  });

  it('fails clearly when a ProductModel recommends an unknown screen grammar', () => {
    const { productModel } = interpretProductBrief({
      description: 'A calm personal productivity workspace.',
    });
    const invalidProductModel = {
      ...productModel,
      likelyScreens: [
        { name: 'Unsupported', screenType: 'unknown-screen', purpose: 'Test unsupported grammar.' },
      ],
    };

    expect(() => planScreenGraph(invalidProductModel)).toThrow(
      /unsupported screen type "unknown-screen"/
    );
  });

  it('builds a small domain-led fallback when a valid ProductModel has no screen recommendations', () => {
    const { productModel } = interpretProductBrief({
      description: 'A local research workspace for laboratory notes.',
    });
    const fallbackModel = { ...productModel, likelyScreens: [] };
    const screens = planScreenGraph(fallbackModel).screenGraph.groups.flatMap(
      (group) => group.screens
    );

    expect(screens.map((screen) => screen.name)).toEqual(['Overview', 'Entity Directory']);
    expect(screens[0]?.purpose).toBe(productModel.primaryObjective);
    expect(JSON.stringify(screens).toLocaleLowerCase()).not.toContain('telemetry');
  });

  it('keeps the employee experience architecture free of unrelated operational and finance copy', () => {
    const brief = benchmark.briefs.find((candidate) => candidate.id === 'REC-02');
    expect(brief).toBeDefined();
    const { productModel } = interpretProductBrief({ description: brief!.description });
    const { screenGraph } = planScreenGraph(productModel);
    const serializedGraph = JSON.stringify(screenGraph).toLocaleLowerCase();

    for (const contamination of [
      'telemetry',
      'order book',
      'trading',
      'portfolio',
      'candidate scorecard',
    ]) {
      expect(serializedGraph).not.toContain(contamination);
    }
  });
});
