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
  expect(html).toContain('disabled');
  expect(html).toContain('Booking not configured');
  expect(html).not.toMatch(/isolated R2|custom SOC2|24\/7 dedicated/);
 });
 it('enables consultation when the caller supplies an integration',()=>{
  const html=renderToStaticMarkup(createElement(PricingEnterprise,{onConsultation:()=>{}}));
  expect(html).not.toContain('disabled');
  expect(html).toContain('Request consultation');
 });
});
