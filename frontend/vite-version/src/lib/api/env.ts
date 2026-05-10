/** Lecture centralisée des URLs de services (aucun secret ici — uniquement des bases HTTP publiques). */

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "")
}

function readOptionalUrl(envKey: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>
  const raw = env[envKey]
  if (raw == null || String(raw).trim() === "") return undefined
  return normalizeBase(String(raw).trim())
}

export const apiEnv = {
  livres: () => readOptionalUrl("VITE_API_LIVRES_URL"),
  emprunts: () => readOptionalUrl("VITE_API_EMPRUNTS_URL"),
  recommandations: () => readOptionalUrl("VITE_API_RECO_URL"),
  utilisateurs: () => readOptionalUrl("VITE_API_UTILISATEURS_URL"),
} as const
