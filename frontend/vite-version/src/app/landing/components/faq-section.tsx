import { CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: "item-1",
    question: "Puis-je consulter le catalogue sans créer de compte ?",
    answer:
      "Oui. Tous les visiteurs peuvent parcourir les livres, lire les notices et utiliser la recherche par titre, auteur ou ISBN. Seules les actions d’emprunt et les recommandations personnalisées nécessitent une connexion.",
  },
  {
    value: "item-2",
    question: "Quelle est la différence entre étudiant, professeur et personnel ?",
    answer:
      "Les trois types de compte permettent d’emprunter et de consulter les recommandations. Le personnel de la bibliothèque dispose en plus d’un espace réservé pour gérer le fonds documentaire et les comptes.",
  },
  {
    value: "item-3",
    question: "Comment prolonger ou rendre un document ?",
    answer:
      "Les échéances et retours visibles dans « Mes emprunts » suivent les règles du service de prêt. Contactez la bibliothèque pour tout cas particulier (prolongation, réservation prioritaire).",
  },
  {
    value: "item-4",
    question: "Les données sont-elles protégées ?",
    answer:
      "Oui. Les comptes utilisateurs et l’historique des prêts sont traités côté serveur de façon sécurisée (bonnes pratiques de développement, aucun secret sensible exposé dans le navigateur pour les données confidentielles).",
  },
  {
    value: "item-5",
    question: "Comment sont calculées les recommandations « Pour vous » ?",
    answer:
      "Le service analyse le fonds catalogué pour proposer une sélection en fonction du profil sélectionné. Les résultats s’adaptent lorsque vous changez de compte dans la page dédiée.",
  },
  {
    value: "item-6",
    question: "Où trouver une aide ou signaler un problème ?",
    answer:
      "Utilisez le formulaire de contact ci-dessous ou écrivez directement au personnel de la bibliothèque pour signaler une erreur de notice, un problème de prêt ou un besoin documentaire précis.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Questions fréquentes</h2>
          <p className="text-lg text-muted-foreground">
            Tout ce qu’il faut savoir sur le catalogue, les emprunts et les différents comptes utilisateurs avant de
            commencer une recherche ou un prêt.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-transparent">
            <div className="p-0">
              <Accordion type="single" collapsible className="space-y-5">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.value}
                    value={item.value}
                    className="rounded-md !border bg-transparent"
                  >
                    <AccordionTrigger className="cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                          <CircleHelp className="size-5" />
                        </div>
                        <span className="text-start font-semibold">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-transparent">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Une autre question ? Écrivez-nous.</p>
            <Button className="cursor-pointer" asChild>
              <a href="#contact">Contacter la bibliothèque</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
