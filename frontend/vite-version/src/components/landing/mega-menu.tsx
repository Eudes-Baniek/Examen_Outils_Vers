import {
  Shield,
  BarChart3,
  BookOpen,
  Building2,
  Rocket,
  Settings,
  Sparkles,
  Package,
  Layout,
  Crown,
  GraduationCap,
} from "lucide-react"

const menuSections = [
  {
    title: "Découvrir la plateforme",
    items: [
      {
        title: "Catalogue des livres",
        description: "Parcourez tout le fonds sans compte, recherche titre / auteur / ISBN.",
        icon: BookOpen,
        href: "/catalogue",
      },
      {
        title: "Mes emprunts",
        description: "Suivez vos prêts, retards et prolongations après connexion.",
        icon: Package,
        href: "#features",
      },
      {
        title: "Pour vous — recommandations",
        description: "Suggestions de lecture selon votre profil connecté.",
        icon: Sparkles,
        href: "#features",
      },
      {
        title: "Espace présentation",
        description: "Une interface simple pour lecteurs et équipe bibliothèque.",
        icon: Layout,
        href: "#about",
      },
    ],
  },
  {
    title: "Publics & rôles",
    items: [
      {
        title: "Étudiants",
        description: "Accès emprunts et recommandations avec un compte lecteur.",
        icon: GraduationCap,
        href: "/auth/sign-up",
      },
      {
        title: "Personnel & administration",
        description: "Gestion des ouvrages et des comptes (rôle personnel).",
        icon: Building2,
        href: "/auth/sign-in",
      },
      {
        title: "Enseignants-chercheurs",
        description: "Profils professeur pour accès aligné aux services pédagogiques.",
        icon: Crown,
        href: "/auth/sign-up",
      },
      {
        title: "Sécurité & qualité de service",
        description: "Données des prêts et des comptes protégées côté serveur.",
        icon: Shield,
        href: "#faq",
      },
    ],
  },
  {
    title: "Ressources",
    items: [
      {
        title: "Questions fréquentes",
        description: "Emprunter, catalogue public, types de comptes.",
        icon: Settings,
        href: "#faq",
      },
      {
        title: "Statistiques du fonds",
        description: "Indicateurs d’usage et de périmètres métier dans le tableau de suivi.",
        icon: BarChart3,
        href: "#stats",
      },
      {
        title: "Contribution & projet",
        description: "Référentiel du template et pistes d’extension numérique.",
        icon: Rocket,
        href: "https://github.com/silicondeck/shadcn-dashboard-landing-template",
      },
      {
        title: "Architecture web",
        description: "Interface moderne, accessible, adaptée bureau et mobile.",
        icon: Crown,
        href: "#about",
      },
    ],
  },
]

export function MegaMenu() {
  return (
    <div className="w-[700px] max-w-[95vw] p-4 sm:p-6 lg:p-8 bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-4 lg:space-y-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h3>

            <div className="space-y-3 lg:space-y-4">
              {section.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group block space-y-1 lg:space-y-2 hover:bg-accent rounded-md p-2 lg:p-3 -mx-2 lg:-mx-3 transition-colors my-0"
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ml-6 lg:ml-7">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
