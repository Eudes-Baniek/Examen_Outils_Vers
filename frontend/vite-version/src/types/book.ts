/** Contrat aligné sur le service FastAPI Livres (`services/livres/main.py`). */
export interface Book {
  id: number
  titre: string
  auteur: string
  categorie: string
  isbn: string
}

/** Réponse GET `/books` paginée (`PaginatedBooks` côté FastAPI). */
export interface PaginatedBooksResponse {
  items: Book[]
  total: number
  page: number
  page_size: number
}
