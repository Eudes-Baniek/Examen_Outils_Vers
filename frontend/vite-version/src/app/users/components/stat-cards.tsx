import { Card, CardContent } from "@/components/ui/card"
import { Users, GraduationCap, Briefcase, School } from "lucide-react"

export interface ComptesParRole {
  total: number
  etudiant: number
  personnel: number
  professeur: number
}

export function StatCards({ counts }: { counts: ComptesParRole }) {
  const cards = [
    {
      title: "Comptes",
      value: counts.total,
      icon: Users,
      subtitle: "utilisateurs enregistrés",
    },
    {
      title: "Étudiants",
      value: counts.etudiant,
      icon: GraduationCap,
      subtitle: "",
    },
    {
      title: "Personnel",
      value: counts.personnel,
      icon: Briefcase,
      subtitle: "",
    },
    {
      title: "Professeurs",
      value: counts.professeur,
      icon: School,
      subtitle: "",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((metric) => (
        <Card key={metric.title} className="border">
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
              <metric.icon className="text-muted-foreground size-6" />
            </div>
            <div className="text-2xl font-bold tabular-nums">{metric.value}</div>
            {metric.subtitle ? (
              <p className="text-muted-foreground text-xs">{metric.subtitle}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
