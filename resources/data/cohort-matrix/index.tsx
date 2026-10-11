import React from 'react';

export type CohortMatrixVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CohortMatrixProps {
  variant?: CohortMatrixVariant;
}

export function CohortMatrix({ variant = 'quiet' }: CohortMatrixProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const getCellBg = (pct: number) => {
    if (variant === 'nocturne') {
      if (pct >= 80) return 'bg-cyan-500 text-black font-semibold';
      if (pct >= 50) return 'bg-cyan-700/80 text-white';
      if (pct >= 30) return 'bg-cyan-900/60 text-cyan-200';
      return 'bg-[#151921] text-neutral-400';
    }
    if (variant === 'expressive') {
      if (pct >= 80) return 'bg-[#2547E8] text-white font-semibold';
      if (pct >= 50) return 'bg-blue-600/80 text-white';
      if (pct >= 30) return 'bg-blue-200 text-blue-900';
      return 'bg-neutral-100 text-neutral-500';
    }
    if (pct >= 80) return 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold';
    if (pct >= 50) return 'bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900';
    if (pct >= 30) return 'bg-neutral-300 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200';
    return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400';
  };

  const cohorts = [
    { cohort: 'Jan 2026', size: '1,240', ret: [100, 78, 64, 52, 45, 41] },
    { cohort: 'Feb 2026', size: '1,480', ret: [100, 81, 68, 59, 49] },
    { cohort: 'Mar 2026', size: '1,620', ret: [100, 84, 72, 63] },
    { cohort: 'Apr 2026', size: '1,890', ret: [100, 86, 75] },
    { cohort: 'May 2026', size: '2,100', ret: [100, 88] },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">User Retention Cohort Matrix</h4>
          <p className="text-xs text-neutral-500">Monthly active user persistence</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-left">
              <th className="py-2 pr-4 font-normal">Cohort</th>
              <th className="py-2 pr-4 font-normal">Size</th>
              {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((m) => (
                <th key={m} className="py-2 px-2 text-center font-normal">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.cohort} className="border-b border-neutral-100 dark:border-neutral-800/50">
                <td className="py-2.5 pr-4 font-medium text-neutral-700 dark:text-neutral-300">{c.cohort}</td>
                <td className="py-2.5 pr-4 text-neutral-500">{c.size}</td>
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const val = c.ret[idx];
                  if (val === undefined) {
                    return <td key={idx} className="py-2.5 px-2 text-center text-neutral-300 dark:text-neutral-700">-</td>;
                  }
                  return (
                    <td key={idx} className="py-1 px-1">
                      <div className={`w-10 h-7 rounded flex items-center justify-center mx-auto text-[11px] ${getCellBg(val)}`}>
                        {val}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
