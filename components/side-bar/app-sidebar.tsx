'use client'

import * as React from 'react'
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
import { SidebarHead } from './sidebar-head'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  // console.log(state)
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarHead />
      </SidebarHeader>
      <SidebarContent className="p-1 overflow-y-auto thin-scroll pt-0">
        <NavSessions />
      </SidebarContent>
    </Sidebar>
  )
}
