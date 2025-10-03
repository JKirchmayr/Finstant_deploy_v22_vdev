'use client'

import * as React from 'react'
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
} from 'lucide-react'

import { NavMain } from '@/components/side-bar/nav-main'
import { NavSessions } from '@/components/side-bar/nav-sessions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'
import { SidebarHead } from './sidebar-head'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const isExpanded = state === 'expanded'
  console.log(state)
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarHead />
      </SidebarHeader>
      <SidebarContent className="p-1 overflow-y-auto">
        <NavSessions />
      </SidebarContent>
    </Sidebar>
  )
}
