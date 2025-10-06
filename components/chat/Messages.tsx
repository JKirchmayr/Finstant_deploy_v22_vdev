import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { Markdown } from '../markdown'
import { InlineCard } from './InlineCard'
import TypingDots from '../TypingDots'
import { useFileStore } from '@/store/useCompanyProfile'
import { Message, Source } from './chat.types'
import { InlineListCard } from './InlineListCard'
import { useChatStore } from '@/store/chatStore'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { Loader2 } from 'lucide-react'
import { useSessionListDetails, useSessionProfileDetails } from '@/queries/sessions'
import { useParams } from 'next/navigation'
import { normalizeListData } from '@/utils/normalizeListData'

type MessagesProps = {
  messages: Message[]
  isStreaming: boolean
  streamingMessage: string | null
  endRef: React.RefObject<HTMLDivElement>
  userId: string
}

export const Messages = ({
  messages,
  isStreaming,
  streamingMessage,
  endRef,
  userId,
}: MessagesProps) => {
  const {
    isSearching,
    setMarkdownSources,
    closeListPanel,
    setIsCanvasOpen,
    openListPanel,
    setMarkdown,
  } = useChatStore()
  const params = useParams()
  const sessionIdFromUrl = params.id?.toString() ?? ''
  const [selectedListId, setSelectedListId] = useState('')
  const [type, setType] = useState<'company' | 'investor' | 'transaction' | 'people'>('company')
  const [title, setTitle] = useState('List')
  const [listCardId, setListCardId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [messageId, setMessageId] = useState('')

  const {
    data: listDetails,
    isLoading: isListLoading,
    isFetched,
  } = useSessionListDetails(selectedListId, sessionIdFromUrl, userId, { enabled: !!selectedListId })

  useEffect(() => {
    if (isFetched && selectedListId && listDetails) {
      const rawData = listDetails?.items || []
      // console.log('raw', rawData)
      const formatted = normalizeListData(rawData, 'investor')
      // console.log(formatted)
      openListPanel(listCardId, title, formatted, formatted.length, 'investor')
      setSelectedListId('')
    }
  }, [isFetched, selectedListId, listDetails, listCardId, title, type])

  const handleListCardClick = (
    id: string,
    cardData: any,
    type: 'company' | 'investor' | 'transaction' | 'people',
    list_id?: string
  ) => {
    const title = cardData?.profile?.title || 'List'
    const list = cardData?.list || []
    const itemCount = cardData?.profile?.estimated_list_item_count || list.length

    setType('investor')
    setTitle(title)
    setListCardId(id)

    if (list_id) {
      setSelectedListId(list_id)
      return
    }

    openListPanel(id, title, list, itemCount, type)
  }

  const {
    data: profileDetails,
    isLoading: isProfileLoading,
    isFetched: isProfileFetched,
    refetch,
  } = useSessionProfileDetails(profileId ?? '', sessionIdFromUrl, userId, { enabled: !!profileId })

  const handleProfileClick = (id?: string, source?: Source[], messageId?: string) => {
    console.log({ id })
    if (!!id) {
      setProfileId(id)
      // refetch()
      setMessageId(messageId || '')
    } else {
      setMarkdownSources((source || []) as unknown as Source[])
    }
    closeListPanel()
    setIsCanvasOpen(true)
  }

  const profile = profileDetails?.profile_details || {}
  const profileSources = profile?.profile_sources
  const profileContent = profile?.profile_content || ''

  useEffect(() => {
    if (profileId && isProfileFetched && profileContent) {
      setMarkdown(profileContent)
      const message = messages.find(m => (m as any)?.message_id === messageId) as
        | (Message & { message_id: string })
        | undefined
      if (message) {
        message.content = profileContent
      }
      console.log({ message })
      setMarkdownSources(JSON.parse(profileSources) || [])
      setSelectedListId('')
    }
  }, [profileId, isProfileFetched, profileContent, profileSources, messageId])

  // console.log(messages)
  return (
    <div className={cn('overflow-y-auto px-2 pt-4 space-y-2 noscroll flex-1 min-h-0')}>
      {messages.map((m, i) => {
        const isUser = m.role === 'user'
        const isInlineCard = m.role === 'inline_card'
        const isInlineListCard = m.role === 'inline_list_card'
        const isChatMessage = m.role === 'user' || m.role === 'assistant'

        return (
          <div
            key={i}
            className={cn('flex', {
              'justify-end': isUser,
              'justify-start': !isUser,
            })}
          >
            <div
              className={cn('max-w-full text-sm leading-relaxed px-1 py-1 rounded-md', {
                'ml-auto bg-secondary/40 border font-normal px-4 py-1 rounded-md max-w-xs  ':
                  isUser,
                'text-gray-800 mr-auto border-none rounded-md': !isUser,
              })}
            >
              {isChatMessage && <Markdown>{m.content}</Markdown>}
              {isInlineCard && (
                <InlineCard
                  name={m.data.name}
                  city={m.data.city}
                  country={m.data.country}
                  content={m.content}
                  website={m.data.website}
                  logo={m.data.logo}
                  type={m.data.type}
                  onClick={() => {
                    handleProfileClick(
                      (m as any)?.profile_id || '',
                      m.sources,
                      (m as any)?.message_id
                    )
                  }}
                  isStreaming={isStreaming}
                />
              )}
              {isInlineListCard && (
                <InlineListCard
                  title={m.data?.profile?.title || m?.data?.title}
                  itemCount={
                    m.data?.profile?.estimated_list_item_count || m?.data?.estimated_list_count
                  }
                  onClick={() =>
                    handleListCardClick(
                      m.id,
                      m.data,
                      m.data?.profile?.type || m?.data?.type,
                      (m as any).list_id ?? ''
                    )
                  }
                  isStreaming={isStreaming}
                />
              )}
            </div>
          </div>
        )
      })}
      {isSearching === 'web' && (
        <p className="flex gap-1 items-center animate-pulse">
          <GlobeAltIcon className="size-5" />
          Searching the web ...
        </p>
      )}
      {isSearching === 'searching' && (
        <p className="flex gap-1 items-center animate-pulse">
          <Loader2 className="size-4 animate-spin" />
          Searching for Information...
        </p>
      )}

      {isStreaming && streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-full text-sm leading-relaxed px-1 py-1 mr-auto border-none rounded-md">
            <Markdown>{streamingMessage}</Markdown>
          </div>
        </div>
      )}

      {isStreaming && isSearching === 'streaming' && (
        <div className="flex justify-start">
          <div className="rounded-2xl text-sm text-gray-600 max-w-[75%]">
            <div className="px-2">
              <TypingDots />
            </div>
          </div>
        </div>
      )}

      {messages.length > 1 && (
        <div className={cn('h-1 opacity-0', { 'h-10': messages.length > 1 })} ref={endRef} />
      )}
    </div>
  )
}
