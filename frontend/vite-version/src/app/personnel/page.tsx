"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BiblioShell } from "@/components/biblio/biblio-shell"
import { LivresAdminPanel } from "@/app/personnel/livres-admin-panel"
import { UtilisateursAdminPanel } from "@/app/personnel/utilisateurs-admin-panel"

/** Espace administration (personnel = admin UI) — livres + comptes. */
export default function PersonnelPage() {
  return (
    <BiblioShell>
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Espace personnel (admin)</h1>
          <p className="text-muted-foreground max-w-2xl">
            Réservé aux comptes avec le rôle <strong>personnel</strong> pour la gestion des ouvrages et
            le suivi des comptes lecteurs.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="livres" className="w-full gap-6">
          <TabsList className="max-w-md w-full grid grid-cols-2">
            <TabsTrigger value="livres">Livres</TabsTrigger>
            <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
          </TabsList>
          <TabsContent value="livres" className="mt-0">
            <LivresAdminPanel />
          </TabsContent>
          <TabsContent value="utilisateurs" className="mt-0">
            <UtilisateursAdminPanel />
          </TabsContent>
        </Tabs>
      </section>
    </BiblioShell>
  )
}
