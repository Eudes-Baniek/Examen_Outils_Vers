import type { MouseEvent } from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Github, Library, ChevronDown, X, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Logo } from "@/components/logo"
import { MegaMenu } from "@/components/landing/mega-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { useTheme } from "@/hooks/use-theme"

const navigationItems = [
  { name: "Accueil", href: "#hero" },
  { name: "Fonctionnalités", href: "#features" },
  { name: "Services", href: "#features", hasMegaMenu: true },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
]

type MobileNavEntry =
  | { kind: "heading"; title: string }
  | { kind: "link"; name: string; href: string }

const solutionsItems: MobileNavEntry[] = [
  { kind: "heading", title: "Parcourir le site" },
  { kind: "link", name: "Catalogue ouvert à tous", href: "/catalogue" },
  { kind: "link", name: "Emprunts (compte lecteur)", href: "#features" },
  { kind: "link", name: "Recommandations lecture", href: "#features" },
  { kind: "heading", title: "Espaces utilisateurs" },
  { kind: "link", name: "Créer un compte étudiant", href: "/auth/sign-up" },
  { kind: "link", name: "Connexion professeur", href: "/auth/sign-in" },
  { kind: "link", name: "Espace personnel bibliothèque", href: "/auth/sign-in" },
  { kind: "heading", title: "Aide & contenu" },
  { kind: "link", name: "Foire aux questions", href: "#faq" },
  {
    kind: "link",
    name: "Référentiel GitHub du thème UI",
    href: "https://github.com/silicondeck/shadcn-dashboard-landing-template",
  },
]

function smoothScrollTo(targetId: string) {
  if (targetId.startsWith("#")) {
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
}

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer" aria-label="Accueil">
            <Logo size={32} />
            <span className="font-bold">Bibliothèque numérique DIT</span>
          </Link>
        </div>

        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasMegaMenu ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary cursor-pointer">
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenu />
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                    onClick={(e: MouseEvent) => {
                      e.preventDefault()
                      if (item.href.startsWith("#")) {
                        smoothScrollTo(item.href)
                      } else {
                        window.location.href = item.href
                      }
                    }}
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden xl:flex items-center space-x-2">
          <ModeToggle variant="ghost" />
          <Button variant="ghost" size="icon" asChild className="cursor-pointer">
            <a
              href="https://github.com/silicondeck/shadcn-dashboard-landing-template"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dépôt GitHub du template"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link to="/catalogue">
              <Library className="h-4 w-4 mr-2" />
              Catalogue
            </Link>
          </Button>
          <Button variant="ghost" asChild className="cursor-pointer">
            <Link to="/auth/sign-in">Connexion</Link>
          </Button>
          <Button asChild className="cursor-pointer">
            <Link to="/auth/sign-up">Créer un compte</Link>
          </Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[400px] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Logo size={16} />
                  </div>
                  <SheetTitle className="text-lg font-semibold">Bibliothèque DIT</SheetTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="cursor-pointer h-8 w-8"
                    >
                      <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="cursor-pointer h-8 w-8">
                      <a
                        href="https://github.com/silicondeck/shadcn-dashboard-landing-template"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="cursor-pointer h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      {item.hasMegaMenu ? (
                        <Collapsible open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            {item.name}
                            <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1">
                            {solutionsItems.map((entry, index) =>
                              entry.kind === "heading" ? (
                                <div
                                  key={`h-${index}`}
                                  className="px-4 mt-5 py-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider"
                                >
                                  {entry.title}
                                </div>
                              ) : (
                                <a
                                  key={`${entry.name}-${index}`}
                                  href={entry.href}
                                  className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={(e) => {
                                    setIsOpen(false)
                                    if (entry.href.startsWith("#")) {
                                      e.preventDefault()
                                      setTimeout(() => smoothScrollTo(entry.href), 100)
                                    }
                                  }}
                                  {...(entry.href.startsWith("http")
                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                    : {})}
                                >
                                  {entry.name}
                                </a>
                              ),
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
                          href={item.href}
                          className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            setIsOpen(false)
                            if (item.href.startsWith("#")) {
                              e.preventDefault()
                              setTimeout(() => smoothScrollTo(item.href), 100)
                            }
                          }}
                        >
                          {item.name}
                        </a>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="border-t p-6 space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" size="lg" asChild className="w-full cursor-pointer">
                    <Link to="/catalogue" onClick={() => setIsOpen(false)}>
                      <Library className="size-4" />
                      Catalogue
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" asChild className="cursor-pointer">
                      <Link to="/auth/sign-in" onClick={() => setIsOpen(false)}>
                        Connexion
                      </Link>
                    </Button>
                    <Button asChild size="lg" className="cursor-pointer">
                      <Link to="/auth/sign-up" onClick={() => setIsOpen(false)}>
                        S’inscrire
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
