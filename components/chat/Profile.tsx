import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Streamdown } from 'streamdown'
import { useChatStore } from '@/store/chatStore'

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
    if (streamingMarkdownContent && streamingMarkdownContent?.trim()?.length) {
      const root = containerRef.current
      if (!root) return
      if (root) {
        root.scrollTop = root.scrollHeight
      }
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
          span.style.backgroundColor = '#E5E7EB' // A light grey (Tailwind's gray-200)
          span.addEventListener('mouseover', () => {
            span.style.backgroundColor = '#D1D5DB' // Tailwind's gray-300 for darker hover state
          })
          span.addEventListener('mouseout', () => {
            span.style.backgroundColor = '#E5E7EB' // Reset to original color
          })
          span.style.color = '#111827' // A dark grey for text (Tailwind's gray-900)
          span.style.padding = '2px 8px'
          span.style.borderRadius = '4px' // Creates a pill shape
          span.style.marginLeft = '4px'
          span.style.marginRight = '4px'
          span.style.fontSize = '0.75rem' // Smaller font size
          span.style.lineHeight = '1rem'
          span.style.display = 'inline-block'
          span.style.verticalAlign = 'middle'
          span.textContent = num
          frag.appendChild(span)
          lastIndex = re.lastIndex
          // if (!isStreaming) {
          //   span.addEventListener('click', () => onOpenSources?.())
          // }
        }
        if (lastIndex < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)))
        }
        textNode.replaceWith(frag)
      })
    }
  }, [streamingMarkdownContent, onOpenSources, isStreaming])

  // {streamingMarkdownContent.length <= 0 }

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
                className="streamdown-images [&_h3]:mt-3 [&_h1]:mt-3"
                parseIncompleteMarkdown
              >
                {streamingMarkdownContent}
              </Streamdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
