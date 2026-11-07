import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { tryDeterministicCommandMatch } from '../packages/workbench/src/ai/ai-service.js';

interface BenchmarkCase {
  id: string;
  split: string;
  prompt: string;
  expectedAction: string | null;
  expectedNodeId?: string;
  expectedDnaDirections?: Record<string, number>;
  expectedDivergence?: number;
  model: {
    action: string;
    confidence: number;
    divergenceLevel: number;
    dnaDeltas?: Record<string, number>;
    targetNodeIds?: string[];
  };
}

const root = process.cwd();
const casesPath = path.join(root, 'quality/evidence/step-32/model-benchmark-cases.json');
const outputPath = path.resolve(process.argv[2] ?? 'quality/evidence/step-32/model-evaluation.json');
const benchmark = JSON.parse(readFileSync(casesPath, 'utf8')) as Record<string, unknown>;
const python = process.env.PYTHON ?? 'python';
const execution = spawnSync(python, [path.join(root, 'apps/host-daemon/model/evaluate.py'), casesPath], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
});
if (execution.status !== 0) {
  process.stderr.write(execution.stderr || execution.error?.message || 'Host model evaluation failed.\n');
  process.exit(execution.status ?? 1);
}

const raw = JSON.parse(execution.stdout) as Record<string, BenchmarkCase[]>;
const canonical = (action: string | null): string | null =>
  action === 'rethink-screen' ? 'recompose-screen' : action;
const evaluateSplit = (cases: BenchmarkCase[]) => {
  let modelCorrect = 0;
  let baselineCorrect = 0;
  let baselineCovered = 0;
  let modelFalsePositives = 0;
  let baselineFalsePositives = 0;
  let nodeCorrect = 0;
  let nodeCount = 0;
  let dnaCorrect = 0;
  let dnaCount = 0;
  let divergenceAbsoluteError = 0;
  let divergenceCount = 0;
  let brierScore = 0;
  let calibrationCount = 0;
  const calibrationBins = Array.from({ length: 5 }, () => ({ count: 0, confidence: 0, accuracy: 0 }));

  for (const item of cases) {
    const modelAction = canonical(item.model.action);
    const expectedAction = canonical(item.expectedAction);
    const modelIsCorrect = expectedAction === null ? false : modelAction === expectedAction;
    const baselineCommand = tryDeterministicCommandMatch({} as never, 'screen', item.prompt);
    const baselineAction = canonical(baselineCommand?.action ?? null);
    const baselineIsCorrect = expectedAction === null ? baselineAction === null : baselineAction === expectedAction;

    if (expectedAction !== null) {
      if (modelIsCorrect) modelCorrect += 1;
      if (baselineIsCorrect) baselineCorrect += 1;
      if (baselineAction !== null) baselineCovered += 1;
    } else {
      if (modelAction !== null) modelFalsePositives += 1;
      if (baselineAction !== null) baselineFalsePositives += 1;
    }

    if (item.expectedNodeId) {
      nodeCount += 1;
      if (item.model.targetNodeIds?.includes(item.expectedNodeId)) nodeCorrect += 1;
    }
    for (const [dimension, direction] of Object.entries(item.expectedDnaDirections ?? {})) {
      dnaCount += 1;
      const actual = item.model.dnaDeltas?.[dimension] ?? 0;
      if (Math.sign(actual) === Math.sign(direction)) dnaCorrect += 1;
    }
    if (item.expectedDivergence !== undefined) {
      divergenceCount += 1;
      divergenceAbsoluteError += Math.abs(item.model.divergenceLevel - item.expectedDivergence);
    }

    const confidence = Math.min(1, Math.max(0, item.model.confidence));
    const isCorrect = expectedAction === null ? modelAction === null : modelIsCorrect;
    brierScore += (confidence - Number(isCorrect)) ** 2;
    calibrationCount += 1;
    const bin = calibrationBins[Math.min(4, Math.floor(confidence * 5))]!;
    bin.count += 1;
    bin.confidence += confidence;
    bin.accuracy += Number(isCorrect);
  }

  const positives = cases.filter((item) => item.expectedAction !== null).length;
  const ece = calibrationBins.reduce((sum, bin) => {
    if (!bin.count || !calibrationCount) return sum;
    return sum + (bin.count / calibrationCount) * Math.abs(bin.confidence / bin.count - bin.accuracy / bin.count);
  }, 0);
  return {
    cases: cases.length,
    labeledActions: positives,
    modelActionAccuracy: positives ? modelCorrect / positives : null,
    deterministicParserActionAccuracy: positives ? baselineCorrect / positives : null,
    deterministicParserCoverage: positives ? baselineCovered / positives : null,
    modelFalsePositiveRate: cases.length - positives ? modelFalsePositives / (cases.length - positives) : null,
    deterministicParserFalsePositiveRate: cases.length - positives ? baselineFalsePositives / (cases.length - positives) : null,
    nodeSelectionAccuracy: nodeCount ? nodeCorrect / nodeCount : null,
    nodeSelectionCases: nodeCount,
    dnaDirectionAccuracy: dnaCount ? dnaCorrect / dnaCount : null,
    dnaDirectionChecks: dnaCount,
    divergenceMeanAbsoluteError: divergenceCount ? divergenceAbsoluteError / divergenceCount : null,
    divergenceCases: divergenceCount,
    confidenceBrierScore: calibrationCount ? brierScore / calibrationCount : null,
    confidenceExpectedCalibrationError: ece,
    calibrationBins: calibrationBins.map((bin, index) => ({
      range: `${(index * 20).toString()}-${((index + 1) * 20).toString()}%`,
      count: bin.count,
      meanConfidence: bin.count ? bin.confidence / bin.count : null,
      observedAccuracy: bin.count ? bin.accuracy / bin.count : null,
    })),
  };
};

const splits = Object.fromEntries(Object.entries(raw).map(([name, cases]) => [name, evaluateSplit(cases)]));
const report = {
  version: 1,
  recordedAt: new Date().toISOString(),
  benchmarkCases: path.relative(root, casesPath).replaceAll('\\', '/'),
  trainingSource: benchmark.trainingSource,
  trainingExamples: raw.training?.length ?? 0,
  comparison: 'BespokeInferenceEngine output versus tryDeterministicCommandMatch from the Workbench.',
  note: 'Action strings normalize rethink-screen to recompose-screen only because the deterministic parser intentionally treats rethink as its recompose alias. The laptop model has no abstention output, so every adversarial proposal counts as a false positive.',
  splits,
  disposition: 'LAB: evidence is diagnostic; no quality promotion is implied.',
  cases: raw,
};
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ output: path.relative(root, outputPath).replaceAll('\\', '/'), trainingExamples: report.trainingExamples, splits })}\n`);
