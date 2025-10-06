'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChatBubbleLeftIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export function SidebarHead() {
  const { state } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const isCopilot = pathname.includes('/copilot')
  const isSavedLists = pathname.includes('/saved-lists')

  return (
    <div className="bg-background hover:bg-transparent">
      <div className="flex aspect-square size-8 items-center justify-center">
        <Image src="/images/logo_small.jpg" width={32} height={32} alt="logo" className="size-8" />
      </div>
      <div className="pt-4 pb-2 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem key="new-chat">
            <SidebarMenuButton
              asChild
              tooltip=""
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
        <SidebarMenu>
          <SidebarMenuItem key="saved-lists">
            <SidebarMenuButton
              asChild
              tooltip=""
              isActive={isSavedLists}
              onClick={() => router.push('/saved-list')}
            >
              <div className="flex items-center cursor-pointer">
                <ListBulletIcon className="size-5" />
                <span className="mb-0.5">Saved Lists</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </div>
  )
}
