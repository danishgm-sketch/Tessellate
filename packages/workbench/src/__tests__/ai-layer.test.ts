import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { type ProjectManifest } from '@tessellate/schemas';
import {
  OpenAIAdapter,
  AnthropicAdapter,
  GeminiAdapter,
  OpenRouterAdapter,
  credentialStore,
  IntentCommandSchema,
  planMutationsFromIntent,
  interpretProductWithAI,
  mapArbitraryFeel,
  generateAICritique,
  generateWithConstrainedRepair,
  executeNaturalLanguageCommand,
  auditProjectManifest,
  AISchemaValidationError,
  createHistoryOperation,
  applyOperation,
} from '../index.js';
import { createSampleProject } from '../store/sample-project.js';

describe('Phase 13: AI-assisted layer', () => {
  let sampleProject: ProjectManifest;

  beforeEach(() => {
    credentialStore.clearAll();
    sampleProject = createSampleProject();
  });

  describe('1. Provider Adapters & Key Redaction', () => {
    it('OpenAI adapter generates structured output and redacts keys from errors', async () => {
      const adapter = new OpenAIAdapter();
      const secretKey = 'sk-proj-super-secret-openai-key-12345';

      // Mock fetch for success
      const mockFetchSuccess = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({ greeting: 'Hello', count: 42 }),
              },
            },
          ],
        }),
      } as unknown as Response);

      const TestSchema = z.object({ greeting: z.string(), count: z.number() });
      const result = await adapter.structuredGenerate(
        { id: 'openai', apiKey: secretKey },
        {
          prompt: 'Say hello',
          schema: TestSchema,
          schemaName: 'TestOutput',
        },
        mockFetchSuccess as unknown as typeof fetch
      );

      expect(result.data.greeting).toBe('Hello');
      expect(result.data.count).toBe(42);

      // Verify request had response_format
      const callArgs = mockFetchSuccess.mock.calls[0]!;
      const sentPayload = JSON.parse(callArgs[1].body);
      expect(sentPayload.response_format.type).toBe('json_schema');
      expect(sentPayload.response_format.json_schema.name).toBe('TestOutput');

      // Test Key Redaction on 401 error
      const mockFetchFail = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => `Invalid authorization token: ${secretKey}`,
      } as unknown as Response);

      await expect(
        adapter.structuredGenerate(
          { id: 'openai', apiKey: secretKey },
          {
            prompt: 'Say hello',
            schema: TestSchema,
            schemaName: 'TestOutput',
          },
          mockFetchFail as unknown as typeof fetch
        )
      ).rejects.toThrow();

      try {
        await adapter.structuredGenerate(
          { id: 'openai', apiKey: secretKey },
          { prompt: 'test', schema: TestSchema, schemaName: 'Test' },
          mockFetchFail as unknown as typeof fetch
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        expect(msg).not.toContain(secretKey);
      }
    });

    it('Anthropic adapter uses tool_use structured output', async () => {
      const adapter = new AnthropicAdapter();
      const secretKey = 'ant-api-top-secret-anthropic-key-67890';

      const mockFetchSuccess = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              type: 'tool_use',
              name: 'DesignDirective',
              input: { theme: 'editorial', contrast: 90 },
            },
          ],
        }),
      } as unknown as Response);

      const Schema = z.object({ theme: z.string(), contrast: z.number() });
      const result = await adapter.structuredGenerate(
        { id: 'anthropic', apiKey: secretKey },
        { prompt: 'Suggest theme', schema: Schema, schemaName: 'DesignDirective' },
        mockFetchSuccess as unknown as typeof fetch
      );

      expect(result.data.theme).toBe('editorial');
      expect(result.data.contrast).toBe(90);

      // Verify tools structure
      const payload = JSON.parse(mockFetchSuccess.mock.calls[0]![1]!.body as string);
      expect(payload.tool_choice.name).toBe('DesignDirective');
      expect(payload.tools[0].name).toBe('DesignDirective');
    });

    it('Gemini adapter sends responseSchema and x-goog-api-key header', async () => {
      const adapter = new GeminiAdapter();
      const secretKey = 'AIzaSyA_Gemini_Secret_Key_abc123';

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ mode: 'dark', curvature: 12 }) }],
              },
            },
          ],
        }),
      } as unknown as Response);

      const Schema = z.object({ mode: z.string(), curvature: z.number() });
      const result = await adapter.structuredGenerate(
        { id: 'gemini', apiKey: secretKey },
        { prompt: 'Dark mode', schema: Schema, schemaName: 'GeminiMode' },
        mockFetch as unknown as typeof fetch
      );

      expect(result.data.mode).toBe('dark');
      expect(result.data.curvature).toBe(12);

      const headers = mockFetch.mock.calls[0]![1]!.headers as Record<string, string>;
      expect(headers['x-goog-api-key']).toBe(secretKey);
    });

    it('OpenRouter adapter strips markdown fences if model outputs ```json ... ```', async () => {
      const adapter = new OpenRouterAdapter();
      const secretKey = 'sk-or-v1-openrouter-key-99999';

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '```json\n{\n  "recommendation": "modern-minimal"\n}\n```',
              },
            },
          ],
        }),
      } as unknown as Response);

      const Schema = z.object({ recommendation: z.string() });
      const result = await adapter.structuredGenerate(
        { id: 'openrouter', apiKey: secretKey },
        { prompt: 'Recommend style', schema: Schema, schemaName: 'RouterOutput' },
        mockFetch as unknown as typeof fetch
      );

      expect(result.data.recommendation).toBe('modern-minimal');
    });
  });

  describe('2. Memory-Only Credential Store', () => {
    it('stores credentials exclusively in ephemeral memory and clears on disconnect', () => {
      expect(credentialStore.hasActiveCredential()).toBe(false);

      credentialStore.setCredential('openai', { apiKey: 'sk-proj-test123456789' });
      expect(credentialStore.hasActiveCredential()).toBe(true);
      expect(credentialStore.getActiveProviderId()).toBe('openai');

      const masked = credentialStore.listConfiguredProviders();
      expect(masked[0]?.maskedKey).toBe('sk-p••••6789');
      expect(masked[0]?.maskedKey).not.toContain('test12345');

      credentialStore.disconnect('openai');
      expect(credentialStore.hasActiveCredential()).toBe(false);
      expect(credentialStore.getActiveCredential()).toBeNull();
    });

    it('sanitizes errors to strip any sensitive key traces', () => {
      credentialStore.setCredential('anthropic', { apiKey: 'ant-api-super-confidential-007' });
      const rawError = new Error(
        'Upstream failed for key ant-api-super-confidential-007 at endpoint'
      );
      const sanitized = credentialStore.sanitizeError(rawError);

      expect(sanitized.message).not.toContain('ant-api-super-confidential-007');
      expect(sanitized.message).toContain('[REDACTED_KEY]');
    });
  });

  describe('3. Natural-Language IntentCommand & Mutation Planning', () => {
    it('validates IntentCommand schema structure', () => {
      const valid = IntentCommandSchema.safeParse({
        action: 'adjust-dna',
        summary: 'Elevate contrast and reduce motion',
        preserveLockedNodes: true,
        dnaDeltas: { contrast: 25, motion: -30 },
      });
      expect(valid.success).toBe(true);

      const invalid = IntentCommandSchema.safeParse({
        action: 'unsupported-arbitrary-action',
        summary: 'Invalid',
      });
      expect(invalid.success).toBe(false);
    });

    it('plans safe validated mutations and respects node locks', () => {
      const activeScreen = sampleProject.screens[0]!;
      const headerNode = activeScreen.rootNode.children[0]!;

      // Lock header node structure
      headerNode.locks = { structure: true };

      // Attempt replace-component on locked header
      const replaceCommand = {
        action: 'replace-component' as const,
        summary: 'Replace locked header',
        targetScreenId: activeScreen.id,
        targetNodeIds: [headerNode.id],
        replacementResourceSlug: 'new-header',
        preserveLockedNodes: true,
      };

      expect(() => {
        planMutationsFromIntent(sampleProject, activeScreen.id, replaceCommand);
      }).toThrow(/Cannot replace node.*Structural lock is active/);

      // Attempt recompose-screen: locked node must survive
      const recomposeCommand = {
        action: 'recompose-screen' as const,
        summary: 'Recompose around locked header',
        targetScreenId: activeScreen.id,
        preserveLockedNodes: true,
      };

      const plan = planMutationsFromIntent(sampleProject, activeScreen.id, recomposeCommand);
      expect(plan.mutations.length).toBeGreaterThan(0);
      expect(plan.mutations[0]?.type).toBe('REPLACE_NODE');
    });

    it('plans DNA and feel mutations cleanly', () => {
      const activeScreen = sampleProject.screens[0]!;
      const feelCommand = {
        action: 'apply-feel' as const,
        summary: 'Apply professional but playful feel',
        feelDescriptors: 'professional but playful',
        preserveLockedNodes: true,
      };

      const plan = planMutationsFromIntent(sampleProject, activeScreen.id, feelCommand);
      expect(plan.mutations.length).toBeGreaterThan(0);
      expect(plan.mutations.some((m) => m.type === 'SET_INTENT')).toBe(true);
      const projectDnaMutations = plan.mutations.filter(
        (mutation) => mutation.type === 'SET_INTENT' || mutation.type === 'SET_DESIGN_TOKEN'
      );
      expect(projectDnaMutations.length).toBeGreaterThan(0);
      expect(projectDnaMutations.every((mutation) => mutation.targetId === 'project')).toBe(true);
      const applied = applyOperation(
        sampleProject,
        createHistoryOperation('Apply project feel', plan.mutations, 'ai')
      ).nextManifest;
      expect(applied.designDNA).not.toEqual(sampleProject.designDNA);
    });

    it('applies project-scope DNA proposals to the canonical project target', () => {
      const activeScreen = sampleProject.screens[0]!;
      const plan = planMutationsFromIntent(sampleProject, activeScreen.id, {
        action: 'adjust-dna',
        summary: 'Make the project more playful',
        preserveLockedNodes: true,
        dnaDeltas: { playfulness: 20 },
      });
      const dnaMutation = plan.mutations.find((mutation) => mutation.type === 'SET_INTENT');

      expect(dnaMutation?.targetId).toBe('project');
      const operation = createHistoryOperation('Adjust project DNA', plan.mutations, 'ai');
      const applied = applyOperation(sampleProject, operation).nextManifest;
      expect(applied.designDNA.playfulness).toBe(sampleProject.designDNA.playfulness + 20);
    });
  });

  describe('4. Structured ProductModel Interpretation & Fallback', () => {
    it('interprets brief with AI when provider is configured', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  schemaVersion: '1.0.0',
                  productArchetypes: [{ tag: 'saas', weight: 1.0 }],
                  primaryAudience: 'Enterprise Data Engineers',
                  userSophistication: 85,
                  primaryObjective: 'Monitor distributed data pipelines',
                  secondaryObjectives: ['Low latency telemetry'],
                  jobsToBeDone: ['Inspect pipeline health', 'Trigger DAG runs'],
                  entities: [{ name: 'Pipeline', description: 'ETL workflow' }],
                  workflows: [{ id: 'run', name: 'Trigger DAG', steps: ['submit'] }],
                  trustRequirement: 90,
                  informationComplexity: 80,
                  dataDensity: 85,
                  collaborationLevel: 60,
                  transactionCriticality: 70,
                  navigationComplexity: 75,
                  mobileImportance: 30,
                  likelyScreens: [
                    { name: 'Pipelines', screenType: 'dashboard', purpose: 'Live status' },
                  ],
                  requiredCapabilities: ['streaming-metrics'],
                  forbiddenPatterns: ['gamification'],
                  constraints: {
                    accessibilityFloor: 'AA',
                    targetDevices: ['desktop', 'tablet', 'mobile'],
                  },
                }),
              },
            },
          ],
        }),
      } as unknown as Response);

      const viSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation(mockFetch as unknown as typeof fetch);

      const result = await interpretProductWithAI(
        { description: 'Enterprise telemetry tool for data engineers' },
        {
          providerConfig: { id: 'openai', apiKey: 'sk-proj-mock-key' },
        }
      );

      expect(result.productModel.primaryAudience).toBe('Enterprise Data Engineers');
      expect(result.productModel.userSophistication).toBe(85);
      expect(result.productModel.jobsToBeDone).toContain('Inspect pipeline health');

      viSpy.mockRestore();
    });

    it('falls back seamlessly to deterministic interpreter when provider is offline', async () => {
      const mockFailingFetch = vi.fn().mockRejectedValue(new Error('Network connection timeout'));
      const viSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation(mockFailingFetch as unknown as typeof fetch);

      const result = await interpretProductWithAI(
        { description: 'Developer tools terminal' },
        {
          providerConfig: { id: 'openai', apiKey: 'sk-proj-failing' },
          fallbackToDeterministic: true,
        }
      );

      // Deterministic recovery succeeded
      expect(result.productModel).toBeDefined();
      expect(result.productModel.primaryAudience).toBeDefined();
      expect(result.inferredAssumptions[0]).toContain(
        'Safely recovered using deterministic composer'
      );

      viSpy.mockRestore();
    });
  });

  describe('5. Arbitrary Feel Mapping & Critique', () => {
    it('maps arbitrary poetic feel with deterministic fallback', async () => {
      const result = await mapArbitraryFeel('Swiss luxury watch precision with calm minimalism', {
        fallbackToDeterministic: true,
      });

      expect(result.primaryAdjectives).toContain('luxury');
      expect(result.dnaDeltas.luxury).toBeGreaterThan(0);
      expect(result.categoricalSuggestions.geometryFamily).toBe('sharp');
    });

    it('generates AI critique without altering the 100-point deterministic audit score', async () => {
      const auditBefore = auditProjectManifest(sampleProject);
      expect(auditBefore.total).toBe(100);

      const critique = await generateAICritique(sampleProject, { fallbackToDeterministic: true });

      expect(critique.holisticAssessment).toBeDefined();
      expect(critique.emotionalResonance).toBeDefined();
      expect(critique.creativeSuggestions.length).toBeGreaterThan(0);

      // HARD CONTRACT: Deterministic audit score remains completely unaffected
      const auditAfter = auditProjectManifest(sampleProject);
      expect(auditAfter.total).toBe(100);
      expect(auditAfter.scores).toEqual(auditBefore.scores);
    });
  });

  describe('6. Constrained Repair Attempt & No-State-Change Guarantee', () => {
    it('performs exactly one constrained repair attempt on invalid structured output', async () => {
      const adapter = new OpenAIAdapter();
      const TargetSchema = z.object({
        name: z.string(),
        age: z.number().int(),
      });

      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // Attempt 1: Output with invalid field type ('twenty' instead of number)
          return {
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({ name: 'Alex', age: 'twenty' }),
                  },
                },
              ],
            }),
          };
        }
        // Attempt 2 (Repair): Corrected output conforming to schema
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({ name: 'Alex', age: 20 }),
                },
              },
            ],
          }),
        };
      });

      const res = await generateWithConstrainedRepair(
        adapter,
        { id: 'openai', apiKey: 'sk-proj-test' },
        { prompt: 'Generate user profile', schema: TargetSchema, schemaName: 'UserProfile' },
        mockFetch as unknown as typeof fetch
      );

      expect(callCount).toBe(2);
      expect(res.repaired).toBe(true);
      expect(res.repairAttemptCount).toBe(1);
      expect(res.data.name).toBe('Alex');
      expect(res.data.age).toBe(20);
    });

    it('fails safely and leaves state 100% unchanged when repair also fails', async () => {
      const adapter = new OpenAIAdapter();
      const TargetSchema = z.object({
        score: z.number(),
      });

      // Both initial and repair calls return invalid data
      const mockAlwaysInvalid = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: { content: JSON.stringify({ score: 'invalid-string' }) },
            },
          ],
        }),
      });

      await expect(
        generateWithConstrainedRepair(
          adapter,
          { id: 'openai', apiKey: 'sk-proj-test' },
          { prompt: 'Score', schema: TargetSchema, schemaName: 'ScoreOutput' },
          mockAlwaysInvalid as unknown as typeof fetch
        )
      ).rejects.toThrow(AISchemaValidationError);

      // Verify that executing natural language command in failure mode leaves manifest untouched
      const originalManifestSnapshot = JSON.stringify(sampleProject);

      const execResult = await executeNaturalLanguageCommand(
        sampleProject,
        sampleProject.screens[0]!.id,
        'Make the layout futuristic and asymmetrical',
        {
          providerConfig: { id: 'openai', apiKey: 'sk-proj-test' },
          fetchFn: mockAlwaysInvalid as unknown as typeof fetch,
        }
      );

      expect(execResult.success).toBe(false);
      if (!execResult.success) {
        // Preserves user prompt for retry
        expect(execResult.preservedPrompt).toBe('Make the layout futuristic and asymmetrical');
        expect(execResult.error).toBeDefined();
      }

      // STATE CONTRACT: Project manifest was not altered
      expect(JSON.stringify(sampleProject)).toBe(originalManifestSnapshot);
    });
  });

  describe('7. Deterministic Mode with AI Disconnected (Phase 13 Gate)', () => {
    it('executes deterministic keyword commands when AI is disconnected', async () => {
      credentialStore.clearAll();

      const activeScreen = sampleProject.screens[0]!;

      // 1. Recompose command
      const recomposeRes = await executeNaturalLanguageCommand(
        sampleProject,
        activeScreen.id,
        'recompose screen around locked items'
      );
      expect(recomposeRes.success).toBe(true);
      if (recomposeRes.success) {
        expect(recomposeRes.command.action).toBe('recompose-screen');
        expect(recomposeRes.mutations.length).toBeGreaterThan(0);
      }

      // 2. Reduce motion command
      const motionRes = await executeNaturalLanguageCommand(
        sampleProject,
        activeScreen.id,
        'reduce motion'
      );
      expect(motionRes.success).toBe(true);
      if (motionRes.success) {
        expect(motionRes.command.action).toBe('adjust-dna');
        expect(motionRes.command.dnaDeltas?.motion).toBe(-40);
      }

      // 3. Sharp geometry command
      const sharpRes = await executeNaturalLanguageCommand(
        sampleProject,
        activeScreen.id,
        'make corners sharp zero radius'
      );
      expect(sharpRes.success).toBe(true);
      if (sharpRes.success) {
        expect(sharpRes.command.categoricalDna?.geometryFamily).toBe('sharp');
      }

      // 4. Unrecognized command shows helpful prompt to connect BYO provider
      const unknownRes = await executeNaturalLanguageCommand(
        sampleProject,
        activeScreen.id,
        'add a rotating 3D holographic globe in the footer'
      );
      expect(unknownRes.success).toBe(false);
      if (!unknownRes.success) {
        expect(unknownRes.error).toContain('No AI provider configured');
        expect(unknownRes.preservedPrompt).toBe(
          'add a rotating 3D holographic globe in the footer'
        );
      }
    });
  });
});
