import React, { useState } from 'react';
import {ManifestRenderer} from '@tessellate/renderer';
import type {ProjectManifest} from '@tessellate/schemas';
export function ShowcasePreview({ manifest }: { manifest: ProjectManifest }) {
  const [active, setActive] = useState(manifest.screens[0]!.id);
  const activeScreen = manifest.screens.find((screen) => screen.id === active) ?? manifest.screens[0]!;

  return (
    <section aria-labelledby="showcase-preview-heading" className="space-y-4">
      <label className="flex flex-wrap items-center gap-3">
        Example screen
        <select
          aria-label="Example screen"
          className="border bg-white p-2 text-black"
          value={active}
          onChange={(event) => setActive(event.target.value)}
        >
          {manifest.screens.map((screen) => (
            <option key={screen.id} value={screen.id}>{screen.name}</option>
          ))}
        </select>
      </label>
      <h2 id="showcase-preview-heading" className="text-xl font-semibold">
        Example: {activeScreen.name}
      </h2>
      <div className="overflow-auto border" aria-label={`${activeScreen.name} example screen`}>
        <ManifestRenderer manifest={manifest} activeScreenId={active} context={{ viewport: 'desktop', reducedMotion: true }} />
      </div>
      <dl className="grid gap-4 border-t pt-4 sm:grid-cols-3">
        <div><dt>Navigation model</dt><dd>{manifest.navigation.model}</dd></div>
        <div><dt>Visual ambition</dt><dd>{manifest.designDNA.visualAmbition}</dd></div>
        <div><dt>Structural creativity</dt><dd>{manifest.designDNA.structuralCreativity}</dd></div>
      </dl>
    </section>
  );
}
