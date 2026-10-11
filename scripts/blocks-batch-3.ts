import type { BlockDef } from './blocks-builder.js';

export const BLOCKS_BATCH_3: BlockDef[] = [
  // 37. Settings Navigation
  {
    slug: 'settings-navigation',
    name: 'Settings Navigation',
    description: 'Vertical or horizontal tabs linking administrative sections (Account, Team, Billing, API).',
    categories: ['blocks', 'settings', 'navigation'],
    roles: ['settings', 'navigation'],
    purposes: ['Admin panel routing', 'Preferences switcher'],
    componentName: 'SettingsNavigation',
    tags: ['settings-navigation', 'settings', 'tabs', 'admin'],
    idealFor: ['Settings portals and preferences dashboards'],
    avoidFor: ['Content reading screens'],
    jobs: ['Provide clean tabbed switching across administrative settings panes'],
    indexCode: `import React, { useState } from 'react';

export type SettingsNavigationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SettingsNavigationProps {
  variant?: SettingsNavigationVariant;
}

export function SettingsNavigation({ variant = 'quiet' }: SettingsNavigationProps) {
  const [active, setActive] = useState('Profile');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let activeTab = 'bg-neutral-100 font-semibold';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    activeTab = 'bg-blue-50 text-[#2547E8] font-semibold border-l-2 border-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    activeTab = 'bg-[#151921] text-cyan-400 font-semibold border-l-2 border-cyan-400';
  }

  const sections = ['Profile', 'Organization', 'Team', 'API Keys', 'Billing', 'Audit Log'];

  return (
    <div className={\`w-full p-4 rounded-xl border transition-colors \${bg}\`}>
      <div className="space-y-1 text-xs">
        {sections.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={\`w-full text-left px-3 py-2 rounded-lg transition-colors \${
              active === s ? activeTab : 'opacity-70 hover:opacity-100 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }\`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SettingsNavigation, SettingsNavigationVariant } from './index.js';

export function SettingsNavigationPreview() {
  const [variant, setVariant] = useState<SettingsNavigationVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Settings Navigation Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as SettingsNavigationVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <SettingsNavigation variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const settingsNavigationFixtures = {};`,
    readmeCode: `# Settings Navigation

Navigation menu for administrative settings panels.`,
  },

  // 38. Profile Settings
  {
    slug: 'profile-settings',
    name: 'Profile Settings',
    description: 'User settings form with avatar uploader, display name, handle, and email inputs.',
    categories: ['blocks', 'settings', 'profile'],
    roles: ['settings', 'form'],
    purposes: ['User account preferences', 'Personal identity updates'],
    componentName: 'ProfileSettings',
    tags: ['profile-settings', 'profile', 'form', 'settings'],
    idealFor: ['User account management screens'],
    avoidFor: ['Read-only dashboard statistics'],
    jobs: ['Allow user to update display name, email, and handle'],
    indexCode: `import React from 'react';

export type ProfileSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProfileSettingsProps {
  variant?: ProfileSettingsVariant;
}

export function ProfileSettings({ variant = 'quiet' }: ProfileSettingsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-6">Profile Settings</h3>
      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label className="font-semibold block mb-1">Display Name</label>
          <input
            type="text"
            defaultValue="Alex Morgan"
            className={\`w-full p-2.5 rounded-lg border outline-none \${inputBorder}\`}
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Email Address</label>
          <input
            type="email"
            defaultValue="alex@tessellate.design"
            className={\`w-full p-2.5 rounded-lg border outline-none \${inputBorder}\`}
          />
        </div>
        <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs">
          Save Changes
        </button>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ProfileSettings, ProfileSettingsVariant } from './index.js';

export function ProfileSettingsPreview() {
  const [variant, setVariant] = useState<ProfileSettingsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Profile Settings Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ProfileSettingsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ProfileSettings variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const profileSettingsFixtures = {};`,
    readmeCode: `# Profile Settings

User preferences form managing name, email, and authentication details.`,
  },

  // 39. Organization Settings
  {
    slug: 'organization-settings',
    name: 'Organization Settings',
    description: 'Tenant profile configuration covering workspace domain, branding, and billing email.',
    categories: ['blocks', 'settings', 'organization'],
    roles: ['settings', 'organization'],
    purposes: ['Tenant administration', 'Workspace branding'],
    componentName: 'OrganizationSettings',
    tags: ['organization-settings', 'organization', 'tenant', 'settings'],
    idealFor: ['Multi-tenant organizational controls'],
    avoidFor: ['Individual developer accounts'],
    jobs: ['Configure company-wide workspace slug, logo, and domain'],
    indexCode: `import React from 'react';

export type OrganizationSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OrganizationSettingsProps {
  variant?: OrganizationSettingsVariant;
}

export function OrganizationSettings({ variant = 'quiet' }: OrganizationSettingsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-6">Organization Settings</h3>
      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label className="font-semibold block mb-1">Organization Name</label>
          <input
            type="text"
            defaultValue="Acme Systems Ltd"
            className={\`w-full p-2.5 rounded-lg border outline-none \${inputBorder}\`}
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Custom Domain</label>
          <input
            type="text"
            defaultValue="ui.acme.corp"
            className={\`w-full p-2.5 rounded-lg border font-mono outline-none \${inputBorder}\`}
          />
        </div>
        <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs">
          Update Organization
        </button>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OrganizationSettings, OrganizationSettingsVariant } from './index.js';

export function OrganizationSettingsPreview() {
  const [variant, setVariant] = useState<OrganizationSettingsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Organization Settings Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as OrganizationSettingsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <OrganizationSettings variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const organizationSettingsFixtures = {};`,
    readmeCode: `# Organization Settings

Organization-level configuration managing company name and custom domains.`,
  },

  // 40. Team Management
  {
    slug: 'team-management',
    name: 'Team Management',
    description: 'Member roster with invite link modal, role assignment selects, and removal actions.',
    categories: ['blocks', 'settings', 'team'],
    roles: ['settings', 'team'],
    purposes: ['Team member administration', 'Invitation management'],
    componentName: 'TeamManagement',
    tags: ['team-management', 'team', 'members', 'roles'],
    idealFor: ['Managing team member seats and inviting collaborators'],
    avoidFor: ['Personal unshared projects'],
    jobs: ['Manage workspace members, invite colleagues, and adjust access levels'],
    indexCode: `import React from 'react';

export type TeamManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TeamManagementProps {
  variant?: TeamManagementVariant;
}

export function TeamManagement({ variant = 'quiet' }: TeamManagementProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const members = [
    { name: 'Elena Rostova', email: 'elena@synthetix.cloud', role: 'Owner' },
    { name: 'David Kim', email: 'david@synthetix.cloud', role: 'Editor' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold">Team Members</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border text-xs font-semibold">
          + Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.email} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-[11px] opacity-60 font-mono">{m.email}</div>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TeamManagement, TeamManagementVariant } from './index.js';

export function TeamManagementPreview() {
  const [variant, setVariant] = useState<TeamManagementVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Team Management Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TeamManagementVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <TeamManagement variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const teamManagementFixtures = {};`,
    readmeCode: `# Team Management

Member roster block with role badges and team invitation triggers.`,
  },

  // 41. Role Permissions
  {
    slug: 'role-permissions',
    name: 'Role Permissions',
    description: 'Matrix defining role permissions (Admin, Editor, Viewer) across operations.',
    categories: ['blocks', 'settings', 'permissions'],
    roles: ['settings', 'rbac'],
    purposes: ['Access control matrix', 'Role management'],
    componentName: 'RolePermissions',
    tags: ['role-permissions', 'rbac', 'permissions', 'roles'],
    idealFor: ['Granular access control administration in enterprise software'],
    avoidFor: ['Single-user hobby apps'],
    jobs: ['Map out capability permissions across Owner, Editor, and Viewer roles'],
    indexCode: `import React from 'react';

export type RolePermissionsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RolePermissionsProps {
  variant?: RolePermissionsVariant;
}

export function RolePermissions({ variant = 'quiet' }: RolePermissionsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const perms = [
    { op: 'Mutate DNA Tokens', owner: '✓', editor: '✓', viewer: '—' },
    { op: 'Export Standalone TSX', owner: '✓', editor: '✓', viewer: '✓' },
    { op: 'Rotate API Keys', owner: '✓', editor: '—', viewer: '—' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border text-xs transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-6 font-sans">Role Permission Matrix (RBAC)</h3>
      <table className="w-full text-left font-mono">
        <thead className="border-b border-neutral-200 dark:border-neutral-800 opacity-60 text-[10px] uppercase">
          <tr>
            <th className="py-2">Operation</th>
            <th className="py-2">Owner</th>
            <th className="py-2">Editor</th>
            <th className="py-2">Viewer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
          {perms.map((p) => (
            <tr key={p.op}>
              <td className="py-2.5 font-sans font-semibold">{p.op}</td>
              <td className="py-2.5 text-emerald-600 font-bold">{p.owner}</td>
              <td className="py-2.5">{p.editor}</td>
              <td className="py-2.5 opacity-50">{p.viewer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { RolePermissions, RolePermissionsVariant } from './index.js';

export function RolePermissionsPreview() {
  const [variant, setVariant] = useState<RolePermissionsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Role Permissions Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as RolePermissionsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <RolePermissions variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const rolePermissionsFixtures = {};`,
    readmeCode: `# Role Permissions

RBAC permission matrix charting authorized actions across user roles.`,
  },

  // 42. API Key Management
  {
    slug: 'api-key-management',
    name: 'API Key Management',
    description: 'Secret key manager with generate modal, masked token display, and revocation buttons.',
    categories: ['blocks', 'settings', 'api'],
    roles: ['settings', 'api-keys'],
    purposes: ['Developer credential administration', 'API token management'],
    componentName: 'ApiKeyManagement',
    tags: ['api-key-management', 'api-keys', 'tokens', 'credentials'],
    idealFor: ['Developer portals managing authentication tokens'],
    avoidFor: ['Consumer frontends without API keys'],
    jobs: ['Generate, view, and revoke programmatic developer API keys'],
    indexCode: `import React from 'react';

export type ApiKeyManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApiKeyManagementProps {
  variant?: ApiKeyManagementVariant;
}

export function ApiKeyManagement({ variant = 'quiet' }: ApiKeyManagementProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const keys = [
    { label: 'Production Agent Token', key: 'tess_live_••••••••••••94b2', created: '3d ago' },
    { label: 'Local Development Key', key: 'tess_test_••••••••••••11a0', created: '2w ago' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold">API Tokens</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border text-xs font-semibold">
          + Create New Token
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {keys.map((k) => (
          <div key={k.label} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="font-semibold font-sans">{k.label}</div>
              <div className="text-[11px] opacity-60">{k.key}</div>
            </div>
            <button type="button" className="text-rose-500 hover:underline text-[11px]">
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ApiKeyManagement, ApiKeyManagementVariant } from './index.js';

export function ApiKeyManagementPreview() {
  const [variant, setVariant] = useState<ApiKeyManagementVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">API Key Management Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ApiKeyManagementVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ApiKeyManagement variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const apiKeyManagementFixtures = {};`,
    readmeCode: `# API Key Management

Developer token manager displaying masked secret keys and revocation triggers.`,
  },

  // 43. Webhook Management
  {
    slug: 'webhook-management',
    name: 'Webhook Management',
    description: 'Endpoint destination manager with event subscription triggers and delivery logs.',
    categories: ['blocks', 'settings', 'webhooks'],
    roles: ['settings', 'webhooks'],
    purposes: ['Event delivery endpoints', 'Webhook testing'],
    componentName: 'WebhookManagement',
    tags: ['webhook-management', 'webhooks', 'endpoints', 'events'],
    idealFor: ['Managing outbound event webhooks and endpoint status'],
    avoidFor: ['Standard non-event apps'],
    jobs: ['Configure event subscriptions and test HTTP delivery health'],
    indexCode: `import React from 'react';

export type WebhookManagementVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WebhookManagementProps {
  variant?: WebhookManagementVariant;
}

export function WebhookManagement({ variant = 'quiet' }: WebhookManagementProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const hooks = [
    { url: 'https://api.acme.corp/webhooks/tessellate', status: '200 OK', events: 'project.updated' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold">Configured Webhooks</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border text-xs font-semibold">
          + Add Endpoint
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {hooks.map((h) => (
          <div key={h.url} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="font-semibold">{h.url}</div>
              <span className="text-[10px] opacity-60">Events: {h.events}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { WebhookManagement, WebhookManagementVariant } from './index.js';

export function WebhookManagementPreview() {
  const [variant, setVariant] = useState<WebhookManagementVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Webhook Management Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as WebhookManagementVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <WebhookManagement variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const webhookManagementFixtures = {};`,
    readmeCode: `# Webhook Management

Webhook endpoint manager tracking destination URLs and HTTP response codes.`,
  },

  // 44. Billing Overview
  {
    slug: 'billing-overview',
    name: 'Billing Overview',
    description: 'Subscription status panel with card on file, next invoice date, and plan upgrade trigger.',
    categories: ['blocks', 'settings', 'billing'],
    roles: ['settings', 'billing'],
    purposes: ['Invoice administration', 'Subscription management'],
    componentName: 'BillingOverview',
    tags: ['billing-overview', 'billing', 'invoices', 'subscription'],
    idealFor: ['Subscription overview and card-on-file management'],
    avoidFor: ['Pre-commercial open source projects'],
    jobs: ['Show current subscription plan, payment card, and invoice date'],
    indexCode: `import React from 'react';

export type BillingOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BillingOverviewProps {
  variant?: BillingOverviewVariant;
}

export function BillingOverview({ variant = 'quiet' }: BillingOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-4">Subscription & Billing</h3>
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex justify-between items-center mb-6 text-xs">
        <div>
          <span className="font-bold">Team Pro Subscription</span>
          <div className="text-[11px] opacity-60">Renews on Nov 1, 2026 • £18/month</div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold font-mono">ACTIVE</span>
      </div>
      <button type="button" className="px-4 py-2 rounded-lg border text-xs font-semibold">
        Update Payment Method
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { BillingOverview, BillingOverviewVariant } from './index.js';

export function BillingOverviewPreview() {
  const [variant, setVariant] = useState<BillingOverviewVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Billing Overview Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as BillingOverviewVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <BillingOverview variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const billingOverviewFixtures = {};`,
    readmeCode: `# Billing Overview

Subscription panel detailing active billing cycle, plan status, and payment method.`,
  },

  // 45. Usage Overview
  {
    slug: 'usage-overview',
    name: 'Usage Overview',
    description: 'Quota progress bars tracking API calls, active seats, and cloud storage capacity.',
    categories: ['blocks', 'settings', 'usage'],
    roles: ['settings', 'usage'],
    purposes: ['Quota tracking', 'Resource limit monitoring'],
    componentName: 'UsageOverview',
    tags: ['usage-overview', 'usage', 'quotas', 'limits'],
    idealFor: ['Displaying consumption quotas against plan limits'],
    avoidFor: ['Unlimited local operations'],
    jobs: ['Map out consumption progress bars against hard tier ceilings'],
    indexCode: `import React from 'react';

export type UsageOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface UsageOverviewProps {
  variant?: UsageOverviewVariant;
}

export function UsageOverview({ variant = 'quiet' }: UsageOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const quotas = [
    { label: 'Cloud Checkpoints', used: '18 / 50', pct: '36%' },
    { label: 'Monthly AST Compilations', used: '14,200 / 50,000', pct: '28%' },
    { label: 'Active Developer Seats', used: '4 / 10', pct: '40%' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-6">Quota Utilization</h3>
      <div className="space-y-4">
        {quotas.map((q) => (
          <div key={q.label} className="space-y-1 text-xs">
            <div className="flex justify-between font-medium">
              <span>{q.label}</span>
              <span className="font-mono opacity-70">{q.used}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div style={{ width: q.pct }} className="h-full bg-neutral-900 dark:bg-white rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { UsageOverview, UsageOverviewVariant } from './index.js';

export function UsageOverviewPreview() {
  const [variant, setVariant] = useState<UsageOverviewVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Usage Overview Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as UsageOverviewVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <UsageOverview variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const usageOverviewFixtures = {};`,
    readmeCode: `# Usage Overview

Quota consumption block illustrating resource usage against plan limits.`,
  },

  // 46. Onboarding Checklist
  {
    slug: 'onboarding-checklist',
    name: 'Onboarding Checklist',
    description: 'Checklist guide with completion progress bar helping new users complete first tasks.',
    categories: ['blocks', 'onboarding', 'checklist'],
    roles: ['onboarding', 'checklist'],
    purposes: ['User activation', 'Product orientation'],
    componentName: 'OnboardingChecklist',
    tags: ['onboarding-checklist', 'onboarding', 'checklist', 'tasks'],
    idealFor: ['New user workspaces and activation flows'],
    avoidFor: ['Experienced power-user settings'],
    jobs: ['Guide first-time users through initial setup milestones'],
    indexCode: `import React, { useState } from 'react';

export type OnboardingChecklistVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OnboardingChecklistProps {
  variant?: OnboardingChecklistVariant;
}

export function OnboardingChecklist({ variant = 'quiet' }: OnboardingChecklistProps) {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Inspect Design DNA tokens', done: true },
    { id: 2, title: 'Compose your first shell and section', done: true },
    { id: 3, title: 'Export clean React source code', done: false },
  ]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const toggle = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-2">Getting Started with Tessellate</h3>
      <p className="text-xs opacity-75 mb-6">Complete these quick steps to master the composition engine.</p>
      <div className="space-y-3">
        {tasks.map((t) => (
          <label key={t.id} className="flex items-center gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
              className="cursor-pointer"
            />
            <span className={t.done ? 'line-through opacity-50' : 'font-medium'}>{t.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OnboardingChecklist, OnboardingChecklistVariant } from './index.js';

export function OnboardingChecklistPreview() {
  const [variant, setVariant] = useState<OnboardingChecklistVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Onboarding Checklist Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as OnboardingChecklistVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <OnboardingChecklist variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const onboardingChecklistFixtures = {};`,
    readmeCode: `# Onboarding Checklist

Interactive checklist tracking activation progress for new developers.`,
  },

  // 47. Onboarding Wizard
  {
    slug: 'onboarding-wizard',
    name: 'Onboarding Wizard',
    description: 'Multi-step guided setup wizard with progress bar and next/previous controls.',
    categories: ['blocks', 'onboarding', 'wizard'],
    roles: ['onboarding', 'wizard'],
    purposes: ['Multi-step initial configuration', 'Guided setup'],
    componentName: 'OnboardingWizard',
    tags: ['onboarding-wizard', 'wizard', 'steps', 'onboarding'],
    idealFor: ['First-time workspace setup requiring 3+ consecutive choices'],
    avoidFor: ['Quick single-action modals'],
    jobs: ['Walk user sequentially through initial project configuration steps'],
    indexCode: `import React, { useState } from 'react';

export type OnboardingWizardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OnboardingWizardProps {
  variant?: OnboardingWizardVariant;
}

export function OnboardingWizard({ variant = 'quiet' }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border text-center transition-colors \${bg}\`}>
      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block mb-2">Step {step} of 3</span>
      <h3 className="text-base font-bold mb-4">
        {step === 1 && 'Name Your Project'}
        {step === 2 && 'Select Visual DNA Theme'}
        {step === 3 && 'Configure Initial Layout Shell'}
      </h3>
      <p className="text-xs opacity-75 max-w-sm mx-auto mb-8">
        {step === 1 && 'Give your project a clean identifier for local persistence.'}
        {step === 2 && 'Choose between Quiet (Editorial), Expressive (Vibrant), or Nocturne (Obsidian).'}
        {step === 3 && 'Pick a top navigation bar or two-pane application shell to start.'}
      </p>

      <div className="flex justify-center gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-lg border text-xs">
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Continue →
          </button>
        ) : (
          <button type="button" onClick={() => setStep(1)} className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
            Finish Setup
          </button>
        )}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OnboardingWizard, OnboardingWizardVariant } from './index.js';

export function OnboardingWizardPreview() {
  const [variant, setVariant] = useState<OnboardingWizardVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Onboarding Wizard Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as OnboardingWizardVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <OnboardingWizard variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const onboardingWizardFixtures = {};`,
    readmeCode: `# Onboarding Wizard

Sequential step-by-step wizard guiding users through initial setup.`,
  },

  // 48. Onboarding Role Select
  {
    slug: 'onboarding-role-select',
    name: 'Onboarding Role Select',
    description: 'Role segmentation card picker (Engineer, Designer, Agent Architect, Founder).',
    categories: ['blocks', 'onboarding', 'segmentation'],
    roles: ['onboarding', 'role-select'],
    purposes: ['User persona personalization', 'Tailored onboarding'],
    componentName: 'OnboardingRoleSelect',
    tags: ['onboarding-role-select', 'roles', 'segmentation', 'onboarding'],
    idealFor: ['Personalizing workspace initial state by user archetype'],
    avoidFor: ['Fixed single-persona products'],
    jobs: ['Allow new user to pick their professional role for custom defaults'],
    indexCode: `import React, { useState } from 'react';

export type OnboardingRoleSelectVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OnboardingRoleSelectProps {
  variant?: OnboardingRoleSelectVariant;
}

export function OnboardingRoleSelect({ variant = 'quiet' }: OnboardingRoleSelectProps) {
  const [selected, setSelected] = useState('Engineer');

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const roles = [
    { title: 'Engineer', desc: 'Prioritize raw TSX export & MCP agent tooling.' },
    { title: 'Product Designer', desc: 'Focus on Design DNA & visual harmony.' },
    { title: 'Autonomous Agent', desc: 'Provide JSON schemas & OpenAPI docs.' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border text-center transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-2">How will you use Tessellate?</h3>
      <p className="text-xs opacity-75 mb-6">Select your primary role to configure default tools.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roles.map((r) => (
          <div
            key={r.title}
            onClick={() => setSelected(r.title)}
            className={\`p-4 rounded-xl border text-left cursor-pointer transition-all \${
              selected === r.title ? 'border-neutral-900 dark:border-white ring-1 ring-current' : 'border-neutral-200 dark:border-neutral-800 opacity-70'
            }\`}
          >
            <div className="font-bold text-xs mb-1">{r.title}</div>
            <p className="text-[11px] opacity-75">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { OnboardingRoleSelect, OnboardingRoleSelectVariant } from './index.js';

export function OnboardingRoleSelectPreview() {
  const [variant, setVariant] = useState<OnboardingRoleSelectVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Onboarding Role Select Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as OnboardingRoleSelectVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <OnboardingRoleSelect variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const onboardingRoleSelectFixtures = {};`,
    readmeCode: `# Onboarding Role Select

Role-based persona selection cards tailoring initial workspace defaults.`,
  },

  // 49. Import Data Flow
  {
    slug: 'import-data-flow',
    name: 'Import Data Flow',
    description: 'File drag-and-drop ingestion card supporting schema upload and progress indicators.',
    categories: ['blocks', 'onboarding', 'import'],
    roles: ['import', 'upload'],
    purposes: ['Manifest ingestion', 'Schema file upload'],
    componentName: 'ImportDataFlow',
    tags: ['import-data-flow', 'import', 'upload', 'drag-drop'],
    idealFor: ['Drag-and-drop file import for manifests and projects'],
    avoidFor: ['Standard form text entry'],
    jobs: ['Provide drop zone for uploading project.json or schema files'],
    indexCode: `import React from 'react';

export type ImportDataFlowVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ImportDataFlowProps {
  variant?: ImportDataFlowVariant;
}

export function ImportDataFlow({ variant = 'quiet' }: ImportDataFlowProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let dropzone = 'border-dashed border-neutral-300 bg-neutral-50/50';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    dropzone = 'border-dashed border-blue-300 bg-blue-50/30';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    dropzone = 'border-dashed border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border text-center transition-colors \${bg}\`}>
      <h3 className="text-base font-bold mb-2">Import Project or Manifest</h3>
      <p className="text-xs opacity-75 mb-6">Drop a project.json or resource schema to open in Workbench.</p>

      <div className={\`p-8 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer \${dropzone}\`}>
        <span className="font-mono text-xl mb-2">↑</span>
        <span className="font-semibold text-xs mb-1">Drag and drop file here</span>
        <span className="text-[11px] opacity-60">Supports JSON schema version 1.0.0</span>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ImportDataFlow, ImportDataFlowVariant } from './index.js';

export function ImportDataFlowPreview() {
  const [variant, setVariant] = useState<ImportDataFlowVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Import Data Flow Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ImportDataFlowVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ImportDataFlow variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const importDataFlowFixtures = {};`,
    readmeCode: `# Import Data Flow

Drag-and-drop file ingestion zone for importing project manifests.`,
  },

  // 50. Empty Workspace
  {
    slug: 'empty-workspace',
    name: 'Empty Workspace',
    description: 'Empty state placeholder card with welcoming illustration and primary create action.',
    categories: ['blocks', 'onboarding', 'empty'],
    roles: ['empty-state', 'workspace'],
    purposes: ['Zero-data illustration', 'First action invitation'],
    componentName: 'EmptyWorkspace',
    tags: ['empty-workspace', 'empty-state', 'placeholder', 'first-action'],
    idealFor: ['New workspaces with zero created projects'],
    avoidFor: ['Populated data tables'],
    jobs: ['Welcome user to empty workspace with create CTA'],
    indexCode: `import React from 'react';

export type EmptyWorkspaceVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptyWorkspaceProps {
  variant?: EmptyWorkspaceVariant;
}

export function EmptyWorkspace({ variant = 'quiet' }: EmptyWorkspaceProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-12 rounded-xl border text-center flex flex-col items-center justify-center transition-colors \${bg}\`}>
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg mb-4 opacity-75">
        ✧
      </div>
      <h3 className="text-base font-bold mb-2">No Projects Found</h3>
      <p className="text-xs opacity-75 max-w-sm mb-6">
        Start by creating a new composition or choose from 12 pre-built blueprints.
      </p>
      <button type="button" className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
        + Create New Project
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EmptyWorkspace, EmptyWorkspaceVariant } from './index.js';

export function EmptyWorkspacePreview() {
  const [variant, setVariant] = useState<EmptyWorkspaceVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Empty Workspace Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as EmptyWorkspaceVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <EmptyWorkspace variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const emptyWorkspaceFixtures = {};`,
    readmeCode: `# Empty Workspace

Empty-state container welcoming user with create project trigger.`,
  },

  // 51. Upgrade Prompt
  {
    slug: 'upgrade-prompt',
    name: 'Upgrade Prompt',
    description: 'In-app upgrade callout card presenting locked feature benefits and upgrade trigger.',
    categories: ['blocks', 'onboarding', 'upgrade'],
    roles: ['upgrade', 'prompt'],
    purposes: ['In-app tier expansion', 'Feature discovery'],
    componentName: 'UpgradePrompt',
    tags: ['upgrade-prompt', 'upgrade', 'pro', 'cta'],
    idealFor: ['Gracefully prompting users when they encounter enterprise features'],
    avoidFor: ['Aggressive blocking modal spam'],
    jobs: ['Explain benefits of cloud team synchronization without hard barriers'],
    indexCode: `import React from 'react';

export type UpgradePromptVariant = 'quiet' | 'expressive' | 'nocturne';

export interface UpgradePromptProps {
  variant?: UpgradePromptVariant;
}

export function UpgradePrompt({ variant = 'quiet' }: UpgradePromptProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-r from-blue-50/60 to-purple-50/40 text-neutral-950 border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#151921] text-white border-cyan-500/30';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors \${bg}\`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm">Unlock Cloud Team Checkpoints</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">TEAM PRO</span>
        </div>
        <p className="text-xs opacity-75">Sync projects across devices and collaborate with unlimited teammates.</p>
      </div>
      <button type="button" className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold whitespace-nowrap">
        Upgrade Now →
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { UpgradePrompt, UpgradePromptVariant } from './index.js';

export function UpgradePromptPreview() {
  const [variant, setVariant] = useState<UpgradePromptVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Upgrade Prompt Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as UpgradePromptVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <UpgradePrompt variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const upgradePromptFixtures = {};`,
    readmeCode: `# Upgrade Prompt

In-app upgrade banner explaining benefits of team cloud sync.`,
  },

  // 52. Messaging Thread
  {
    slug: 'messaging-thread',
    name: 'Messaging Thread',
    description: 'Conversation stream with speech bubbles, timestamp markers, and quick input bar.',
    categories: ['blocks', 'collaboration', 'messaging'],
    roles: ['collaboration', 'chat'],
    purposes: ['Team communication', 'Agent chat interface'],
    componentName: 'MessagingThread',
    tags: ['messaging-thread', 'chat', 'messaging', 'thread'],
    idealFor: ['Collaboration sidebars and AI agent conversational channels'],
    avoidFor: ['Standard non-conversational reports'],
    jobs: ['Render message bubbles with avatars and reply input'],
    indexCode: `import React, { useState } from 'react';

export type MessagingThreadVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MessagingThreadProps {
  variant?: MessagingThreadVariant;
}

export function MessagingThread({ variant = 'quiet' }: MessagingThreadProps) {
  const [text, setText] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let bubbleMe = 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';
  const bubbleOther = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    bubbleMe = 'bg-[#2547E8] text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    bubbleMe = 'bg-cyan-500 text-black font-semibold';
  }

  const messages = [
    { sender: 'Elena', text: 'Checked the new Nocturne tokens. Contrast passes AA across all buttons.', isMe: false },
    { sender: 'You', text: 'Great. Merging into canonical registry now.', isMe: true },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border flex flex-col justify-between min-h-[300px] transition-colors \${bg}\`}>
      <div className="space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={\`flex flex-col \${m.isMe ? 'items-end' : 'items-start'}\`}>
            <span className="text-[10px] opacity-50 mb-1">{m.sender}</span>
            <div className={\`p-3 rounded-xl text-xs max-w-xs \${m.isMe ? bubbleMe : bubbleOther}\`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setText(''); }} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply to thread..."
          className="w-full p-2.5 rounded-lg border text-xs outline-none bg-transparent border-neutral-300 dark:border-neutral-700"
        />
        <button type="submit" className="px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
          Send
        </button>
      </form>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MessagingThread, MessagingThreadVariant } from './index.js';

export function MessagingThreadPreview() {
  const [variant, setVariant] = useState<MessagingThreadVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Messaging Thread Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as MessagingThreadVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <MessagingThread variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const messagingThreadFixtures = {};`,
    readmeCode: `# Messaging Thread

Conversational chat bubble thread supporting team discussions and AI dialogues.`,
  },

  // 53. Conversation List
  {
    slug: 'conversation-list',
    name: 'Conversation List',
    description: 'Channel and direct message thread list with unread counters and presence badges.',
    categories: ['blocks', 'collaboration', 'channels'],
    roles: ['collaboration', 'channel-list'],
    purposes: ['Messaging channel navigation', 'Inbox list'],
    componentName: 'ConversationList',
    tags: ['conversation-list', 'channels', 'chat', 'inbox'],
    idealFor: ['Collaboration sidebars and chat client channel lists'],
    avoidFor: ['Standard documentation articles'],
    jobs: ['List direct message threads and channels with unread counts'],
    indexCode: `import React from 'react';

export type ConversationListVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ConversationListProps {
  variant?: ConversationListVariant;
}

export function ConversationList({ variant = 'quiet' }: ConversationListProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const channels = [
    { name: '# general-architecture', unread: 0 },
    { name: '# design-dna-tokens', unread: 3 },
    { name: '# agent-mcp-stream', unread: 12 },
  ];

  return (
    <div className={\`w-full p-4 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-xs font-bold uppercase text-neutral-500 mb-3 px-2">Channels</h3>
      <div className="space-y-1 text-xs">
        {channels.map((c) => (
          <div key={c.name} className="px-3 py-2 rounded-lg flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <span className="font-medium">{c.name}</span>
            {c.unread > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
                {c.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ConversationList, ConversationListVariant } from './index.js';

export function ConversationListPreview() {
  const [variant, setVariant] = useState<ConversationListVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Conversation List Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ConversationListVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ConversationList variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const conversationListFixtures = {};`,
    readmeCode: `# Conversation List

Channel and conversation list with unread counter badges.`,
  },

  // 54. Approval Queue
  {
    slug: 'approval-queue',
    name: 'Approval Queue',
    description: 'Decision workflow queue with Approve/Reject actions and reason commentary.',
    categories: ['blocks', 'collaboration', 'approval'],
    roles: ['workflow', 'approval'],
    purposes: ['Change request reviews', 'Approval workflows'],
    componentName: 'ApprovalQueue',
    tags: ['approval-queue', 'approval', 'review', 'workflow'],
    idealFor: ['Review queues for pull requests, token changes, and publishing'],
    avoidFor: ['Standard read-only logs'],
    jobs: ['Present pending approvals with one-click Approve/Reject controls'],
    indexCode: `import React from 'react';

export type ApprovalQueueVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApprovalQueueProps {
  variant?: ApprovalQueueVariant;
}

export function ApprovalQueue({ variant = 'quiet' }: ApprovalQueueProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const items = [
    { title: 'Publish Revision 1.0.4', submitter: 'Agent Antigravity', time: '14m ago' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Pending Approvals (1)</h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-[11px] opacity-60">Submitted by {it.submitter} • {it.time}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1.5 rounded border text-rose-500 font-semibold">
                Reject
              </button>
              <button type="button" className="px-3 py-1.5 rounded bg-emerald-600 text-white font-semibold">
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ApprovalQueue, ApprovalQueueVariant } from './index.js';

export function ApprovalQueuePreview() {
  const [variant, setVariant] = useState<ApprovalQueueVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Approval Queue Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as ApprovalQueueVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <ApprovalQueue variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const approvalQueueFixtures = {};`,
    readmeCode: `# Approval Queue

Decision queue providing Approve and Reject action triggers for workflow reviews.`,
  },

  // 55. Task Detail
  {
    slug: 'task-detail',
    name: 'Task Detail',
    description: 'Detailed issue view with assignee dropdown, status selector, priority tag, and subtasks.',
    categories: ['blocks', 'collaboration', 'task'],
    roles: ['task', 'detail'],
    purposes: ['Task inspection', 'Ticket editing'],
    componentName: 'TaskDetail',
    tags: ['task-detail', 'task', 'ticket', 'issue'],
    idealFor: ['Task and issue tracking detail views'],
    avoidFor: ['Small notification strips'],
    jobs: ['Inspect and edit task metadata, assignee, and priority'],
    indexCode: `import React from 'react';

export type TaskDetailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TaskDetailProps {
  variant?: TaskDetailVariant;
}

export function TaskDetail({ variant = 'quiet' }: TaskDetailProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono opacity-60 uppercase">TASK-1048</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">IN PROGRESS</span>
      </div>
      <h2 className="text-base sm:text-lg font-bold mb-3">Scale 56 Application Blocks</h2>
      <p className="text-xs opacity-75 leading-relaxed mb-6">
        Ensure every block implements Quiet, Expressive, and Nocturne variants with 0 external dependencies.
      </p>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <div>
          <span className="opacity-50 text-[10px] block">Assignee</span>
          <span className="font-bold">Antigravity Agent</span>
        </div>
        <div>
          <span className="opacity-50 text-[10px] block">Priority</span>
          <span className="font-bold text-amber-500">P0 Urgent</span>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TaskDetail, TaskDetailVariant } from './index.js';

export function TaskDetailPreview() {
  const [variant, setVariant] = useState<TaskDetailVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Task Detail Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as TaskDetailVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <TaskDetail variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const taskDetailFixtures = {};`,
    readmeCode: `# Task Detail

Task detail view presenting assignee, status, and priority metadata.`,
  },

  // 56. Workflow Builder
  {
    slug: 'workflow-builder',
    name: 'Workflow Builder',
    description: 'Node-based visual automation flow designer linking triggers, conditions, and actions.',
    categories: ['blocks', 'collaboration', 'workflow'],
    roles: ['workflow', 'builder'],
    purposes: ['Visual automation pipelines', 'Trigger-action logic'],
    componentName: 'WorkflowBuilder',
    tags: ['workflow-builder', 'workflow', 'automation', 'nodes'],
    idealFor: ['Visual automation pipeline builders and trigger-action flows'],
    avoidFor: ['Simple flat task lists'],
    jobs: ['Map out trigger nodes connecting to conditional actions in a visual pipeline'],
    indexCode: `import React from 'react';

export type WorkflowBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkflowBuilderProps {
  variant?: WorkflowBuilderVariant;
}

export function WorkflowBuilder({ variant = 'quiet' }: WorkflowBuilderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let node = 'border-neutral-200 bg-neutral-50/60 font-mono text-xs';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    node = 'border-blue-200 bg-white shadow-2xs font-mono text-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    node = 'border-[#2E3440] bg-[#151921] font-mono text-xs';
  }

  const nodes = [
    { type: 'TRIGGER', title: 'On Manifest Change' },
    { type: 'CONDITION', title: 'Quality >= 80' },
    { type: 'ACTION', title: 'Emit Clean TSX Bundle' },
  ];

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-6">Automation Pipeline</h3>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {nodes.map((n, i) => (
          <React.Fragment key={n.title}>
            <div className={\`p-4 rounded-xl border text-center w-full sm:w-auto \${node}\`}>
              <span className="text-[10px] font-bold opacity-50 block mb-1 uppercase">{n.type}</span>
              <span className="font-semibold">{n.title}</span>
            </div>
            {i < nodes.length - 1 && (
              <span className="text-neutral-400 font-bold rotate-90 sm:rotate-0">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { WorkflowBuilder, WorkflowBuilderVariant } from './index.js';

export function WorkflowBuilderPreview() {
  const [variant, setVariant] = useState<WorkflowBuilderVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Workflow Builder Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as WorkflowBuilderVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <WorkflowBuilder variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const workflowBuilderFixtures = {};`,
    readmeCode: `# Workflow Builder

Visual automation pipeline connecting trigger nodes with conditional execution actions.`,
  },
];
