import type { ProductModel, ScreenNode } from '@tessellate/schemas';

/**
 * Content injection (Phase 29): every composed section receives props drawn from the reviewed product —
 * its name, the screen's purpose, real navigation labels and sample records built from the entity's
 * fields — never Tessellate's own marketing copy. Resources that accept these props render the client's
 * content; the export carries the same props so nothing has to be rewritten by hand.
 */
export interface ContentContext {
  productName: string;
  productModel: ProductModel;
  screen: ScreenNode;
  navItems: Array<{ label: string; href: string }>;
}

const SAMPLE_PEOPLE = ['Amira Khan', 'Ben Carter', 'Chloe Martin', 'Daniel Osei', 'Elena Rossi', 'Farid Haddad'];
const SAMPLE_STATUS = ['Active', 'Pending', 'Completed', 'Scheduled', 'Cancelled'];

function sampleValue(field: string, row: number): string | number {
  const f = field.toLowerCase();
  if (/(^|\s)(name|client|patient|customer|member|clinician|owner|with|staff|guest)(\s|$)/.test(f)) return SAMPLE_PEOPLE[row % SAMPLE_PEOPLE.length]!;
  if (f.includes('status')) return SAMPLE_STATUS[row % SAMPLE_STATUS.length]!;
  if (/(date|time|created|due|start|end|when)/.test(f)) {
    const d = new Date(Date.UTC(2026, 0, 12 + row * 3, 9 + (row % 6), row % 2 ? 30 : 0));
    return f.includes('time') ? d.toISOString().slice(0, 16).replace('T', ' ') : d.toISOString().slice(0, 10);
  }
  if (/(amount|total|price|deposit|fee|cost|balance|rate|value)/.test(f)) return `£${(45 + row * 17.5).toFixed(2)}`;
  if (/(count|quantity|capacity|seats|size)/.test(f)) return 2 + ((row * 3) % 9);
  if (/(email)/.test(f)) return `${SAMPLE_PEOPLE[row % SAMPLE_PEOPLE.length]!.split(' ')[0]!.toLowerCase()}@example.com`;
  if (/(note|description|summary|reason)/.test(f)) return 'Sample text — replace with real data.';
  return `${field[0]!.toUpperCase()}${field.slice(1)} ${row + 1}`;
}

/** Deterministic sample records for an entity, from its ontology fields. Clearly sample data, never real. */
export function sampleRecords(fields: string[], count = 5): Array<Record<string, string | number>> {
  return Array.from({ length: count }, (_, row) => Object.fromEntries(fields.slice(0, 6).map((f) => [f, sampleValue(f, row)])));
}

export function plural(word: string): string {
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  return /(s|sh|ch|x)$/i.test(word) ? word + 'es' : word + 's';
}

function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildContentProps(role: string, ctx: ContentContext): Record<string, unknown> {
  const { productName, productModel, screen, navItems } = ctx;
  const entity = screen.entity ? productModel.entities.find((e) => e.name === screen.entity) : undefined;
  const audience = productModel.primaryAudience;
  const base: Record<string, unknown> = { heading: screen.name, description: screen.purpose };

  switch (role) {
    case 'navigation':
    case 'app-navigation':
    case 'settings-nav':
      return { brand: productName, productName, items: navItems };
    case 'footer':
      return { brand: productName, productName, items: navItems, copyright: `© ${new Date().getUTCFullYear()} ${productName}` };
    case 'hero':
      return {
        productName,
        heading: productName,
        description: productModel.primaryObjective || `${productName} for ${audience}.`,
        primaryActionLabel: 'Get started',
        secondaryActionLabel: 'Learn more',
      };
    case 'value-proposition':
    case 'feature-grid':
      return {
        heading: `Why ${productName}`,
        items: productModel.entities.slice(0, 6).map((e) => ({ title: titleCase(e.name), description: e.description })),
      };
    case 'conversion-cta':
      return { heading: `Get started with ${productName}`, primaryActionLabel: 'Get started' };
    case 'metric-cards':
    case 'summary-kpis':
      return {
        ...base,
        metrics: productModel.entities.slice(0, 4).map((e, i) => ({ label: plural(titleCase(e.name)), value: 12 + i * 37, sample: true })),
      };
    case 'data-table':
    case 'admin-table':
    case 'invoices-table':
    case 'results-grid':
    case 'results-list':
    case 'upcoming-list':
    case 'board-view':
    case 'calendar-view':
    case 'map-view': {
      const fields = entity?.fields ?? ['name', 'status', 'created'];
      return { ...base, entity: entity?.name, columns: fields.slice(0, 6), rows: sampleRecords(fields), sampleData: true };
    }
    case 'entity-header':
    case 'main-content-pane':
    case 'metadata-sidebar': {
      const fields = entity?.fields ?? ['name', 'status', 'created'];
      return { ...base, entity: entity?.name, fields, record: sampleRecords(fields, 1)[0], sampleData: true };
    }
    default:
      return entity ? { ...base, entity: entity.name } : base;
  }
}
