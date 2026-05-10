"use client"

import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import {
  getReaderSession,
  isReaderAuthenticated,
} from "@/lib/auth/reader-session"
import { getAppUrl } from "@/lib/utils"

type RequirePersonnelProps = {
  children: ReactNode
}

/** Accès réservé au rôle personnel (considéré comme admin UI). */
export function RequirePersonnel({ children }: RequirePersonnelProps) {
  const location = useLocation()

  if (!isReaderAuthenticated()) {
    return (
      <Navigate
        to={getAppUrl("/auth/sign-in")}
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  const profile = getReaderSession()
  if (!profile || profile.role !== "personnel") {
    return <Navigate to={getAppUrl("/")} replace />
  }

  return children
}
