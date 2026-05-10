import { Link } from "react-router-dom"
import { ArrowRight, Play, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DotPattern } from "@/components/dot-pattern"

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-16 sm:pt-20 pb-16"
    >
      <div className="absolute inset-0">
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-foreground">
              <Star className="w-3 h-3 mr-2 fill-current" />
              Nouveau : parcours bibliothèque tout-en-un
              <ArrowRight className="w-3 h-3 ml-2" />
            </Badge>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Une bibliothèque
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}
              numérique
            </span>{" "}
            pour étudiants et enseignants
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Consultez le catalogue en libre accès. Empruntez ou recevez des recommandations dès que vous avez créé votre
            compte lecteur. L’équipe bibliothèque gère le fonds et les profils depuis un espace sécurisé.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base cursor-pointer" asChild>
              <Link to="/catalogue">
                Parcourir le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base cursor-pointer" asChild>
              <Link to="/auth/sign-up">
                <Play className="mr-2 h-4 w-4" />
                Créer un compte lecteur
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <div className="relative group">
            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl" />

            <div className="relative rounded-xl border bg-card shadow-2xl">
              <img
                src="/dashboard-light.png"
                alt="Présentation de l’espace bibliothèque — thème clair"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover block dark:hidden"
                fetchPriority="high"
              />

              <img
                src="/dashboard-dark.png"
                alt="Présentation de l’espace bibliothèque — thème sombre"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover hidden dark:block"
                fetchPriority="high"
              />

              <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 lg:h-48 bg-gradient-to-b from-background/0 via-background/70 to-background rounded-b-xl" />

              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 p-0 cursor-pointer hover:scale-105 transition-transform"
                  asChild
                >
                  <Link to="/catalogue" aria-label="Aller au catalogue">
                    <Play className="h-6 w-6 fill-current" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
