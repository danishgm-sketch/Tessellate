import { describe, expect, it } from 'vitest';
import benchmark from '../../../../quality/PRODUCT_INTERPRETATION_BENCHMARK.json';
import { interpretProductBrief } from '../interpreter.js';

type MetricRange = [number, number];
type SemanticProfile = {
  audienceAnyOf: string[];
  objectiveAnyOf: string[];
  entityAnyOf: string[];
  workflowAnyOf: string[];
  screenAnyOf: string[];
  forbiddenAnyOf: string[];
};

type InterpretationBenchmark = {
  metricProfiles: Record<
    string,
    {
      trustRequirement: MetricRange;
      dataDensity: MetricRange;
      transactionCriticality: MetricRange;
    }
  >;
  semanticProfiles: Record<string, SemanticProfile>;
  briefs: Array<{
    id: string;
    domain: string;
    description: string;
    expectedPrimaryArchetype: string;
    acceptableArchetypes: string[];
    semanticProfile: string;
  }>;
};

const dataset = benchmark as unknown as InterpretationBenchmark;

function includesAny(actual: string, expected: string[]): boolean {
  const normalized = actual.toLocaleLowerCase();
  return expected.some((term) => normalized.includes(term.toLocaleLowerCase()));
}

function inRange(value: number, [min, max]: MetricRange): boolean {
  return value >= min && value <= max;
}

describe('Product Interpreter semantic quality benchmark', () => {
  it('contains 100 no-override briefs covering every shipped archetype', () => {
    expect(dataset.briefs).toHaveLength(100);
    expect(new Set(dataset.briefs.map((brief) => brief.id)).size).toBe(100);
    expect(new Set(dataset.briefs.map((brief) => brief.domain)).size).toBe(18);
    expect(
      dataset.briefs.every((brief) =>
        brief.acceptableArchetypes.includes(brief.expectedPrimaryArchetype)
      )
    ).toBe(true);
  });

  for (const brief of dataset.briefs) {
    it(`${brief.id} infers a coherent ${brief.domain} product without overrides`, () => {
      const { productModel } = interpretProductBrief({ description: brief.description });
      const archetypes = productModel.productArchetypes;
      const tags = archetypes.map((archetype) => archetype.tag);
      const profile = dataset.semanticProfiles[brief.semanticProfile];
      const metrics = dataset.metricProfiles[brief.semanticProfile];
      if (!profile || !metrics)
        throw new Error(`Missing semantic or metric profile for ${brief.id}`);

      expect(tags[0]).toBe(brief.expectedPrimaryArchetype);
      expect(tags.every((tag) => brief.acceptableArchetypes.includes(tag))).toBe(true);
      expect(
        archetypes.every((archetype) => archetype.weight >= 20 && archetype.weight <= 100)
      ).toBe(true);
      expect(
        archetypes.every(
          (archetype, index) => index === 0 || archetypes[index - 1]!.weight >= archetype.weight
        )
      ).toBe(true);

      expect(includesAny(productModel.primaryAudience, profile.audienceAnyOf)).toBe(true);
      expect(includesAny(productModel.primaryObjective, profile.objectiveAnyOf)).toBe(true);
      expect(includesAny(JSON.stringify(productModel.entities), profile.entityAnyOf)).toBe(true);
      expect(includesAny(JSON.stringify(productModel.workflows), profile.workflowAnyOf)).toBe(true);
      expect(includesAny(JSON.stringify(productModel.likelyScreens), profile.screenAnyOf)).toBe(
        true
      );

      expect(inRange(productModel.trustRequirement, metrics.trustRequirement)).toBe(true);
      expect(inRange(productModel.dataDensity, metrics.dataDensity)).toBe(true);
      expect(inRange(productModel.transactionCriticality, metrics.transactionCriticality)).toBe(
        true
      );

      const serializedModel = JSON.stringify(productModel).toLocaleLowerCase();
      for (const forbidden of profile.forbiddenAnyOf) {
        expect(serializedModel).not.toContain(forbidden.toLocaleLowerCase());
      }

      if (brief.id === 'REC-02') {
        expect(productModel.forbiddenPatterns).not.toContain(
          'unblinded-evaluations-causing-bias'
        );
        expect(productModel.forbiddenPatterns).not.toContain(
          'accidental-rejection-email-dispatches'
        );
      }
    });
  }
});
