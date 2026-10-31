import React from 'react';

export type AppSidebarExpandedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarLink {
  label: string;
  href?: string;
  active?: boolean;
}

export interface AppSidebarExpandedProps {
  variant?: AppSidebarExpandedVariant;
  workspaceLinks?: AppSidebarLink[];
  settingsLinks?: AppSidebarLink[];
}

const defaultWorkspaceLinks: AppSidebarLink[] = [
  { label: 'Dashboard', active: true },
  { label: 'Telemetry' },
  { label: 'Composition Engine' },
];
const defaultSettingsLinks: AppSidebarLink[] = [{ label: 'Design DNA' }, { label: 'API Tokens' }];

export function AppSidebarExpanded({
  variant = 'quiet',
  workspaceLinks = defaultWorkspaceLinks,
  settingsLinks = defaultSettingsLinks,
}: AppSidebarExpandedProps) {
  let theme = 'bg-white border-r border-neutral-200 text-neutral-900';
  let active = 'bg-neutral-100 font-semibold';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-900';
    active = 'bg-[#E7EBFF] text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-white';
    active = 'bg-[#1E232E] text-white font-semibold';
  }

  const renderLink = (link: AppSidebarLink) => {
    const className = `block px-2.5 py-1.5 rounded-lg ${link.active ? active : 'opacity-70 hover:opacity-100'}`;
    return link.href ? (
      <a key={link.label} href={link.href} aria-current={link.active ? 'page' : undefined} className={className}>{link.label}</a>
    ) : (
      <span key={link.label} aria-current={link.active ? 'page' : undefined} className={className}>{link.label}</span>
    );
  };

  return (
    <aside className={`w-60 h-screen flex flex-col p-4 gap-6 text-xs ${theme}`}>
      <div className="font-semibold text-sm px-2">Tessellate Console</div>
      <div className="space-y-4 flex-1">
        <div className="space-y-1">
          <p className="px-2 text-[10px] uppercase font-bold text-neutral-400">Workspace</p>
          {workspaceLinks.map(renderLink)}
        </div>
        <div className="space-y-1">
          <p className="px-2 text-[10px] uppercase font-bold text-neutral-400">Settings</p>
          {settingsLinks.map(renderLink)}
        </div>
      </div>
    </aside>
  );
}
