import type { StateDef } from './states-builder';

export const STATES_BATCH_2: StateDef[] = [
  // 9. Empty Collection State
  {
    slug: 'empty-collection-state',
    name: 'Empty Collection State',
    description: 'Empty inventory or folder state prompting the user to bookmark resources or create their first item collection.',
    categories: ['states', 'empty', 'collection'],
    roles: ['state', 'empty-collection'],
    purposes: ['empty-library', 'collection-creation', 'onboarding'],
    componentName: 'EmptyCollectionState',
    tags: ['empty', 'collection', 'library', 'favorites', 'bookmarks'],
    idealFor: ['Saved components lists', 'Custom project themes', 'Personal resource collections'],
    avoidFor: ['Search failures', 'Permission errors'],
    jobs: ['Inspire users to build collections by browsing the catalog or saving active components'],
    indexCode: `import React from 'react';

export type EmptyCollectionStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptyCollectionStateProps {
  collectionName?: string;
  onCreate?: () => void;
  variant?: EmptyCollectionStateVariant;
  children?: React.ReactNode;
}

export function EmptyCollectionState({
  collectionName = 'Favorites',
  onCreate,
  variant = 'quiet',
  children,
}: EmptyCollectionStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl \${badgeColor}\`}>
        📁
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          Your &ldquo;{collectionName}&rdquo; collection is empty
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Bookmark components, sections, or patterns from the catalog to organize them into reusable design systems.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onCreate}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Explore Catalog Resources
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EmptyCollectionState, EmptyCollectionStateVariant } from './index';

export function EmptyCollectionStatePreview() {
  const [variant, setVariant] = useState<EmptyCollectionStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <EmptyCollectionState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const emptyCollectionStateFixtures = {};`,
    readmeCode: `# Empty Collection State

Zero items feedback encouraging catalog exploration and bookmarking.`,
  },

  // 10. First Run State
  {
    slug: 'first-run-state',
    name: 'First Run State',
    description: 'Onboarding walkthrough card welcoming users on their initial workspace launch with architectural step guides.',
    categories: ['states', 'onboarding', 'first-run'],
    roles: ['state', 'first-run'],
    purposes: ['onboarding-welcome', 'feature-primer', 'new-user-guide'],
    componentName: 'FirstRunState',
    tags: ['onboarding', 'first-run', 'welcome', 'guide', 'steps'],
    idealFor: ['New user signups', 'Fresh CLI project installations', 'Initial workspace boots'],
    avoidFor: ['Returning power users', 'Transient errors'],
    jobs: ['Orient newcomers to the core philosophy and initial actions of the Tessellate workbench'],
    indexCode: `import React from 'react';

export type FirstRunStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FirstRunStateProps {
  onGetStarted?: () => void;
  variant?: FirstRunStateVariant;
  children?: React.ReactNode;
}

export function FirstRunState({ onGetStarted, variant = 'quiet', children }: FirstRunStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-6 transition-colors \${containerBg}\`}>
      <div className="flex items-center gap-3">
        <span className={\`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-lg \${badgeColor}\`}>
          ✨
        </span>
        <div>
          <h3 className="text-xl font-bold tracking-tight">Welcome to Tessellate Workbench</h3>
          <p className="text-xs text-neutral-500">Autonomous interface composition with zero vendor lock-in</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-lg border border-neutral-200/20 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 font-bold">STEP 01</span>
          <h4 className="text-sm font-semibold">Select Design DNA</h4>
          <p className="text-xs text-neutral-500">Calibrate 30 visual tokens from Quiet to Expressive and Nocturne.</p>
        </div>
        <div className="p-4 rounded-lg border border-neutral-200/20 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 font-bold">STEP 02</span>
          <h4 className="text-sm font-semibold">Compose Manifest</h4>
          <p className="text-xs text-neutral-500">Assemble validated screens from 324 open resource components.</p>
        </div>
        <div className="p-4 rounded-lg border border-neutral-200/20 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 font-bold">STEP 03</span>
          <h4 className="text-sm font-semibold">Export Clean Code</h4>
          <p className="text-xs text-neutral-500">Download production React + Tailwind TypeScript source code.</p>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Begin Composition Tour
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FirstRunState, FirstRunStateVariant } from './index';

export function FirstRunStatePreview() {
  const [variant, setVariant] = useState<FirstRunStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <FirstRunState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const firstRunStateFixtures = {};`,
    readmeCode: `# First Run State

Onboarding card welcoming first-time users with structured architectural milestones.`,
  },

  // 11. Offline State
  {
    slug: 'offline-state',
    name: 'Offline State',
    description: 'Local-first offline banner informing the user that cached manifests remain interactive while remote sync is paused.',
    categories: ['states', 'network', 'offline'],
    roles: ['state', 'offline-state'],
    purposes: ['network-status', 'local-first', 'offline-alert'],
    componentName: 'OfflineState',
    tags: ['offline', 'network', 'cached', 'local-first', 'status'],
    idealFor: ['PWA offline modes', 'Airplane travel composing', 'Flaky network alerts'],
    avoidFor: ['Permanent server 500 errors', 'Authentication failures'],
    jobs: ['Reassure users that local guest composition continues uninterrupted without network connection'],
    indexCode: `import React from 'react';

export type OfflineStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OfflineStateProps {
  variant?: OfflineStateVariant;
  children?: React.ReactNode;
}

export function OfflineState({ variant = 'quiet', children }: OfflineStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-amber-50/60 text-amber-950 border-amber-200'
      : 'bg-neutral-50 text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-amber-400 bg-amber-950/40 border-amber-800'
      : variant === 'expressive'
      ? 'text-amber-800 bg-amber-100 border-amber-300'
      : 'text-neutral-700 bg-neutral-200 border-neutral-300';

  return (
    <div
      role="alert"
      className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto flex items-start gap-4 transition-colors \${containerBg}\`}
    >
      <div className={\`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-lg \${badgeColor}\`}>
        📡
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold tracking-tight">
          Working in Local Offline Mode
        </h4>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-lg">
          Your changes are securely saved in browser IndexedDB. Remote cloud synchronization will resume automatically once network connectivity is restored.
        </p>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OfflineState, OfflineStateVariant } from './index';

export function OfflineStatePreview() {
  const [variant, setVariant] = useState<OfflineStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <OfflineState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const offlineStateFixtures = {};`,
    readmeCode: `# Offline State

Local-first banner verifying cached operation while remote sync is paused.`,
  },

  // 12. Connection Lost State
  {
    slug: 'connection-lost-state',
    name: 'Connection Lost State',
    description: 'Active socket or telemetry disconnect alert with automatic reconnect countdown and manual retry button.',
    categories: ['states', 'network', 'connection'],
    roles: ['state', 'connection-lost'],
    purposes: ['socket-disconnect', 'telemetry-reconnect', 'network-recovery'],
    componentName: 'ConnectionLostState',
    tags: ['connection', 'lost', 'reconnect', 'socket', 'retry'],
    idealFor: ['Live collaborative editing sessions', 'Real-time telemetry streams', 'Remote preview bridges'],
    avoidFor: ['Standard 404 page routes', 'Planned maintenance modals'],
    jobs: ['Inform users of active websocket connection dropouts and provide automatic reconnect attempts'],
    indexCode: `import React from 'react';

export type ConnectionLostStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ConnectionLostStateProps {
  countdownSec?: number;
  onRetry?: () => void;
  variant?: ConnectionLostStateVariant;
  children?: React.ReactNode;
}

export function ConnectionLostState({
  countdownSec = 5,
  onRetry,
  variant = 'quiet',
  children,
}: ConnectionLostStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-red-50/50 text-red-950 border-red-200'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-red-400 bg-red-950/40 border-red-800'
      : variant === 'expressive'
      ? 'text-red-700 bg-red-100 border-red-300'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div
      role="alert"
      className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto flex items-start gap-4 transition-colors \${containerBg}\`}
    >
      <div className={\`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-lg \${badgeColor}\`}>
        ⚡
      </div>

      <div className="space-y-2 grow">
        <h4 className="text-base font-bold tracking-tight">
          Telemetry Connection Dropped
        </h4>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
          The real-time preview socket disconnected unexpectedly. Reconnecting automatically in {countdownSec}s...
        </p>

        <div className="pt-1">
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Reconnect Now
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ConnectionLostState, ConnectionLostStateVariant } from './index';

export function ConnectionLostStatePreview() {
  const [variant, setVariant] = useState<ConnectionLostStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <ConnectionLostState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const connectionLostStateFixtures = {};`,
    readmeCode: `# Connection Lost State

WebSocket disconnect alert with reconnect countdown and immediate retry trigger.`,
  },

  // 13. Error State
  {
    slug: 'error-state',
    name: 'Error State',
    description: 'System exception and runtime fault callout with stack diagnosis summary, recovery actions, and error report trigger.',
    categories: ['states', 'feedback', 'error'],
    roles: ['state', 'error-state'],
    purposes: ['runtime-exception', 'diagnostic-feedback', 'error-recovery'],
    componentName: 'ErrorState',
    tags: ['error', 'exception', 'fault', 'recovery', 'alert'],
    idealFor: ['React Error Boundaries', 'API 500 error views', 'Manifest compilation errors'],
    avoidFor: ['Standard validation field warnings', 'Informational empty states'],
    jobs: ['Explain failures with clarity without panicking users, offering direct recovery paths'],
    indexCode: `import React from 'react';

export type ErrorStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ErrorStateProps {
  title?: string;
  errorMessage?: string;
  codeSnippet?: string;
  onRetry?: () => void;
  variant?: ErrorStateVariant;
  children?: React.ReactNode;
}

export function ErrorState({
  title = 'Manifest Compilation Fault',
  errorMessage = 'Resource dependency schema validation failed: missing required property "layoutDNA.density".',
  codeSnippet = 'Error: [ZodError] layoutDNA: density is required',
  onRetry,
  variant = 'quiet',
  children,
}: ErrorStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-red-900/60'
      : variant === 'expressive'
      ? 'bg-red-50/50 text-neutral-900 border-red-200'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-red-400 bg-red-950/40 border-red-800'
      : variant === 'expressive'
      ? 'text-red-700 bg-red-100 border-red-300'
      : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div
      role="alert"
      className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors \${containerBg}\`}
    >
      <div className="flex items-center gap-3">
        <span className={\`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-lg \${badgeColor}\`}>
          ⚠️
        </span>
        <div>
          <h3 className="text-base font-bold tracking-tight text-red-600 dark:text-red-400">
            {title}
          </h3>
          <p className="text-xs text-neutral-500">{errorMessage}</p>
        </div>
      </div>

      {codeSnippet && (
        <pre className="p-3 rounded-lg bg-neutral-950 text-neutral-300 text-xs font-mono overflow-x-auto">
          {codeSnippet}
        </pre>
      )}

      <div className="pt-2 flex gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Retry Operation
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ErrorState, ErrorStateVariant } from './index';

export function ErrorStatePreview() {
  const [variant, setVariant] = useState<ErrorStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <ErrorState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const errorStateFixtures = {};`,
    readmeCode: `# Error State

Runtime exception fault panel with error diagnostics and actionable recovery button.`,
  },

  // 14. Permission Denied State
  {
    slug: 'permission-denied-state',
    name: 'Permission Denied State',
    description: 'Access boundary lock screen detailing required RBAC roles, organization membership, and request access workflow.',
    categories: ['states', 'security', 'permission'],
    roles: ['state', 'permission-denied'],
    purposes: ['rbac-boundary', 'access-denied', 'security-lock'],
    componentName: 'PermissionDeniedState',
    tags: ['permission', 'denied', 'rbac', 'security', 'lock'],
    idealFor: ['Protected team admin settings', 'Private project repositories', 'Restricted billing consoles'],
    avoidFor: ['Standard login authentication errors', 'Public resources'],
    jobs: ['Explain why an operation was blocked by access policies and direct users to request access'],
    indexCode: `import React from 'react';

export type PermissionDeniedStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PermissionDeniedStateProps {
  requiredRole?: string;
  onRequestAccess?: () => void;
  variant?: PermissionDeniedStateVariant;
  children?: React.ReactNode;
}

export function PermissionDeniedState({
  requiredRole = 'Organization Architect',
  onRequestAccess,
  variant = 'quiet',
  children,
}: PermissionDeniedStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl \${badgeColor}\`}>
        🔒
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          Permission Denied
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          You lack authorization to modify this production interface system. Required role: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{requiredRole}</span>.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onRequestAccess}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Request Role Access
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PermissionDeniedState, PermissionDeniedStateVariant } from './index';

export function PermissionDeniedStatePreview() {
  const [variant, setVariant] = useState<PermissionDeniedStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <PermissionDeniedState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const permissionDeniedStateFixtures = {};`,
    readmeCode: `# Permission Denied State

Access control boundary panel specifying required roles and approval requests.`,
  },

  // 15. Success State
  {
    slug: 'success-state',
    name: 'Success State',
    description: 'Completed transaction confirmation panel with verified checkmark, output artifact links, and next step suggestions.',
    categories: ['states', 'feedback', 'success'],
    roles: ['state', 'success-state'],
    purposes: ['task-completed', 'export-success', 'confirmation'],
    componentName: 'SuccessState',
    tags: ['success', 'completed', 'confirmation', 'checkmark', 'done'],
    idealFor: ['Project export completion', 'Cloud checkpoint saves', 'Publishing workflows'],
    avoidFor: ['Pending background queues', 'Incomplete validation forms'],
    jobs: ['Celebrate task completion and deliver immediate access to finished artifacts'],
    indexCode: `import React from 'react';

export type SuccessStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SuccessStateProps {
  title?: string;
  message?: string;
  onViewArtifact?: () => void;
  variant?: SuccessStateVariant;
  children?: React.ReactNode;
}

export function SuccessState({
  title = 'System Export Completed Successfully',
  message = '11 production-ready Vite + React TypeScript files generated with zero external lock-in.',
  onViewArtifact,
  variant = 'quiet',
  children,
}: SuccessStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-emerald-900/50'
      : variant === 'expressive'
      ? 'bg-emerald-50/50 text-neutral-900 border-emerald-200'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800'
      : variant === 'expressive'
      ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl \${badgeColor}\`}>
        ✓
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={onViewArtifact}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          View Exported Files
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SuccessState, SuccessStateVariant } from './index';

export function SuccessStatePreview() {
  const [variant, setVariant] = useState<SuccessStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <SuccessState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const successStateFixtures = {};`,
    readmeCode: `# Success State

Completed transaction confirmation panel with verified artifact links.`,
  },

  // 16. Processing/Queued State
  {
    slug: 'processing-queued-state',
    name: 'Processing/Queued State',
    description: 'Asynchronous task queue state card displaying queue position, estimated wait time, and auto-refresh telemetry.',
    categories: ['states', 'loading', 'queue'],
    roles: ['state', 'processing-queued'],
    purposes: ['async-queue', 'job-status', 'processing-notice'],
    componentName: 'ProcessingQueuedState',
    tags: ['processing', 'queued', 'async', 'waiting', 'job'],
    idealFor: ['Large bundle builds', 'AI fine-tuning jobs', 'Bulk asset optimization runs'],
    avoidFor: ['Synchronous fast API responses', 'Failed jobs'],
    jobs: ['Keep users informed when heavy batch processing has been accepted into an asynchronous worker queue'],
    indexCode: `import React from 'react';

export type ProcessingQueuedStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProcessingQueuedStateProps {
  queuePosition?: number;
  estimatedWait?: string;
  jobId?: string;
  variant?: ProcessingQueuedStateVariant;
  children?: React.ReactNode;
}

export function ProcessingQueuedState({
  queuePosition = 2,
  estimatedWait = '45 seconds',
  jobId = 'job_batch_8992a',
  variant = 'quiet',
  children,
}: ProcessingQueuedStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl animate-pulse \${badgeColor}\`}>
        ⏳
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          Job Queued for Autonomous Processing
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Position in queue: <span className="font-semibold text-neutral-800 dark:text-neutral-200">#{queuePosition}</span> • Estimated wait time: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{estimatedWait}</span>
        </p>
      </div>

      <div className="text-[10px] font-mono text-neutral-400">
        Job ID: {jobId}
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ProcessingQueuedState, ProcessingQueuedStateVariant } from './index';

export function ProcessingQueuedStatePreview() {
  const [variant, setVariant] = useState<ProcessingQueuedStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <ProcessingQueuedState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const processingQueuedStateFixtures = {};`,
    readmeCode: `# Processing/Queued State

Asynchronous task queue state card displaying queue position and estimated wait time.`,
  },
];
