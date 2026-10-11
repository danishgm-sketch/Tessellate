import type { PrimitiveDef } from './primitives-builder.js';

export const BATCH_3: PrimitiveDef[] = [
  // 31. Drawer
  {
    slug: 'drawer',
    name: 'Drawer',
    description: 'Slide-out side panel for contextual inspections, property editing, or complex drilldowns.',
    categories: ['primitives', 'overlays', 'layout'],
    roles: ['drawer', 'overlay'],
    purposes: ['Property inspector', 'Details side sheet', 'Navigation drawer'],
    componentName: 'Drawer',
    tags: ['drawer', 'panel', 'side-sheet', 'overlay'],
    idealFor: ['Secondary workflows without losing primary screen context'],
    avoidFor: ['Small brief notices (use Toast)'],
    jobs: ['Slide out side inspection panel on trigger'],
    indexCode: `import React from 'react';

export type DrawerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DrawerProps {
  variant?: DrawerVariant;
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function Drawer({
  variant = 'quiet',
  open,
  onClose,
  title,
  children,
  position = 'right',
}: DrawerProps) {
  if (!open) return null;

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  const posClass = position === 'right' ? 'right-0 border-l' : 'left-0 border-r';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-2xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={\`fixed top-0 bottom-0 w-full max-w-md p-6 overflow-y-auto \${posClass} \${theme}\`}>
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm opacity-60 hover:opacity-100">✕</button>
        </div>
        <div className="py-4 text-sm">{children}</div>
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Drawer } from './index.js';

export function DrawerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Inspector Drawer
      </button>
      <Drawer variant="expressive" open={open} onClose={() => setOpen(false)} title="Node Inspector">
        <p className="text-xs text-neutral-600">Properties, overrides, and semantic bindings for selected node.</p>
      </Drawer>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', open: false, title: 'Details' };
export const expressiveFixture = { variant: 'expressive', open: true, title: 'Design DNA Settings' };
export const nocturneFixture = { variant: 'nocturne', open: false, title: 'Metrics' };
`,
    readmeCode: `# Drawer Primitive
Slide-out side panel for contextual inspections, property editing, or complex drilldowns.
`,
  },

  // 32. Bottom Sheet
  {
    slug: 'bottom-sheet',
    name: 'Bottom Sheet',
    description: 'Mobile-first bottom sliding sheet with drag handle bar and responsive snap points.',
    categories: ['primitives', 'overlays'],
    roles: ['bottomsheet', 'sheet', 'mobile'],
    purposes: ['Mobile menus', 'Share sheets', 'Quick actions'],
    componentName: 'BottomSheet',
    tags: ['bottom-sheet', 'mobile', 'drawer', 'sheet'],
    idealFor: ['Touch ergonomics on narrow viewports'],
    avoidFor: ['Desktop widescreen layouts'],
    jobs: ['Slide up bottom sheet with swipe handle'],
    indexCode: `import React from 'react';

export type BottomSheetVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BottomSheetProps {
  variant?: BottomSheetVariant;
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  variant = 'quiet',
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  if (!open) return null;

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-2xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={\`relative w-full max-w-lg rounded-t-3xl border-t p-6 z-10 \${theme}\`}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        {title && <h3 className="text-base font-semibold mb-3">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { BottomSheet } from './index.js';

export function BottomSheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <button onClick={() => setOpen(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow-xs">
        Open Bottom Sheet
      </button>
      <BottomSheet variant="expressive" open={open} onClose={() => setOpen(false)} title="Select Resource Variant">
        <p className="text-xs text-neutral-600">Choose between Quiet, Expressive, and Nocturne presets.</p>
      </BottomSheet>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', open: false };
export const expressiveFixture = { variant: 'expressive', open: true, title: 'Share' };
export const nocturneFixture = { variant: 'nocturne', open: false };
`,
    readmeCode: `# Bottom Sheet Primitive
Mobile-first bottom sliding sheet with drag handle bar and responsive snap points.
`,
  },

  // 33. Toast
  {
    slug: 'toast',
    name: 'Toast',
    description: 'Ephemeral floating notification banner with auto-dismiss timers and action hooks.',
    categories: ['primitives', 'feedback'],
    roles: ['toast', 'alert', 'status'],
    purposes: ['Save success notices', 'Error toasts', 'Undo operation banner'],
    componentName: 'Toast',
    tags: ['toast', 'notification', 'feedback', 'banner'],
    idealFor: ['Non-blocking asynchronous task updates'],
    avoidFor: ['Blocking critical user confirmation requests'],
    jobs: ['Confirm asynchronous operation completion'],
    indexCode: `import React from 'react';

export type ToastVariant = 'quiet' | 'expressive' | 'nocturne';
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  type?: ToastType;
  title: string;
  description?: string;
  onDismiss?: () => void;
}

export function Toast({
  variant = 'quiet',
  type = 'info',
  title,
  description,
  onDismiss,
}: ToastProps) {
  let card = 'bg-white border-neutral-200 text-neutral-900 shadow-xl';
  let dot = 'bg-neutral-900';
  if (type === 'success') dot = 'bg-emerald-500';
  if (type === 'error') dot = 'bg-rose-500';
  if (type === 'warning') dot = 'bg-amber-500';

  if (variant === 'expressive') {
    card = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
    if (type === 'info') dot = 'bg-[#2547E8]';
  } else if (variant === 'nocturne') {
    card = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';
  }

  return (
    <div className={\`flex items-start gap-3 rounded-xl border p-4 max-w-sm \${card}\`}>
      <span className={\`mt-1 h-2 w-2 rounded-full shrink-0 \${dot}\`} />
      <div className="flex-1 space-y-0.5 text-xs">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-neutral-500 leading-relaxed">{description}</p>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-xs opacity-50 hover:opacity-100">✕</button>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { Toast } from './index.js';

export function ToastPreview() {
  return (
    <div className="p-8 flex flex-col gap-3 items-center bg-[#FAF9F6]">
      <Toast variant="expressive" type="success" title="Project Published" description="Your workspace was successfully exported to Cloudflare Pages." />
      <Toast variant="quiet" type="info" title="Checkpoint Saved" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', title: 'Saved' };
export const expressiveFixture = { variant: 'expressive', type: 'success', title: 'Export Ready' };
export const nocturneFixture = { variant: 'nocturne', type: 'error', title: 'Build Failed' };
`,
    readmeCode: `# Toast Primitive
Ephemeral floating notification banner with auto-dismiss timers and action hooks.
`,
  },

  // 34. Inline Alert
  {
    slug: 'inline-alert',
    name: 'Inline Alert',
    description: 'In-page contextual message banner conveying informational, success, warning, or danger states.',
    categories: ['primitives', 'feedback'],
    roles: ['alert', 'banner'],
    purposes: ['Form validation summary', 'Service degradation notices', 'Deprecation warnings'],
    componentName: 'InlineAlert',
    tags: ['inline-alert', 'alert', 'banner', 'warning'],
    idealFor: ['Persistent contextual state messaging embedded inside forms or pages'],
    avoidFor: ['Temporary notifications (use Toast)'],
    jobs: ['Inform user of critical page or section conditions'],
    indexCode: `import React from 'react';

export type InlineAlertVariant = 'quiet' | 'expressive' | 'nocturne';
export type InlineAlertIntent = 'info' | 'success' | 'warning' | 'danger';

export interface InlineAlertProps {
  variant?: InlineAlertVariant;
  intent?: InlineAlertIntent;
  title: string;
  description?: string;
  className?: string;
}

export function InlineAlert({
  variant = 'quiet',
  intent = 'info',
  title,
  description,
  className = '',
}: InlineAlertProps) {
  let theme = 'bg-neutral-50 border-neutral-200 text-neutral-800';
  if (intent === 'success') theme = 'bg-emerald-50 border-emerald-200 text-emerald-900';
  if (intent === 'warning') theme = 'bg-amber-50 border-amber-200 text-amber-900';
  if (intent === 'danger') theme = 'bg-rose-50 border-rose-200 text-rose-900';

  if (variant === 'nocturne') {
    theme = 'bg-[#171A21] border-[#2E3440] text-neutral-200';
    if (intent === 'danger') theme = 'bg-rose-950/40 border-rose-800 text-rose-200';
  }

  return (
    <div className={\`w-full rounded-lg border p-3.5 text-xs space-y-1 \${theme} \${className}\`}>
      <p className="font-semibold">{title}</p>
      {description && <p className="opacity-80 leading-relaxed">{description}</p>}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { InlineAlert } from './index.js';

export function InlineAlertPreview() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-3 bg-[#FAF9F6]">
      <InlineAlert variant="expressive" intent="info" title="Deterministic Composition" description="All layout blueprints are constructed with validated Zod contracts." />
      <InlineAlert variant="quiet" intent="warning" title="Experimental Resource" description="This component has not yet achieved 80 quality score floor." />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', title: 'Note' };
export const expressiveFixture = { variant: 'expressive', intent: 'success', title: 'Validated' };
export const nocturneFixture = { variant: 'nocturne', intent: 'danger', title: 'Crash' };
`,
    readmeCode: `# Inline Alert Primitive
In-page contextual message banner conveying informational, success, warning, or danger states.
`,
  },

  // 35. Badge
  {
    slug: 'badge',
    name: 'Badge',
    description: 'Compact pill indicator for counts, status dots, and metadata taxonomy tags.',
    categories: ['primitives', 'display'],
    roles: ['badge', 'status'],
    purposes: ['Version indicators', 'Resource count badges', 'Status pills'],
    componentName: 'Badge',
    tags: ['badge', 'pill', 'tag', 'status'],
    idealFor: ['Quick quantitative or categorical metadata labeling'],
    avoidFor: ['Clickable actions (use Button or Tag/Chip)'],
    jobs: ['Display compact status or numerical count'],
    indexCode: `import React from 'react';

export type BadgeVariant = 'quiet' | 'expressive' | 'nocturne';
export type BadgeIntent = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  variant?: BadgeVariant;
  intent?: BadgeIntent;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'quiet',
  intent = 'neutral',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  let theme = 'bg-neutral-100 text-neutral-800 border-neutral-200';
  if (intent === 'primary') theme = 'bg-neutral-900 text-white border-neutral-900';
  if (intent === 'success') theme = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (intent === 'danger') theme = 'bg-rose-50 text-rose-700 border-rose-200';

  if (variant === 'expressive') {
    if (intent === 'primary') theme = 'bg-[#E7EBFF] text-[#2547E8] border-[#2547E8]/30 font-semibold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#171A21] text-neutral-300 border-[#2E3440]';
    if (intent === 'primary') theme = 'bg-white text-neutral-950 border-white font-semibold';
  }

  return (
    <span className={\`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none \${theme} \${className}\`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
`,
    previewCode: `import React from 'react';
import { Badge } from './index.js';

export function BadgePreview() {
  return (
    <div className="p-8 flex flex-wrap gap-3 justify-center bg-[#FAF9F6]">
      <Badge variant="quiet">v1.0.0</Badge>
      <Badge variant="expressive" intent="primary" dot>Verified</Badge>
      <Badge variant="expressive" intent="success">Active</Badge>
      <Badge variant="nocturne" intent="primary">Nocturne</Badge>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', children: 'Beta' };
export const expressiveFixture = { variant: 'expressive', intent: 'primary', children: 'New' };
export const nocturneFixture = { variant: 'nocturne', children: 'Production' };
`,
    readmeCode: `# Badge Primitive
Compact pill indicator for counts, status dots, and metadata taxonomy tags.
`,
  },

  // 36. Tag/Chip
  {
    slug: 'tag-chip',
    name: 'Tag Chip',
    description: 'Clickable and removable categorical chip token for multi-criteria filters.',
    categories: ['primitives', 'inputs'],
    roles: ['chip', 'tag', 'control'],
    purposes: ['Filter pills', 'Facet selectors', 'Search tokens'],
    componentName: 'TagChip',
    tags: ['tag-chip', 'chip', 'tag', 'filter'],
    idealFor: ['Active filter criteria and removable selections'],
    avoidFor: ['Non-interactive labels (use Badge)'],
    jobs: ['Represent selected filter token with optional removal'],
    indexCode: `import React from 'react';

export type TagChipVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TagChipProps {
  variant?: TagChipVariant;
  label: string;
  selected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function TagChip({
  variant = 'quiet',
  label,
  selected = false,
  onRemove,
  onClick,
}: TagChipProps) {
  let theme = 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-400';
  if (selected) theme = 'bg-neutral-900 border-neutral-900 text-white';

  if (variant === 'expressive' && selected) {
    theme = 'bg-[#2547E8] border-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne') {
    theme = selected ? 'bg-white text-neutral-950 border-white' : 'bg-[#171A21] border-[#2E3440] text-neutral-300';
  }

  return (
    <div
      onClick={onClick}
      className={\`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs cursor-pointer select-none transition-colors \${theme}\`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75"
        >
          ✕
        </button>
      )}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { TagChip } from './index.js';

export function TagChipPreview() {
  const [selected, setSelected] = useState(true);
  return (
    <div className="p-8 flex gap-3 justify-center bg-[#FAF9F6]">
      <TagChip variant="expressive" label="React 19" selected={selected} onClick={() => setSelected(!selected)} onRemove={() => {}} />
      <TagChip variant="quiet" label="Tailwind 4" selected={false} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', label: 'Dark Mode' };
export const expressiveFixture = { variant: 'expressive', label: 'TypeScript', selected: true };
export const nocturneFixture = { variant: 'nocturne', label: 'WASM' };
`,
    readmeCode: `# Tag Chip Primitive
Clickable and removable categorical chip token for multi-criteria filters.
`,
  },

  // 37. Avatar
  {
    slug: 'avatar',
    name: 'Avatar',
    description: 'Circular user representation displaying profile photography with monogram initial fallback and presence dot.',
    categories: ['primitives', 'display'],
    roles: ['avatar', 'image'],
    purposes: ['User header identity', 'Comment authorship', 'Team members'],
    componentName: 'Avatar',
    tags: ['avatar', 'user', 'profile', 'image'],
    idealFor: ['User presence representation and author credits'],
    avoidFor: ['Generic illustration thumbnails'],
    jobs: ['Display user image or monogram fallback gracefully'],
    indexCode: `import React from 'react';

export type AvatarVariant = 'quiet' | 'expressive' | 'nocturne';
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  variant?: AvatarVariant;
  size?: AvatarSize;
  src?: string;
  alt?: string;
  initials?: string;
  status?: 'online' | 'offline' | 'busy';
}

export function Avatar({
  variant = 'quiet',
  size = 'md',
  src,
  alt = 'User avatar',
  initials = 'TL',
  status,
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  }[size];

  let theme = 'bg-neutral-200 text-neutral-800 border-neutral-300';
  if (variant === 'expressive') theme = 'bg-[#E7EBFF] text-[#2547E8] font-bold border-[#2547E8]/20';
  if (variant === 'nocturne') theme = 'bg-[#171A21] text-neutral-200 border-[#2E3440] font-bold';

  return (
    <div className="relative inline-block">
      <div className={\`flex items-center justify-center rounded-full border overflow-hidden font-medium select-none \${sizeClasses} \${theme}\`}>
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={\`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-950 \${
            status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-rose-500' : 'bg-neutral-400'
          }\`}
        />
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { Avatar } from './index.js';

export function AvatarPreview() {
  return (
    <div className="p-8 flex gap-4 items-center justify-center bg-[#FAF9F6]">
      <Avatar variant="quiet" initials="AL" status="online" size="sm" />
      <Avatar variant="expressive" initials="TL" status="online" size="md" />
      <Avatar variant="nocturne" initials="NC" size="lg" status="busy" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', initials: 'JD' };
export const expressiveFixture = { variant: 'expressive', initials: 'TS', status: 'online' };
export const nocturneFixture = { variant: 'nocturne', initials: 'OX' };
`,
    readmeCode: `# Avatar Primitive
Circular user representation displaying profile photography with monogram initial fallback and presence dot.
`,
  },

  // 38. Avatar Group
  {
    slug: 'avatar-group',
    name: 'Avatar Group',
    description: 'Overlapping clustered avatars with ring separation and excess counter pill (+N).',
    categories: ['primitives', 'display'],
    roles: ['avatargroup', 'team'],
    purposes: ['Collaborator list', 'Assignees strip', 'Customer social proof stack'],
    componentName: 'AvatarGroup',
    tags: ['avatar-group', 'team', 'collaborators', 'cluster'],
    idealFor: ['Displaying multiple contributors in compact horizontal space'],
    avoidFor: ['Dense tabular cells where single names are needed'],
    jobs: ['Stack avatars with clean overlap and excess count'],
    indexCode: `import React from 'react';

export type AvatarGroupVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AvatarGroupProps {
  variant?: AvatarGroupVariant;
  items: Array<{ initials: string; src?: string }>;
  max?: number;
}

export function AvatarGroup({ variant = 'quiet', items, max = 3 }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const excess = items.length - max;

  let ring = 'border-white dark:border-neutral-900';
  if (variant === 'expressive') ring = 'border-[#FAF9F6]';
  if (variant === 'nocturne') ring = 'border-[#0B0D10]';

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((it, idx) => (
        <div
          key={idx}
          className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-neutral-200 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 shadow-xs \${ring}\`}
        >
          {it.initials}
        </div>
      ))}
      {excess > 0 && (
        <div className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 \${ring}\`}>
          +{excess}
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { AvatarGroup } from './index.js';

export function AvatarGroupPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <AvatarGroup
        variant="expressive"
        items={[
          { initials: 'AL' },
          { initials: 'JD' },
          { initials: 'MK' },
          { initials: 'PR' },
          { initials: 'ZW' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', items: [{ initials: 'A' }, { initials: 'B' }] };
export const expressiveFixture = { variant: 'expressive', items: [{ initials: 'X' }, { initials: 'Y' }, { initials: 'Z' }] };
export const nocturneFixture = { variant: 'nocturne', items: [{ initials: '1' }] };
`,
    readmeCode: `# Avatar Group Primitive
Overlapping clustered avatars with ring separation and excess counter pill (+N).
`,
  },

  // 39. Progress Bar
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    description: 'Linear progress meter with determinate percentage progress and indeterminate pulse.',
    categories: ['primitives', 'feedback'],
    roles: ['progressbar', 'progress'],
    purposes: ['File uploads', 'Setup wizards', 'Usage quotas'],
    componentName: 'ProgressBar',
    tags: ['progress-bar', 'progress', 'meter', 'linear'],
    idealFor: ['Step completion status and asynchronous processing'],
    avoidFor: ['Binary states (use Switch)'],
    jobs: ['Visualize quantitative progress towards completion'],
    indexCode: `import React from 'react';

export type ProgressBarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProgressBarProps {
  variant?: ProgressBarVariant;
  value: number;
  max?: number;
  showLabel?: boolean;
}

export function ProgressBar({ variant = 'quiet', value, max = 100, showLabel = false }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let fill = 'bg-neutral-900';
  if (variant === 'expressive') fill = 'bg-[#2547E8]';
  if (variant === 'nocturne') fill = 'bg-white';

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span>Progress</span>
          <span className="font-mono">{percent}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={\`h-full transition-all duration-300 ease-out \${fill}\`}
          style={{ width: \`\${percent}%\` }}
        />
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ProgressBar } from './index.js';

export function ProgressBarPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <ProgressBar variant="expressive" value={68} showLabel />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: 25 };
export const expressiveFixture = { variant: 'expressive', value: 68 };
export const nocturneFixture = { variant: 'nocturne', value: 92 };
`,
    readmeCode: `# Progress Bar Primitive
Linear progress meter with determinate percentage progress and indeterminate pulse.
`,
  },

  // 40. Progress Ring
  {
    slug: 'progress-ring',
    name: 'Progress Ring',
    description: 'Circular radial progress meter with smooth stroke animation and central metric label.',
    categories: ['primitives', 'feedback'],
    roles: ['progress', 'meter', 'radial'],
    purposes: ['Quality scores', 'Storage utilization', 'Task completion'],
    componentName: 'ProgressRing',
    tags: ['progress-ring', 'circle', 'gauge', 'meter'],
    idealFor: ['High density dashboards showing score percentages'],
    avoidFor: ['Long wide progress displays'],
    jobs: ['Display radial completion score in compact square bounds'],
    indexCode: `import React from 'react';

export type ProgressRingVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProgressRingProps {
  variant?: ProgressRingVariant;
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  variant = 'quiet',
  value,
  size = 64,
  strokeWidth = 6,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  let stroke = '#171717';
  if (variant === 'expressive') stroke = '#2547E8';
  if (variant === 'nocturne') stroke = '#FFFFFF';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-200 dark:text-neutral-800"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-xs font-semibold">{value}%</span>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ProgressRing } from './index.js';

export function ProgressRingPreview() {
  return (
    <div className="p-8 flex gap-6 justify-center bg-[#FAF9F6]">
      <ProgressRing variant="quiet" value={45} />
      <ProgressRing variant="expressive" value={82} />
      <ProgressRing variant="nocturne" value={98} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: 50 };
export const expressiveFixture = { variant: 'expressive', value: 85 };
export const nocturneFixture = { variant: 'nocturne', value: 100 };
`,
    readmeCode: `# Progress Ring Primitive
Circular radial progress meter with smooth stroke animation and central metric label.
`,
  },

  // 41. Skeleton
  {
    slug: 'skeleton',
    name: 'Skeleton',
    description: 'Content placeholder animation primitive preventing layout shift during loading.',
    categories: ['primitives', 'feedback'],
    roles: ['skeleton', 'loading'],
    purposes: ['Card placeholders', 'Table row loading', 'Text lines skeleton'],
    componentName: 'Skeleton',
    tags: ['skeleton', 'loading', 'pulse', 'placeholder'],
    idealFor: ['Zero layout shift loading states'],
    avoidFor: ['Interactive elements'],
    jobs: ['Reserve spatial bounds while content loads in background'],
    indexCode: `import React from 'react';

export type SkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

export function Skeleton({ variant = 'quiet', className = 'h-4 w-full' }: SkeletonProps) {
  let theme = 'bg-neutral-200';
  if (variant === 'expressive') theme = 'bg-neutral-200/80';
  if (variant === 'nocturne') theme = 'bg-neutral-800';

  return (
    <div className={\`animate-pulse rounded-md \${theme} \${className}\`} />
  );
}
`,
    previewCode: `import React from 'react';
import { Skeleton } from './index.js';

export function SkeletonPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-3 bg-[#FAF9F6]">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Skeleton Primitive
Content placeholder animation primitive preventing layout shift during loading.
`,
  },

  // 42. Separator
  {
    slug: 'separator',
    name: 'Separator',
    description: 'Clean hairline divider line supporting horizontal and vertical orientations and middle labels.',
    categories: ['primitives', 'layout'],
    roles: ['separator', 'divider'],
    purposes: ['Section break', 'Toolbar divider', 'Modal header separator'],
    componentName: 'Separator',
    tags: ['separator', 'divider', 'hairline', 'line'],
    idealFor: ['Delimiting visual groups with clean hairline tokens'],
    avoidFor: ['Content-bearing structural elements'],
    jobs: ['Divide adjacent visual regions cleanly'],
    indexCode: `import React from 'react';

export type SeparatorVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SeparatorProps {
  variant?: SeparatorVariant;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function Separator({
  variant = 'quiet',
  orientation = 'horizontal',
  label,
  className = '',
}: SeparatorProps) {
  let line = 'bg-neutral-200';
  if (variant === 'expressive') line = 'bg-[#D9D6CF]';
  if (variant === 'nocturne') line = 'bg-[#2E3440]';

  if (orientation === 'vertical') {
    return <div className={\`inline-block h-full w-px \${line} \${className}\`} />;
  }

  if (label) {
    return (
      <div className={\`flex items-center gap-3 w-full \${className}\`}>
        <div className={\`h-px flex-1 \${line}\`} />
        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{label}</span>
        <div className={\`h-px flex-1 \${line}\`} />
      </div>
    );
  }

  return <div className={\`h-px w-full \${line} \${className}\`} />;
}
`,
    previewCode: `import React from 'react';
import { Separator } from './index.js';

export function SeparatorPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <p className="text-xs text-neutral-600">Upper section content</p>
      <Separator variant="expressive" label="OR" />
      <p className="text-xs text-neutral-600">Lower section content</p>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive', label: 'AND' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Separator Primitive
Clean hairline divider line supporting horizontal and vertical orientations and middle labels.
`,
  },

  // 43. Breadcrumb
  {
    slug: 'breadcrumb',
    name: 'Breadcrumb',
    description: 'Hierarchical navigation trail path with customizable separators and accessible current page.',
    categories: ['primitives', 'navigation'],
    roles: ['breadcrumb', 'navigation'],
    purposes: ['Deep folder navigation', 'Settings hierarchy', 'Project drilldown'],
    componentName: 'Breadcrumb',
    tags: ['breadcrumb', 'navigation', 'hierarchy', 'trail'],
    idealFor: ['Multi-level product topologies and nested entity views'],
    avoidFor: ['Flat single-level sites'],
    jobs: ['Display hierarchy path and allow one-click traversal upwards'],
    indexCode: `import React from 'react';

export type BreadcrumbVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  variant?: BreadcrumbVariant;
  items: BreadcrumbItem[];
}

export function Breadcrumb({ variant = 'quiet', items }: BreadcrumbProps) {
  let activeColor = 'text-neutral-900 dark:text-neutral-100 font-semibold';
  if (variant === 'expressive') activeColor = 'text-[#2547E8] font-bold';
  if (variant === 'nocturne') activeColor = 'text-white font-semibold';

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {it.href && !isLast ? (
                <a href={it.href} className="text-neutral-500 hover:text-neutral-900 transition-colors">
                  {it.label}
                </a>
              ) : (
                <span className={activeColor} aria-current={isLast ? 'page' : undefined}>
                  {it.label}
                </span>
              )}
              {!isLast && <span className="opacity-40 select-none">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
`,
    previewCode: `import React from 'react';
import { Breadcrumb } from './index.js';

export function BreadcrumbPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Breadcrumb
        variant="expressive"
        items={[
          { label: 'Workspaces', href: '#' },
          { label: 'Telemetry Hub', href: '#' },
          { label: 'Analytics Screen', current: true },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', items: [{ label: 'Home' }] };
export const expressiveFixture = { variant: 'expressive', items: [{ label: 'App', href: '#' }, { label: 'Settings', current: true }] };
export const nocturneFixture = { variant: 'nocturne', items: [{ label: 'Root' }] };
`,
    readmeCode: `# Breadcrumb Primitive
Hierarchical navigation trail path with customizable separators and accessible current page.
`,
  },

  // 44. Pagination
  {
    slug: 'pagination',
    name: 'Pagination',
    description: 'Page traversal bar with previous/next triggers, page numbering, and ellipsis jumps.',
    categories: ['primitives', 'navigation'],
    roles: ['pagination', 'navigation'],
    purposes: ['Data table paging', 'Search results index', 'Catalog browsing'],
    componentName: 'Pagination',
    tags: ['pagination', 'pager', 'pages', 'navigation'],
    idealFor: ['Navigating large multi-page datasets'],
    avoidFor: ['Infinite scroll feeds'],
    jobs: ['Navigate between numbered dataset pages'],
    indexCode: `import React from 'react';

export type PaginationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PaginationProps {
  variant?: PaginationVariant;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  variant = 'quiet',
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  let active = 'bg-neutral-900 text-white font-semibold';
  if (variant === 'expressive') active = 'bg-[#2547E8] text-white font-semibold shadow-xs';
  if (variant === 'nocturne') active = 'bg-white text-neutral-950 font-semibold shadow-xs';

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={\`h-7 w-7 rounded border transition-colors \${
              isCurrent ? active : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }\`}
          >
            {p}
          </button>
        );
      })}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Next
      </button>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Pagination } from './index.js';

export function PaginationPreview() {
  const [p, setP] = useState(2);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <Pagination variant="expressive" currentPage={p} totalPages={5} onPageChange={setP} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', currentPage: 1, totalPages: 3 };
export const expressiveFixture = { variant: 'expressive', currentPage: 2, totalPages: 5 };
export const nocturneFixture = { variant: 'nocturne', currentPage: 1, totalPages: 10 };
`,
    readmeCode: `# Pagination Primitive
Page traversal bar with previous/next triggers, page numbering, and ellipsis jumps.
`,
  },
];
