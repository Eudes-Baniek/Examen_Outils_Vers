"use client"

import * as React from "react"
import { Menu, BookMarked, Moon, Sun } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getAppUrl } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { useTheme } from "@/hooks/use-theme"
import {
  clearReaderSession,
  isPersonnelSession,
  isReaderAuthenticated,
} from "@/lib/auth/reader-session"

const navPublic = [
  { label: "Catalogue", to: "/catalogue" },
  { label: "Emprunts", to: "/emprunts", needsAuth: true },
  { label: "Recommandations", to: "/recommandations", needsAuth: true },
  { label: "Profil", to: "/profil", needsAuth: true },
]

export function BiblioNavbar() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const { setTheme, theme } = useTheme()
  const [sessionTick, setSessionTick] = React.useState(0)

  React.useEffect(() => {
    const sync = () => setSessionTick((t) => t + 1)
    window.addEventListener("biblio-auth-change", sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener("biblio-auth-change", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const authed = isReaderAuthenticated()
  const isPersonnel = isPersonnelSession()
  // sessionTick évite fermetures eslint sur deps ; déclenche re-render au login
  void sessionTick

  const links = navPublic.filter((l) => !l.needsAuth || authed)

  const linkCls =
    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between gap-4">
        <Link
          to={getAppUrl("/")}
          className="flex items-center gap-2 shrink-0"
          aria-label="Bibliothèque numérique DIT — accueil"
        >
          <BookMarked className="h-6 w-6 text-primary shrink-0" aria-hidden />
          <Logo size={28} />
          <span className="font-semibold hidden sm:inline">BiblioNum DIT</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={getAppUrl(l.to)} className={linkCls}>
              {l.label}
            </Link>
          ))}
          {isPersonnel ? (
            <Link to={getAppUrl("/personnel")} className={linkCls}>
              Personnel (admin)
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex">
            <ModeToggle variant="ghost" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {!authed ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={getAppUrl("/auth/sign-in")}>Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={getAppUrl("/auth/sign-up")}>Créer un compte</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={getAppUrl("/auth/sign-in")}>Autre compte</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    clearReaderSession()
                    navigate(getAppUrl("/"), { replace: true })
                  }}
                >
                  Déconnexion
                </Button>
              </>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,320px)]">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-2">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    aria-label="Basculer le thème"
                  >
                    <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </div>
              </SheetHeader>
              <nav className="flex flex-col gap-1 pt-4">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={getAppUrl(l.to)}
                    className="px-3 py-3 rounded-md text-sm font-medium hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                {isPersonnel ? (
                  <Link
                    to={getAppUrl("/personnel")}
                    className="px-3 py-3 rounded-md text-sm font-medium hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Personnel (admin)
                  </Link>
                ) : null}
                <div className="border-t my-2" />
                {!authed ? (
                  <>
                    <Link
                      to={getAppUrl("/auth/sign-in")}
                      className="px-3 py-3 rounded-md text-sm font-medium hover:bg-accent"
                      onClick={() => setOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to={getAppUrl("/auth/sign-up")}
                      className="px-3 py-3 rounded-md text-sm font-medium hover:bg-accent"
                      onClick={() => setOpen(false)}
                    >
                      Créer un compte
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={getAppUrl("/auth/sign-in")}
                      className="px-3 py-3 rounded-md text-sm font-medium hover:bg-accent"
                      onClick={() => setOpen(false)}
                    >
                      Autre compte
                    </Link>
                    <button
                      type="button"
                      className="text-left px-3 py-3 rounded-md text-sm font-medium hover:bg-accent"
                      onClick={() => {
                        clearReaderSession()
                        setOpen(false)
                        navigate(getAppUrl("/"), { replace: true })
                      }}
                    >
                      Déconnexion
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
