"use client"

import * as React from "react"
import { BiblioShell } from "@/components/biblio/biblio-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchProfilUtilisateur } from "@/lib/api/utilisateurs"
import { apiEnv } from "@/lib/api/env"
import { getReaderSession } from "@/lib/auth/reader-session"
import type { UtilisateurApi } from "@/lib/api/utilisateurs"

function roleLabel(role: UtilisateurApi["role"]): string {
  switch (role) {
    case "personnel":
      return "Personnel"
    case "professeur":
      return "Professeur"
    case "etudiant":
      return "Étudiant"
    default:
      return role
  }
}

export default function ProfilPage() {
  const [data, setData] = React.useState<UtilisateurApi | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const configured = Boolean(apiEnv.utilisateurs())
  const session = getReaderSession()

  React.useEffect(() => {
    if (!configured || !session) {
      setData(null)
      setErr(configured ? null : "API utilisateurs non configurée.")
      return
    }
    let cancelled = false
    setErr(null)
    fetchProfilUtilisateur(session.id)
      .then((u) => {
        if (!cancelled) setData(u)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Impossible de charger le profil.")
      })
    return () => {
      cancelled = true
    }
  }, [configured, session?.id])

  return (
    <BiblioShell>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
            <CardDescription>
              Informations associées à votre compte telles qu’elles sont enregistrées dans le système.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!configured ? (
              <p className="text-muted-foreground">
                Ce service est momentanément indisponible. Réessayez plus tard ou contactez le support.
              </p>
            ) : err ? (
              <p className="text-destructive">{err}</p>
            ) : !session ? (
              <p className="text-muted-foreground">Session introuvable.</p>
            ) : !data ? (
              <p className="text-muted-foreground">Chargement…</p>
            ) : (
              <dl className="space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Nom</dt>
                  <dd className="font-medium">
                    {[data.prenom, data.nom].filter(Boolean).join(" ").trim()}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">E-mail</dt>
                  <dd>{data.email}</dd>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <dt className="text-muted-foreground">Rôle</dt>
                  <dd>
                    <Badge variant={data.role === "personnel" ? "default" : "secondary"}>
                      {roleLabel(data.role)}
                    </Badge>
                  </dd>
                </div>
                {data.num_etudiant ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">N° étudiant</dt>
                    <dd>{data.num_etudiant}</dd>
                  </div>
                ) : null}
                {data.service ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd>{data.service}</dd>
                  </div>
                ) : null}
                {data.departement ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Département</dt>
                    <dd>{data.departement}</dd>
                  </div>
                ) : null}
              </dl>
            )}
          </CardContent>
        </Card>
      </section>
    </BiblioShell>
  )
}
