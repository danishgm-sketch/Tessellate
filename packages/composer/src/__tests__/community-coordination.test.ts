import { describe, expect, it } from 'vitest';
import { interpretProductBrief } from '../interpreter.js';

const mutualAidBrief =
  'A mobile-first mutual-aid app for 30,000 residents in a dense city. Verified residents share local updates, organise cleanup events and skill swaps, ask neighbours for help, and follow street-by-street notices. Volunteer moderators handle reports and privacy controls. Users have limited data plans; motion should be optional and every action accessible.';

describe('Neighbourhood mutual-aid domain interpretation', () => {
  it('recognises standalone mutual aid briefs and both neighbourhood spellings', () => {
    for (const description of [
      mutualAidBrief,
      mutualAidBrief.replace('mutual-aid app', 'neighbourhood social and mutual-aid app'),
      mutualAidBrief.replace('mutual-aid app', 'neighborhood social and mutual aid app'),
    ]) {
      const { productModel } = interpretProductBrief({ description });
      const entityNames = productModel.entities.map((entity) => entity.name);
      const allFields = productModel.entities.flatMap((entity) => entity.fields ?? []);
      const screenNames = productModel.likelyScreens.map((screen) => screen.name);
      const workflowText = productModel.workflows
        .map((workflow) => `${workflow.name} ${workflow.steps.join(' ')}`)
        .join(' ')
        .toLocaleLowerCase();

      expect(productModel.productArchetypes[0]?.tag).toBe('consumer');
      expect(productModel.primaryObjective.toLocaleLowerCase()).toMatch(
        /consent-based local assistance/
      );
      expect(productModel.trustRequirement).toBeGreaterThanOrEqual(95);
      expect(productModel.mobileImportance).toBe(100);
      expect(entityNames).toEqual(
        expect.arrayContaining([
          'Resident',
          'Mutual Aid Request',
          'Volunteer Offer',
          'Community Event',
          'Safety Notice',
          'Moderation Report',
        ])
      );
      expect(allFields).toContain('selectedNeighbourhood');
      expect(allFields).toContain('consentState');
      expect(allFields).toContain('expiresAt');
      expect(allFields.join(' ').toLocaleLowerCase()).not.toMatch(
        /homeaddress|streetaddress|dateofbirth|phone(number)?|personalemail/
      );
      expect(screenNames).toEqual(
        expect.arrayContaining([
          'Neighbourhood Updates',
          'Community Help Board',
          'Local Events & Skills',
          'Safety & Moderation',
          'Privacy & Languages',
        ])
      );
      expect(workflowText).toMatch(/both residents consent/);
      expect(workflowText).toMatch(/authorised moderators/);
      expect(productModel.requiredCapabilities).toEqual(
        expect.arrayContaining([
          'consent-based-contact-sharing',
          'community-moderation-queue',
          'minimal-location-precision',
          'language-preferences',
          'expiring-local-notices',
          'offline-draft-mode',
        ])
      );
      expect(productModel.forbiddenPatterns).toEqual(
        expect.arrayContaining([
          'direct-contact-shared-without-mutual-consent',
          'exact-home-address-in-public-feed',
          'stale-safety-notice-presented-as-current',
        ])
      );
    }
  });

  it('keeps ordinary shared-interest communities on the established community model', () => {
    const { productModel } = interpretProductBrief({
      description:
        'A neighborhood social app for hobby groups to share local updates, interests, and casual event invitations.',
    });
    const screenNames = productModel.likelyScreens.map((screen) => screen.name);

    expect(productModel.productArchetypes[0]?.tag).toBe('consumer');
    expect(productModel.primaryObjective).toMatch(/social discovery through local updates/i);
    expect(productModel.entities.map((entity) => entity.name)).toContain('Community Update');
    expect(productModel.entities.map((entity) => entity.name)).not.toContain('Mutual Aid Request');
    expect(screenNames).toContain('Activity Stream');
    expect(screenNames).not.toContain('Community Help Board');
  });
});
