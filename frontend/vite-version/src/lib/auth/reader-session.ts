/** Session lecteur côté client après connexion ou inscription réussie. */

import type { RoleBiblio } from "@/lib/api/utilisateurs"

const STORAGE_KEY = "biblio_reader_session_v1"

export interface ReaderSessionPayload {
  id: number
  email: string
  role: RoleBiblio
  nom: string
  prenom: string | null
}

function notifyAuthChange(): void {
  try {
    window.dispatchEvent(new Event("biblio-auth-change"))
  } catch {
    /* SSR */
  }
}

/** Enregistre la session après login ou inscription réussie. */
export function setReaderSession(payload: ReaderSessionPayload): void {
  try {
    const body = {
      ...payload,
      at: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(body))
    notifyAuthChange()
  } catch {
    /* stockage indisponible */
  }
}

export function clearReaderSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    notifyAuthChange()
  } catch {
    /* ignore */
  }
}

/** Session lecteur avec profil issu du service utilisateurs. */
export function isReaderAuthenticated(): boolean {
  return getReaderSession() !== null
}

/** Profil structuré si login API a été effectué ; sinon null (profil incomplet). */
export function getReaderSession(): ReaderSessionPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Record<string, unknown>
    if (
      typeof o.id === "number" &&
      typeof o.email === "string" &&
      typeof o.role === "string" &&
      typeof o.nom === "string" &&
      (o.prenom === null || typeof o.prenom === "string")
    ) {
      return {
        id: o.id,
        email: o.email,
        role: o.role as RoleBiblio,
        nom: o.nom,
        prenom: o.prenom as string | null,
      }
    }
    return null
  } catch {
    return null
  }
}

export function isPersonnelSession(): boolean {
  return getReaderSession()?.role === "personnel"
}
