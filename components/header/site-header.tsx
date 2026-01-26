import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DarkLightToggle } from "../theme-toggle/DarkLightToggle"
import LanguageSwitcher from "../LanguageSwitcher" 
import { Avatar, AvatarImage } from "../ui/avatar"
import { CircleUserRound } from "lucide-react"
import { User } from "@/types/user"

export function SiteHeader({ user, lang }: { lang: "en" | "bn", user: User }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
         <div className="flex items-center gap-3" >
          <Avatar className="h-8 w-8 rounded-lg grayscale flex items-center justify-end">
            {user?.image ? <AvatarImage src={user?.image} alt={user.name} /> : <CircleUserRound />}
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            {user.name && (<span className="truncate font-medium">{user.name}</span>)}
            <span className="text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DarkLightToggle />
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  )
}
