import { apiEnv } from "@/lib/api/env"
import type { Book, PaginatedBooksResponse } from "@/types/book"

export function getLivresApiBaseUrl(): string | undefined {
  return apiEnv.livres()
}

function isPaginatedBooksResponse(data: unknown): data is PaginatedBooksResponse {
  if (data === null || typeof data !== "object") return false
  const o = data as Record<string, unknown>
  return (
    Array.isArray(o.items) &&
    typeof o.total === "number" &&
    typeof o.page === "number" &&
    typeof o.page_size === "number"
  )
}

function normalizeItem(b: Partial<Book> & Record<string, unknown>): Book {
  return {
    id: Number(b.id),
    titre: String(b.titre ?? ""),
    auteur: String(b.auteur ?? ""),
    categorie: String(b.categorie ?? ""),
    isbn: typeof b.isbn === "string" ? b.isbn : "",
  }
}

export type FetchBooksPageParams = {
  /** page 1-based, alignée sur l’API */
  page: number
  pageSize: number
  q?: string
}

export async function fetchBooksPage(
  params: FetchBooksPageParams
): Promise<PaginatedBooksResponse> {
  const base = getLivresApiBaseUrl()
  if (!base) {
    throw new Error("VITE_API_LIVRES_URL non défini")
  }
  const sp = new URLSearchParams()
  sp.set("page", String(params.page))
  sp.set("page_size", String(params.pageSize))
  if (params.q?.trim()) sp.set("q", params.q.trim())

  const res = await fetch(`${base}/books?${sp.toString()}`)
  if (!res.ok) {
    throw new Error(`Erreur API livres (${res.status})`)
  }
  const data: unknown = await res.json()
  if (!isPaginatedBooksResponse(data)) {
    throw new Error("Réponse /books inattendue (pagination serveur requise)")
  }
  const items = data.items.map((raw) =>
    normalizeItem(raw as Partial<Book> & Record<string, unknown>)
  )
  return {
    items,
    total: data.total,
    page: data.page,
    page_size: data.page_size,
  }
}

export type BookPayload = Omit<Book, "id">

export async function createBook(book: BookPayload): Promise<Book> {
  const base = getLivresApiBaseUrl()
  if (!base) throw new Error("VITE_API_LIVRES_URL non défini")
  const res = await fetch(`${base}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  })
  if (!res.ok) throw new Error(`Création livre (${res.status})`)
  return normalizeItem(await res.json())
}

export async function updateBook(id: number, book: BookPayload): Promise<Book> {
  const base = getLivresApiBaseUrl()
  if (!base) throw new Error("VITE_API_LIVRES_URL non défini")
  const res = await fetch(`${base}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titre: book.titre, auteur: book.auteur, categorie: book.categorie, isbn: book.isbn }),
  })
  if (!res.ok) throw new Error(`Mise à jour livre (${res.status})`)
  return normalizeItem(await res.json())
}

export async function deleteBook(id: number): Promise<void> {
  const base = getLivresApiBaseUrl()
  if (!base) throw new Error("VITE_API_LIVRES_URL non défini")
  const res = await fetch(`${base}/books/${id}`, { method: "DELETE" })
  if (res.status === 404) throw new Error("Livre introuvable")
  if (!res.ok) throw new Error(`Suppression livre (${res.status})`)
}
