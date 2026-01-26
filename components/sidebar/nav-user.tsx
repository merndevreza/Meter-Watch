"use client" 
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { IconLogout } from "@tabler/icons-react"
import { signOut } from "next-auth/react"
import { User } from "@/types/user" 

export function NavUser({ user }: { user: User }) {

  return (
    <SidebarMenu>
      <SidebarMenuItem> 
        <Button onClick={() => signOut()} className="w-full">
          <IconLogout />
          Log out
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
