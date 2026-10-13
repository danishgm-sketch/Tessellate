import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CustomerMetricsStrip} from '../resources/sections/customer-metrics-strip/index.js';
import {CounterTypography} from '../resources/typography/counter-typography/index.js';
import {PerformanceBenchmarkSection} from '../resources/sections/performance-benchmark-section/index.js';
import {ComplianceProof} from '../resources/sections/compliance-proof/index.js';
import {TrustBadgesStrip} from '../resources/sections/trust-badges-strip/index.js';
import {FeatureComparison} from '../resources/sections/feature-comparison/index.js';
import {SocialProofHero} from '../resources/sections/social-proof-hero/index.js';
import {TestimonialQuote} from '../resources/sections/testimonial-quote/index.js';
import {TestimonialGrid} from '../resources/sections/testimonial-grid/index.js';
import {TestimonialCarousel} from '../resources/sections/testimonial-carousel/index.js';
import {PricingEnterprise} from '../resources/sections/pricing-enterprise/index.js';
import {PressMentionsStrip} from '../resources/sections/press-mentions-strip/index.js';
import {FeatureMetrics} from '../resources/sections/feature-metrics/index.js';
import {SecurityProof} from '../resources/sections/security-proof/index.js';
import {SplitProductHero} from '../resources/sections/split-product-hero/index.js';
import {CaseStudySpotlight} from '../resources/sections/case-study-spotlight/index.js';
import {CustomerStorySplit} from '../resources/sections/customer-story-split/index.js';
import {LogoCloudMinimal} from '../resources/sections/logo-cloud-minimal/index.js';
import {ExecutiveSummaryPanel} from '../resources/blocks/executive-summary-panel/index.js';
import {StatusOverview} from '../resources/blocks/status-overview/index.js';
import {CtaDemoBooking} from '../resources/sections/cta-demo-booking/index.js';
import {UpgradePrompt} from '../resources/blocks/upgrade-prompt/index.js';
import {OfflineState} from '../resources/states/offline-state/index.js';
import {ArchitectureDiagramSection} from '../resources/sections/architecture-diagram-section/index.js';
import {FooterDeveloper} from '../resources/sections/footer-developer/index.js';
import {CtaDownload} from '../resources/sections/cta-download/index.js';
import {ProductScreenshotHero} from '../resources/sections/product-screenshot-hero/index.js';
import {ComparisonTable} from '../resources/blocks/comparison-table/index.js';
import {FaqTwoColumn} from '../resources/sections/faq-two-column/index.js';
import {FeatureGrid3x2} from '../resources/sections/feature-grid-3x2/index.js';
import {AIGenerationCompare} from '../resources/ai/ai-generation-compare/index.js';
import {EditorialHero} from '../resources/sections/editorial-hero/index.js';
const hasDisabledButton=(html:string)=>/<button\b[^>]*\sdisabled(?:=|\s|>)/.test(html);
describe('resource demonstrations do not invent product evidence',()=>{
 it('does not invent press quotations',()=>{
  const html=renderToStaticMarkup(createElement(PressMentionsStrip));
  expect(html).not.toMatch(/TechCrunch|Wired|The Verge/);
  expect(html).toMatch(/illustrative|example/i);
 });
 it('requires measurement before publishing performance scores',()=>{
  const html=renderToStaticMarkup(createElement(FeatureMetrics));
  expect(html).not.toMatch(/100\/100|verified clean|Audited Performance/);
  expect(html).toMatch(/measure/i);
 });
 it('does not assert encryption or certification without implemented evidence',()=>{
  const html=renderToStaticMarkup(createElement(SecurityProof));
  expect(html).not.toMatch(/AES-256|End-to-End Encryption|SECURE/);
  expect(html).toMatch(/review|verify/i);
 });
 it('describes composition without cost or visual guarantees',()=>{
  const html=renderToStaticMarkup(createElement(SplitProductHero));
  expect(html).not.toMatch(/zero bundle penalty|guaranteeing visual harmony/);
  expect(html).toMatch(/validated manifests/i);
 });
 it.each([CustomerMetricsStrip,CounterTypography,PerformanceBenchmarkSection])('labels default measurements as examples',Component=>{
  const html=renderToStaticMarkup(createElement(Component));
  expect(html).toMatch(/example|illustrative/i);
  expect(html).not.toMatch(/Verified Uptime|Zero Vulnerabilities|Audited Latency|Tessellate Manifest Parse/);
 });
 it.each([ComplianceProof,TrustBadgesStrip,FeatureComparison])('does not certify an unverified product',Component=>{
  const html=renderToStaticMarkup(createElement(Component));
  expect(html).not.toMatch(/CERTIFIED|AA VERIFIED|Guaranteed data residency|audits verify that Tessellate|Certified WCAG/);
  expect(html).toMatch(/evidence|target|verify/i);
 });
 it('does not fabricate customer adoption or reviews',()=>{
  const html=renderToStaticMarkup(createElement(SocialProofHero));
  expect(html).toMatch(/example/i);
  expect(html).not.toMatch(/40,000|42,800|1,200 reviews|Zero security incidents|powers reliable/);
 });
 it.each([TestimonialQuote,TestimonialGrid,TestimonialCarousel])('identifies example testimonials',Component=>{
  const html=renderToStaticMarkup(createElement(Component));
  expect(html).toMatch(/illustrative|example/i);
  expect(html).not.toMatch(/Elena Rostova|Samantha Reed|Marcus Vance|Aria Chen|Devon Patel|under three weeks|world-class application/);
 });
 it('truthfully disables booking without an integration',()=>{
  const html=renderToStaticMarkup(createElement(PricingEnterprise));
  expect(hasDisabledButton(html)).toBe(true);
  expect(html).toContain('Booking not configured');
  expect(html).not.toMatch(/isolated R2|custom SOC2|24\/7 dedicated/);
 });
 it('enables consultation when the caller supplies an integration',()=>{
  const html=renderToStaticMarkup(createElement(PricingEnterprise,{onConsultation:()=>{}}));
  expect(hasDisabledButton(html)).toBe(false);
  expect(html).toContain('Request consultation');
 });
 it('does not present an invented customer outcome as a published case study',()=>{
  const html=renderToStaticMarkup(createElement(CaseStudySpotlight));
  expect(html).not.toMatch(/KRONOS|Kronos|4\.2x|140 disparate components/);
  expect(html).toMatch(/example|verified outcome/i);
  expect(hasDisabledButton(html)).toBe(true);
 });
 it('does not invent a named customer story or leave its link inert',()=>{
  const html=renderToStaticMarkup(createElement(CustomerStorySplit));
  expect(html).not.toMatch(/Helios|robotics dashboard|telemetry interface|under 20ms/);
  expect(html).toMatch(/example|approved customer/i);
  expect(hasDisabledButton(html)).toBe(true);
 });
 it('does not imply fictional organisations use Tessellate',()=>{
  const html=renderToStaticMarkup(createElement(LogoCloudMinimal));
  expect(html).not.toMatch(/Acme Corp|Starlight Data|Hyperion|Vertex Labs|Nexus AI/);
  expect(html).toMatch(/example|approved logos/i);
 });
 it('labels executive dashboard values as illustrative',()=>{
  const html=renderToStaticMarkup(createElement(ExecutiveSummaryPanel));
  expect(html).not.toMatch(/All telemetry targets exceeded|zero security anomalies|100% uptime sustained/);
  expect(html).toMatch(/example data|illustrative data/i);
 });
 it('labels service health values as illustrative instead of live status',()=>{
  const html=renderToStaticMarkup(createElement(StatusOverview));
  expect(html).not.toMatch(/100% OPERATIONAL|Authentication OAuth/);
  expect(html).toMatch(/example|illustrative/i);
  expect(html).toMatch(/Example service A/);
 });
 it('does not claim availability or accept a booking without a calendar integration',()=>{
  const html=renderToStaticMarkup(createElement(CtaDemoBooking));
  expect(html).not.toMatch(/Available Times \(Tomorrow\)|Speak with our core team/);
  expect(html).toMatch(/example|calendar not configured/i);
  expect(hasDisabledButton(html)).toBe(true);
 });
 it('does not sell unsupported cloud collaboration or a Tessellate Pro plan',()=>{
  const html=renderToStaticMarkup(createElement(UpgradePrompt));
  expect(html).not.toMatch(/TEAM PRO|Cloud Team Checkpoints|unlimited teammates/);
  expect(html).toMatch(/example|plan not configured/i);
  expect(hasDisabledButton(html)).toBe(true);
 });
 it('does not promise secure IndexedDB persistence or automatic cloud sync',()=>{
  const html=renderToStaticMarkup(createElement(OfflineState));
  expect(html).not.toMatch(/securely saved|IndexedDB|cloud synchronization will resume/i);
  expect(html).toMatch(/host app|local persistence/i);
 });
 it('distinguishes optional reference architecture from the unbound review Site',()=>{
  const html=renderToStaticMarkup(createElement(ArchitectureDiagramSection));
  expect(html).not.toMatch(/sub-millisecond routing|Encrypted checkpoints|D1 \+ R2 Registry/);
  expect(html).toMatch(/reference architecture|not provisioned/i);
 });
 it('does not invent build hashes or edge performance telemetry',()=>{
  const html=renderToStaticMarkup(createElement(FooterDeveloper));
  expect(html).not.toMatch(/c4b2a9f|Edge: 100% OK|Latency: 0\.8ms/);
  expect(html).toMatch(/example|not live|replace with/i);
 });
 it('does not advertise unpublished package channels as working download actions',()=>{
  const html=renderToStaticMarkup(createElement(CtaDownload));
  expect(html).not.toMatch(/1\.0\.0 RELEASE READY|brew install tessellate|npm install @tessellate\/cli/);
  expect(html).toMatch(/not configured|example/i);
  expect(hasDisabledButton(html)).toBe(true);
 });
 it('does not use an invented product hostname, live catalogue count, or dead hero CTA',()=>{
  const html=renderToStaticMarkup(createElement(ProductScreenshotHero));
  expect(html).not.toMatch(/workbench\.tessellate\.design|324 validated resources|Real-time token synchronization/);
  expect(html).toMatch(/example|destination not configured/i);
  expect(hasDisabledButton(html)).toBe(true);
 });
 it('labels comparison numbers as examples rather than measured Tessellate claims',()=>{
  const html=renderToStaticMarkup(createElement(ComparisonTable));
  expect(html).not.toMatch(/Tessellate Pure|Generic Alternative/);
  expect(html).toMatch(/example comparison|replace with measured/i);
 });
 it('does not claim a particular offline store or verified migration behavior in the FAQ',()=>{
  const html=renderToStaticMarkup(createElement(FaqTwoColumn));
  expect(html).not.toMatch(/IndexedDB persistence|running fully offline|Every resource is immutable/);
  expect(html).toMatch(/depends on the host app/i);
 });
 it('qualifies capability, performance, accessibility, and sync claims in the feature grid',()=>{
  const html=renderToStaticMarkup(createElement(FeatureGrid3x2));
  expect(html).not.toMatch(/Sub-Millisecond Parsing|Meets WCAG 2\.2 AA|optional GitHub OAuth for cloud sync/);
  expect(html).toMatch(/configure|target|example/i);
 });
 it('labels AI candidate latency and cohesion as illustrative',()=>{
  const html=renderToStaticMarkup(createElement(AIGenerationCompare));
  expect(html).not.toMatch(/Latency: 420ms|Latency: 510ms|Cohesion: 92\/100|Cohesion: 98\/100/);
  expect(html).toMatch(/illustrative|example/i);
 });
 it('does not advertise an unshipped version or measured microsecond performance',()=>{
  const html=renderToStaticMarkup(createElement(EditorialHero));
  expect(html).not.toMatch(/Announcing Version 2\.0|sub-millisecond execution/);
  expect(html).toMatch(/validated|compose resilient interfaces/i);
 });
 it('enables resource actions only when the host provides their destinations',()=>{
  const caseStudy=renderToStaticMarkup(createElement(CaseStudySpotlight,{caseStudyHref:'/case-studies/example'}));
  const install=renderToStaticMarkup(createElement(CtaDownload,{onInstall:()=>{}}));
  const upgrade=renderToStaticMarkup(createElement(UpgradePrompt,{onUpgrade:()=>{}}));
  const hero=renderToStaticMarkup(createElement(ProductScreenshotHero,{ctaHref:'/compose'}));
  expect(caseStudy).toContain('href="/case-studies/example"');
  expect(install).toContain('Open installation instructions');
  expect(hasDisabledButton(install)).toBe(false);
  expect(upgrade).toContain('View available plan');
  expect(hasDisabledButton(upgrade)).toBe(false);
  expect(hero).toContain('href="/compose"');
  expect(hasDisabledButton(hero)).toBe(false);
 });
});
