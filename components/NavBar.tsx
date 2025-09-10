'use client'

import React, { useState } from 'react'
import { FolderOpen, X, User, Settings, LogOut, Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useFileStore } from '@/store/useCompanyProfile'
import { InlineCard } from './chat/InlineCard'
import { useChatStore } from '@/store/chatStore'
import { InlineListCard } from './chat/InlineListCard'

// Files dropdown component
const FilesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isStreaming, openListPanel } = useChatStore()

  const inlineCards =
    messages.filter(m => m.role === 'inline_card' || m.role === 'inline_list_card') || []
  // console.log(inlineCards)
  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 hover:bg-gray-100 relative rounded-full"
      >
        <FolderOpen className="h-4 w-4" />
        {/* 4. Dynamic indicator badge */}
        {inlineCards.length > 0 && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-700 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-[8px] text-white font-bold">{inlineCards.length}</span>
          </div>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-4 w-80 h-[28rem] bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Files</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 hover:bg-gray-200 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 5. Dynamic Content Area */}
            <div className="flex-1 p-2 overflow-y-auto space-y-2" onClick={() => setIsOpen(false)}>
              {inlineCards.length > 0 ? (
                inlineCards.map((card, index) =>
                  card.role === 'inline_card' ? (
                    <InlineCard
                      key={card.id || index}
                      name={card.data?.name}
                      city={card.data?.city}
                      country={card.data?.country}
                      website={card.data?.website}
                      logo={card.data?.logo || ''}
                      type={card.data?.type}
                      content={card.content}
                      isStreaming={isStreaming}
                    />
                  ) : (
                    <InlineListCard
                      key={card.id || index}
                      title={card.data?.profile?.title}
                      itemCount={card.data?.profile?.estimated_list_item_count}
                      isStreaming={isStreaming}
                      onClick={() =>
                        openListPanel(
                          card.id,
                          card.data?.profile?.title,
                          card.data?.list,
                          card.data?.profile?.estimated_list_item_count
                        )
                      }
                    />
                  )
                )
              ) : (
                <div className="flex items-center justify-center h-full text-center text-sm text-gray-500">
                  <p>No files generated in this session.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// User avatar component
const UserAvatar = () => {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { setUser } = useAuthStore()

  // Get user initials
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userName = user?.user_metadata?.full_name || user?.email || 'User'
  const userInitials = getInitials(userName)

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error('Error while logging out. Please try again.')
        return
      }

      // Clear user from store
      setUser(null)

      toast.success('Logged out successfully!')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to log out. Please try again.')
      console.error('Logout Error:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs font-medium bg-blue-100 text-gray-800">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Main navbar component
export const TopNavbar = () => {
  return (
    <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-end px-4 gap-4">
      <FilesDropdown />
      <UserAvatar />
    </div>
  )
}
