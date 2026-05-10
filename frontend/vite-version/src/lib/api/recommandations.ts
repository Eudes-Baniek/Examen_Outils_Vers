import { apiEnv } from "@/lib/api/env"
import type { LivreRecommande } from "@/types/recommendation"

/**
 * Branchement futur : GET /recommendations/{user_id} ou équivalent query param.
 */
export function getRecoApiBaseUrl(): string | undefined {
  return apiEnv.recommandations()
}

export async function fetchRecommendations(userId: string): Promise<LivreRecommande[]> {
  const base = getRecoApiBaseUrl()
  if (!base) {
    throw new Error("VITE_API_RECO_URL non défini")
  }
  const res = await fetch(
    `${base}/recommendations/${encodeURIComponent(userId)}`
  )
  if (!res.ok) throw new Error(`Erreur API recommandations (${res.status})`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) throw new Error("Réponse recommandations inattendue")
  return data as LivreRecommande[]
}
