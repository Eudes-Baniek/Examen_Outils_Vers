"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { clearReaderSession, isReaderAuthenticated } from "@/lib/auth/reader-session"
import { getAppUrl } from "@/lib/utils"
import * as React from "react"

/** Lien de déconnexion pour la session lecteur. */
export function ReaderSessionFooter() {
  const [on, setOn] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const sync = () => setOn(isReaderAuthenticated())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("biblio-auth-change", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("biblio-auth-change", sync)
    }
  }, [])

  if (!on) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto p-0 text-muted-foreground hover:text-foreground"
      onClick={() => {
        clearReaderSession()
        setOn(false)
        navigate(getAppUrl("/"), { replace: true })
      }}
    >
      Se déconnecter
    </Button>
  )
}
