import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CardDecorator } from "@/components/ui/card-decorator"
import { BookOpen, GraduationCap, Shield, Users } from "lucide-react"

const values = [
  {
    icon: BookOpen,
    title: "Accès au savoir",
    description:
      "Le catalogue est ouvert à tous : parcourir, rechercher par titre, auteur ou ISBN, sans créer de compte.",
  },
  {
    icon: GraduationCap,
    title: "Parcours pédagogique",
    description:
      "Étudiants et enseignants disposent d’emprunts et de recommandations adaptés à leurs besoins de lecture.",
  },
  {
    icon: Shield,
    title: "Données protégées",
    description:
      "Les comptes et l’historique des prêts sont gérés côté serveur par des microservices sécurisés.",
  },
  {
    icon: Users,
    title: "Équipe bibliothèque",
    description:
      "Le personnel assure la gestion du fonds, des utilisateurs et des espaces réservés à l’administration.",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            À propos
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            La Bibliothèque numérique DIT
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Nous poursuivons la vocation de l’établissement : diffuser le savoir, nourrir les projets créatifs et les
            débats scientifiques. Cette plateforme regroupe catalogue public, emprunts, recommandations et outils pour
            l’équipe documentaire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className="group shadow-xs py-2">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <CardDecorator>
                    <value.icon className="h-6 w-6" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 font-medium text-balance">{value.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">Conçu pour la communauté DIT</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <Link to="/catalogue">Découvrir le catalogue</Link>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <Link to="/auth/sign-up">Ouvrir un compte lecteur</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
