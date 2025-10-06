'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { useGetUserSessionsQuery } from '@/queries/sessions'
import { SessionRow } from '@/types/common.types'

type SessionTypes = SessionRow & {
  date_group: string
}

export function NavSessions({}) {
  const { data, isLoading } = useGetUserSessionsQuery()

  if (isLoading || !data) return null

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden sm:hidden group-data-[state=expanded]:flex pt-0">
      <SidebarGroupLabel className="text-sm sticky top-0 z-30 bg-white dark:bg-black">
        History
      </SidebarGroupLabel>
      <SidebarMenu>
        {Object.entries(data?.data).map(([group, sessions]) => (
          <SidebarGroup key={group} className="p-0">
            <SidebarGroupLabel className="truncate sticky top-[2rem] z-20 bg-white dark:bg-black">
              {group}
            </SidebarGroupLabel>
            {(sessions as SessionTypes[]).map(session => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/sessions/${session.id}`}>
                    <span>{session.session_title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
