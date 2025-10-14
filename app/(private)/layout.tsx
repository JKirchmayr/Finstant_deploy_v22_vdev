import { AppSidebar } from '@/components/side-bar/app-sidebar'
import { TopNavbar } from '@/components/NavBar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React, { ReactNode } from 'react'

export default function layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar collapsible="expand-on-hover" />
      <SidebarInset>
        <div className="h-dvh flex flex-col overflow-hidden">
          <TopNavbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
