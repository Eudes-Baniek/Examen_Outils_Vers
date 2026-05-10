/** Contrat cible pour le service Recommandations (à aligner sur OpenAPI / équipe backend). */
export interface LivreRecommande {
  id: number
  titre: string
  auteur: string
  categorie: string
  /** Pertinence normalisée 0–1 si fournie par le modèle */
  score?: number
}
