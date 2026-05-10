"use client"

import * as React from "react"
import { AlertTriangle, BookOpenCheck, Loader2 } from "lucide-react"
import { BiblioShell } from "@/components/biblio/biblio-shell"
import { ListPaginationControls } from "@/components/biblio/list-pagination-controls"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useClientPagination } from "@/hooks/use-client-pagination"
import { fetchEmpruntsEnCours } from "@/lib/api/emprunts"
import {
  MOCK_EMPRUNTS_EN_COURS,
  MOCK_EMPRUNTS_HISTORIQUE,
} from "@/lib/mocks/lecteur-dataset"
import { apiEnv } from "@/lib/api/env"
import type { EmpruntEnCours } from "@/types/emprunt"

type TabKey = "actifs" | "historique"

export default function EmpruntsPage() {
  const [tab, setTab] = React.useState<TabKey>("actifs")
  const useApi = Boolean(apiEnv.emprunts())

  const [remoteActifs, setRemoteActifs] = React.useState<EmpruntEnCours[] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!useApi) {
      setRemoteActifs(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEmpruntsEnCours()
      .then((rows) => {
        if (!cancelled) setRemoteActifs(rows)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur réseau")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [useApi])

  const actifs = useApi && remoteActifs ? remoteActifs : MOCK_EMPRUNTS_EN_COURS
  const historique = MOCK_EMPRUNTS_HISTORIQUE

  const list = tab === "actifs" ? actifs : historique
  const resetKey = `${tab}-${list.length}-${useApi ? "api" : "mock"}`
  const pagination = useClientPagination(list, resetKey)

  return (
    <BiblioShell>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <BookOpenCheck className="size-6 shrink-0" aria-hidden />
              <span className="text-sm font-medium uppercase tracking-wide">
                Emprunts
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Mes prêts
            </h1>
            <p className="text-muted-foreground text-lg">
              Suivez vos documents en cours et votre historique. Les actions de retour ou de prolongation
              s’activent lorsque votre bibliothèque les propose sur ce portail.
            </p>
            {!useApi && (
              <p className="text-sm text-muted-foreground rounded-md border border-dashed p-3 bg-muted/40">
                Données d’aperçu : vos prêts réels apparaîtront une fois le service d’emprunts connecté.
              </p>
            )}
            {useApi && error && (
              <p
                role="alert"
                className="text-sm text-destructive flex items-center gap-2"
              >
                <AlertTriangle className="size-4 shrink-0" />
                {error} — affichage de secours.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Prêts en cours et historique</CardTitle>
            <CardDescription>
              Onglets indépendants, chacun paginé. Colonne statut pour les retards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as TabKey)}
              className="space-y-6"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="actifs" className="cursor-pointer">
                  En cours
                </TabsTrigger>
                <TabsTrigger value="historique" className="cursor-pointer">
                  Historique
                </TabsTrigger>
              </TabsList>

              <TabsContent value="actifs" className="mt-0">
                {useApi && loading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                    Chargement des prêts…
                  </div>
                ) : (
                  <LoanTable
                    rows={pagination.pageItems}
                    showStatut={true}
                    empty="Aucun prêt en cours."
                  />
                )}
              </TabsContent>

              <TabsContent value="historique" className="mt-0">
                <LoanTable rows={pagination.pageItems} showStatut={false} empty="Aucun prêt dans l’historique." />
              </TabsContent>
            </Tabs>

            {!(useApi && loading && tab === "actifs") && (
              <ListPaginationControls
                pageIndex={pagination.pageIndex}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={pagination.setPageIndex}
                onPageSizeChange={(n) => {
                  pagination.setPageSize(n)
                  pagination.setPageIndex(0)
                }}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </BiblioShell>
  )
}

function LoanTable({
  rows,
  showStatut,
  empty,
}: {
  rows: EmpruntEnCours[]
  showStatut: boolean
  empty: string
}) {
  if (rows.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">{empty}</p>
    )
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Emprunt</TableHead>
              <TableHead>Retour prévu</TableHead>
              {showStatut ? <TableHead>Statut</TableHead> : null}
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium max-w-[220px] truncate">
                  {row.livreTitre}
                </TableCell>
                <TableCell>{row.livreAuteur}</TableCell>
                <TableCell className="whitespace-nowrap">{row.dateEmprunt}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.dateRetourPrevue}
                </TableCell>
                {showStatut ? (
                  <TableCell>
                    {row.enRetard ? (
                      <Badge variant="destructive">Retard</Badge>
                    ) : (
                      <Badge variant="secondary">En cours</Badge>
                    )}
                  </TableCell>
                ) : null}
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block">
                        <Badge variant="outline" className="cursor-not-allowed opacity-60">
                          Retour
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Connexion au service Emprunts requise
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
