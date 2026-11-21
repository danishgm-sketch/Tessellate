import React, { useId, useState } from 'react';

export type ProfileSettingsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProfileSettingsProps {
  variant?: ProfileSettingsVariant;
  onSaveProfile?: (value: { displayName: string; email: string }) => void;
}

export function ProfileSettings({ variant = 'quiet', onSaveProfile }: ProfileSettingsProps) {
  const displayNameId = useId();
  const emailId = useId();
  const [displayName, setDisplayName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex@example.com');
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

  const handleSave = () => {
    onSaveProfile?.({ displayName, email });
    setStatusMessage('Preview only: profile changes saved locally; no account service is connected.');
  };

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-1">Profile Settings</h3>
      <p className={`text-xs mb-6 ${statusColor}`}>Example profile fields (changes stay in this preview).</p>
      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label htmlFor={displayNameId} className="font-semibold block mb-1">
            Display Name
          </label>
          <input
            id={displayNameId}
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className={`w-full p-2.5 rounded-lg border focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:outline-none ${inputBorder}`}
          />
        </div>
        <div>
          <label htmlFor={emailId} className="font-semibold block mb-1">
            Email Address
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`w-full p-2.5 rounded-lg border focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:outline-none ${inputBorder}`}
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-lg font-semibold text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2547E8] ${
            variant === 'nocturne' ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
          }`}
        >
          Save Changes
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
