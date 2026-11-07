import React, { useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { auditProjectManifest } from '../../audit/audit-engine.js';
import type { AuditIssue, AuditSeverity, AuditCategory, ProjectManifest } from '@tessellate/schemas';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Wand2,
  Sparkles,
} from 'lucide-react';

export function AuditPanel({ manifest: propManifest }: { manifest?: ProjectManifest } = {}) {
  const storeManifest = useWorkbenchStore((state) => state.manifest);
  const manifest = propManifest ?? storeManifest;
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const setActiveScreen = useWorkbenchStore((state) => state.setActiveScreen);
  const executeMutation = useWorkbenchStore((state) => state.executeMutation);

  const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<AuditCategory | 'all'>('all');

  // Compute live deterministic audit result
  const auditResult = auditProjectManifest(manifest);
  const { total, scores, issues } = auditResult;

  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const warningIssues = issues.filter((i) => i.severity === 'warning');
  const infoIssues = issues.filter((i) => i.severity === 'info');

  const filteredIssues = issues.filter((i) => {
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    return true;
  });

  const handleSelectIssue = (issue: AuditIssue) => {
    if (issue.nodeIds && issue.nodeIds.length > 0) {
      const targetNodeId = issue.nodeIds[0]!;
      // Find which screen contains this node
      for (const screen of manifest.screens) {
        if (findNodeInTree(screen.rootNode, targetNodeId)) {
          setActiveScreen(screen.id);
          break;
        }
      }
      selectNode(targetNodeId);
    }
  };

  const handleApplyFix = (e: React.MouseEvent, issue: AuditIssue) => {
    e.stopPropagation();
    if (issue.suggestedFix?.mutations) {
      for (const mutation of issue.suggestedFix.mutations) {
        executeMutation(mutation);
      }
    }
  };

  const getScoreColor = (val: number, max: number) => {
    const ratio = val / max;
    if (ratio >= 0.9) return 'text-emerald-700 dark:text-emerald-400';
    if (ratio >= 0.7) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const categoryLabels: Record<AuditCategory, { label: string; max: number }> = {
    cohesion: { label: 'Cohesion', max: 20 },
    accessibility: { label: 'Accessibility', max: 20 },
    performance: { label: 'Performance', max: 15 },
    responsive: { label: 'Responsive', max: 15 },
    hierarchy: { label: 'Hierarchy', max: 10 },
    densityConsistency: { label: 'Density', max: 5 },
    motionConsistency: { label: 'Motion', max: 5 },
    designSystemCompliance: { label: 'Compliance', max: 5 },
    interactionConsistency: { label: 'Interaction', max: 5 },
  };

  return (
    <div
      data-testid="audit-panel"
      className="dark flex-1 min-w-0 flex flex-col h-full bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#111217] dark:text-[#F5F7FA] overflow-hidden select-none"
    >
      {/* Top Banner: Overall Score & Metrics */}
      <div className="p-6 border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] flex flex-wrap items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-5">
          {/* Total Circular Score Badge */}
          <div className="relative flex items-center justify-center">
            <div
              className={`h-20 w-20 rounded-2xl flex flex-col items-center justify-center border-2 ${
                total >= 90
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : total >= 75
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
              }`}
            >
              <span className="text-2xl font-black tracking-tight">{total}</span>
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Deterministic Quality Audit</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[#62666F] dark:text-[#A8AFBA]">
                100-pt model
              </span>
            </div>
            <p className="text-xs text-[#62666F] dark:text-[#A8AFBA] mt-1 max-w-md">
              Manifest checks for declared accessibility, performance and Design DNA consistency. This score does not measure live browser contrast, keyboard access or responsiveness; verify the rendered project.
            </p>
          </div>
        </div>

        {/* Severity Summary Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              filterSeverity === 'critical'
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                : 'border-[#D9D6CF] dark:border-[#272C34] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
            <span>Critical: {criticalIssues.length}</span>
          </button>

          <button
            onClick={() => setFilterSeverity(filterSeverity === 'warning' ? 'all' : 'warning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              filterSeverity === 'warning'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                : 'border-[#D9D6CF] dark:border-[#272C34] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Warnings: {warningIssues.length}</span>
          </button>

          <button
            onClick={() => setFilterSeverity(filterSeverity === 'info' ? 'all' : 'info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              filterSeverity === 'info'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                : 'border-[#D9D6CF] dark:border-[#272C34] hover:bg-[#FAF9F6] dark:hover:bg-[#171B21]'
            }`}
          >
            <Info className="h-3.5 w-3.5 text-blue-500" />
            <span>Info: {infoIssues.length}</span>
          </button>
        </div>
      </div>

      {/* Nine Categories Grid */}
      <div className="px-6 py-4 border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 shrink-0">
        {(Object.keys(categoryLabels) as AuditCategory[]).map((cat) => {
          const info = categoryLabels[cat];
          const val = scores[cat];
          const isSelected = filterCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(isSelected ? 'all' : cat)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#2547E8] bg-[#2547E8]/5 dark:bg-[#2547E8]/10 ring-1 ring-[#2547E8]'
                  : 'border-[#D9D6CF]/70 dark:border-[#272C34]/70 hover:border-[#D9D6CF] dark:hover:border-[#272C34]'
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] truncate">
                {info.label}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-base font-bold ${getScoreColor(val, info.max)}`}>
                  {val}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">/{info.max}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      <div tabIndex={0} role="region" aria-label="Project audit results" className="flex-1 overflow-y-auto p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#62666F] dark:text-[#A8AFBA]">
            {filteredIssues.length} Actionable Findings
          </div>
          {(filterSeverity !== 'all' || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setFilterSeverity('all');
                setFilterCategory('all');
              }}
              className="text-xs text-[#2547E8] dark:text-[#879DFF] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#D9D6CF] dark:border-[#272C34] rounded-2xl bg-white dark:bg-[#111217]">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#111217] dark:text-[#F5F7FA]">
              Zero Issues Detected
            </h3>
            <p className="text-xs text-[#62666F] dark:text-[#A8AFBA] mt-1 max-w-sm mx-auto">
              All 9 deterministic quality dimensions passed successfully with zero policy violations.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isTargetSelected =
              issue.nodeIds && issue.nodeIds.includes(selectedNodeId || '');
            const isBetaSuggestion = issue.category === 'accessibility' || issue.category === 'performance';
            return (
              <div
                key={issue.id}
                onClick={() => handleSelectIssue(issue)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isTargetSelected
                    ? 'border-[#2547E8] bg-[#2547E8]/5 dark:bg-[#2547E8]/10 ring-1 ring-[#2547E8]'
                    : 'border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] hover:border-[#2547E8]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {issue.severity === 'critical' ? (
                        <ShieldAlert className="h-4 w-4 text-rose-500" />
                      ) : issue.severity === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111217] dark:text-[#F5F7FA]">
                          {issue.message}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[var(--text-muted)]">
                          {issue.category}
                        </span>
                      </div>

                      {issue.nodeIds.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-[var(--text-muted)]">
                          <span>Affected nodes:</span>
                          {issue.nodeIds.map((nid) => (
                            <span
                              key={nid}
                              className="px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[#111217] dark:text-[#F5F7FA]"
                            >
                              {nid}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {issue.suggestedFix && (
                    <button
                      onClick={(e) => handleApplyFix(e, issue)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2547E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                      title={issue.suggestedFix.description}
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>Fix</span>
                      {isBetaSuggestion && (
                        <span
                          data-testid="audit-fix-beta-badge"
                          title="Beta: review the suggested manifest change and verify the rendered result."
                          className="rounded border border-white/40 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                        >
                          Beta
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Critique Disclaimers */}
        <div className="mt-8 p-4 rounded-xl border border-dashed border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#111217] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#62666F] dark:text-[#A8AFBA]">
            <Sparkles className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#879DFF]" />
            <span>AI critique, when configured, appears separately under AI Review and cannot overwrite deterministic audit findings.</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">BYO Provider</span>
        </div>
      </div>
    </div>
  );
}

interface TreeNode {
  id: string;
  children?: TreeNode[];
}

function findNodeInTree(root: TreeNode, targetId: string): boolean {
  if (root.id === targetId) return true;
  if (root.children) {
    for (const child of root.children) {
      if (findNodeInTree(child, targetId)) return true;
    }
  }
  return false;
}
