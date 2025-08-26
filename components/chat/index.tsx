'use client'
import { cn, tryParseJSON } from '@/lib/utils'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PromptField } from '@/components/chat/PromptField'
import { BottomSuggestions, SUGGESTION_BANK, Suggestions, TabKey } from './Suggestions'
import { Messages } from './Messages'
import { useChatStore } from '@/store/chatStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useFileStore } from '@/store/useCompanyProfile'
import { CanvasPanel } from './CanvasPanel'
import SourcesComponent from './Sources'
import { v4 } from 'uuid'
import { InlineCardData } from './chat.types'

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const Chat = () => {
  const { user, loading } = useAuth()
  const userId = user?.user_id ?? ''

  const {
    messages,
    input,
    append,
    setInput,
    updateMessage,
    markdown,
    setMarkdown,
    markdownSources,
    setMarkdownSources,
    isCanvasOpen,
    setIsCanvasOpen,
    isStreaming,
    setIsStreaming,
    sourcesOpen,
    setSourcesOpen,
  } = useChatStore()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('research')
  const endRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [streamId, setStreamId] = useState<string>('')
  const [streamingCanvasContent, setStreamingCanvasContent] = useState<string>('')
  const [sources, setSources] = useState<Array<{ id: number; title: string; url: string }>>([])

  const { addFile, setIsProfileStreaming } = useFileStore()

  const handleCardClick = (data: any) => {
    setMarkdown(data)
    setIsCanvasOpen(true)
  }

  // Create controller for request cancellation
  const controllerRef = useRef<AbortController | null>(null)

  const handleStopStreaming = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }
    setIsStreaming(false)
    setStreamingMessage('')
    setIsProfileStreaming(false)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
  }

  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) return
    scrollTimeoutRef.current = setTimeout(() => {
      const end = endRef.current
      if (end) {
        end.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
      scrollTimeoutRef.current = null
    }, 100)
  }, [])

  let processingBuffer = ''

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const promptToSend = input.trim()
    setStreamingMessage('')
    setStreamingCanvasContent('')

    append({ role: 'user', content: promptToSend })
    setInput('')
    scrollToBottom()
    setIsStreaming(true)
    setIsCanvasOpen(false)
    setMarkdown('')
    setMarkdownSources([])

    // Create new controller for this request
    controllerRef.current = new AbortController()
    const uuid = v4()

    try {
      const response = await fetch(`${backendURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          user_prompt: promptToSend,
          user_id: userId,
          session_id: sessionId,
        }),
        signal: controllerRef.current.signal,
      })

      // clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available.')

      const decoder = new TextDecoder()

      let parsed: any

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          if (processingBuffer.trim()) {
            append({ role: 'assistant', content: processingBuffer })
          }
          setIsStreaming(false)
          if (parsed?.data?.session_id) {
            setSessionId(parsed.data.session_id)
          }
          setStreamingMessage('')
          scrollToBottom()
          setIsProfileStreaming(false)
          controllerRef.current = null
          break
        }

        const rawChunk = decoder.decode(value, { stream: true })
        const events = rawChunk.split('\n\n')

        for (const event of events) {
          if (!event.trim() || !event.startsWith('data:')) continue

          const cleaned = event.replace(/^data:/, '').trim()
          parsed = tryParseJSON(cleaned)
          if (!parsed) {
            console.warn('⚠️ Skipping invalid JSON chunk:', cleaned)
            continue
          }

          const { data, event: eventType } = parsed

          // Check for final stage to end streaming
          if (data?.meta?.stage === 'final') {
            if (eventType === 'text' && data?.meta?.type === 'text' && streamingMessage.trim()) {
              append({ role: 'assistant', content: streamingMessage })
            }
            setIsStreaming(false)

            if (parsed?.data?.session_id) {
              setSessionId(parsed.data.session_id)
            }
            scrollToBottom()
            setIsProfileStreaming(false)
            break
          }

          if (eventType === 'text') {
            if (data?.meta?.stage === 'processing') {
              const newText = data?.text || ''
              setStreamingMessage(prev => prev + newText)
              processingBuffer += newText

              if (processingBuffer.length % 50 === 0) {
                scrollToBottom()
              }
            }
          }

          if (eventType === 'company_profile_card') {
            const newCompanyCardData: InlineCardData = {
              name: data?.company_name,
              city: data?.company_city,
              country: data?.company_country,
            }
            setStreamId(uuid)

            addFile(newCompanyCardData)
            append({
              id: uuid,
              role: 'inline_card',
              content: '',
              data: newCompanyCardData,
            })
          }

          if (eventType === 'investor_profile_card') {
            const newCompanyCardData: InlineCardData = {
              name: data?.investor_name,
              city: data?.investor_city,
              country: data?.investor_country,
            }
            console.log(data)
            setStreamId(uuid)

            addFile(newCompanyCardData)
            append({
              id: uuid,
              role: 'inline_card',
              content: '',
              data: newCompanyCardData,
            })
          }

          //--------Company Profile ----------
          if (eventType === 'company_profile') {
            const text = data?.text || ''
            const stage = data?.meta?.stage

            if (stage === 'streaming') {
              setIsProfileStreaming(true)
              setIsCanvasOpen(true)
              setStreamingCanvasContent(prev => prev + text)
            }
            if (stage === 'sources') {
              const incoming = Array.isArray(data?.sources) ? data.sources : []
              setSources(incoming)
            }
          }

          //--------Investor Profile ----------
          if (eventType === 'investor_profile') {
            const text = data?.text || ''
            const stage = data?.meta?.stage

            if (stage === 'streaming') {
              setIsProfileStreaming(true)
              setIsCanvasOpen(true)
              setStreamingCanvasContent(prev => prev + text)
            }
            if (stage === 'sources') {
              const incoming = Array.isArray(data?.sources) ? data.sources : []
              setSources(incoming)
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error during streaming:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          append({
            role: 'assistant',
            content: 'Manually stopped the request.',
          })
        } else {
          append({
            role: 'assistant',
            content: `Error: ${error.message}`,
          })
        }
      } else {
        append({
          role: 'assistant',
          content: 'An error occurred while processing your request.',
        })
      }

      setIsStreaming(false)
      setStreamingMessage('')
      setIsProfileStreaming(false)
      controllerRef.current = null

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!!streamingCanvasContent && !isStreaming && streamId) {
      const messageToUpdate = messages.find(message => message.id === streamId)
      if (messageToUpdate) {
        updateMessage(streamId, streamingCanvasContent, sources)
      }
    }
  }, [streamingCanvasContent, isStreaming, streamId, updateMessage, sources])

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT PANE: messages + prompt */}
      <motion.div
        className="flex flex-col flex-1 min-h-min relative z-0 "
        initial={false} // no animation on first render
        animate={{ width: isCanvasOpen ? '35%' : '100%' }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        layout
      >
        {/* Suggestions (centered look based on your original) */}
        {messages.length <= 0 && (
          <div className="max-w-3xl pt-10 mx-auto w-full px-2">
            <Suggestions activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto overflow-hidden">
          {messages.length > 0 && (
            <div className="flex-1 min-h-0 flex flex-col">
              <Messages
                messages={messages}
                isStreaming={isStreaming}
                streamingMessage={streamingMessage}
                endRef={endRef}
                // isProfileStreaming={isProfileStreaming}
                onCardClick={handleCardClick}
              />
            </div>
          )}
        </div>

        {/* Prompt box */}
        <div className="w-full max-w-3xl mx-auto  z-10">
          <PromptField
            handleSend={handleSend}
            input={input}
            handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            isLoading={isStreaming}
            messages={messages}
            onStop={handleStopStreaming}
          />
        </div>

        {/* Bottom suggestions (just like your screenshot) */}
        {messages.length <= 0 && (
          <div className="w-full max-w-3xl pb-24 text-muted-foreground mx-auto px-2">
            <BottomSuggestions items={SUGGESTION_BANK[activeTab] ?? []} setInput={setInput} />
          </div>
        )}

        <AnimatePresence>
          {sourcesOpen && (
            <SourcesComponent
              open={sourcesOpen}
              onClose={() => setSourcesOpen(false)}
              sources={sources}
              isStreaming={isStreaming}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* RIGHT PANE: canvas */}
      <AnimatePresence initial={false}>
        {isCanvasOpen && (
          <CanvasPanel
            streamingCanvasContent={markdown || streamingCanvasContent}
            sources={markdownSources || sources}
            setSourcesOpen={setSourcesOpen}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Chat
