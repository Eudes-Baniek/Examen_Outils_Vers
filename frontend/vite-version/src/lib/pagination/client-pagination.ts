/**
 * Pagination côté client (liste déjà chargée).
 * Pour une pagination serveur, réutiliser les mêmes paramètres d’affichage
 * (`page`, `pageSize`) en les passant en query à l’API et en utilisant `total`
 * renvoyé par le backend à la place de `items.length`.
 */

export const DEFAULT_PAGE_SIZE = 10

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const

export function computeTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1
  const ps = Math.max(1, pageSize)
  return Math.max(1, Math.ceil(totalItems / ps))
}

/** pageIndex : base 0 */
export function slicePage<T>(items: T[], pageIndex: number, pageSize: number): T[] {
  const ps = Math.max(1, pageSize)
  const start = Math.max(0, pageIndex) * ps
  return items.slice(start, start + ps)
}

/** Plage affichée 1-based pour l’UI « x–y sur z » */
export function displayRange(
  pageIndex: number,
  pageSize: number,
  totalItems: number
): { from: number; to: number } {
  if (totalItems === 0) return { from: 0, to: 0 }
  const ps = Math.max(1, pageSize)
  const from = pageIndex * ps + 1
  const to = Math.min(totalItems, pageIndex * ps + ps)
  return { from, to }
}
