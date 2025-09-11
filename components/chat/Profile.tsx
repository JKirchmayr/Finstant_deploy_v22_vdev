import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Streamdown } from 'streamdown'
import { useChatStore } from '@/store/chatStore'
import rehypeRaw from 'rehype-raw'
import Link from 'next/link'
import { Globe } from 'lucide-react'

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
  const { activeProfile, setSourcesOpen } = useChatStore()
  const onOpenSources = () => {
    setSourcesOpen(true)
  }

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
              <div className="flex py-4 gap-4">
                {!!activeProfile.logo && (
                  <img
                    src={activeProfile?.logo || ''}
                    alt={activeProfile?.name || 'logo'}
                    width={80}
                    height={80}
                    className="rounded-sm object-contain border"
                  />
                )}
                <div className="flex flex-col justify-between py-1">
                  <h2 className="text-xl font-semibold ">{activeProfile?.name || 'Profile'}</h2>
                  {[activeProfile.city, activeProfile.country].filter(Boolean).length > 0 && (
                    <p>
                      {activeProfile.city}, {activeProfile.country}
                    </p>
                  )}
                  {activeProfile.website && (
                    <Link
                      href={activeProfile.website}
                      className="flex items-center gap-1 text-blue-600 hover:underline hover:text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="inline-block w-4 h-4 " /> {activeProfile.website}
                    </Link>
                  )}
                </div>
              </div>
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
                  code: ({ children }) => (
                    <code
                      onClick={() => {
                        onOpenSources()
                      }}
                    >
                      <span className="bg-muted-foreground/10 cursor-pointer py-0 text-xs px-1 rounded-md font-medium">
                        {children}
                      </span>
                    </code>
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
