"use client"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { User } from "@/types/user"
import { CirclePlus, LayoutDashboard } from "lucide-react"
import SiteLogo from "../SiteLogo"

export function AppSidebar({ lang, user }: { lang: "en" | "bn"; user: User }) {

  const navMain = [
    {
      title: "Dashboard",
      url: `/${lang}`,
      icon: LayoutDashboard,
    },
    {
      title: "Add Meter",
      url: `/${lang}/add-edit-meter`,
      icon: CirclePlus,
    },
  ];
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SiteLogo />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
