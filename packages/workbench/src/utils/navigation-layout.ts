import type {ProjectNode} from '@tessellate/schemas';
import {isNodeLocked} from '../locks/lock-engine.js';
/** Update navigation topology without replacing or duplicating content resources. */
export function applyNavigationLayout(root:ProjectNode,model:string):ProjectNode {
 if(isNodeLocked(root) || root.semanticRole==='marketing-page')return root;
 const nav=root.children.find(child=>child.semanticRole==='navigation');
 if(!nav || isNodeLocked(nav))return root;
 const other=root.children.filter(child=>child!==nav);
 const content=other.length===1 && ['main-content-scroll','workspace-multi-pane'].includes(other[0]!.semanticRole)?other[0]!.children:other;
 const navigation={...nav,props:{...nav.props,orientation:model==='top-nav'?'horizontal':'vertical'}};
 if(model==='top-nav')return {...root,semanticRole:'top-nav-page-canvas',children:[navigation,...content]};
 const pane=other.length===1 && ['main-content-scroll','workspace-multi-pane'].includes(other[0]!.semanticRole)?other[0]!:{id:`navigation-content-${root.id}`,nodeType:'layout' as const,semanticRole:'main-content-scroll',children:content,slots:{},props:{}};
 return {...root,semanticRole:model==='sidebar'?'sidebar-shell':'workspace-dock-shell',children:[navigation,(isNodeLocked(pane)?pane:{...pane,semanticRole:model==='sidebar'?'main-content-scroll':'workspace-multi-pane'})]};
}
