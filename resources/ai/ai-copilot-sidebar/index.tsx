import React, { useId, useState } from 'react';

export type AICopilotSidebarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AICopilotSidebarProps {
  variant?: AICopilotSidebarVariant;
  onApplyRecommendedFixes?: (recommendationIds: readonly string[]) => void;
}

const sampleRecommendations = [
  {
    id: 'border-contrast-token',
    title: 'Example: use a contrast token',
    description: 'Would replace a hardcoded border color with the host design token.',
  },
  {
    id: 'table-keyboard-shortcuts',
    title: 'Example: add table shortcuts',
    description: 'Would add keyboard navigation when implemented by the host application.',
  },
] as const;

export function AICopilotSidebar({
  variant = 'quiet',
  onApplyRecommendedFixes,
}: AICopilotSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const applyHelpId = useId();

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const recommendationBg =
    variant === 'nocturne'
      ? 'bg-[#151921] border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-blue-50/50 border-blue-200 text-blue-900'
      : 'bg-neutral-50 border-neutral-200';

  return (
    <div className={`w-full max-w-sm p-5 rounded-xl border flex flex-col gap-4 transition-all ${cardBg} ${collapsed ? 'h-16 overflow-hidden' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neutral-400" aria-hidden="true" />
          <h4 className="text-sm font-semibold tracking-tight">Copilot suggestions (example)</h4>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          className="text-xs text-neutral-400 hover:text-current font-mono"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {!collapsed && (
        <>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Example content only. This preview does not inspect files or change source code.
            <span className="block mt-1 font-mono text-neutral-700 dark:text-neutral-200">Sample context: DashboardView.tsx</span>
          </p>

          <ul aria-label="Example recommendations" className="space-y-2">
            {sampleRecommendations.map((recommendation) => (
              <li
                key={recommendation.id}
                className={`p-3 rounded-lg border text-xs ${recommendationBg}`}
              >
                <div className="font-medium mb-1">{recommendation.title}</div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300">
                  {recommendation.description}
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            data-testid="ai-copilot-apply"
            disabled={!onApplyRecommendedFixes}
            aria-describedby={applyHelpId}
            onClick={() => onApplyRecommendedFixes?.(sampleRecommendations.map(({ id }) => id))}
            className="w-full py-2 text-xs rounded-lg font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply All Recommended Fixes
          </button>
          <p id={applyHelpId} data-testid="ai-copilot-apply-help" className="text-[11px] text-neutral-600 dark:text-neutral-300">
            {onApplyRecommendedFixes
              ? 'Applying uses the host action connected to this component.'
              : 'Unavailable until the host connects a validated apply action.'}
          </p>
        </>
      )}
    </div>
  );
}
