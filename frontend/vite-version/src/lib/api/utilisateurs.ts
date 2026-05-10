/** Client API Utilisateurs (FastAPI — port Compose 8004 par défaut). */

import { apiEnv } from "./env"

export type RoleBiblio = "etudiant" | "personnel" | "professeur"

export interface UtilisateurApi {
  id: number
  role: RoleBiblio
  email: string
  nom: string
  prenom: string | null
  num_etudiant: string | null
  service: string | null
  departement: string | null
  cree_le: string
}

export interface CreerUtilisateurPayload {
  role: RoleBiblio
  email: string
  nom: string
  prenom?: string | null
  password: string
  num_etudiant?: string | null
  service?: string | null
  departement?: string | null
}

function base(): string | undefined {
  return apiEnv.utilisateurs()
}

/** FastAPI peut renvoyer `detail` en string, en liste de validation `{ msg }`, ou en objet. */
function fastApiDetailToMessage(detail: unknown, fallback: string): string {
  if (detail == null) return fallback
  if (typeof detail === "string") return detail.trim() || fallback
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (
          item &&
          typeof item === "object" &&
          "msg" in item &&
          typeof (item as { msg: unknown }).msg === "string"
        ) {
          return (item as { msg: string }).msg
        }
        return null
      })
      .filter((s): s is string => Boolean(s?.trim()))
    if (parts.length) return parts.join(" • ")
    return fallback
  }
  if (typeof detail === "object" && detail !== null) {
    if ("msg" in detail && typeof (detail as { msg: unknown }).msg === "string") {
      const m = (detail as { msg: string }).msg.trim()
      if (m) return m
    }
  }
  try {
    return JSON.stringify(detail)
  } catch {
    return fallback
  }
}

export async function fetchUtilisateurs(): Promise<UtilisateurApi[]> {
  const b = base()
  if (!b) throw new Error("VITE_API_UTILISATEURS_URL non défini")
  const r = await fetch(`${b}/utilisateurs`)
  if (!r.ok) throw new Error(`Utilisateurs: ${r.status}`)
  return (await r.json()) as UtilisateurApi[]
}

/** Détail utilisateur (`GET /utilisateurs/:id`). */
export async function fetchProfilUtilisateur(id: number): Promise<UtilisateurApi> {
  const b = base()
  if (!b) throw new Error("VITE_API_UTILISATEURS_URL non défini")
  const url = `${b}/utilisateurs/${encodeURIComponent(String(id))}`
  const r = await fetch(url)
  if (r.status === 404) throw new Error("Utilisateur introuvable")
  if (!r.ok) throw new Error(`Utilisateurs: ${r.status}`)
  const data: unknown = await r.json()
  return data as UtilisateurApi
}

/** Connexion : vérifie le mot de passe côté API et renvoie le profil public. */
export async function loginUtilisateur(body: {
  email: string
  password: string
}): Promise<UtilisateurApi> {
  const b = base()
  if (!b) throw new Error("VITE_API_UTILISATEURS_URL non défini")
  const r = await fetch(`${b}/utilisateurs/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const err = (await r.json().catch(() => ({}))) as { detail?: unknown }
    throw new Error(
      fastApiDetailToMessage(err.detail, `Connexion impossible (${r.status})`),
    )
  }
  return (await r.json()) as UtilisateurApi
}

export async function creerUtilisateur(body: CreerUtilisateurPayload): Promise<UtilisateurApi> {
  const b = base()
  if (!b) throw new Error("VITE_API_UTILISATEURS_URL non défini")
  const r = await fetch(`${b}/utilisateurs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (r.status === 409) {
    const err = (await r.json().catch(() => ({}))) as { detail?: unknown }
    throw new Error(fastApiDetailToMessage(err.detail, "Email déjà utilisée"))
  }
  if (!r.ok) {
    const err = await r.text()
    throw new Error(err || `Création: ${r.status}`)
  }
  return (await r.json()) as UtilisateurApi
}

export async function supprimerUtilisateur(id: number): Promise<void> {
  const b = base()
  if (!b) throw new Error("VITE_API_UTILISATEURS_URL non défini")
  const r = await fetch(`${b}/utilisateurs/${id}`, { method: "DELETE" })
  if (r.status === 404) throw new Error("Utilisateur introuvable")
  if (!r.ok) throw new Error(`Suppression: ${r.status}`)
}

export async function fetchIdsUtilisateurs(): Promise<number[]> {
  const b = base()
  if (!b) return []
  const r = await fetch(`${b}/utilisateurs/ids`)
  if (!r.ok) throw new Error(`utilisateurs/ids: ${r.status}`)
  const j = (await r.json()) as { ids?: number[] }
  return j.ids ?? []
}

export function utilisateurVersSessionPayload(u: UtilisateurApi) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    nom: u.nom,
    prenom: u.prenom,
  }
}
