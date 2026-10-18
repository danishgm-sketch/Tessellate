import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createSampleProject } from '../store/sample-project.js';
import { auditProjectManifest } from '../audit/audit-engine.js';
import { executeMutation } from '../mutations/executor.js';
import { AuditPanel } from '../components/audit/AuditPanel.js';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { AuditResultSchema, type ProjectManifest } from '@tessellate/schemas';

describe('Phase 12: Audit System', () => {
  it('Phase 12 Gate: Score totals 100-point model exactly and fixture violations produce stable actionable issues', () => {
    const manifest = createSampleProject();
    const result = auditProjectManifest(manifest);

    // 1. Verify schema compliance
    const parseRes = AuditResultSchema.safeParse(result);
    expect(parseRes.success).toBe(true);

    // 2. Exact 100-point model verification
    const { scores, total } = result;
    const computedSum =
      scores.cohesion +
      scores.accessibility +
      scores.performance +
      scores.responsive +
      scores.hierarchy +
      scores.densityConsistency +
      scores.motionConsistency +
      scores.designSystemCompliance +
      scores.interactionConsistency;

    expect(total).toBe(computedSum);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(total).toBeLessThanOrEqual(100);

    // 3. Category bounds verification
    expect(scores.cohesion).toBeGreaterThanOrEqual(0);
    expect(scores.cohesion).toBeLessThanOrEqual(20);

    expect(scores.accessibility).toBeGreaterThanOrEqual(0);
    expect(scores.accessibility).toBeLessThanOrEqual(20);

    expect(scores.performance).toBeGreaterThanOrEqual(0);
    expect(scores.performance).toBeLessThanOrEqual(15);

    expect(scores.responsive).toBeGreaterThanOrEqual(0);
    expect(scores.responsive).toBeLessThanOrEqual(15);

    expect(scores.hierarchy).toBeGreaterThanOrEqual(0);
    expect(scores.hierarchy).toBeLessThanOrEqual(10);

    expect(scores.densityConsistency).toBeGreaterThanOrEqual(0);
    expect(scores.densityConsistency).toBeLessThanOrEqual(5);

    expect(scores.motionConsistency).toBeGreaterThanOrEqual(0);
    expect(scores.motionConsistency).toBeLessThanOrEqual(5);

    expect(scores.designSystemCompliance).toBeGreaterThanOrEqual(0);
    expect(scores.designSystemCompliance).toBeLessThanOrEqual(5);

    expect(scores.interactionConsistency).toBeGreaterThanOrEqual(0);
    expect(scores.interactionConsistency).toBeLessThanOrEqual(5);
  });

  describe('Deterministic Category Rules & Violation Detection', () => {
    it('detects accessibility contrast violations and provides deterministic fix', () => {
      const manifest = createSampleProject();
      manifest.constraints.accessibilityFloor = 'AAA';
      manifest.designDNA.contrast = 60; // Fails AAA (min 80)

      const result = auditProjectManifest(manifest);
      const contrastIssue = result.issues.find((i) => i.id === 'a11y-contrast-floor-aaa');

      expect(contrastIssue).toBeDefined();
      expect(contrastIssue?.severity).toBe('critical');
      expect(contrastIssue?.category).toBe('accessibility');
      expect(contrastIssue?.suggestedFix).toBeDefined();

      // Apply suggested fix
      const fix = contrastIssue!.suggestedFix!;
      const { nextManifest } = executeMutation(manifest, fix.mutations![0]!);
      expect(nextManifest.designDNA.contrast).toBe(85);

      // Re-audit: violation is resolved and score improves
      const resolvedResult = auditProjectManifest(nextManifest);
      expect(resolvedResult.issues.find((i) => i.id === 'a11y-contrast-floor-aaa')).toBeUndefined();
      expect(resolvedResult.scores.accessibility).toBeGreaterThan(result.scores.accessibility);
    });

    it('detects buttons missing accessible labels and links exact nodeIds', () => {
      const manifest = createSampleProject();
      // Introduce unlabeled button
      const overviewScreen = manifest.screens[0]!;
      overviewScreen.rootNode.children.push({
        id: 'node-unlabeled-btn',
        nodeType: 'component',
        semanticRole: 'action-button',
        slots: {},
        props: {}, // Missing label/title
        children: [],
      });

      const result = auditProjectManifest(manifest);
      const labelIssue = result.issues.find((i) => i.id === 'a11y-missing-button-label-node-unlabeled-btn');

      expect(labelIssue).toBeDefined();
      expect(labelIssue?.severity).toBe('critical');
      expect(labelIssue?.nodeIds).toContain('node-unlabeled-btn');
      expect(labelIssue?.suggestedFix).toBeDefined();

      // Apply fix
      const { nextManifest } = executeMutation(manifest, labelIssue!.suggestedFix!.mutations![0]!);
      const reAudit = auditProjectManifest(nextManifest);
      expect(reAudit.issues.find((i) => i.id === labelIssue!.id)).toBeUndefined();
    });

    it('detects lightweight performance ceiling violations with 3D/video', () => {
      const manifest = createSampleProject();
      manifest.constraints.performanceCeiling = 'lightweight';
      manifest.designDNA.threeDIntensity = 50;

      const result = auditProjectManifest(manifest);
      const perfIssue = result.issues.find((i) => i.id === 'perf-heavy-media-lightweight');

      expect(perfIssue).toBeDefined();
      expect(perfIssue?.severity).toBe('critical');
      expect(perfIssue?.suggestedFix).toBeDefined();
      expect(result.scores.performance).toBeLessThan(15);

      const { nextManifest } = executeMutation(manifest, perfIssue!.suggestedFix!.mutations![0]!);
      expect(nextManifest.designDNA.threeDIntensity).toBe(0);
      expect(nextManifest.designDNA.videoIntensity).toBe(0);
      expect(auditProjectManifest(nextManifest).issues.find((issue) => issue.id === perfIssue!.id)).toBeUndefined();
    });

    it('detects uncollapsed multi-column grids causing mobile overflow', () => {
      const manifest = createSampleProject();
      manifest.constraints.targetDevices = ['desktop', 'mobile'];
      const screen = manifest.screens[0]!;
      screen.rootNode.children.push({
        id: 'node-rigid-grid',
        nodeType: 'layout',
        semanticRole: 'container',
        slots: {},
        props: { className: 'grid grid-cols-4 gap-4' },
        children: [],
      });

      const result = auditProjectManifest(manifest);
      const gridIssue = result.issues.find((i) => i.id === 'responsive-uncollapsed-grid-node-rigid-grid');

      expect(gridIssue).toBeDefined();
      expect(gridIssue?.severity).toBe('warning');
      expect(gridIssue?.nodeIds).toContain('node-rigid-grid');
      expect(gridIssue?.suggestedFix).toBeDefined();

      // Apply suggested responsive fix
      const { nextManifest } = executeMutation(manifest, gridIssue!.suggestedFix!.mutations![0]!);
      const updatedNode = nextManifest.screens[0]?.rootNode.children.find((c) => c.id === 'node-rigid-grid');
      expect(updatedNode?.props['className']).toContain('md:grid-cols-4');
    });

    it('detects multiple primary buttons within the same container', () => {
      const manifest = createSampleProject();
      const screen = manifest.screens[0]!;
      screen.rootNode.children.push({
        id: 'node-btn-group',
        nodeType: 'section',
        semanticRole: 'action-bar',
        slots: {},
        props: {},
        children: [
          {
            id: 'btn-1',
            nodeType: 'component',
            semanticRole: 'action-button',
            slots: {},
            props: { label: 'Submit', variant: 'primary' },
            children: [],
          },
          {
            id: 'btn-2',
            nodeType: 'component',
            semanticRole: 'action-button',
            slots: {},
            props: { label: 'Confirm', variant: 'primary' },
            children: [],
          },
        ],
      });

      const result = auditProjectManifest(manifest);
      const btnIssue = result.issues.find((i) => i.id.startsWith('interaction-multiple-primary-btns-'));

      expect(btnIssue).toBeDefined();
      expect(btnIssue?.severity).toBe('warning');
      expect(btnIssue?.nodeIds).toContain('btn-2');
      expect(btnIssue?.suggestedFix).toBeDefined();

      // Apply fix: second button becomes outline
      const { nextManifest } = executeMutation(manifest, btnIssue!.suggestedFix!.mutations![0]!);
      const fixedGroup = nextManifest.screens[0]?.rootNode.children.find((c) => c.id === 'node-btn-group');
      const secondBtn = fixedGroup?.children.find((c) => c.id === 'btn-2');
      expect(secondBtn?.props['variant']).toBe('outline');
    });

    it('detects motion personality clashes on node level', () => {
      const manifest = createSampleProject();
      manifest.designDNA.motionPersonality = 'precise';
      const screen = manifest.screens[0]!;
      screen.rootNode.children.push({
        id: 'node-playful-card',
        nodeType: 'component',
        semanticRole: 'metric-kpi',
        slots: {},
        dnaOverrides: { motionPersonality: 'playful' },
        props: { title: 'Card' },
        children: [],
      });

      const result = auditProjectManifest(manifest);
      const motionIssue = result.issues.find((i) => i.id === 'motion-personality-clash-node-playful-card');

      expect(motionIssue).toBeDefined();
      expect(motionIssue?.severity).toBe('warning');
      expect(motionIssue?.nodeIds).toContain('node-playful-card');
    });
  });

  describe('AuditPanel UI Component', () => {
    beforeEach(() => {
      useWorkbenchStore.setState({
        manifest: createSampleProject(),
        selectedNodeId: null,
      });
    });

    it('renders audit summary, nine category scores, and actionable findings', () => {
      const html = renderToString(<AuditPanel />);

      expect(html).toContain('Deterministic Quality Audit');
      expect(html).toContain('100-pt model');
      expect(html).toContain('/ 100');

      // Category labels
      expect(html).toContain('Cohesion');
      expect(html).toContain('Accessibility');
      expect(html).toContain('Performance');
      expect(html).toContain('Responsive');
      expect(html).toContain('Hierarchy');
      expect(html).toContain('Density');
      expect(html).toContain('Motion');
      expect(html).toContain('Compliance');
      expect(html).toContain('Interaction');

      // Severity filters
      expect(html).toContain('Critical:');
      expect(html).toContain('Warnings:');
      expect(html).toContain('Info:');
    });

    it('renders actionable issues and links affected nodes', () => {
      const copy = createSampleProject();
      copy.screens[0]!.rootNode.children.push({
        id: 'node-audit-target',
        nodeType: 'component',
        semanticRole: 'action-button',
        slots: {},
        props: {}, // Unlabeled
        children: [],
      });
      useWorkbenchStore.getState().setManifest(copy);

      const html = renderToString(<AuditPanel manifest={copy} />);
      expect(html).toContain('Action button');
      expect(html).toContain('node-audit-target');
      expect(html).toContain('Fix');
    });

    it('visibly labels accessibility and performance suggested fixes as Beta', () => {
      const accessibilityManifest = createSampleProject();
      accessibilityManifest.constraints.accessibilityFloor = 'AAA';
      accessibilityManifest.designDNA.contrast = 60;
      const accessibilityHtml = renderToString(<AuditPanel manifest={accessibilityManifest} />);
      expect(accessibilityHtml).toContain('data-testid="audit-fix-beta-badge"');
      expect(accessibilityHtml).toContain('Beta: review the suggested manifest change');

      const performanceManifest = createSampleProject();
      performanceManifest.constraints.performanceCeiling = 'lightweight';
      performanceManifest.designDNA.threeDIntensity = 50;
      const performanceHtml = renderToString(<AuditPanel manifest={performanceManifest} />);
      expect(performanceHtml).toContain('data-testid="audit-fix-beta-badge"');
      expect(performanceHtml).toContain('Beta: review the suggested manifest change');
    });

    it('applies suggested fix mutations into store accurately', () => {
      const storeManifest = useWorkbenchStore.getState().manifest;
      const copy = JSON.parse(JSON.stringify(storeManifest)) as ProjectManifest;
      copy.constraints.accessibilityFloor = 'AAA';
      copy.designDNA.contrast = 60; // Fails AAA
      useWorkbenchStore.getState().setManifest(copy);

      const result = auditProjectManifest(copy);
      const contrastIssue = result.issues.find((i) => i.id === 'a11y-contrast-floor-aaa');
      expect(contrastIssue?.suggestedFix).toBeDefined();

      // Apply the suggested fix mutations via store
      for (const mut of contrastIssue!.suggestedFix!.mutations!) {
        useWorkbenchStore.getState().executeMutation(mut);
      }

      // Verify store updated
      expect(useWorkbenchStore.getState().manifest.designDNA.contrast).toBe(85);
    });
  });
});
