import React from 'react';

export type LogoCloudMarqueeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LogoCloudMarqueeProps {
  variant?: LogoCloudMarqueeVariant;
  logos?: string[];
}

export function LogoCloudMarquee({
  variant = 'quiet',
  logos = ['Vercel', 'Stripe', 'Linear', 'Raycast', 'OpenAI', 'Anthropic', 'Supabase', 'Cloudflare'],
}: LogoCloudMarqueeProps) {
  let bg = 'bg-white text-neutral-800 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-900 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-10 px-6 overflow-hidden border-b transition-colors ${bg}`}>
      <div className="flex items-center gap-12 sm:gap-20 overflow-x-auto no-scrollbar justify-center">
        {logos.map((logo, idx) => (
          <span key={`${logo}-${idx}`} className="font-mono text-sm sm:text-base font-bold tracking-tight opacity-70 shrink-0">
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
