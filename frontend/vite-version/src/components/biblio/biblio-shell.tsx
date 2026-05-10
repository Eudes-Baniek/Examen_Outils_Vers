import type { ReactNode } from "react"
import { BiblioNavbar } from "@/components/biblio/biblio-navbar"
import { BiblioFooter } from "@/components/biblio/biblio-footer"

type BiblioShellProps = {
  children: ReactNode
}

/** Conteneur commun bibliothèque (navigation minimale alignée projet examen). */
export function BiblioShell({ children }: BiblioShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BiblioNavbar />
      <main className="flex-1">{children}</main>
      <BiblioFooter />
    </div>
  )
}
