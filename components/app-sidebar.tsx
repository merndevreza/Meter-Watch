"use client"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { User } from "@/types/user"
import { CirclePlus, LayoutDashboard, Zap } from "lucide-react"

const navMain = [
  {
    title: "Dashboard",
    url: "/en",
    icon: LayoutDashboard,
  },
  {
    title: "Add Meter",
    url: "/add-edit-meter",
    icon: CirclePlus,
  },
];
export function AppSidebar({ user }: { user: User }) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex gap-3">
            <Zap />
            <span className="text-base font-semibold">Meter Watch</span>
          </div>
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
