import React from 'react'
import { cn } from '../../lib/utils'
import { Markdown } from '../markdown'
import { InlineCard } from './InlineCard'
import TypingDots from '../TypingDots'
import { useFileStore } from '@/store/useCompanyProfile'
import { Message, Source } from './chat.types'
import { InlineListCard } from './InlineListCard'
import { useChatStore } from '@/store/chatStore'
import { GlobeAltIcon } from '@heroicons/react/24/outline'

type MessagesProps = {
  messages: Message[]
  isStreaming: boolean
  streamingMessage: string | null
  endRef: React.RefObject<HTMLDivElement>
  onListCardClick: (id: string, data: any, type: 'company' | 'investor') => void
}

export const Messages = ({
  messages,
  isStreaming,
  streamingMessage,
  endRef,
  onListCardClick,
}: MessagesProps) => {
  const { isWebSearching, setMarkdown, setMarkdownSources, closeListPanel, setIsCanvasOpen } =
    useChatStore()
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
                    setMarkdownSources((m.sources || []) as unknown as Source[])
                    closeListPanel()
                    setIsCanvasOpen(true)
                  }}
                  isStreaming={isStreaming}
                />
              )}
              {isInlineListCard && (
                <InlineListCard
                  title={m.data.profile.title}
                  itemCount={m.data.profile.estimated_list_item_count}
                  onClick={() => onListCardClick(m.id, m.data, m.data.profile.type)}
                  isStreaming={isStreaming}
                />
              )}
            </div>
          </div>
        )
      })}
      {isWebSearching && (
        <p className="flex gap-1 items-center animate-pulse">
          <GlobeAltIcon className="size-5" />
          Searching the web ...
        </p>
      )}

      {isStreaming && streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-full text-sm leading-relaxed px-1 py-1 mr-auto border-none rounded-md">
            <Markdown>{streamingMessage}</Markdown>
          </div>
        </div>
      )}

      {isStreaming && (
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
