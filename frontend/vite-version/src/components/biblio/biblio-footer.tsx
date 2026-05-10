"use client"

import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { ReaderSessionFooter } from "@/components/biblio/reader-session-footer"
import { getAppUrl } from "@/lib/utils"

const liens = [
  { label: "Catalogue", to: "/catalogue" },
  { label: "Emprunts", to: "/emprunts" },
  { label: "Recommandations", to: "/recommandations" },
  { label: "Connexion", to: "/auth/sign-in" },
]

export function BiblioFooter() {
  return (
    <footer className="border-t bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Logo size={20} />
          <span>BiblioNum DIT — portail bibliothèque numérique.</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {liens.map((l) => (
            <Link
              key={l.to}
              to={getAppUrl(l.to)}
              className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
            >
              {l.label}
            </Link>
          ))}
          <ReaderSessionFooter />
        </nav>
      </div>
    </footer>
  )
}
