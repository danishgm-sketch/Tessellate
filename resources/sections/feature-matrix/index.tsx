import React from 'react';

export type FeatureMatrixVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureMatrixProps {
  variant?: FeatureMatrixVariant;
  title?: string;
  items?: Array<{title:string;description:string;detail:string}>;
}

export function FeatureMatrix({ variant = 'quiet', title='Example capability matrix',items }: FeatureMatrixProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let tableBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    tableBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tableBorder = 'border-[#2E3440]';
  }

  const rows = items?.map(item=>({capability:item.title,primitives:item.description,shells:item.detail,sections:'Example',blocks:'Review'})) ?? [
    { capability: 'Verified Zod Schemas', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
    { capability: 'Accessibility review', primitives: 'Required', shells: 'Required', sections: 'Required', blocks: 'Required' },
    { capability: 'Zero External CSS Dependencies', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
    { capability: 'Curated Nocturne Theme', primitives: 'Yes', shells: 'Yes', sections: 'Yes', blocks: 'Yes' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">{title}</h2>

        <div
          role="region"
          aria-label={`${title} comparison table`}
          tabIndex={0}
          className={`overflow-x-auto rounded-[var(--tess-radius-xl,8px)] border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${tableBorder}`}
        >
          <table className="w-full text-left text-xs @sm:text-sm">
            <thead className="border-b bg-neutral-100/60 dark:bg-neutral-900/60 text-xs uppercase tracking-wider font-mono">
              <tr>
                <th className="p-4">Capability</th>
                <th className="p-4">{items?'Purpose':'Primitives'}</th>
                <th className="p-4">{items?'Journey':'Shells'}</th>
                <th className="p-4">{items?'Content':'Sections'}</th>
                <th className="p-4">{items?'Next step':'Blocks'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((r) => (
                <tr key={r.capability} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="p-4 font-semibold">{r.capability}</td>
                  <td className="p-4 text-emerald-800 dark:text-emerald-300 font-mono">{r.primitives}</td>
                  <td className="p-4 text-emerald-800 dark:text-emerald-300 font-mono">{r.shells}</td>
                  <td className="p-4 text-emerald-800 dark:text-emerald-300 font-mono">{r.sections}</td>
                  <td className="p-4 text-emerald-800 dark:text-emerald-300 font-mono">{r.blocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
