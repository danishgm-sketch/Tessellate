import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const EXAMPLE_BRIEFS = [
  {
    label: 'Physiotherapy clinic',
    desc: 'A booking platform for independent physiotherapy clinics. Patients book appointments and pay deposits; clinicians manage calendars, treatment notes and invoices. Calm and accessible for older users.',
  },
  {
    label: 'Coffee roaster shop',
    desc: 'Online shop for a small coffee roaster. Customers browse products, add them to a basket and check out. We ship orders across the UK and collect reviews.',
  },
  {
    label: 'Support helpdesk',
    desc: 'An internal tool for our support team to triage tickets, assign them to agents and track SLAs. Customers email us and the tickets appear automatically.',
  },
  {
    label: 'Council permits',
    desc: 'Council permit applications: residents apply for parking permits, upload documents and pay the fee. Caseworkers review cases and approve or reject them.',
  },
];

const STEPS = [
  ['Describe', 'Say who uses the product and what they do in it.'],
  ['Review', 'Check the product type, entities and screens Tessellate understood, and correct anything wrong.'],
  ['Choose', 'Pick one of three composed directions and keep editing it in the Workbench.'],
] as const;

/** Homepage entry point: hands the brief to /compose, where it is interpreted, reviewed and composed. */
export function HeroComposer() {
  const [description, setDescription] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const brief = description.trim();
    window.location.href = brief ? `/compose?brief=${encodeURIComponent(brief)}` : '/compose';
  };

  return (
    <section className="relative mx-auto max-w-[1440px] px-6 pb-20 pt-12">
      <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight text-[#111217] sm:text-6xl md:text-7xl">
            Describe the product.
            <br />
            Get the interface.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[#62666F] sm:text-xl">
            Tessellate turns a product brief into a coherent interface system, composed from an open library of components and
            patterns, which you review and refine before you export it.
          </p>
        </div>
        <div className="flex flex-col gap-2 lg:col-span-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#62666F]">Try an example</span>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_BRIEFS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDescription(p.desc)}
                className="rounded-md border border-[#D9D6CF] bg-[#FAF9F6] px-2.5 py-1 text-xs text-[#4A4E57] hover:border-[#111217] hover:text-[#111217] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        <form
          onSubmit={submit}
          className="rounded-[20px] border border-[#D9D6CF] bg-white p-6 shadow-[0_18px_30px_rgba(17,18,23,0.08)] sm:p-7 xl:col-span-9"
        >
          <label htmlFor="hero-brief" className="block pb-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#62666F]">
            Product brief
          </label>
          <textarea
            id="hero-brief"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={4000}
            placeholder="A booking platform for physiotherapy clinics. Patients book appointments and pay deposits…"
            className="w-full resize-none border-none bg-transparent font-sans text-base leading-relaxed text-[#111217] placeholder-[#8B8F97] focus:outline-none sm:text-lg"
          />
          <div className="my-4 h-px bg-[#E5E2DC]" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#62666F]">Next you will review what Tessellate understood before anything is composed.</p>
            <button
              type="submit"
              className="ml-auto flex items-center gap-2 rounded-lg bg-[#2547E8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E3CCD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547E8]"
            >
              Compose <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>

        <ol className="space-y-4 rounded-[20px] border border-[#D9D6CF] bg-[#FAF9F6] p-6 xl:col-span-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex gap-3">
              <span className="font-mono text-xs font-semibold text-[#2547E8]">0{i + 1}</span>
              <span>
                <span className="block text-sm font-semibold text-[#111217]">{title}</span>
                <span className="block text-xs leading-relaxed text-[#62666F]">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
