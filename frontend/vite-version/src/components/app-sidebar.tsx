"use client"

import * as React from "react"
import {
  LayoutList,
  BookOpenCheck,
  Sparkles,
  UserCircle,
  ShieldCheck,
  BookMarked,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"
import { getAppUrl } from "@/lib/utils"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "BiblioNum",
    email: "portail.exemple@univ.local",
    avatar: "",
  },
  navGroups: [
    {
      label: "Bibliothèque",
      items: [
        {
          title: "Catalogue",
          url: "/catalogue",
          icon: BookMarked,
        },
        {
          title: "Emprunts",
          url: "/emprunts",
          icon: BookOpenCheck,
        },
        {
          title: "Recommandations",
          url: "/recommandations",
          icon: Sparkles,
        },
        {
          title: "Profil",
          url: "/profil",
          icon: UserCircle,
        },
        {
          title: "Espace personnel (admin)",
          url: "/personnel",
          icon: ShieldCheck,
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          title: "Connexion lecteur",
          url: "/auth/sign-in",
          icon: LayoutList,
        },
        {
          title: "Création de compte",
          url: "/auth/sign-up",
          icon: LayoutList,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={getAppUrl("/")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">BiblioNum DIT</span>
                  <span className="truncate text-xs">Portail biblio numérique</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
