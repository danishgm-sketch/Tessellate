import React, { useEffect, useState } from 'react';
import type { ProjectManifest } from '@tessellate/schemas';
import type { ManifestRendererProps } from '@tessellate/renderer';

/** The homepage demo uses the canonical composer on demand; no simulated directions. */
export function ThreeDirectionsDemo() {
  const [projects, setProjects] = useState<ProjectManifest[]>([]);
  const [Renderer, setRenderer] = useState<React.ComponentType<ManifestRendererProps> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      const [response, composer, schemas, renderer] = await Promise.all([
        fetch('/data/catalog.json'),
        import('@tessellate/compatibility'),
        import('@tessellate/schemas'),
        import('@tessellate/renderer'),
      ]);
      if (!response.ok) throw new Error(`Catalogue HTTP ${response.status}`);
      const catalogue = schemas.ResourceManifestSchema.array().parse(
        (await response.json()).resources
      );
      const result = composer.composeProjectPipeline(
        {
          description:
            'An employee experience platform for 500 people, with people, teams, refined dashboard, playful onboarding and conservative settings.',
          feel: 'professional but playful',
          visualAmbition: 40,
          structuralCreativity: 55,
        },
        { catalogResources: catalogue, seed: crypto.randomUUID() }
      );
      setProjects([
        result.directionA.manifest,
        result.directionB.manifest,
        result.directionC.manifest,
      ]);
      setRenderer(() => renderer.ManifestRenderer);
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy(false);
    }
  };

  const open = async (project: ProjectManifest, blend = false) => {
    try {
      const { saveLocalProject } = await import('@tessellate/workbench');
      for (const sibling of projects) {
        localStorage.setItem(`tessellate_project_${sibling.id}`, JSON.stringify(sibling));
        localStorage.setItem(`tessellate_directions_${sibling.id}`, JSON.stringify(projects));
        await saveLocalProject(sibling);
      }
      localStorage.setItem('tessellate_active_project', JSON.stringify(project));
      window.location.href = `/workbench?project=${encodeURIComponent(project.id)}${blend ? '&open=blend' : ''}`;
    } catch (cause) {
      setError(`Could not save the example: ${String(cause)}`);
    }
  };

  return (
    <section
      id="three-directions-demo"
      className="mx-auto max-w-[1440px] space-y-5 px-6 pb-20 pt-8 md:space-y-8 md:pt-4"
    >
      <header className="max-w-3xl space-y-4">
        <p className="font-mono text-xs uppercase text-[#62666F]">Three directions, one product</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Choose a direction. Or blend them.
        </h2>
        <p className="text-[#62666F]">
          Generate an employee experience example with the real catalogue and composer. Compare its
          sidebar, editorial and rail workspace structures, then edit the exact project in
          Workbench.
        </p>
        <button
          type="button"
          disabled={!hydrated || busy}
          aria-describedby={!hydrated ? 'example-directions-readiness' : undefined}
          aria-busy={busy}
          className="rounded-lg bg-[#2547E8] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void generate()}
        >
          {busy
            ? 'Loading catalogue and composing…'
            : projects.length
              ? 'Generate new example directions'
              : 'Generate example directions'}
        </button>
        {!hydrated && (
          <p id="example-directions-readiness" role="status" className="text-sm text-[#62666F]">
            Preparing the example composer…
          </p>
        )}
        <a className="ml-5 underline" href="/compose">
          Compose your own brief
        </a>
      </header>
      {error && <p role="alert">{error}</p>}
      {Renderer && (
        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project, index) => {
            const dashboard =
              project.screens.find((screen) => screen.slug === '/overview') ?? project.screens[0]!;
            return (
              <article key={project.id} className="min-w-0 border border-[#D9D6CF] bg-white">
                <header className="space-y-2 p-5">
                  <h3 className="text-xl font-semibold">
                    Direction {String.fromCharCode(65 + index)}
                  </h3>
                  <p className="text-sm">
                    {project.navigation.model} · {project.designDNA.visualAmbition} visual ambition
                    · {project.designDNA.structuralCreativity} structural creativity
                  </p>
                </header>
                <div className="h-[460px] overflow-auto border-y border-[#D9D6CF]">
                  <Renderer
                    manifest={project}
                    activeScreenId={dashboard.id}
                    context={{ viewport: 'mobile', reducedMotion: true }}
                  />
                </div>
                <div className="flex flex-wrap gap-4 p-5">
                  <button
                    type="button"
                    className="rounded bg-[#111217] px-4 py-2 text-white"
                    onClick={() => void open(project)}
                  >
                    Choose Direction {String.fromCharCode(65 + index)}
                  </button>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void open(project, true)}
                  >
                    Blend actual directions
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
