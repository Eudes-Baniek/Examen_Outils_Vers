"use client"

import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn, getAppUrl } from "@/lib/utils"
import {
  utilisateurVersSessionPayload,
  loginUtilisateur,
} from "@/lib/api/utilisateurs"
import { apiEnv } from "@/lib/api/env"
import { setReaderSession } from "@/lib/auth/reader-session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function LoginForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate()
  const location = useLocation()
  const rawFrom = (location.state as { from?: string } | null)?.from?.trim()

  const [pending, setPending] = React.useState(false)

  function buildPostLoginTarget(
    raw: string | undefined,
    role: "etudiant" | "personnel" | "professeur",
  ): string {
    const fallback =
      role === "personnel" ? getAppUrl("/personnel") : getAppUrl("/catalogue")
    if (!raw || raw.startsWith("/auth/sign-in")) return fallback
    const q = raw.indexOf("?")
    const pathPart = q >= 0 ? raw.slice(0, q) : raw
    const searchPart = q >= 0 ? raw.slice(q) : ""
    const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`
    return getAppUrl(path) + searchPart
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? ""
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? ""

    if (!apiEnv.utilisateurs()) {
      toast.error("Connexion impossible : le service de comptes n’est pas configuré pour cette installation.")
      return
    }

    setPending(true)
    try {
      const u = await loginUtilisateur({ email: email.trim(), password })
      setReaderSession(utilisateurVersSessionPayload(u))
      const target = buildPostLoginTarget(rawFrom, u.role)
      toast.success(`Bienvenue${u.prenom ? `, ${u.prenom}` : ""} !`)
      navigate(target, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connexion impossible.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={(e) => void onSubmit(e)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Connexion lecteur</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Connectez-vous pour emprunter, consulter vos recommandations et accéder à votre espace lecteur.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="vous@univ.local"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Mot de passe</Label>
            <span className="ml-auto text-xs text-muted-foreground">
              Mot de passe oublié&nbsp;? Contactez votre bibliothèque.
            </span>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Pas encore de compte&nbsp;?{" "}
        <Link
          to={getAppUrl("/auth/sign-up")}
          className="underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </div>
    </form>
  )
}
