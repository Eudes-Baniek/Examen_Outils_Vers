"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CreerUtilisateurPayload, RoleBiblio } from "@/lib/api/utilisateurs"

const roleEnum = z.enum(["etudiant", "personnel", "professeur"])

const schema = z.object({
  nom: z.string().min(2, { message: "Nom requis (min. 2 caractères)." }),
  prenom: z.string().optional(),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(6, { message: "Mot de passe (min. 6 caractères)." }),
  role: roleEnum,
  num_etudiant: z.string().optional(),
  service: z.string().optional(),
  departement: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export interface UserFormSubmitPayload extends CreerUtilisateurPayload {}

interface UserFormDialogProps {
  onSubmitUser: (payload: UserFormSubmitPayload) => Promise<void>
}

export function UserFormDialog({ onSubmitUser }: UserFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      role: "etudiant",
      num_etudiant: "",
      service: "",
      departement: "",
    },
  })

  const roleWatch = form.watch("role") as RoleBiblio | undefined

  async function onSubmit(data: FormValues) {
    setSubmitting(true)
    try {
      const payload: CreerUtilisateurPayload = {
        role: data.role,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom?.trim() ? data.prenom : null,
        password: data.password,
        num_etudiant: data.role === "etudiant" && data.num_etudiant?.trim()
          ? data.num_etudiant.trim()
          : null,
        service: data.role === "personnel" && data.service?.trim() ? data.service.trim() : null,
        departement:
          data.role === "professeur" && data.departement?.trim()
            ? data.departement.trim()
            : null,
      }
      await onSubmitUser(payload)
      form.reset()
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" type="button">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau compte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogDescription>
            Créer un compte étudiant, personnel ou professeur (API Utilisateurs).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="prenom.nom@univ.local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="etudiant">Étudiant</SelectItem>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="professeur">Professeur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {roleWatch === "etudiant" && (
              <FormField
                control={form.control}
                name="num_etudiant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° étudiant</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. E-2026-042" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {roleWatch === "personnel" && (
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. Accueil, Prêt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {roleWatch === "professeur" && (
              <FormField
                control={form.control}
                name="departement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. Informatique" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" className="cursor-pointer" disabled={submitting}>
                {submitting ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
