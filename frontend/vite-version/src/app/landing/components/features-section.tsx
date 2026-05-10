import {
  BookOpen,
  Sparkles,
  Users,
  ArrowRight,
  Library,
  Search,
  GraduationCap,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Image3D } from "@/components/image-3d"

const mainFeatures = [
  {
    icon: BookOpen,
    title: "Catalogue centralisé",
    description:
      "Listes paginées, recherche par titre, auteur ou ISBN pour trouver vite le bon ouvrage.",
  },
  {
    icon: Library,
    title: "Gestion du fonds",
    description:
      "Ajouter, modifier ou retirer des livres depuis l’espace réservé au personnel bibliothèque.",
  },
  {
    icon: Sparkles,
    title: "Recommandations",
    description:
      "Des suggestions « Pour vous » basées sur le fonds lorsque vous êtes connecté.",
  },
  {
    icon: Search,
    title: "Recherche précise",
    description:
      "Filtrez par mots-clés ; les métadonnées sont alignées sur le microservice Livres.",
  },
]

const secondaryFeatures = [
  {
    icon: Users,
    title: "Trois profils utilisateurs",
    description: "Étudiant, enseignant, personnel bibliothèque — chaque rôle a ses accès prévus.",
  },
  {
    icon: ShieldCheck,
    title: "Emprunts authentifiés",
    description: "Le catalogue reste ouvert à tous ; l’action d’emprunt nécessite un compte valide.",
  },
  {
    icon: GraduationCap,
    title: "Prêt étudiant & enseignant",
    description: "Historique visible et parcours cohérent avec les services Emprunts et Reco.",
  },
  {
    icon: Library,
    title: "Interface responsive",
    description: "Consultation confortable sur ordinateur, tablette ou smartphone.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Tout pour gérer et découvrir les livres
          </h2>
          <p className="text-lg text-muted-foreground">
            Une interface unique reliant catalogue, gestion du fonds, emprunts et recommandations, pensée pour la
            bibliothèque numérique du DIT.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          <Image3D
            lightSrc="/feature-1-light.png"
            darkSrc="/feature-1-dark.png"
            alt="Aperçu du catalogue et des statistiques"
            direction="left"
          />
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Du fonds documentaire à l’écran lecteur
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Retrouvez les ouvrages du programme, suivez les disponibilités et préparez vos emprunts sans quitter
                le navigateur.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <Link to="/catalogue" className="flex items-center">
                  Ouvrir le catalogue
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <Link to="/auth/sign-in">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Conçu pour les usages réels de l’établissement
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                La plateforme sépare clairement la consultation publique des actions qui nécessitent un compte
                (emprunt, recommandations personnalisées, administration).
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <Link to="/auth/sign-up" className="flex items-center">
                  Créer un compte
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a
                  href="https://github.com/silicondeck/shadcn-dashboard-landing-template"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Référentiel GitHub du thème UI
                </a>
              </Button>
            </div>
          </div>

          <Image3D
            lightSrc="/feature-2-light.png"
            darkSrc="/feature-2-dark.png"
            alt="Consultation bibliothèque sur plusieurs appareils"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
