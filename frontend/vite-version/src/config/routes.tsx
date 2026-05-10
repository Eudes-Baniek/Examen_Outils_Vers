import { lazy } from "react"
import { Navigate } from "react-router-dom"
import { RequireReader } from "@/components/auth/require-reader"
import { RequirePersonnel } from "@/components/auth/require-personnel"

const Landing = lazy(() => import("@/app/landing/page"))
const Catalogue = lazy(() => import("@/app/catalogue/page"))
const Emprunts = lazy(() => import("@/app/emprunts/page"))
const Recommandations = lazy(() => import("@/app/recommandations/page"))
const Profil = lazy(() => import("@/app/profil/page"))
const Personnel = lazy(() => import("@/app/personnel/page"))
const SignIn2 = lazy(() => import("@/app/auth/sign-in-2/page"))
const SignUp2 = lazy(() => import("@/app/auth/sign-up-2/page"))
const NotFound = lazy(() => import("@/app/errors/not-found/page"))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}

export const routes: RouteConfig[] = [
  { path: "/", element: <Landing /> },
  { path: "/dashboard", element: <Navigate to="/catalogue" replace /> },
  { path: "/catalogue", element: <Catalogue /> },
  {
    path: "/emprunts",
    element: (
      <RequireReader>
        <Emprunts />
      </RequireReader>
    ),
  },
  {
    path: "/recommandations",
    element: (
      <RequireReader>
        <Recommandations />
      </RequireReader>
    ),
  },
  {
    path: "/profil",
    element: (
      <RequireReader>
        <Profil />
      </RequireReader>
    ),
  },
  { path: "/admin", element: <Navigate to="/personnel" replace /> },
  {
    path: "/personnel",
    element: (
      <RequireReader>
        <RequirePersonnel>
          <Personnel />
        </RequirePersonnel>
      </RequireReader>
    ),
  },

  { path: "/auth/sign-in", element: <SignIn2 /> },
  { path: "/auth/sign-in-2", element: <Navigate to="/auth/sign-in" replace /> },
  { path: "/auth/sign-up", element: <SignUp2 /> },
  { path: "/auth/sign-up-2", element: <Navigate to="/auth/sign-up" replace /> },

  { path: "*", element: <NotFound /> },
]
