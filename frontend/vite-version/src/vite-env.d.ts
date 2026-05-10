/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_LIVRES_URL?: string
  readonly VITE_API_EMPRUNTS_URL?: string
  readonly VITE_API_RECO_URL?: string
  readonly VITE_API_UTILISATEURS_URL?: string
  readonly VITE_BASENAME?: string
  readonly VITE_GTM_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
