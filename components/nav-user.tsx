"use client"

import {
  Avatar, 
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { IconLogout } from "@tabler/icons-react"
import { signOut } from "next-auth/react"
import { User } from "@/types/user"
import { CircleUserRound } from "lucide-react"

export function NavUser({ user }: { user: User }) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 mb-6" >
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
        <Button onClick={() => signOut()} className="w-full">
          <IconLogout />
          Log out
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
