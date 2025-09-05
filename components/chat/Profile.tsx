import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Streamdown } from 'streamdown'
import { useChatStore } from '@/store/chatStore'
import { Button } from '../ui/button'
import { CanvasSkeleton } from './CanvasSkeleton'
import rehypeRaw from 'rehype-raw'

type Source = {
  id: number
  title: string
  url: string
}

type ProfileMessagesProps = {
  streamingMarkdownContent: string
  sources: Array<Source>
  isStreaming: boolean
}

export const ProfileMessages = ({
  streamingMarkdownContent,
  sources,
  isStreaming,
}: ProfileMessagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setSourcesOpen } = useChatStore()
  const onOpenSources = () => {
    setSourcesOpen(true)
  }

  useEffect(() => {
    if (containerRef.current && !isStreaming) {
      const buttons = containerRef.current.querySelectorAll('code[data-streamdown="inline-code"]')
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const num = button.textContent?.trim()
          if (num) {
            onOpenSources()
          }
        })
      })
    }
  }, [isStreaming])

  const processedMarkdown = streamingMarkdownContent.replace(/\[(\d+)\]/g, '`$1`')

  return (
    <div className="flex flex-col flex-1">
      <div className={cn('overflow-y-auto px-2 space-y-2 noscroll flex-1 min-h-0')}>
        <AnimatePresence mode="wait">
          {streamingMarkdownContent.length > 0 && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="px-2"
              ref={containerRef}
            >
              <Streamdown
                className="streamdown-images streamdown "
                parseIncompleteMarkdown
                allowedImagePrefixes={['*']}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto rounded-md shadow-xl">
                      <table className="w-full">{children}</table>
                    </div>
                  ),
                }}
              >
                {processedMarkdown}
              </Streamdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
