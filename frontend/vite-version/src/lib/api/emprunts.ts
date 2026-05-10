import { apiEnv } from "@/lib/api/env"
import type { EmpruntEnCours } from "@/types/emprunt"

/**
 * Branchement futur : lister les prêts actifs du lecteur connecté.
 * Exemple d’URL attendue : GET /loans/active ou /emprunts?statut=en_cours
 */
export function getEmpruntsApiBaseUrl(): string | undefined {
  return apiEnv.emprunts()
}

export async function fetchEmpruntsEnCours(_userId?: string): Promise<EmpruntEnCours[]> {
  const base = getEmpruntsApiBaseUrl()
  if (!base) {
    throw new Error("VITE_API_EMPRUNTS_URL non défini")
  }
  void _userId
  const res = await fetch(`${base}/emprunts`) // contrat à figer avec le backend
  if (!res.ok) throw new Error(`Erreur API emprunts (${res.status})`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) throw new Error("Réponse emprunts inattendue")
  return data as EmpruntEnCours[]
}
