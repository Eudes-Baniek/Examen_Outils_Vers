"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { StatCards } from "@/app/users/components/stat-cards"
import { DataTable } from "@/app/users/components/data-table"
import type { UtilisateurRowModel } from "@/app/users/components/data-table"
import {
  creerUtilisateur,
  fetchUtilisateurs,
  supprimerUtilisateur,
  type CreerUtilisateurPayload,
  type RoleBiblio,
  type UtilisateurApi,
} from "@/lib/api/utilisateurs"
import { apiEnv } from "@/lib/api/env"
import { toast } from "sonner"

function roleLabel(r: RoleBiblio): string {
  switch (r) {
    case "etudiant":
      return "Étudiant"
    case "personnel":
      return "Personnel"
    case "professeur":
      return "Professeur"
    default:
      return r
  }
}

function initialsFrom(u: UtilisateurApi): string {
  const parts = [u.prenom, u.nom].filter(Boolean).join(" ").trim()
  if (parts.length >= 2) {
    const tok = parts.split(/\s+/).filter(Boolean)
    if (tok.length >= 2)
      return `${tok[0]![0] ?? ""}${tok[tok.length - 1]![0] ?? ""}`.toUpperCase()
  }
  return (u.nom || "?").slice(0, 2).toUpperCase()
}

function detailPour(u: UtilisateurApi): string {
  if (u.role === "etudiant" && u.num_etudiant) return `N° ${u.num_etudiant}`
  if (u.role === "personnel" && u.service) return u.service
  if (u.role === "professeur" && u.departement) return u.departement
  return "—"
}

function mapApiRow(u: UtilisateurApi): UtilisateurRowModel {
  const nomAffiche =
    [u.prenom, u.nom].filter(Boolean).join(" ").trim() || u.nom || u.email
  return {
    id: u.id,
    nomAffiche,
    email: u.email,
    initials: initialsFrom(u),
    roleRaw: u.role,
    roleLabel: roleLabel(u.role),
    detail: detailPour(u),
  }
}

/** Liste et création d’utilisateurs (API) — réservé au personnel dans le routeur parent. */
export function UtilisateursAdminPanel() {
  const utilisateursOk = Boolean(apiEnv.utilisateurs())

  const [remote, setRemote] = useState<UtilisateurApi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!utilisateursOk) {
      setError(null)
      setRemote([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchUtilisateurs()
      setRemote(rows)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [utilisateursOk])

  useEffect(() => {
    void reload()
  }, [reload])

  const rows = useMemo(() => remote.map(mapApiRow), [remote])

  const counts = useMemo(() => {
    let etudiant = 0
    let personnel = 0
    let professeur = 0
    for (const u of remote) {
      if (u.role === "etudiant") etudiant += 1
      else if (u.role === "personnel") personnel += 1
      else professeur += 1
    }
    return {
      total: remote.length,
      etudiant,
      personnel,
      professeur,
    }
  }, [remote])

  const onCreateUser = async (payload: CreerUtilisateurPayload) => {
    try {
      const created = await creerUtilisateur(payload)
      setRemote((prev) => [created, ...prev])
      toast.success("Utilisateur créé")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.error(msg)
      throw e
    }
  }

  const onDeleteUser = async (id: number) => {
    try {
      await supprimerUtilisateur(id)
      setRemote((prev) => prev.filter((u) => u.id !== id))
      toast.success("Utilisateur supprimé")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.error(msg)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!utilisateursOk ? (
        <p className="text-muted-foreground rounded-md border bg-muted/40 px-4 py-3 text-sm">
          Définissez <code className="rounded bg-muted px-1">VITE_API_UTILISATEURS_URL</code> dans
          <code className="rounded bg-muted px-1">vite-version/.env</code> (ex.{" "}
          <code className="rounded bg-muted px-1">http://localhost:8004</code>), puis relancez Vite.
        </p>
      ) : null}

      <div className="@container/main px-0 lg:px-0">
        <StatCards counts={counts} />
      </div>

      <div className="@container/main px-0 lg:px-0 mt-6 lg:mt-8">
        <DataTable
          users={rows}
          loading={loading && utilisateursOk}
          error={error}
          onCreateUser={onCreateUser}
          onDeleteUser={onDeleteUser}
        />
      </div>
    </div>
  )
}
