import React, { useId, useState } from 'react';

export type OrganizationSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OrganizationSettingsProps {
  variant?: OrganizationSettingsVariant;
  onUpdateOrganization?: (value: { organizationName: string; customDomain: string }) => void;
}

export function OrganizationSettings({
  variant = 'quiet',
  onUpdateOrganization,
}: OrganizationSettingsProps) {
  const orgNameId = useId();
  const domainId = useId();
  const [organizationName, setOrganizationName] = useState('Acme Systems Ltd');
  const [customDomain, setCustomDomain] = useState('ui.acme.corp');
  const [statusMessage, setStatusMessage] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300 bg-white text-neutral-900';
  let statusColor = 'text-neutral-700';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200 bg-white text-neutral-950';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921] text-white';
    statusColor = 'text-neutral-200';
  }

  const handleSubmit = () => {
    onUpdateOrganization?.({ organizationName, customDomain });
    setStatusMessage('Preview only: organization settings updated locally; no backend is connected.');
  };

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-1">Organization Settings</h3>
      <p className={`text-xs mb-6 ${statusColor}`}>Example workspace fields (changes stay in this preview).</p>
      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label htmlFor={orgNameId} className="font-semibold block mb-1">
            Organization Name
          </label>
          <input
            id={orgNameId}
            type="text"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            className={`w-full p-2.5 rounded-lg border focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:outline-none ${inputBorder}`}
          />
        </div>
        <div>
          <label htmlFor={domainId} className="font-semibold block mb-1">
            Custom Domain
          </label>
          <input
            id={domainId}
            type="text"
            value={customDomain}
            onChange={(event) => setCustomDomain(event.target.value)}
            className={`w-full p-2.5 rounded-lg border font-mono focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:outline-none ${inputBorder}`}
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-5 py-2.5 rounded-lg font-semibold text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2547E8] ${
            variant === 'nocturne' ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
          }`}
        >
          Update Organization
        </button>
        {statusMessage && (
          <p role="status" className={`text-xs ${statusColor}`}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
