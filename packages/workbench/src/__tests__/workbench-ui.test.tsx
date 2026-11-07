import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { TopToolbar } from '../components/TopToolbar.js';
import { BreadcrumbBar } from '../components/canvas/BreadcrumbBar.js';
import { DeviceFrame } from '../components/canvas/DeviceFrame.js';
import { LayersTab } from '../components/left-panel/LayersTab.js';
import { PagesTab } from '../components/left-panel/PagesTab.js';
import { FeelMixer } from '../components/feel-mixer/FeelMixer.js';
import { RightInspector } from '../components/right-inspector/RightInspector.js';
import { CommandBar } from '../components/CommandBar.js';
import { PreviewModal } from '../components/preview/PreviewModal.js';
import { MobileWorkbench } from '../components/mobile/MobileWorkbench.js';
import { BriefTab } from '../components/left-panel/BriefTab.js';
import { interpretProductBrief } from '@tessellate/composer';

describe('Workbench UI Components', () => {
  beforeEach(() => {
    useWorkbenchStore.getState().loadSampleProject();
  });

  it('renders TopToolbar with project title and mode switches', () => {
    const html = renderToString(<TopToolbar />);
    expect(html).toContain('Apex Financial Intelligence');
    expect(html).toContain('Local');
    expect(html).toContain('structure');
    expect(html).toContain('style');
    expect(html).toContain('Preview');
    expect(html).toContain('Export');
  });

  it('renders BreadcrumbBar with screen name and selected node', () => {
    useWorkbenchStore.getState().selectNode('node-metric-arr');
    const html = renderToString(<BreadcrumbBar />);
    expect(html).toContain('Portfolio Overview');
    expect(html).toContain('Total Portfolio Value');
  });

  it('renders DeviceFrame across responsive, tablet, and mobile presets', () => {
    const fluidHtml = renderToString(
      <DeviceFrame preset="responsive"><div>Content</div></DeviceFrame>
    );
    expect(fluidHtml).toContain('Content');

    const tabletHtml = renderToString(
      <DeviceFrame preset="768"><div>Tablet View</div></DeviceFrame>
    );
    expect(tabletHtml).toContain('768px');
    expect(tabletHtml).toContain('Tablet View');

    const mobileHtml = renderToString(
      <DeviceFrame preset="390"><div>Mobile View</div></DeviceFrame>
    );
    expect(mobileHtml).toContain('390px');
    expect(mobileHtml).toContain('Mobile View');
  });

  it('renders LeftPanel with Layers and Pages tabs', () => {
    const layersHtml = renderToString(<LayersTab />);
    expect(layersHtml).toContain('node-app-shell');
    expect(layersHtml).toContain('Total Portfolio Value');

    const pagesHtml = renderToString(<PagesTab />);
    expect(pagesHtml).toContain('Portfolio Overview');
    expect(pagesHtml).toContain('/overview');
    expect(pagesHtml).toContain('Risk &amp; Analytics');
  });

  it('renders FeelMixer with 5 pinned traits and inheritance tags', () => {
    const html = renderToString(<FeelMixer />);
    expect(html).toContain('Feel Mixer');
    expect(html).toContain('Professionalism');
    expect(html).toContain('Playfulness');
    expect(html).toContain('Warmth');
    expect(html).toContain('Technicality');
    expect(html).toContain('Luxury');
    expect(html).toContain('Inherited');
  });

  it('renders RightInspector with tabs and target scope', () => {
    useWorkbenchStore.getState().selectNode('node-metric-arr');
    const html = renderToString(<RightInspector />);
    expect(html).toContain('Total Portfolio Value');
    expect(html).toContain('Intent');
    expect(html).toContain('Style');
    expect(html).toContain('Motion');
    expect(html).toContain('Content');
    expect(html).toContain('Locks');
  });

  it('renders CommandBar with target node role and keyboard hints', () => {
    useWorkbenchStore.getState().selectNode('node-metric-arr');
    const html = renderToString(<CommandBar />);
    expect(html).toContain('metric-kpi');
    expect(html).toContain('Tell Tess what to change');
    expect(html).toContain('Esc');
  });

  it('renders PreviewModal clean full screen preview', () => {
    const html = renderToString(<PreviewModal />);
    expect(html).toContain('Exit Preview');
    expect(html).toContain('Screen:');
    expect(html).toContain('Reduced Motion');
  });

  it('renders MobileWorkbench with mobile tab navigation', () => {
    const html = renderToString(<MobileWorkbench />);
    expect(html).toContain('Apex Financial Intelligence');
    expect(html).toContain('Preview');
    expect(html).toContain('Pages');
    expect(html).toContain('Inspect');
    expect(html).toContain('Command');
  });

  it('shows employee experience as the archetype and its 0-100 weight correctly', () => {
    const description =
      'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
    const productModel = interpretProductBrief({ description }).productModel;
    const currentManifest = useWorkbenchStore.getState().manifest;
    const projectManifest = {
      ...currentManifest,
      name: 'Adaptive Workspace — Employee experience',
      description,
      productModel,
    };

    const html = renderToString(<BriefTab projectManifest={projectManifest} />);

    expect(html).toMatch(/Identified Archetypes[\s\S]*?>Employee Experience<\/span>/);
    expect(html).toMatch(/100(?:<!-- -->)?%<\/span>/);
    expect(html).not.toContain('10000%');
    expect(html).not.toContain('accidental-rejection-email-dispatches');
    expect(html).not.toContain('Forbidden patterns:');
  });
});
