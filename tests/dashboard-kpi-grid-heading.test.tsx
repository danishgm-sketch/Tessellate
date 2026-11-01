import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DashboardKpiGrid } from '../resources/blocks/dashboard-kpi-grid/index.js';

describe('DashboardKpiGrid heading semantics', () => {
  it('renders its section title as a level-two heading', () => {
    const html = renderToStaticMarkup(
      createElement(DashboardKpiGrid, {
        title: 'Your organisation at a glance',
        cards: [],
      }),
    );

    expect(html).toContain('<h2');
    expect(html).toContain('Your organisation at a glance');
    expect(html).not.toContain('<h3');
  });
});
