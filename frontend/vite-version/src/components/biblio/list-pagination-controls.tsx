"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  displayRange,
  PAGE_SIZE_OPTIONS,
} from "@/lib/pagination/client-pagination"

export type ListPaginationControlsProps = {
  pageIndex: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (index: number) => void
  onPageSizeChange: (size: number) => void
}

export function ListPaginationControls({
  pageIndex,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: ListPaginationControlsProps) {
  const { from, to } = displayRange(pageIndex, pageSize, totalItems)

  if (totalItems === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        {totalItems === 0 ? (
          "Aucun résultat"
        ) : (
          <>
            Affichage{" "}
            <span className="font-medium text-foreground">
              {from}–{to}
            </span>{" "}
            sur <span className="font-medium text-foreground">{totalItems}</span>
          </>
        )}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">Lignes par page</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[72px] cursor-pointer" aria-label="Nombre de lignes par page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={`${n}`} className="cursor-pointer">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 sm:inline-flex cursor-pointer"
            onClick={() => onPageChange(0)}
            disabled={pageIndex <= 0}
            aria-label="Première page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 0}
            aria-label="Page précédente"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex min-w-[7rem] justify-center text-sm tabular-nums">
            Page {pageIndex + 1} / {totalPages}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            aria-label="Page suivante"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 sm:inline-flex cursor-pointer"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
            aria-label="Dernière page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
