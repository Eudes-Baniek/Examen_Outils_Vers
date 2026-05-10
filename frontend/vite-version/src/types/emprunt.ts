/** Contrat cible pour le service Emprunts (à aligner sur OpenAPI / équipe backend). */
export interface EmpruntEnCours {
  id: string
  livreId: number
  livreTitre: string
  livreAuteur: string
  dateEmprunt: string
  dateRetourPrevue: string
  enRetard: boolean
}
