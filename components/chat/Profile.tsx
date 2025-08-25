import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Streamdown } from 'streamdown'

type Source = {
  id: number
  title: string
  url: string
}

type ProfileMessagesProps = {
  streamingMarkdownContent: string
  sources: Array<Source>
  onOpenSources?: () => void
  isStreaming: boolean
}

export const ProfileMessages = ({
  streamingMarkdownContent,
  sources,
  onOpenSources,
  isStreaming,
}: ProfileMessagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isStreaming && streamingMarkdownContent?.trim()?.length) {
      const root = containerRef.current
      if (!root) return
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
          const text = node.nodeValue || ''
          const parentEl = (node.parentNode as HTMLElement) || null
          if (parentEl && parentEl.classList?.contains('citation')) {
            return NodeFilter.FILTER_REJECT
          }
          return /\[(\d+)\]/.test(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        },
      })
      const nodesToProcess: Text[] = []
      let n: Node | null
      while ((n = walker.nextNode())) nodesToProcess.push(n as Text)
      nodesToProcess.forEach(textNode => {
        const text = textNode.nodeValue || ''
        const re = /\[(\d+)\]/g
        let match: RegExpExecArray | null
        let lastIndex = 0
        const frag = document.createDocumentFragment()
        while ((match = re.exec(text)) !== null) {
          const before = text.slice(lastIndex, match.index)
          if (before) frag.appendChild(document.createTextNode(before))
          const num = match[1]
          const span = document.createElement('span')
          span.className = 'citation'
          span.setAttribute('data-num', num)
          span.style.cursor = 'pointer'
          span.style.color = 'black'
          span.style.fontWeight = '500'

          span.textContent = match[0] // "[1]"
          span.addEventListener('click', () => onOpenSources?.())
          frag.appendChild(span)
          lastIndex = re.lastIndex
        }
        if (lastIndex < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)))
        }
        textNode.replaceWith(frag)
      })
    }
  }, [streamingMarkdownContent, onOpenSources, isStreaming])

  return (
    <div className="flex flex-col flex-1">
      <div className={cn('overflow-y-auto px-2 pt-4 space-y-2 noscroll flex-1 min-h-0')}>
        <AnimatePresence mode="wait">
          {streamingMarkdownContent.length > 0 && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-2"
              ref={containerRef}
            >
              <Streamdown className="streamdown-images [&_h3]:mt-3" parseIncompleteMarkdown>
                {streamingMarkdownContent}
              </Streamdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
