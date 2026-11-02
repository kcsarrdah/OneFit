/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API origin for deployed builds. Empty in dev (Vite proxies /api). */
  readonly VITE_API_BASE_URL?: string
}
