import { readFile, writeFile } from 'node:fs/promises';
const file='audit/runtime-audit.json';
let raw=await readFile(file,'utf8');
const findings=[
{
  id:'AUD-375', severity:'medium', route:'/showcase/showcase-playful-hr/', viewport:'1440x900 and 390x844', category:'content',
  title:'Employee showcase repeats the marketing hero as its conversion CTA',
  expected:'The employee marketing page should present a distinct conversion headline and supporting copy after the hero, so the CTA adds a next step rather than repeating the same proposition.',
  actual:'The deployed page renders “A better workday starts with people.” as both the hero H1 and the conversion CTA H2. The exact hero paragraph appears three times on the page (hero, CTA, and footer). Both viewport captures show the CTA repeating the hero wording.',
  reproduction:[
    'Open /showcase/showcase-playful-hr/ at 1440x900 or 390x844.',
    'Scroll to the conversion CTA following “Made for everyday employee experiences.”',
    'Observe that the CTA heading and paragraph exactly repeat the hero heading and paragraph.',
    'The live measurement reports two matching headings and three matching paragraphs; no console errors or failed requests occurred.'
  ],
  console:[], network:[],
  screenshot:'quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive/showcase-copy-before-desktop-1440x900.png',
  rootCause:'bindResourceContent maps both role=hero and role=conversion-cta to the same headline and description variables. This erases the semantic distinction between an introduction and a follow-up action.',
  affectedCode:['packages/compatibility/src/content-bindings.ts','packages/compatibility/src/__tests__/showcase-composition.test.ts','tests/e2e/showcase-content-copy-regression.spec.ts'],
  remediation:'Give conversion-cta its own domain-aware headline and description and add a browser regression that checks the rendered employee showcase has one instance of the hero headline and distinct CTA copy.',
  fixCommit:null, status:'open',
  evidence:['quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive/showcase-copy-before.json','quality/evidence/step-45/public-v52-continuation-2026-10-28/showcase-audit.json']
},
{
  id:'AUD-376', severity:'low', route:'/tools/section-planner/', viewport:'1440x900 and 390x844', category:'accessibility',
  title:'Section Planner custom-title field has no id or name',
  expected:'The custom section title textbox should have a stable field identifier while retaining its accessible label, so browser form tooling can identify it consistently.',
  actual:'The textbox has aria-label="Custom section title" but neither id nor name. Chrome DevTools reports “A form field element should have an id or name attribute”. The Add action itself works at both viewports.',
  reproduction:[
    'Open /tools/section-planner/ at desktop or mobile width.',
    'Inspect the Custom section title textbox: id and name are both absent.',
    'In Chrome DevTools, observe one issue: “A form field element should have an id or name attribute”.',
    'Type “Employee timeline” and activate Add; the section appears and the active count becomes 9.'
  ],
  console:[{type:'issue',text:'A form field element should have an id or name attribute (count: 1)'}], network:[],
  screenshot:'quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive/section-planner-field-before-desktop-1440x900.png',
  rootCause:'The custom title input relies only on aria-label and does not provide an id or name attribute.',
  affectedCode:['apps/site/src/components/tools/SectionPlanner.tsx','tests/e2e/section-planner-input-identity.spec.ts'],
  remediation:'Add a stable id and name to the custom title input and assert the field identity plus successful Add behavior in a browser regression at desktop and mobile sizes.',
  fixCommit:null, status:'open',
  evidence:['quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive/section-planner-field-before.json','quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive-smoke.json']
},
{
  id:'AUD-377', severity:'medium', route:'/data/showcases/index.json', viewport:'N/A (public JSON resource)', category:'data',
  title:'Public showcase index disagrees with the canonical gallery',
  expected:'The public JSON index should match each current showcase name, description, archetype, navigation model, DNA preset, color mode, and screen count.',
  actual:'The endpoint returns HTTP 200 but four of eight entries differ from the canonical showcase definitions. The HR record still describes applicant pipelines and hiring while the visible gallery and detail page describe employee experience. Three other taglines are stale, including duplicated “bespoke” copy.',
  reproduction:[
    'Fetch /data/showcases/index.json from the live Site; the response is HTTP 200.',
    'Compare its eight entries with the visible /showcase gallery and SHOWCASE_PROJECTS in packages/composer/src/showcases.ts.',
    'Find mismatches for showcase-luxury-hospitality, showcase-playful-hr, showcase-luxury-ecommerce, and showcase-minimal-productivity.'
  ],
  console:[], network:[{url:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/data/showcases/index.json',status:200}],
  screenshot:'quality/evidence/step-45/public-v52-continuation-2026-10-28/routes/_showcase-desktop-1440x900.png',
  rootCause:'scripts/build-catalog.ts regenerates each showcase manifest but never writes data/showcases/index.json, leaving a public static index from older product copy.',
  affectedCode:['scripts/build-catalog.ts','apps/site/public/data/showcases/index.json','packages/composer/src/showcases.ts','packages/compatibility/src/__tests__/showcase-composition.test.ts'],
  remediation:'Generate the public showcase index from SHOWCASE_PROJECTS during build:catalog and add a regression comparing every public index field with the canonical definitions.',
  fixCommit:null, status:'open',
  evidence:['quality/evidence/step-45/public-v52-continuation-2026-10-28/compare-showcase-index.ts','quality/evidence/step-45/public-v52-continuation-2026-10-28/route-classifications.json']
}
];
const existing=JSON.parse(raw).entries.map(x=>x.id);
const additions=findings.filter(x=>!existing.includes(x.id));
if(additions.length){
  const marker = `\n  ],\n  "generatedAt"`;
  const pos = raw.indexOf(marker);
  if (pos === -1) throw new Error('Could not find runtime audit entries closing marker');
  const payload=additions.map(x=>JSON.stringify(x,null,2).split('\n').map(line=>'    '+line).join('\n')).join(',\n');
  raw=raw.slice(0,pos)+',\n'+payload+raw.slice(pos);
}
raw=raw.replace(/"generatedAt":\s*"[^"]+"/, '"generatedAt": "2026-10-28T07:10:00Z"');
await writeFile(file,raw);
console.log(JSON.stringify({added:additions.map(x=>x.id),total:JSON.parse(raw).entries.length}));
