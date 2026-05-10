"use client"

import * as React from "react"
import { BookMarked, Loader2, Search } from "lucide-react"
import { BiblioShell } from "@/components/biblio/biblio-shell"
import { ListPaginationControls } from "@/components/biblio/list-pagination-controls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { fetchBooksPage, getLivresApiBaseUrl } from "@/lib/api/livres"
import { computeTotalPages } from "@/lib/pagination/client-pagination"
import type { Book } from "@/types/book"
import { getAppUrl } from "@/lib/utils"

export default function CataloguePage() {
  const [books, setBooks] = React.useState<Book[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebouncedValue(query, 400)

  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const configured = Boolean(getLivresApiBaseUrl())

  React.useEffect(() => {
    setPageIndex(0)
  }, [debouncedQuery])

  React.useEffect(() => {
    const maxIndex = Math.max(0, computeTotalPages(total, pageSize) - 1)
    setPageIndex((i) => Math.min(i, maxIndex))
  }, [total, pageSize])

  React.useEffect(() => {
    if (!configured) {
      setLoading(false)
      setError(null)
      setBooks([])
      setTotal(0)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchBooksPage({
      page: pageIndex + 1,
      pageSize,
      q: debouncedQuery.trim() || undefined,
    })
      .then((res) => {
        if (!cancelled) {
          setBooks(res.items)
          setTotal(res.total)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement")
          setBooks([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [configured, pageIndex, pageSize, debouncedQuery])

  const totalPages = computeTotalPages(total, pageSize)

  return (
    <BiblioShell>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary mb-3">
              <BookMarked className="size-6" aria-hidden />
              <span className="text-sm font-medium uppercase tracking-wide">
                Catalogue
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Fonds documentaire
            </h1>
            <p className="text-muted-foreground text-lg">
              Parcourez le fonds par titre, auteur, catégorie ou ISBN. La liste se met à jour au fil de
              votre recherche avec navigation par pages.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!configured ? (
          <div
            role="alert"
            className="rounded-lg border bg-card text-card-foreground p-6 space-y-3"
          >
            <p className="font-semibold">API Livres non configurée</p>
            <p className="text-sm text-muted-foreground">
              Créez un fichier <code className="rounded bg-muted px-1">.env</code> à partir
              de <code className="rounded bg-muted px-1">.env.example</code> et définissez{" "}
              <code className="rounded bg-muted px-1">
                VITE_API_LIVRES_URL=http://localhost:8001
              </code>
              , puis relancez le serveur Vite.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href={getAppUrl("/")}>Retour à l&apos;accueil</a>
            </Button>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 space-y-2"
          >
            <p className="font-semibold text-destructive">
              Impossible de charger le catalogue
            </p>
            <p className="text-sm">{error}</p>
            <p className="text-sm text-muted-foreground">
              Vérifiez que le service Livres est à jour (réponse paginée JSON) et joignable.
            </p>
          </div>
        ) : (
          <Card>
            <CardHeader className="gap-2">
              <CardTitle>Recherche</CardTitle>
              <CardDescription>
                Filtre serveur sur titre, auteur, catégorie ou ISBN (délai 400&nbsp;ms après la
                dernière frappe).
              </CardDescription>
              <div className="relative max-w-md pt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Ex. Python, Balzac, 978-…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Recherche dans le catalogue"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div
                  className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
                  role="status"
                >
                  <Loader2 className="size-6 animate-spin" />
                  Chargement du catalogue…
                </div>
              ) : total === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Aucun ouvrage ne correspond à cette recherche ou la base est vide.
                </p>
              ) : (
                <>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Titre</TableHead>
                          <TableHead>Auteur</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>ISBN</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-mono text-muted-foreground">
                              {b.id}
                            </TableCell>
                            <TableCell className="font-medium">{b.titre}</TableCell>
                            <TableCell>{b.auteur}</TableCell>
                            <TableCell>{b.categorie}</TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {b.isbn || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ListPaginationControls
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={total}
                    onPageChange={setPageIndex}
                    onPageSizeChange={(n) => {
                      setPageSize(n)
                      setPageIndex(0)
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </BiblioShell>
  )
}
