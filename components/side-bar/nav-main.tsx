'use client'

import { ChatBubbleLeftIcon, ListBulletIcon } from '@heroicons/react/24/outline'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { usePathname, useRouter } from 'next/navigation'

export function NavMain({}) {
  const pathname = usePathname()
  const router = useRouter()
  const isCopilot = pathname.includes('/copilot')

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem key="new-chat">
          <SidebarMenuButton
            asChild
            tooltip="New Session"
            isActive={isCopilot}
            onClick={() => {
              if (isCopilot) {
                window.location.reload()
              } else {
                router.push('/copilot')
              }
            }}
          >
            <div className="flex items-center cursor-pointer">
              <ChatBubbleLeftIcon className="size-5" />
              <span className="mb-0.5">New Session</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
