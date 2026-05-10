"use client"

import * as React from "react"
import { Loader2, Sparkles } from "lucide-react"
import { BiblioShell } from "@/components/biblio/biblio-shell"
import { ListPaginationControls } from "@/components/biblio/list-pagination-controls"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClientPagination } from "@/hooks/use-client-pagination"
import { fetchRecommendations } from "@/lib/api/recommandations"
import { fetchIdsUtilisateurs } from "@/lib/api/utilisateurs"
import { apiEnv } from "@/lib/api/env"
import { MOCK_RECOMMANDATIONS } from "@/lib/mocks/lecteur-dataset"
import type { LivreRecommande } from "@/types/recommendation"
import { getReaderSession } from "@/lib/auth/reader-session"

const DEMO_USER_IDS = ["1", "2", "3"] as const

export default function RecommandationsPage() {
  const useApi = Boolean(apiEnv.recommandations())
  const hasUsersApi = Boolean(apiEnv.utilisateurs())
  const [userId, setUserId] = React.useState<string>(DEMO_USER_IDS[0])
  const [apiUserIds, setApiUserIds] = React.useState<number[] | null>(null)

  React.useEffect(() => {
    if (!hasUsersApi) {
      setApiUserIds(null)
      return
    }
    let cancelled = false
    fetchIdsUtilisateurs()
      .then((ids) => {
        if (!cancelled) setApiUserIds(ids.length > 0 ? ids : null)
      })
      .catch(() => {
        if (!cancelled) setApiUserIds(null)
      })
    return () => {
      cancelled = true
    }
  }, [hasUsersApi])

  const selectableReaderIds = React.useMemo(() => {
    if (apiUserIds?.length) return apiUserIds.map((id) => String(id))
    return [...DEMO_USER_IDS]
  }, [apiUserIds])

  React.useEffect(() => {
    if (selectableReaderIds.length === 0) return
    const s = getReaderSession()
    const sid = s ? String(s.id) : null
    if (sid && selectableReaderIds.includes(sid)) {
      setUserId(sid)
      return
    }
    setUserId((prev) =>
      selectableReaderIds.includes(prev) ? prev : (selectableReaderIds[0] ?? DEMO_USER_IDS[0]),
    )
  }, [selectableReaderIds])

  React.useEffect(() => {
    const onAuth = () => {
      const s = getReaderSession()
      if (!s) return
      const sid = String(s.id)
      if (selectableReaderIds.includes(sid)) setUserId(sid)
    }
    window.addEventListener("biblio-auth-change", onAuth)
    return () => window.removeEventListener("biblio-auth-change", onAuth)
  }, [selectableReaderIds])

  const [remote, setRemote] = React.useState<LivreRecommande[] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!useApi) {
      setRemote(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchRecommendations(userId)
      .then((rows) => {
        if (!cancelled) setRemote(rows)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [useApi, userId])

  const mockForUser = React.useMemo(() => {
    const uid = Number.parseInt(userId, 10) || 0
    return MOCK_RECOMMANDATIONS.filter((_, i) => i % 3 === uid % 3)
  }, [userId])

  const list = useApi && remote ? remote : mockForUser
  const pagination = useClientPagination(list, `${userId}-${useApi}-${list.length}`)

  return (
    <BiblioShell>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-6 shrink-0" aria-hidden />
              <span className="text-sm font-medium uppercase tracking-wide">
                Recommandations
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pour vous
            </h1>
            <p className="text-muted-foreground text-lg">
              Sélection d’ouvrages à explorer en complément de vos lectures. Choisissez un profil lecteur
              lorsque plusieurs comptes partagent cet appareil.
            </p>
            {!useApi && (
              <p className="text-sm text-muted-foreground rounded-md border border-dashed p-3 bg-muted/40">
                Les suggestions affichées sont indicatives jusqu’à branchement complet du service de
                recommandation.
              </p>
            )}
            {useApi && error && (
              <p role="alert" className="text-sm text-destructive">
                {error} — liste de secours affichée.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-sm text-muted-foreground">
                Lecteur (provisoire)
              </span>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="w-[200px] cursor-pointer" aria-label="Identifiant lecteur pour les recommandations">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectableReaderIds.map((id) => (
                    <SelectItem key={id} value={id} className="cursor-pointer">
                      Utilisateur {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasUsersApi && apiUserIds && apiUserIds.length > 0 ? (
                <span className="text-xs text-muted-foreground">Liste synchronisée avec les comptes actifs.</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {useApi && loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            Chargement des suggestions…
          </div>
        ) : pagination.totalItems === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Aucune suggestion pour ce profil pour le moment.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagination.pageItems.map((livre) => (
                <Card key={livre.id} className="flex flex-col">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-lg leading-snug line-clamp-2">
                      {livre.titre}
                    </CardTitle>
                    <CardDescription>{livre.auteur}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Badge variant="secondary">{livre.categorie}</Badge>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground justify-between">
                    <span>Ref. #{livre.id}</span>
                    {livre.score != null && (
                      <span>Score {livre.score.toFixed(2)}</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
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
          </>
        )}
      </section>
    </BiblioShell>
  )
}
