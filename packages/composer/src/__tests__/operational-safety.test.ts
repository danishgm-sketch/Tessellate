import { describe, expect, it } from 'vitest';
import { interpretProductBrief } from '../interpreter.js';

const offshoreWindBrief =
  'A field safety intelligence and equipment maintenance platform for a 1,200-person offshore wind operator. Dispatch crews across three time zones. Technicians use rugged tablets with intermittent connectivity; control room teams manage turbine status, sea conditions, permits to work, lockout/tagout, and incident escalation.';
const municipalWaterBrief =
  'A public drinking-water utility operations workspace helps field crews and control-room dispatchers respond to burst mains and planned outages across three districts. Teams need to locate affected streets, assign qualified repair crews, verify isolation and water-quality clearance before service returns, and prepare accessible resident updates. Technicians use phones with intermittent connectivity. This is an offline product prototype with sample data only.';

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

  it('turns a drinking-water service brief into domain-specific operations screens and safeguards', () => {
    const { productModel } = interpretProductBrief({ description: municipalWaterBrief });
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
    expect(productModel.primaryAudience.toLocaleLowerCase()).toMatch(/field technician|dispatch/);
    expect(productModel.primaryObjective.toLocaleLowerCase()).toMatch(/water|outage|service/);
    expect(entityNames).toEqual(
      expect.arrayContaining([
        'water network asset',
        'service incident',
        'work order',
        'water quality clearance',
        'resident notice',
      ])
    );
    expect(workflowText).toMatch(/isolation/);
    expect(workflowText).toMatch(/water quality|clearance/);
    expect(workflowText).toMatch(/affected area|resident|accessible/);
    expect(screenText).toMatch(/network operations/);
    expect(screenText).toMatch(/outage.*incident/);
    expect(screenText).toMatch(/repair work orders/);
    expect(screenText).toMatch(/water quality clearance/);
    expect(screenText).toMatch(/resident updates/);
    expect(screenText).not.toMatch(/inventory catalog|purchase order/);
    expect(productModel.trustRequirement).toBeGreaterThanOrEqual(98);
    expect(productModel.transactionCriticality).toBeGreaterThanOrEqual(95);
    expect(productModel.mobileImportance).toBeGreaterThanOrEqual(90);
    expect(productModel.requiredCapabilities).toEqual(
      expect.arrayContaining([
        'water-quality-clearance',
        'offline-field-drafts',
        'accessible-resident-notices',
      ])
    );
  });

  it('does not turn water-quality research into a utility operations product', () => {
    const { productModel } = interpretProductBrief({
      description:
        'A field research platform helps hydrologists compare drinking-water quality measurements from regional samples, cite methods, and review evidence dossiers.',
    });
    const screenNames = productModel.likelyScreens.map((screen) => screen.name);

    expect(productModel.productArchetypes[0]?.tag).toBe('intelligence-research');
    expect(screenNames).not.toContain('Network Operations');
    expect(screenNames).not.toContain('Water Quality Clearance');
    expect(productModel.entities.map((entity) => entity.name)).not.toContain('Service Incident');
  });
});
