import { LoginForm2 } from "./components/login-form-2"
import { Logo } from "@/components/logo"
import { assetUrl, getAppUrl } from "@/lib/utils"
import { BookMarked } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href={getAppUrl("/")} className="flex items-center gap-2 font-medium">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
              <BookMarked className="size-5" aria-hidden />
            </span>
            <span className="flex items-center gap-2">
              <Logo size={24} />
              BiblioNum DIT
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm2 />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <img
          src={assetUrl("images/bibliotheque-lecteurs.png")}
          alt="Lecteurs consultant un ouvrage à la bibliothèque"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>
    </div>
  )
}
