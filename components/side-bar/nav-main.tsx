"use client";


import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";


const items = [
  { name: "New Chat", url: "/", Icon: ChatBubbleLeftIcon },
  
];

export function NavMain({}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const { Icon } = item;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  
                  <Icon className="size-5" /> 
                  <span className="mb-0.5">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}