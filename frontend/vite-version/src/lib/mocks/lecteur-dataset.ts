import type { EmpruntEnCours } from "@/types/emprunt"
import type { LivreRecommande } from "@/types/recommendation"

/** Données de démo uniquement — retirées quand l’API est branchée. */
export const MOCK_EMPRUNTS_EN_COURS: EmpruntEnCours[] = Array.from(
  { length: 28 },
  (_, i) => {
    const d0 = new Date(2025, 2, 1 + (i % 20))
    const d1 = new Date(d0)
    d1.setDate(d1.getDate() + 14)
    const enRetard = i % 7 === 0
    return {
      id: `emp-mock-${i + 1}`,
      livreId: 100 + i,
      livreTitre: `Ouvrage exemple ${i + 1}`,
      livreAuteur: ["Diop", "Sy", "Ndiaye", "Faye"][i % 4],
      dateEmprunt: d0.toISOString().slice(0, 10),
      dateRetourPrevue: enRetard
        ? new Date(2024, 0, 1).toISOString().slice(0, 10)
        : d1.toISOString().slice(0, 10),
      enRetard,
    }
  }
)

export const MOCK_EMPRUNTS_HISTORIQUE: EmpruntEnCours[] = Array.from(
  { length: 15 },
  (_, i) => {
    const d0 = new Date(2024, 5, 5 + i)
    const d1 = new Date(d0)
    d1.setDate(d1.getDate() + 14)
    return {
      id: `emp-hist-mock-${i + 1}`,
      livreId: 300 + i,
      livreTitre: `Prêt terminé — titre ${i + 1}`,
      livreAuteur: ["Mendy", "Thiam"][i % 2],
      dateEmprunt: d0.toISOString().slice(0, 10),
      dateRetourPrevue: d1.toISOString().slice(0, 10),
      enRetard: false,
    }
  }
)

export const MOCK_RECOMMANDATIONS: LivreRecommande[] = Array.from(
  { length: 34 },
  (_, i) => ({
    id: 500 + i,
    titre: `Suggestion lecture ${i + 1}`,
    auteur: ["Camara", "Ba", "Kane", "Sow"][i % 4],
    categorie: ["Informatique", "Littérature", "Sciences", "Histoire"][i % 4],
    score: Math.round((0.5 + (i % 10) / 20) * 100) / 100,
  })
)
