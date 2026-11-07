import { useEffect, useState } from 'react';

export interface WorkbenchStartupProps {
  hasProjectQuery?: boolean;
}

/** A stable, accessible shell shared by Astro's server fallback and Workbench's client startup. */
export function WorkbenchStartup({ hasProjectQuery = false }: WorkbenchStartupProps) {
  const [clientRendered, setClientRendered] = useState(false);

  useEffect(() => setClientRendered(true), []);

  return (
    <main
      id="workbench-startup"
      data-testid="workbench-startup-shell"
      data-client-rendered={clientRendered ? 'true' : 'false'}
      aria-busy="true"
      className="flex h-screen min-h-screen w-screen flex-col overflow-hidden bg-[#0B0D10] text-[#F5F7FA]"
    >
      <header className="flex min-h-14 shrink-0 items-center justify-between border-b border-[#272C34] bg-[#111419] px-4 lg:min-h-[89px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-8 place-items-center bg-[#6782FF] text-sm font-bold text-[#0B0D10]">T</span>
          <span className="text-sm font-semibold tracking-tight">Tessellate Workbench</span>
        </div>
        <span className="hidden text-xs text-[#A8AFBA] sm:block">Preparing your local workspace</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside aria-hidden="true" className="hidden w-[280px] shrink-0 flex-col border-r border-[#272C34] bg-[#111419] lg:flex">
          <div className="h-11 border-b border-[#272C34] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8AFBA]">Project structure</div>
          <div className="space-y-4 px-4 py-5">
            <div className="h-3 w-3/4 bg-[#20252D]" />
            <div className="ml-4 h-3 w-2/3 bg-[#20252D]" />
            <div className="ml-4 h-3 w-4/5 bg-[#20252D]" />
            <div className="ml-4 h-3 w-1/2 bg-[#20252D]" />
          </div>
        </aside>

        <section aria-label="Workbench loading area" className="flex min-w-0 flex-1 flex-col">
          <div aria-hidden="true" className="hidden h-11 shrink-0 items-center border-b border-[#272C34] px-4 text-xs text-[#A8AFBA] lg:flex">Project canvas</div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-6">
            <div className="w-full max-w-xl border border-[#272C34] bg-[#111419] p-6 sm:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#A8AFBA]">Local project</p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Preparing your local workspace</h1>
              <p
                role="status"
                aria-live="polite"
                data-testid="workbench-startup-status"
                className="mt-3 max-w-lg text-sm leading-6 text-[#A8AFBA]"
              >
                {hasProjectQuery
                  ? 'Loading the selected project and verified resource catalogue. Projects remain in this browser.'
                  : 'Loading the example project and verified resource catalogue. Projects remain in this browser.'}
              </p>
              <a
                href="/compose"
                className="mt-5 inline-flex min-h-11 items-center border border-[#454C57] px-4 py-2 text-sm font-semibold text-[#F5F7FA] hover:bg-[#20252D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#879DFF]"
              >
                Open Compose
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="hidden h-14 shrink-0 items-center border-t border-[#272C34] px-4 text-xs text-[#A8AFBA] lg:flex">Viewport and preview controls load with the project</div>
        </section>

        <aside aria-hidden="true" className="hidden w-[340px] shrink-0 flex-col border-l border-[#272C34] bg-[#111419] lg:flex">
          <div className="h-11 border-b border-[#272C34] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8AFBA]">Inspector</div>
          <div className="space-y-4 px-4 py-5">
            <div className="h-3 w-2/3 bg-[#20252D]" />
            <div className="h-9 w-full border border-[#272C34]" />
            <div className="h-3 w-1/2 bg-[#20252D]" />
          </div>
        </aside>
      </div>

      <footer aria-hidden="true" className="flex h-16 shrink-0 items-center border-t border-[#272C34] bg-[#111419] px-4 text-xs text-[#A8AFBA]">
        Project commands load with the workspace
      </footer>
    </main>
  );
}
