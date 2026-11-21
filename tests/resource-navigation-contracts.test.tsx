import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppSidebarCompact } from '../resources/shells/app-sidebar-compact/index.js';
import { AppSidebarExpanded } from '../resources/shells/app-sidebar-expanded/index.js';
import { BreadcrumbHeader } from '../resources/shells/breadcrumb-header/index.js';
import { CenteredTopNav } from '../resources/shells/centered-top-nav/index.js';
import { CollapsibleSidebar } from '../resources/shells/collapsible-sidebar/index.js';
import { FloatingNav } from '../resources/shells/floating-nav/index.js';
import { FooterMinimal } from '../resources/sections/footer-minimal/index.js';
import { FooterSitemap } from '../resources/sections/footer-sitemap/index.js';
import { MarketingNavCta } from '../resources/shells/marketing-nav-cta/index.js';
import { MegaNav } from '../resources/shells/mega-nav/index.js';
import { MinimalTopNav } from '../resources/shells/minimal-top-nav/index.js';
import { MobileDrawerNav } from '../resources/shells/mobile-drawer-nav/index.js';
import { ProjectSwitcher } from '../resources/shells/project-switcher/index.js';
import { ResponsiveAppShell } from '../resources/shells/responsive-app-shell/index.js';
import { TabWorkspaceNav } from '../resources/shells/tab-workspace-nav/index.js';
import { TransparentSolidNav } from '../resources/shells/transparent-solid-nav/index.js';
import { WorkspaceSwitcher } from '../resources/shells/workspace-switcher/index.js';

const defaults = [
  ['expanded sidebar', createElement(AppSidebarExpanded)],
  ['breadcrumb header', createElement(BreadcrumbHeader)],
  ['centered navigation', createElement(CenteredTopNav)],
  ['collapsible sidebar', createElement(CollapsibleSidebar)],
  ['floating navigation', createElement(FloatingNav)],
  ['minimal footer', createElement(FooterMinimal)],
  ['sitemap footer', createElement(FooterSitemap)],
  ['marketing navigation', createElement(MarketingNavCta)],
  ['mega navigation', createElement(MegaNav)],
  ['minimal top navigation', createElement(MinimalTopNav)],
  ['mobile drawer', createElement(MobileDrawerNav)],
  ['responsive app shell', createElement(ResponsiveAppShell)],
  ['transparent navigation', createElement(TransparentSolidNav)],
] as const;

const configured = [
  ['expanded sidebar', createElement(AppSidebarExpanded, { workspaceLinks: [{ label: 'Dashboard', href: '/dashboard', active: true }] })],
  ['breadcrumb header', createElement(BreadcrumbHeader, { items: [{ label: 'Projects', href: '/projects' }, { label: 'Current' }] })],
  ['centered navigation', createElement(CenteredTopNav, { links: [{ label: 'Overview', href: '/overview' }] })],
  ['collapsible sidebar', createElement(CollapsibleSidebar, { links: [{ label: 'Overview', href: '/overview' }] })],
  ['floating navigation', createElement(FloatingNav, { links: [{ label: 'Overview', href: '/overview' }] })],
  ['minimal footer', createElement(FooterMinimal, { links: [{ label: 'Privacy', href: '/privacy' }] })],
  ['sitemap footer', createElement(FooterSitemap, { columns: [{ title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }] }] })],
  ['marketing navigation', createElement(MarketingNavCta, { links: [{ label: 'Features', href: '/features' }] })],
  ['mega navigation', createElement(MegaNav, { links: [{ label: 'Docs', href: '/docs' }], onLaunch: () => undefined })],
  ['minimal top navigation', createElement(MinimalTopNav, { links: [{ label: 'People', href: '/people' }] })],
  ['responsive app shell', createElement(ResponsiveAppShell, { navigation: [{ label: 'Analytics', href: '/analytics' }] })],
  ['transparent navigation', createElement(TransparentSolidNav, { links: [{ label: 'Gallery', href: '/gallery' }] })],
] as const;

describe('resource navigation destination contracts', () => {
  it.each(defaults)('%s has no placeholder destination in its default state', (_name, element) => {
    const html = renderToStaticMarkup(element);
    expect(html).not.toMatch(/href\s*=\s*["'](?:#|)["']/i);
    expect(html).not.toContain('href="#');
  });

  it.each(configured)('%s preserves a consumer-provided route', (_name, element) => {
    const html = renderToStaticMarkup(element);
    expect(html).toMatch(/href="\/(?:dashboard|projects|overview|privacy|features|docs|people|analytics|gallery)"/);
  });

  it('does not expose the mega-nav launch control as an enabled dead button', () => {
    const html = renderToStaticMarkup(createElement(MegaNav));
    expect(html).toContain('disabled=""');
    expect(html).toContain('Connect a launch action');
  });

  it('enables the mega-nav launch control when the host supplies an action', () => {
    const html = renderToStaticMarkup(createElement(MegaNav, { onLaunch: () => undefined }));
    expect(html).not.toContain('disabled=""');
  });

  it('reflects externally supplied active selection props in navigation shells', () => {
    const sidebarHtml = renderToStaticMarkup(
      createElement(AppSidebarCompact, { activeId: 'export' })
    );
    expect(sidebarHtml).toMatch(/aria-label="Export"[^>]*aria-current="page"/);

    const tabsHtml = renderToStaticMarkup(createElement(TabWorkspaceNav, { activeId: '3' }));
    expect(tabsHtml).toMatch(/aria-current="page"[^>]*>schema\.json</);

    const projectHtml = renderToStaticMarkup(
      createElement(ProjectSwitcher, { currentProject: 'Documentation Site' })
    );
    expect(projectHtml).toContain('Documentation Site');

    const workspaceHtml = renderToStaticMarkup(
      createElement(WorkspaceSwitcher, { currentWorkspace: 'Starter Lab' })
    );
    expect(workspaceHtml).toContain('Starter Lab');
  });
});
