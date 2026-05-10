"use client"

import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { getAppUrl } from "@/lib/utils"

export function NotFoundError() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:gap-12 md:p-16">
      <div className="text-center space-y-2 max-w-md">
        <p className="text-7xl font-bold text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground">
          Ce chemin ne correspond à aucune page du portail bibliothèque (template marketing retiré).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button className="cursor-pointer" onClick={() => navigate(getAppUrl("/"))}>
            Retour au catalogue
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate(getAppUrl("/auth/sign-in"))}
          >
            Connexion
          </Button>
        </div>
      </div>
    </div>
  )
}
