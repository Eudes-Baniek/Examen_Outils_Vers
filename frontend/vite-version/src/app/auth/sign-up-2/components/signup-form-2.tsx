"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn, getAppUrl } from "@/lib/utils"
import {
  creerUtilisateur,
  utilisateurVersSessionPayload,
  type RoleBiblio,
} from "@/lib/api/utilisateurs"
import { apiEnv } from "@/lib/api/env"
import { setReaderSession } from "@/lib/auth/reader-session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export function SignupForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate()
  const [role, setRole] = React.useState<Exclude<RoleBiblio, "personnel">>("etudiant")
  const [pending, setPending] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const pw = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? ""
    const pw2 =
      (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value ?? ""
    if (pw !== pw2) {
      toast.error("Les mots de passe ne correspondent pas.")
      return
    }
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? ""
    const firstName =
      (form.elements.namedItem("firstName") as HTMLInputElement)?.value ?? ""
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement)?.value ?? ""
    const numEtudiant =
      (form.elements.namedItem("numEtudiant") as HTMLInputElement)?.value ?? ""
    const departement =
      (form.elements.namedItem("departement") as HTMLInputElement)?.value ?? ""

    if (!apiEnv.utilisateurs()) {
      toast.error("Inscription impossible : le service de comptes n’est pas configuré pour cette installation.")
      return
    }

    const body = {
      role,
      email: email.trim(),
      nom: lastName.trim(),
      prenom: firstName.trim() || null,
      password: pw,
      num_etudiant: role === "etudiant" && numEtudiant.trim() ? numEtudiant.trim() : null,
      departement: role === "professeur" && departement.trim() ? departement.trim() : null,
    }

    setPending(true)
    try {
      const created = await creerUtilisateur(body)
      setReaderSession(utilisateurVersSessionPayload(created))
      navigate(getAppUrl("/"), { replace: true })
      toast.success("Compte créé — vous êtes connecté.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Création impossible.")
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
        <h1 className="text-2xl font-bold">Créer un compte lecteur</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Inscription publique limitée aux rôles <strong>étudiant</strong> et <strong>professeur</strong>.
          Les comptes du personnel bibliothèque sont créés sur demande par l’administration.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label>Type de compte</Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Exclude<RoleBiblio, "personnel">)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Profil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="etudiant">Étudiant</SelectItem>
              <SelectItem value="professeur">Professeur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-3">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" placeholder="Aminata" required />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" placeholder="Diop" required />
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="prenom.nom@univ.local"
            autoComplete="email"
            required
          />
        </div>
        {role === "etudiant" ? (
          <div className="grid gap-3">
            <Label htmlFor="numEtudiant">N° étudiant (optionnel)</Label>
            <Input id="numEtudiant" name="numEtudiant" placeholder="E-2026-042" />
          </div>
        ) : null}
        {role === "professeur" ? (
          <div className="grid gap-3">
            <Label htmlFor="departement">Département (optionnel)</Label>
            <Input id="departement" name="departement" placeholder="Informatique" />
          </div>
        ) : null}
        <div className="grid gap-3">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0 rounded border border-input accent-primary"
          />
          <Label htmlFor="terms" className="text-sm leading-snug font-normal">
            Je confirme l’exactitude des informations fournies.
          </Label>
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Déjà inscrit(e)&nbsp;?{" "}
        <Link
          to={getAppUrl("/auth/sign-in")}
          className="underline underline-offset-4"
        >
          Se connecter
        </Link>
      </div>
    </form>
  )
}
