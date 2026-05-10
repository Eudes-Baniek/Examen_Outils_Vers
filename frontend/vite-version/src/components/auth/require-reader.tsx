"use client"

import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { isReaderAuthenticated } from "@/lib/auth/reader-session"
import { getAppUrl } from "@/lib/utils"

type RequireReaderProps = {
  children: ReactNode
}

/** Protège les pages nécessitant un lecteur connecté (emprunts, recommandations, profil). Le catalogue reste public. */
export function RequireReader({ children }: RequireReaderProps) {
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

  return children
}
