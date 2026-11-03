export interface ResourceCodeDisclosure {
  installHeading: string | null;
  sourceHeading: string;
  notice: string | null;
}

export function getResourceCodeDisclosure(redistributionVerified: boolean): ResourceCodeDisclosure {
  if (redistributionVerified) {
    return {
      installHeading: 'Install component via CLI:',
      sourceHeading: 'Published source (React + Tailwind):',
      notice: null,
    };
  }

  return {
    installHeading: null,
    sourceHeading: 'Local source (UNLICENSED; rights review required):',
    notice: 'This source is shown for private local inspection only. Do not install or redistribute it while its license and upstream attribution remain unresolved.',
  };
}

export function getResourceVariantsDisclosure(variantCount: number): string {
  return variantCount === 0
    ? 'No named Tessellate variants are declared for this resource. The preview uses its source defaults.'
    : 'The configurations declared by this resource are listed below. Inspect them in the live preview.';
}

export function getResourceVersionDisclosure(version: string): string {
  return `Version ${version} is the value declared in this manifest. Historical release notes and variant certification are not available here.`;
}
