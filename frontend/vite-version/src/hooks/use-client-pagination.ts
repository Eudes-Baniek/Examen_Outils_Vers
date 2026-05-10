import * as React from "react"
import {
  computeTotalPages,
  DEFAULT_PAGE_SIZE,
  slicePage,
} from "@/lib/pagination/client-pagination"

type Options = {
  initialPageSize?: number
}

/**
 * Découpe une liste déjà en mémoire.
 * @param resetKey — quand cette valeur change (ex. texte de recherche), la page revient à 0.
 */
export function useClientPagination<T>(
  items: T[],
  resetKey?: unknown,
  options?: Options
) {
  const initialPageSize = options?.initialPageSize ?? DEFAULT_PAGE_SIZE
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(() =>
    initialPageSize > 0 ? initialPageSize : DEFAULT_PAGE_SIZE
  )

  const totalItems = items.length
  const totalPages = computeTotalPages(totalItems, pageSize)

  React.useEffect(() => {
    setPageIndex(0)
  }, [resetKey])

  React.useEffect(() => {
    setPageIndex((i) => Math.min(i, Math.max(0, totalPages - 1)))
  }, [totalPages])

  const safeIndex = Math.min(pageIndex, Math.max(0, totalPages - 1))
  const pageItems = React.useMemo(
    () => slicePage(items, safeIndex, pageSize),
    [items, safeIndex, pageSize]
  )

  return {
    pageIndex: safeIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalPages,
    pageItems,
    totalItems,
  }
}
