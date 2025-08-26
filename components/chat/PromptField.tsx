import { cn } from '@/lib/utils'
import { ArrowUp, AtSign, ChevronDown, Loader2, Paperclip } from 'lucide-react'
import React from 'react'
import { useRef, useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export const PromptField = ({
  handleSend,
  input,
  handleInputChange,
  isLoading,
  messages,
  onStop,
}: {
  handleSend: any
  input: string
  handleInputChange: any
  isLoading: any
  onStop: () => void
  messages: any
}) => {
  const textareaRef = useRef<any>(null)
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [input])

  const internalHandleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSend(e)
  }
  return (
    <div
      className={cn('h-[145px] w-full px-2 ', {
        'h-[140px]': messages.length > 0,
      })}
      style={{ transition: 'all 0.3s' }}
    >
      <form
        onSubmit={internalHandleSend}
        className="focus-within:border-gray-300 bg-background border-gray-300 relative rounded-xl border transition-shadow"
      >
        <div className="@container/textarea bg-background relative z-10 grid min-h-[100px] rounded-xl overflow-hidden">
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            autoFocus
            minRows={5}
            maxRows={6}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                internalHandleSend(e)
              }
            }}
            placeholder="Enter your prompt here..."
            data-enhancing="false"
            id="chat-main-textarea"
            name="content"
            className={cn(
              'resize-none max-h-[100px] overflow-auto w-full flex-1 p-3 pb-1.5 text-sm outline-none ring-0 placeholder:text-gray-500'
              // { "max-h-[150px]": messages.length > 0 }
            )}
          />
          <div className="flex justify-between gap-2 pb-2 px-2">
            <div className="ml-auto flex items-center gap-1">
              <button
                className="inline-flex shrink-0 cursor-pointer select-none items-center text-xs font-normal justify-center gap-1.5 whitespace-nowrap text-nowrap border-none outline-none transition-all  [&>svg]:pointer-events-none [&>svg]:size-4 [&_svg]:shrink-0  text-background bg-foreground hover:bg-gray-700 px-3 py-1 rounded"
                type={isLoading ? 'button' : 'submit'}
                disabled={!input.trim().length && !isLoading}
                onClick={isLoading ? onStop : internalHandleSend}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="animate-spin size-4 [animation-duration:0.3s]" />
                    <span>Stop</span>
                  </span>
                ) : (
                  'Ask Finstant'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
