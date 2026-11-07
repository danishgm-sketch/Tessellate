import { describe, expect, it } from 'vitest';
import { interpretProductBrief } from '../interpreter.js';

const offshoreWindBrief =
  'A field safety intelligence and equipment maintenance platform for a 1,200-person offshore wind operator. Dispatch crews across three time zones. Technicians use rugged tablets with intermittent connectivity; control room teams manage turbine status, sea conditions, permits to work, lockout/tagout, and incident escalation.';

describe('ERP & Operations domain interpretation', () => {
  it('turns offshore wind safety needs into operational entities, workflows, and screens', () => {
    const { productModel } = interpretProductBrief({ description: offshoreWindBrief });
    const entityNames = productModel.entities.map((entity) => entity.name.toLocaleLowerCase());
    const workflowText = productModel.workflows
      .map((workflow) => `${workflow.name} ${workflow.steps.join(' ')}`)
      .join(' ')
      .toLocaleLowerCase();
    const screenText = productModel.likelyScreens
      .map((screen) => `${screen.name} ${screen.purpose} ${(screen.jobs ?? []).join(' ')}`)
      .join(' ')
      .toLocaleLowerCase();

    expect(productModel.productArchetypes[0]?.tag).toBe('erp-operations');
    expect(productModel.primaryAudience.toLocaleLowerCase()).toMatch(/technician|control room/);
    expect(productModel.primaryObjective.toLocaleLowerCase()).toMatch(/turbine|permit|incident/);
    expect(entityNames).toEqual(
      expect.arrayContaining(['turbine', 'work order', 'permit to work', 'crew', 'incident'])
    );
    expect(workflowText).toMatch(/lockout|tagout|isolation/);
    expect(workflowText).toMatch(/incident|escalat/);
    expect(workflowText).toMatch(/weather|sea condition|crew|dispatch/);
    expect(screenText).toMatch(/turbine operations/);
    expect(screenText).toMatch(/permits to work/);
    expect(screenText).toMatch(/incident response/);
    expect(screenText).toMatch(/crew & vessel dispatch/);
    expect(screenText).not.toMatch(/inventory catalog/);
    expect(entityNames).not.toContain('purchaseorder');
    expect(
      productModel.likelyScreens.find((screen) => screen.name === 'Incident Response')?.screenType
    ).toBe('index-list');
    expect(productModel.trustRequirement).toBeGreaterThanOrEqual(98);
    expect(productModel.transactionCriticality).toBeGreaterThanOrEqual(98);
    expect(productModel.mobileImportance).toBeGreaterThanOrEqual(85);
    expect(productModel.requiredCapabilities).toEqual(
      expect.arrayContaining(['offline-draft-mode', 'permit-to-work', 'incident-escalation'])
    );
  });

  it('leaves ordinary warehouse operations on the inventory and procurement model', () => {
    const { productModel } = interpretProductBrief({
      description:
        'A warehouse inventory and procurement platform for regional distribution teams to track stock, suppliers, and incoming shipments.',
    });
    const names = productModel.likelyScreens.map((screen) => screen.name);

    expect(productModel.productArchetypes[0]?.tag).toBe('erp-operations');
    expect(names).toContain('Inventory Catalog');
    expect(names).not.toContain('Permits to Work');
    expect(productModel.entities.map((entity) => entity.name)).toContain('PurchaseOrder');
  });

  it('keeps offshore wind research on its research model without maintenance or safety workflows', () => {
    const { productModel } = interpretProductBrief({
      description:
        'A field research platform helps climate scientists compare offshore wind measurements, cite papers, and review evidence dossiers.',
    });
    const screenNames = productModel.likelyScreens.map((screen) => screen.name);

    expect(productModel.productArchetypes[0]?.tag).toBe('intelligence-research');
    expect(screenNames).toContain('Research Terminal');
    expect(screenNames).not.toContain('Turbine Operations');
    expect(productModel.entities.map((entity) => entity.name)).not.toContain('Permit to Work');
  });
});
