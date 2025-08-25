"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/side-bar/nav-main"
import { NavSessions } from "@/components/side-bar/nav-sessions"
import { CompanyInfo } from "@/components/side-bar/company-info"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "./side-bar/nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <CompanyInfo />
      </SidebarHeader>
      <SidebarContent className="p-1">
        <NavMain />
        <NavSessions />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
