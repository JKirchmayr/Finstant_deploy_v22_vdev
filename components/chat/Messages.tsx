import React from 'react'
import { cn } from '../../lib/utils'
import { Markdown } from '../markdown'
import { InlineCard } from './InlineCard'
import TypingDots from '../TypingDots'
import { useFileStore } from '@/store/useCompanyProfile'
import { Message } from './chat.types'
import { CompanyListCard } from './CompanyListCard';

type MessagesProps = {
  messages: Message[]
  isStreaming: boolean
  streamingMessage: string | null
  endRef: React.RefObject<HTMLDivElement>
  // isProfileStreaming: boolean;
  onCardClick: (data: any) => void
  onListCardClick: (data: any) => void
}

export const Messages = ({
  messages,
  isStreaming,
  streamingMessage,
  endRef,
  onCardClick,
  onListCardClick,
}: MessagesProps) => {
  console.log(messages)
  return (
    <div className={cn('overflow-y-auto px-2 pt-4 space-y-2 noscroll flex-1 min-h-0')}>
      {messages.map((m, i) => {
        const isUser = m.role === 'user'
        const isInlineCard = m.role === 'inline_card'
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
              {isInlineCard && m.data && (()=>{

              switch (m.data.type) {
                  case 'company_list_card':
                    // This is the new logic for the new card
                    return (
                      <CompanyListCard
                        title={m.data.title}
                        itemCount={m.data.estimated_list_item_count}
                        onClick={() => onListCardClick(m.data)}
                        isStreaming={isStreaming}
                      />
                    );
                  
                  default:
                    // This is your original logic, completely untouched
                    return (
                      <InlineCard
                        name={m.data.name}
                        city={m.data.city}
                        country={m.data.country}
                        content={m.content}
                        onClick={() => onCardClick(m.content)}
                        isStreaming={isStreaming}
                      />
                    );
                }
              })()}
            </div>
          </div>
        )
      })}

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
        <div className={cn('h-1 opacity-0', { 'h-5': messages.length > 1 })} ref={endRef} />
      )}
    </div>
  )
}
