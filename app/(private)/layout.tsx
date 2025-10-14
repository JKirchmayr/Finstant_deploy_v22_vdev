import { AppSidebar } from '@/components/side-bar/app-sidebar'
import { TopNavbar } from '@/components/NavBar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React, { ReactNode } from 'react'

export default function layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar collapsible="expand-on-hover" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
