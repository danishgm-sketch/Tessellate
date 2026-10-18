import type { ProjectNode, PartialDesignDNA } from '@tessellate/schemas';

/** Shared by the manifest renderer and standalone exporter. No hosting dependency. */
export function nodeLayoutClass(node: ProjectNode): string {
  return `tess-node tess-layout-${node.semanticRole.replace(/[^a-z0-9-]/gi,'-')}`;
}
export function nodeRuntimeVariant(node: ProjectNode, dna: PartialDesignDNA,systemMode?:'light'|'dark'): string | undefined {
  if(dna.visualMode==='adaptive')return systemMode==='dark'?'nocturne':node.variant==='nocturne'?'quiet':node.variant;
  if (!node.variant && dna.visualMode==='dark') return 'nocturne';
  return node.variant;
}
export const MANIFEST_LAYOUT_CSS = `
.tess-screen{container-type:inline-size;container-name:tess-screen;min-width:0}
.tess-node{min-width:0;max-width:100%;box-sizing:border-box}
.tess-node>div,.tess-node>section{min-width:0;max-width:100%}
.tess-layout-sidebar-shell,.tess-layout-workspace-dock-shell,.tess-layout-top-nav-page-canvas{display:grid;gap:var(--tess-space-md,16px);align-items:start;min-height:100%;background:var(--tess-canvas);padding:var(--tess-gutter-mobile,16px)}
.tess-layout-main-content-scroll,.tess-layout-workspace-multi-pane,.tess-layout-grid-dashboard-container,.tess-layout-compound-workspace-pane,.tess-layout-split-workspace-columns{display:grid;gap:var(--tess-space-md,16px);align-items:start}
.tess-layout-marketing-page{display:grid;gap:var(--tess-space-lg,24px)}
.tess-layout-marketing-page>.tess-node{grid-column:1/-1}
@container tess-screen (max-width:430px){
 .tess-node[data-responsive-strategy="omit-nonessential"]{display:none!important}
 .tess-node[data-responsive-strategy="stack"]{display:flex;flex-direction:column;gap:var(--tess-space-md,16px);width:100%}
 .tess-node[data-responsive-strategy="collapse"]{overflow:hidden;max-height:12rem}
}
@container tess-screen (min-width:900px){
 .tess-layout-sidebar-shell{grid-template-columns:220px minmax(0,1fr)}
 .tess-layout-workspace-dock-shell{grid-template-columns:180px minmax(0,1fr)}
 .tess-layout-workspace-multi-pane,.tess-layout-grid-dashboard-container,.tess-layout-compound-workspace-pane{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
 .tess-layout-workspace-multi-pane>.tess-layout-overview-header,.tess-layout-workspace-multi-pane>.tess-layout-metric-cards{grid-column:1/-1}
 .tess-layout-workspace-multi-pane>.tess-layout-data-table{grid-column:1}
 .tess-layout-workspace-multi-pane>.tess-layout-compound-workspace-pane,.tess-layout-workspace-multi-pane>.tess-layout-split-workspace-columns{grid-column:1/-1}
 .tess-layout-compound-workspace-pane{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
 .tess-layout-sidebar-shell>.tess-layout-navigation nav,.tess-layout-workspace-dock-shell>.tess-layout-navigation nav{flex-direction:column}
 .tess-layout-sidebar-shell>.tess-layout-navigation,.tess-layout-workspace-dock-shell>.tess-layout-navigation{position:sticky;top:0}
}
.tess-screen h1,.tess-screen h2,.tess-screen h3,.tess-screen h4,.tess-screen h5,.tess-screen h6{font-family:var(--tess-font-heading,sans-serif);letter-spacing:var(--tess-heading-letter-spacing,normal)}
.tess-screen[data-reduced-motion=true] *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
.tess-screen :focus-visible{outline:2px solid var(--tess-accent-primary,#2547E8);outline-offset:3px}
@media(prefers-reduced-motion:reduce){.tess-screen *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`;
