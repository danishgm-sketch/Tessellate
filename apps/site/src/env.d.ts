/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Origin of the isolated preview app (D-023), e.g. https://preview.tessellate.design. */
  readonly PUBLIC_PREVIEW_URL?: string;
  /** Base URL of the API when it is not served from the same origin. */
  readonly PUBLIC_API_URL?: string;
}
