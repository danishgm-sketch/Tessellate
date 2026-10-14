/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Comma-separated extra origins allowed to embed previews (e.g. staging hosts). */
  readonly VITE_ALLOWED_PARENT_ORIGINS?: string;
}
