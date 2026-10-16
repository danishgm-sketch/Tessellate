import type {ProductModel, ScreenNode} from '@tessellate/schemas';

/** Deterministic, serialisable content: examples are identified, never customer claims. */
export function bindResourceContent(product:ProductModel, screen:ScreenNode, role:string, screens:ScreenNode[], resourceSlug:string,briefDescription=''):Record<string,unknown> {
  const employee = product.entities.some(entity=>entity.name==='Employee');
  const brand = employee ? 'People & Co' : `${product.entities[0]?.name ?? 'Team'} Workspace`;
  const links = screens.filter(item=>item.navigationVisibility!=='hidden' && !item.slug.includes(':')).map(item=>({label:item.name,href:`#${item.id}`}));
  const headline = employee ? 'A better workday starts with people.' : product.primaryObjective;
  const description = employee ? 'Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.' : `A workspace for ${product.primaryAudience.toLowerCase()}. ${product.primaryObjective}.`;
  const items = employee ? [
    {title:'A warm welcome',description:'Meet your buddy, discover your team and complete onboarding at your own pace.',detail:'Onboarding'},
    {title:'People, connected',description:'Find colleagues and understand the teams around you.',detail:'People directory'},
    {title:'A voice for everyone',description:'Make space for feedback, recognition and conversations.',detail:'Engagement'},
    {title:'Clarity you can trust',description:'Keep organisational policies and account preferences easy to find.',detail:'Settings & policies'},
  ] : product.entities.map(entity=>({title:entity.name,description:entity.description ?? entity.name,detail:'Example content'}));
  const events = employee ? [
    {time:'Today',title:'Welcome to the team',desc:'Meet your onboarding buddy and introduce yourself to colleagues.'},
    {time:'This week',title:'Team check-in',desc:'Share how your first week is going and ask for support.'},
    {time:'Next milestone',title:'Policies and preferences',desc:'Review organisational guidance and choose your notification preferences.'},
  ] : product.workflows.map((workflow,index)=>({time:`Step ${index+1}`,title:workflow.name,desc:workflow.steps.join(' → ')}));
  const count=briefDescription.match(/\b([\d,]+)[ -]+(?:person|employee|people)/i)?.[1]?.replaceAll(',','');
  const titles:Record<string,string>=employee?{'metric-cards':'Your organisation at a glance','summary-kpis':'Your organisation at a glance','activity-feed':'People updates','activity-timeline':'Recent employee activity','data-table':screen.name==='Teams'?'Team directory':'People and teams','wizard-content':'Your onboarding journey','progress-stepper':'Welcome milestones','value-proposition':'Made for everyday employee experiences'}:{};
  const content:Record<string,unknown> = {
    title: role==='hero' || role==='conversion-cta' ? headline : titles[role] ?? screen.name,
    brand,links,eyebrow:'Example organisation · sample content',badge:'EXAMPLE',initials:employee?'PC':'WS',
    headline,subheadline:description,description,subtitle:screen.purpose,
    panelTitle:employee?'Your first weeks, made clearer':'Your workspace',
    panels:items.slice(0,3).map((item,index)=>({id:`panel-${index}`,label:item.detail,text:`${item.title}\n${item.description}`})),
    primaryCta:{label:employee?'Meet your team':'Open workspace',href:'#screen-overview'},
    secondaryCta:{label:employee?'Explore onboarding':'Browse records',href:employee?'#screen-onboarding':'#screen-collection-index'},
    note:'Example interface · replace sample data with your organisation',
    items,events,
    cards:employee?[
      {label:'People',val:count ?? '—',status:count?'From your brief · example':'Connect your roster'},
      {label:'Onboarding',val:'12',status:'Sample journeys'},
      {label:'Team pulse',val:'Positive',status:'Illustrative feedback'},
    ]:product.entities.map(entity=>({label:entity.name,val:'—',status:'Connect your data'})),
    rows:employee?[
      {id:1,name:'Example colleague A',type:'Product team',quality:80,status:'Onboarding'},
      {id:2,name:'Example colleague B',type:'Engineering team',quality:100,status:'Settled in'},
      {id:3,name:'Example colleague C',type:'People team',quality:40,status:'Welcome week'},
    ]:product.entities.map((entity,index)=>({id:index+1,name:`Example ${entity.name}`,type:entity.description ?? 'Record',quality:0,status:'Sample'})),
    columnLabels:{name:employee?'Colleague':'Record',type:employee?'Team':'Context',quality:'Progress',status:'Status'},
    columns:employee?[
      {title:'Discover',tasks:['Meet your buddy','Find your team']},
      {title:'Connect',tasks:['Introduce yourself','Join a team check-in']},
      {title:'Feel at home',tasks:['Read organisational policies','Share your first-week feedback']},
    ]:product.workflows.map(workflow=>({title:workflow.name,tasks:workflow.steps})),
    label:role==='auth-card'?'Work email':role==='settings-form'?'Notification preferences':role==='save-footer'?'Save preferences':role==='auth-footer'?'Sign in requires your authentication backend':'Continue onboarding',
    helperText:'Example field. Connect persistence and your backend in the exported application.',
    children:role==='save-footer'?'Save preferences':role==='auth-footer'?'Authentication backend required':'Continue',
    disabled:['save-footer','auth-footer','action-controls'].includes(role),
    href:employee?'#screen-onboarding':'#screen-overview',
  };
  if(content.disabled)content.title='Connect the exported application to your backend to enable this action.';
  const accepted:Record<string,string[]> = {
    'minimal-top-nav':['brand','links','orientation'], 'marketing-nav-cta':['brand','links'], 'collapsible-sidebar':['brand','links'],
    'editorial-hero':['eyebrow','headline','subheadline','primaryCta','secondaryCta','note'],
    'split-product-hero':['badge','headline','description','primaryCta','secondaryCta','panelTitle','panels'],
    'feature-bento':['title','items'], 'feature-matrix':['title','items'],
    'cta-minimal':['headline','description','label','href'], 'footer-product':['brand','description','links'],
    'entity-profile-header':['title','subtitle','badge','initials'], 'dashboard-kpi-grid':['title','cards'],
    timeline:['title','events'], 'notification-centre':['title','events'],
    'advanced-data-table':['title','rows','columnLabels'], 'kanban-board':['title','columns'],
    button:['children','disabled','title'], 'magnetic-button':['label','disabled','title'],
    input:['label','helperText'],
  };
  return Object.fromEntries((accepted[resourceSlug] ?? []).filter(key=>content[key]!==undefined).map(key=>[key,content[key]]));
}
