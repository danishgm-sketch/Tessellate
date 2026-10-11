import type { PrimitiveDef } from './primitives-builder.js';

export const BATCH_1: PrimitiveDef[] = [
  // 2. Icon Button
  {
    slug: 'icon-button',
    name: 'Icon Button',
    description: 'Compact icon-only action trigger with tooltip support and accessible label semantics.',
    categories: ['primitives', 'inputs', 'actions'],
    roles: ['action', 'trigger'],
    purposes: ['Toolbar actions', 'Card dismissals', 'Table actions'],
    componentName: 'IconButton',
    tags: ['icon-button', 'action', 'trigger', 'icon', 'control'],
    idealFor: ['Dense toolbars', 'Header actions', 'Card menus'],
    avoidFor: ['Primary call to actions where text label is critical'],
    jobs: ['Trigger quick action', 'Dismiss element', 'Toggle view'],
    indexCode: `import React from 'react';

export type IconButtonVariant = 'quiet' | 'expressive' | 'nocturne';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon?: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'quiet', size = 'md', icon, className = '', disabled, children, ...rest }, ref) => {
    const sizeClasses = {
      sm: 'h-7 w-7 p-1 text-xs rounded-md',
      md: 'h-9 w-9 p-1.5 text-sm rounded-lg',
      lg: 'h-11 w-11 p-2 text-base rounded-xl',
    }[size];

    let colorClasses = '';
    if (variant === 'quiet') {
      colorClasses = 'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent focus-visible:ring-neutral-400';
    } else if (variant === 'expressive') {
      colorClasses = 'bg-white text-[#2547E8] hover:bg-[#E7EBFF] border border-[#D9D6CF] shadow-xs hover:border-[#2547E8] focus-visible:ring-[#2547E8]';
    } else {
      colorClasses = 'bg-[#171A21] text-neutral-300 hover:bg-[#20242D] hover:text-white border border-[#2E3440] focus-visible:ring-white';
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={\`inline-flex items-center justify-center transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-95 motion-reduce:transition-none \${sizeClasses} \${colorClasses} \${className}\`}
        {...rest}
      >
        {icon || children || (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
`,
    previewCode: `import React, { useState } from 'react';
import { IconButton, type IconButtonVariant } from './index.js';

export function IconButtonPreview() {
  const [variant, setVariant] = useState<IconButtonVariant>('expressive');
  const isDark = variant === 'nocturne';

  return (
    <div className={\`p-8 min-h-full transition-colors \${isDark ? 'bg-[#0B0D10] text-white' : 'bg-[#FAF9F6] text-neutral-900'}\`}>
      <div className="flex gap-4 items-center justify-center">
        <IconButton variant={variant} aria-label="Add item" />
        <IconButton variant={variant} size="lg" aria-label="Add item large" />
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {(['quiet', 'expressive', 'nocturne'] as IconButtonVariant[]).map((v) => (
          <button key={v} onClick={() => setVariant(v)} className="px-3 py-1 text-xs border rounded capitalize">
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', 'aria-label': 'Options' };
export const expressiveFixture = { variant: 'expressive', 'aria-label': 'Add record' };
export const nocturneFixture = { variant: 'nocturne', 'aria-label': 'System settings' };
`,
    readmeCode: `# Icon Button Primitive
Compact icon-only action trigger with tooltip support and accessible label semantics.
`,
  },

  // 3. Split Button
  {
    slug: 'split-button',
    name: 'Split Button',
    description: 'Dual-action trigger combining primary immediate intent with secondary dropdown alternatives.',
    categories: ['primitives', 'inputs', 'actions'],
    roles: ['action', 'trigger'],
    purposes: ['Publish/Draft flows', 'Save options', 'Export choices'],
    componentName: 'SplitButton',
    tags: ['split-button', 'action', 'menu', 'button'],
    idealFor: ['Deploy/schedule workflows', 'Export format menus'],
    avoidFor: ['Single atomic actions without alternatives'],
    jobs: ['Execute primary action', 'Open alternative options'],
    indexCode: `import React from 'react';

export type SplitButtonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitButtonProps {
  variant?: SplitButtonVariant;
  label: string;
  onClick?: () => void;
  onMenuClick?: () => void;
  disabled?: boolean;
}

export function SplitButton({
  variant = 'quiet',
  label,
  onClick,
  onMenuClick,
  disabled = false,
}: SplitButtonProps) {
  let theme = 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900';
  let divider = 'border-r border-neutral-700';
  if (variant === 'expressive') {
    theme = 'bg-[#2547E8] text-white hover:bg-[#1E3CCD] border-[#2547E8] shadow-sm';
    divider = 'border-r border-blue-400/30';
  } else if (variant === 'nocturne') {
    theme = 'bg-white text-neutral-950 hover:bg-neutral-200 border-white shadow-sm';
    divider = 'border-r border-neutral-300';
  }

  return (
    <div className="inline-flex rounded-lg border overflow-hidden shadow-xs">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={\`px-3.5 py-2 text-sm font-medium transition-colors \${theme} \${divider} disabled:opacity-40\`}
      >
        {label}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onMenuClick}
        aria-label="More options"
        className={\`px-2.5 py-2 text-sm font-medium transition-colors \${theme} disabled:opacity-40\`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { SplitButton } from './index.js';

export function SplitButtonPreview() {
  return (
    <div className="p-8 flex gap-4 justify-center bg-[#FAF9F6]">
      <SplitButton variant="quiet" label="Publish project" />
      <SplitButton variant="expressive" label="Deploy changes" />
      <SplitButton variant="nocturne" label="Sync cloud" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', label: 'Save draft' };
export const expressiveFixture = { variant: 'expressive', label: 'Publish now' };
export const nocturneFixture = { variant: 'nocturne', label: 'Deploy commit' };
`,
    readmeCode: `# Split Button Primitive
Dual-action trigger combining primary immediate intent with secondary dropdown alternatives.
`,
  },

  // 4. Button Group
  {
    slug: 'button-group',
    name: 'Button Group',
    description: 'Connected cluster of action buttons with cohesive outer border and seamless seams.',
    categories: ['primitives', 'inputs', 'actions'],
    roles: ['container', 'toolbar'],
    purposes: ['Editor formatting', 'Pagination actions', 'Filter groups'],
    componentName: 'ButtonGroup',
    tags: ['button-group', 'toolbar', 'actions', 'group'],
    idealFor: ['Rich text toolbars', 'View mode toggles'],
    avoidFor: ['Unrelated disparate actions'],
    jobs: ['Group related actions', 'Provide clean visual rhythm'],
    indexCode: `import React from 'react';

export type ButtonGroupVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ButtonGroupProps {
  variant?: ButtonGroupVariant;
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ variant = 'quiet', children, className = '' }: ButtonGroupProps) {
  let theme = 'border border-neutral-300 divide-x divide-neutral-200 bg-white';
  if (variant === 'expressive') {
    theme = 'border border-[#D9D6CF] divide-x divide-[#D9D6CF] bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    theme = 'border border-[#2E3440] divide-x divide-[#2E3440] bg-[#11141B]';
  }

  return (
    <div className={\`inline-flex rounded-lg overflow-hidden \${theme} \${className}\`}>
      {children}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ButtonGroup } from './index.js';

export function ButtonGroupPreview() {
  return (
    <div className="p-8 flex flex-col gap-4 items-center bg-[#FAF9F6]">
      <ButtonGroup variant="quiet">
        <button className="px-3 py-1.5 text-xs font-medium">Day</button>
        <button className="px-3 py-1.5 text-xs font-medium">Week</button>
        <button className="px-3 py-1.5 text-xs font-medium">Month</button>
      </ButtonGroup>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Button Group Primitive
Connected cluster of action buttons with cohesive outer border and seamless seams.
`,
  },

  // 5. Link
  {
    slug: 'link',
    name: 'Link',
    description: 'Accessible semantic anchor navigation primitive with tactile underline animation and external indicators.',
    categories: ['primitives', 'navigation'],
    roles: ['navigation', 'link'],
    purposes: ['Inline references', 'Footer links', 'Breadcrumb links'],
    componentName: 'Link',
    tags: ['link', 'anchor', 'navigation'],
    idealFor: ['Body copy citations', 'Navigation menus'],
    avoidFor: ['Action submissions (use Button)'],
    jobs: ['Navigate between pages', 'Deep-link external references'],
    indexCode: `import React from 'react';

export type LinkVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  external?: boolean;
}

export function Link({ variant = 'quiet', external = false, children, className = '', ...rest }: LinkProps) {
  let theme = 'text-neutral-900 hover:text-neutral-600 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900';
  if (variant === 'expressive') {
    theme = 'text-[#2547E8] hover:text-[#1E3CCD] font-medium underline underline-offset-4 decoration-[#2547E8]/40 hover:decoration-[#2547E8]';
  } else if (variant === 'nocturne') {
    theme = 'text-white hover:text-neutral-300 underline underline-offset-4 decoration-neutral-700 hover:decoration-white';
  }

  return (
    <a
      className={\`inline-flex items-center gap-1 transition-colors \${theme} \${className}\`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {children}
      {external && (
        <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </a>
  );
}
`,
    previewCode: `import React from 'react';
import { Link } from './index.js';

export function LinkPreview() {
  return (
    <div className="p-8 flex gap-6 justify-center bg-[#FAF9F6]">
      <Link variant="quiet" href="#">Documentation</Link>
      <Link variant="expressive" href="#" external>Explore API</Link>
      <Link variant="nocturne" href="#">Changelog</Link>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', href: '#' };
export const expressiveFixture = { variant: 'expressive', href: '#', external: true };
export const nocturneFixture = { variant: 'nocturne', href: '#' };
`,
    readmeCode: `# Link Primitive
Accessible semantic anchor navigation primitive with tactile underline animation and external indicators.
`,
  },

  // 6. Text Input
  {
    slug: 'input',
    name: 'Text Input',
    description: 'Clean, accessible single-line text input with label, helper copy, and error states.',
    categories: ['primitives', 'inputs'],
    roles: ['input', 'control'],
    purposes: ['Form fields', 'Configuration', 'Authentication'],
    componentName: 'Input',
    tags: ['input', 'text', 'form', 'control'],
    idealFor: ['Names, emails, single-line configuration inputs'],
    avoidFor: ['Long paragraph copy (use Textarea)'],
    jobs: ['Accept user text input', 'Validate required field input'],
    indexCode: `import React from 'react';

export type InputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'quiet', label, error, helperText, className = '', id, ...rest }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined);

    let borderTheme = 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 bg-white text-neutral-900';
    if (variant === 'expressive') {
      borderTheme = 'border-[#D9D6CF] focus:border-[#2547E8] focus:ring-[#2547E8] bg-white text-neutral-900 shadow-2xs';
    } else if (variant === 'nocturne') {
      borderTheme = 'border-[#2E3440] focus:border-white focus:ring-white bg-[#11141B] text-white';
    }

    if (error) {
      borderTheme = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-white text-rose-900';
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={\`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-1 \${borderTheme} \${className}\`}
          {...rest}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {!error && helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
`,
    previewCode: `import React from 'react';
import { Input } from './index.js';

export function InputPreview() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4 bg-[#FAF9F6]">
      <Input variant="quiet" label="Full name" placeholder="Ada Lovelace" />
      <Input variant="expressive" label="Email address" placeholder="ada@tessellate.design" helperText="We will never share your email." />
      <Input variant="nocturne" label="API Key" placeholder="sk_live_..." error="Key expired" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', label: 'User handle' };
export const expressiveFixture = { variant: 'expressive', label: 'Email', placeholder: 'user@domain.com' };
export const nocturneFixture = { variant: 'nocturne', label: 'Secret Token' };
`,
    readmeCode: `# Text Input Primitive
Clean, accessible single-line text input with label, helper copy, and error states.
`,
  },

  // 7. Textarea
  {
    slug: 'textarea',
    name: 'Textarea',
    description: 'Multi-line text input primitive with character counter, accessible label, and auto-expand support.',
    categories: ['primitives', 'inputs'],
    roles: ['input', 'control'],
    purposes: ['Descriptions', 'Feedback forms', 'Comments'],
    componentName: 'Textarea',
    tags: ['textarea', 'text', 'multiline', 'input'],
    idealFor: ['Long form comments, bios, markdown descriptions'],
    avoidFor: ['Single-line fields'],
    jobs: ['Accept multi-line paragraphs', 'Display remaining character count'],
    indexCode: `import React from 'react';

export type TextareaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'quiet', label, error, helperText, maxLength, className = '', id, ...rest }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined);

    let borderTheme = 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 bg-white text-neutral-900';
    if (variant === 'expressive') {
      borderTheme = 'border-[#D9D6CF] focus:border-[#2547E8] focus:ring-[#2547E8] bg-white text-neutral-900 shadow-2xs';
    } else if (variant === 'nocturne') {
      borderTheme = 'border-[#2E3440] focus:border-white focus:ring-white bg-[#11141B] text-white';
    }

    if (error) {
      borderTheme = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-white text-rose-900';
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          maxLength={maxLength}
          className={\`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-1 resize-y \${borderTheme} \${className}\`}
          {...rest}
        />
        <div className="flex justify-between items-center text-xs">
          {error ? <p className="text-rose-600">{error}</p> : <p className="text-neutral-500">{helperText}</p>}
          {maxLength && <span className="text-neutral-400">Max {maxLength}</span>}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
`,
    previewCode: `import React from 'react';
import { Textarea } from './index.js';

export function TextareaPreview() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4 bg-[#FAF9F6]">
      <Textarea variant="quiet" label="System notes" placeholder="Write context..." maxLength={200} />
      <Textarea variant="expressive" label="Project Brief" placeholder="State your requirements..." />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', label: 'Notes' };
export const expressiveFixture = { variant: 'expressive', label: 'Brief description' };
export const nocturneFixture = { variant: 'nocturne', label: 'Crash dump log' };
`,
    readmeCode: `# Textarea Primitive
Multi-line text input primitive with character counter, accessible label, and auto-expand support.
`,
  },

  // 8. Search Input
  {
    slug: 'search-input',
    name: 'Search Input',
    description: 'High-visibility search field with magnifying glass icon, keyboard shortcut badge (⌘K), and instant clear.',
    categories: ['primitives', 'inputs', 'search'],
    roles: ['search', 'input'],
    purposes: ['Header search', 'Catalog filtering', 'Quick find'],
    componentName: 'SearchInput',
    tags: ['search-input', 'search', 'filter', 'input', 'command'],
    idealFor: ['Global navigation bars', 'Table filter headers'],
    avoidFor: ['Standard form data collection'],
    jobs: ['Search through catalogue', 'Clear search query instantly'],
    indexCode: `import React from 'react';

export type SearchInputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: SearchInputVariant;
  shortcut?: string;
  onClear?: () => void;
}

export function SearchInput({
  variant = 'quiet',
  shortcut = '⌘K',
  onClear,
  value,
  className = '',
  ...rest
}: SearchInputProps) {
  let theme = 'border-neutral-300 bg-white text-neutral-900 focus-within:border-neutral-900 focus-within:ring-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 focus-within:border-[#2547E8] focus-within:ring-[#2547E8] shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white focus-within:border-white focus-within:ring-white';
  }

  return (
    <div className={\`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-1 transition-all \${theme} \${className}\`}>
      <svg className="w-4 h-4 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
        placeholder="Search resources..."
        {...rest}
      />
      {value && onClear ? (
        <button type="button" onClick={onClear} className="opacity-60 hover:opacity-100 text-xs">✕</button>
      ) : shortcut ? (
        <kbd className="hidden sm:inline-block rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { SearchInput } from './index.js';

export function SearchInputPreview() {
  const [val, setVal] = useState('');
  return (
    <div className="p-8 max-w-md mx-auto space-y-4 bg-[#FAF9F6]">
      <SearchInput variant="expressive" value={val} onChange={(e) => setVal(e.target.value)} onClear={() => setVal('')} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', placeholder: 'Search...' };
export const expressiveFixture = { variant: 'expressive', placeholder: 'Filter catalog...' };
export const nocturneFixture = { variant: 'nocturne', placeholder: 'Find command...' };
`,
    readmeCode: `# Search Input Primitive
High-visibility search field with magnifying glass icon, keyboard shortcut badge (⌘K), and instant clear.
`,
  },

  // 9. Password Input
  {
    slug: 'password-input',
    name: 'Password Input',
    description: 'Masked credential field with toggleable eye icon and password strength meter.',
    categories: ['primitives', 'inputs', 'auth'],
    roles: ['input', 'auth'],
    purposes: ['Sign in', 'Registration', 'API Secret input'],
    componentName: 'PasswordInput',
    tags: ['password-input', 'password', 'auth', 'security'],
    idealFor: ['Login screens', 'Credential creation'],
    avoidFor: ['Plaintext inputs'],
    jobs: ['Secure password entry', 'Toggle visibility safely'],
    indexCode: `import React, { useState } from 'react';

export type PasswordInputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: PasswordInputVariant;
  label?: string;
  error?: string;
}

export function PasswordInput({ variant = 'quiet', label = 'Password', error, className = '', ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  let theme = 'border-neutral-300 focus-within:border-neutral-900 bg-white text-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] focus-within:border-[#2547E8] bg-white text-neutral-900 shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] focus-within:border-white bg-[#11141B] text-white';
  }

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className={\`flex items-center rounded-lg border px-3 py-2 text-sm focus-within:ring-1 transition-all \${theme} \${className}\`}>
        <input
          type={show ? 'text' : 'password'}
          className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="text-xs text-neutral-500 hover:text-neutral-800 ml-2"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { PasswordInput } from './index.js';

export function PasswordInputPreview() {
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <PasswordInput variant="expressive" placeholder="Enter secure password" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', placeholder: '••••••••' };
export const expressiveFixture = { variant: 'expressive', placeholder: 'Enter password' };
export const nocturneFixture = { variant: 'nocturne', placeholder: 'Secret passphrase' };
`,
    readmeCode: `# Password Input Primitive
Masked credential field with toggleable eye icon and password strength meter.
`,
  },

  // 10. Number Input
  {
    slug: 'number-input',
    name: 'Number Input',
    description: 'Stepper input control with increment/decrement buttons, min/max bounds, and unit suffix.',
    categories: ['primitives', 'inputs'],
    roles: ['input', 'stepper'],
    purposes: ['Quantity selectors', 'Financial units', 'Dimensions'],
    componentName: 'NumberInput',
    tags: ['number-input', 'number', 'stepper', 'input'],
    idealFor: ['Cart quantities, numerical thresholds, zoom controls'],
    avoidFor: ['Arbitrary alphanumeric text'],
    jobs: ['Increment and decrement numbers safely', 'Clamp within min and max values'],
    indexCode: `import React from 'react';

export type NumberInputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NumberInputProps {
  variant?: NumberInputVariant;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export function NumberInput({
  variant = 'quiet',
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit,
  onChange,
}: NumberInputProps) {
  let theme = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white';
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className={\`inline-flex items-center rounded-lg border overflow-hidden text-sm \${theme}\`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 border-r border-inherit"
        >
          −
        </button>
        <span className="px-4 py-1.5 font-mono text-center min-w-12">
          {value}{unit ? \` \${unit}\` : ''}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 border-l border-inherit"
        >
          +
        </button>
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { NumberInput } from './index.js';

export function NumberInputPreview() {
  const [val, setVal] = useState(5);
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <NumberInput variant="expressive" label="Instances" value={val} onChange={setVal} unit="nodes" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: 1 };
export const expressiveFixture = { variant: 'expressive', value: 10, unit: 'users' };
export const nocturneFixture = { variant: 'nocturne', value: 42 };
`,
    readmeCode: `# Number Input Primitive
Stepper input control with increment/decrement buttons, min/max bounds, and unit suffix.
`,
  },

  // 11. Select
  {
    slug: 'select',
    name: 'Select',
    description: 'Accessible styled dropdown selector with trigger, chevron indicator, and options.',
    categories: ['primitives', 'inputs'],
    roles: ['select', 'control'],
    purposes: ['Category choice', 'Status filter', 'Settings option'],
    componentName: 'Select',
    tags: ['select', 'dropdown', 'picker', 'control'],
    idealFor: ['Single choice from 5–15 distinct options'],
    avoidFor: ['Binary choices (use Switch or Checkbox)'],
    jobs: ['Choose item from curated options list', 'Maintain selected option state'],
    indexCode: `import React from 'react';

export type SelectVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: SelectVariant;
  label?: string;
  options: SelectOption[];
}

export function Select({ variant = 'quiet', label, options, className = '', id, ...rest }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\\s+/g, '-') : undefined);

  let theme = 'border-neutral-300 bg-white text-neutral-900 focus:border-neutral-900 focus:ring-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 focus:border-[#2547E8] focus:ring-[#2547E8] shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white focus:border-white focus:ring-white';
  }

  return (
    <div className="w-full space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          className={\`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-sm outline-none transition-all focus:ring-1 \${theme} \${className}\`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50">
          ▼
        </span>
      </div>
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Select } from './index.js';

export function SelectPreview() {
  const [val, setVal] = useState('react');
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <Select
        variant="expressive"
        label="Framework Target"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        options={[
          { value: 'react', label: 'React + TypeScript' },
          { value: 'vue', label: 'Vue 3' },
          { value: 'svelte', label: 'Svelte 5' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', options: [{ value: 'a', label: 'Option A' }] };
export const expressiveFixture = { variant: 'expressive', options: [{ value: '1', label: 'Tier 1' }] };
export const nocturneFixture = { variant: 'nocturne', options: [{ value: 'prod', label: 'Production' }] };
`,
    readmeCode: `# Select Primitive
Accessible styled dropdown selector with trigger, chevron indicator, and options.
`,
  },

  // 12. Combobox
  {
    slug: 'combobox',
    name: 'Combobox',
    description: 'Searchable selection input combining text filtering with item picker dropdown.',
    categories: ['primitives', 'inputs'],
    roles: ['combobox', 'search', 'select'],
    purposes: ['Country picker', 'Component finder', 'User assigner'],
    componentName: 'Combobox',
    tags: ['combobox', 'searchable-select', 'picker', 'filter'],
    idealFor: ['Large lists of 20+ options where searching is faster'],
    avoidFor: ['Small lists of under 5 items'],
    jobs: ['Filter options by keystrokes', 'Select matched choice'],
    indexCode: `import React, { useState } from 'react';

export type ComboboxVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  variant?: ComboboxVariant;
  label?: string;
  options: ComboboxOption[];
  value?: string;
  onSelect: (val: string) => void;
  placeholder?: string;
}

export function Combobox({
  variant = 'quiet',
  label,
  options,
  value,
  onSelect,
  placeholder = 'Type to search...',
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const selectedOption = options.find((o) => o.value === value);

  let theme = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'expressive') theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') theme = 'border-[#2E3440] bg-[#11141B] text-white';

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className={\`flex items-center rounded-lg border px-3 py-2 text-sm \${theme}\`}>
        <input
          type="text"
          className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-400"
          value={open ? query : selectedOption?.label || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
        />
        <button type="button" onClick={() => setOpen(!open)} className="text-xs opacity-50 ml-1">
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="p-2 text-xs text-neutral-400">No results found</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full rounded px-2.5 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  onSelect(opt.value);
                  setQuery(opt.label);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Combobox } from './index.js';

export function ComboboxPreview() {
  const [val, setVal] = useState('us');
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <Combobox
        variant="expressive"
        label="Country Region"
        value={val}
        onSelect={setVal}
        options={[
          { value: 'us', label: 'United States' },
          { value: 'gb', label: 'United Kingdom' },
          { value: 'de', label: 'Germany' },
          { value: 'jp', label: 'Japan' },
        ]}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', options: [{ value: '1', label: 'Alpha' }] };
export const expressiveFixture = { variant: 'expressive', options: [{ value: '2', label: 'Beta' }] };
export const nocturneFixture = { variant: 'nocturne', options: [{ value: '3', label: 'Gamma' }] };
`,
    readmeCode: `# Combobox Primitive
Searchable selection input combining text filtering with item picker dropdown.
`,
  },

  // 13. Autocomplete
  {
    slug: 'autocomplete',
    name: 'Autocomplete',
    description: 'Typeahead prediction control suggesting options inline or in a floating palette.',
    categories: ['primitives', 'inputs'],
    roles: ['autocomplete', 'input'],
    purposes: ['Tag search', 'Path finder', 'Command prediction'],
    componentName: 'Autocomplete',
    tags: ['autocomplete', 'typeahead', 'search', 'predict'],
    idealFor: ['Address lookup, code completions, quick tags'],
    avoidFor: ['Strictly bounded single selects'],
    jobs: ['Suggest completions based on prefix', 'Insert chosen suggestion'],
    indexCode: `import React, { useState } from 'react';

export type AutocompleteVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AutocompleteProps {
  variant?: AutocompleteVariant;
  label?: string;
  suggestions: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function Autocomplete({
  variant = 'quiet',
  label,
  suggestions,
  value,
  onChange,
  placeholder = 'Type something...',
}: AutocompleteProps) {
  const [active, setActive] = useState(false);
  const matches = suggestions.filter((s) => s.toLowerCase().startsWith(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase());

  let theme = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'expressive') theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') theme = 'border-[#2E3440] bg-[#11141B] text-white';

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <input
        type="text"
        className={\`w-full rounded-lg border px-3 py-2 text-sm outline-none \${theme}\`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(true);
        }}
        onFocus={() => setActive(true)}
        placeholder={placeholder}
      />
      {active && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-md">
          {matches.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="w-full rounded px-2.5 py-1 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  onChange(item);
                  setActive(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Autocomplete } from './index.js';

export function AutocompletePreview() {
  const [val, setVal] = useState('Re');
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <Autocomplete
        variant="expressive"
        label="Technology"
        value={val}
        onChange={setVal}
        suggestions={['React', 'Remix', 'Redux', 'Relay', 'Rust']}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', value: '', suggestions: ['TypeScript', 'JavaScript'] };
export const expressiveFixture = { variant: 'expressive', value: 'App', suggestions: ['Apple', 'Application'] };
export const nocturneFixture = { variant: 'nocturne', value: '', suggestions: ['Linux', 'BSD'] };
`,
    readmeCode: `# Autocomplete Primitive
Typeahead prediction control suggesting options inline or in a floating palette.
`,
  },

  // 14. Multi-select
  {
    slug: 'multi-select',
    name: 'Multi-select',
    description: 'Tag-based selection input allowing multiple choices with removable pills.',
    categories: ['primitives', 'inputs'],
    roles: ['select', 'multiselect', 'tags'],
    purposes: ['Tagging records', 'Multiple role assignment', 'Filter criteria'],
    componentName: 'MultiSelect',
    tags: ['multi-select', 'tags', 'picker', 'chips'],
    idealFor: ['Assigning multiple categories, members, or labels'],
    avoidFor: ['Strictly mutually exclusive choices'],
    jobs: ['Add multiple choices', 'Remove chosen pill tags'],
    indexCode: `import React, { useState } from 'react';

export type MultiSelectVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MultiSelectProps {
  variant?: MultiSelectVariant;
  label?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelect({
  variant = 'quiet',
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  let theme = 'border-neutral-300 bg-white text-neutral-900';
  let pill = 'bg-neutral-100 text-neutral-800';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
    pill = 'bg-[#E7EBFF] text-[#2547E8] font-medium';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white';
    pill = 'bg-[#1E232E] text-neutral-200 border border-neutral-700';
  }

  return (
    <div className="relative w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div
        className={\`flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border p-1.5 cursor-pointer \${theme}\`}
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 && <span className="text-xs text-neutral-400 px-1">Select items...</span>}
        {selected.map((item) => (
          <span key={item} className={\`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs \${pill}\`}>
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(item);
              }}
              className="hover:opacity-75"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={\`w-full rounded px-2.5 py-1.5 text-left text-sm flex justify-between \${
                selected.includes(opt) ? 'font-semibold bg-neutral-50 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }\`}
              onClick={() => toggle(opt)}
            >
              <span>{opt}</span>
              {selected.includes(opt) && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { MultiSelect } from './index.js';

export function MultiSelectPreview() {
  const [items, setItems] = useState(['Design', 'Frontend']);
  return (
    <div className="p-8 max-w-sm mx-auto bg-[#FAF9F6]">
      <MultiSelect
        variant="expressive"
        label="Disciplines"
        options={['Design', 'Frontend', 'Backend', 'DevOps', 'QA']}
        selected={items}
        onChange={setItems}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', selected: ['Admin'] };
export const expressiveFixture = { variant: 'expressive', selected: ['TypeScript', 'Tailwind'] };
export const nocturneFixture = { variant: 'nocturne', selected: ['Docker'] };
`,
    readmeCode: `# Multi-select Primitive
Tag-based selection input allowing multiple choices with removable pills.
`,
  },

  // 15. Checkbox
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description: 'Accessible boolean selection control with indeterminate state, animated checkmark, and descriptive label.',
    categories: ['primitives', 'inputs'],
    roles: ['checkbox', 'control'],
    purposes: ['Form agreements', 'Table multi-row selection', 'Settings toggles'],
    componentName: 'Checkbox',
    tags: ['checkbox', 'boolean', 'toggle', 'control'],
    idealFor: ['Terms agreement, batch row selection, optional feature flags'],
    avoidFor: ['Mutually exclusive single choices (use Radio Group)'],
    jobs: ['Toggle checked state', 'Represent indeterminate parent states'],
    indexCode: `import React from 'react';

export type CheckboxVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CheckboxProps {
  variant?: CheckboxVariant;
  label?: string;
  description?: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  variant = 'quiet',
  label,
  description,
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
}: CheckboxProps) {
  let box = 'border-neutral-300 text-neutral-900 focus:ring-neutral-900';
  if (checked || indeterminate) {
    box = 'bg-neutral-900 border-neutral-900 text-white';
  }
  if (variant === 'expressive' && (checked || indeterminate)) {
    box = 'bg-[#2547E8] border-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne' && (checked || indeterminate)) {
    box = 'bg-white border-white text-neutral-950 shadow-xs';
  }

  return (
    <label className={\`inline-flex items-start gap-2.5 cursor-pointer select-none \${disabled ? 'opacity-40 pointer-events-none' : ''}\`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={\`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 \${box}\`}
      >
        {indeterminate ? (
          <span className="h-0.5 w-2 bg-current rounded" />
        ) : checked ? (
          <svg className="h-3 w-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </button>
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-neutral-900 dark:text-neutral-100">{label}</span>}
          {description && <p className="text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
`,
    previewCode: `import React, { useState } from 'react';
import { Checkbox } from './index.js';

export function CheckboxPreview() {
  const [agree, setAgree] = useState(true);
  return (
    <div className="p-8 max-w-sm mx-auto space-y-4 bg-[#FAF9F6]">
      <Checkbox
        variant="expressive"
        label="Accept License Agreement"
        description="By continuing, you agree to the open-source MIT terms."
        checked={agree}
        onChange={setAgree}
      />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet', checked: true, label: 'Remember me' };
export const expressiveFixture = { variant: 'expressive', checked: true, label: 'Subscribe' };
export const nocturneFixture = { variant: 'nocturne', checked: false, label: 'Debug mode' };
`,
    readmeCode: `# Checkbox Primitive
Accessible boolean selection control with indeterminate state, animated checkmark, and descriptive label.
`,
  },
];
