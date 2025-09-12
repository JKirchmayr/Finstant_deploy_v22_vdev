'use client'
import { cn, tryParseJSON } from '@/lib/utils'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chatStore'
import { v4 } from 'uuid'
import { InlineCardData, InlineListCardData, Source } from './chat.types'
import MainChat from './MainChat'
import { TabKey } from './Suggestions'

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
    updateListData,
    setMarkdown,
    setIsCanvasOpen,
    isStreaming,
    setIsStreaming,
    openListPanel,
    setActiveProfile,
    setListProfileData,
    streamListData,
    setIsWebSearching,
    setMarkdownSources,
  } = useChatStore()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('research')
  const endRef = useRef<HTMLDivElement>(null)
  const [streamId, setStreamId] = useState<string>('')
  const [streamingCanvasContent, setStreamingCanvasContent] = useState<string>('')
  const [sources, setSources] = useState<Source[]>([])
  const controllerRef = useRef<AbortController | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const handleListCardClick = (id: string, cardData: any, type: 'company' | 'investor') => {
    const title = cardData?.profile?.title || 'Company List'
    const list = cardData?.list || []
    const itemCount = cardData?.profile?.estimated_list_item_count || list.length
    openListPanel(id, title, list, itemCount, type)
  }

  const handleStopStreaming = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
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
    // endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    let processingBuffer = ''
    e.preventDefault()
    if (!input.trim()) return

    const promptToSend = input.trim()

    setStreamingMessage('')

    setStreamId('')
    const uuid = v4()

    append({ role: 'user', content: promptToSend })
    setInput('')
    scrollToBottom()
    setIsStreaming(true)
    //setIsCanvasOpen(false)
    controllerRef.current = new AbortController()

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

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available.')

      const decoder = new TextDecoder()
      const companyMap = new Map<string, any>()

      let listCardTitle = 'Company List'
      let leftoverChunk = ''
      let finalEventReceived = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (processingBuffer.trim()) {
            append({ role: 'assistant', content: processingBuffer })
            processingBuffer = ''
          }
          if (companyMap.size > 0) {
            updateListData(uuid, Array.from(companyMap.values()))
          }
          finalEventReceived = true
          break
        }

        leftoverChunk += decoder.decode(value, { stream: true })
        const events = leftoverChunk.split('\n\n')
        leftoverChunk = events.pop() || ''

        for (const event of events) {
          if (!event.trim() || !event.startsWith('data:')) continue
          const cleaned = event.replace(/^data:/, '').trim()
          const parsed = tryParseJSON(cleaned)
          if (!parsed) continue

          const { data, event: eventType } = parsed
          scrollToBottom()
          if (parsed?.data?.session_id) {
            setSessionId(parsed.data.session_id)
          }

          if (eventType === 'loading') {
            setIsSearching(true)
          }

          if (data?.meta?.stage === 'final') {
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
              setIsStreaming(false)
            }
            if (companyMap.size > 0) {
              const finalListData = Array.from(companyMap.values())
              updateListData(uuid, finalListData)
            }
            break
          }

          //------if searching web-------
          if (eventType === 'web_search') {
            const webSearchStage = data?.meta?.stage
            if (webSearchStage === 'init') {
              setIsWebSearching(true)
            }
          }

          if (eventType === 'text') {
            if (data?.meta?.stage === 'processing') {
              setIsWebSearching(false)
              setIsSearching(false)
              processingBuffer += data?.text || ''
              setStreamingMessage(processingBuffer)
            }
          }

          // ... your other event handlers for company_profile etc.
          if (eventType === 'company_profile_card') {
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
              setStreamingMessage('')
            }
            setSources([])
            setMarkdownSources([])
            setStreamingCanvasContent('')
            setMarkdown('')
            // console.log(data?.company)
            const newCompanyCardData: InlineCardData = {
              name: data?.company?.company_name,
              city: data?.company?.company_city,
              country: data?.company?.company_country,
              website: data?.company?.company_website,
              logo: data?.company?.company_logo,
              type: 'company',
            }
            setStreamId(uuid)

            setActiveProfile(
              data?.company?.company_name,
              'company',
              data?.company?.company_website || '',
              data?.company?.company_logo || '',
              data?.company?.company_city || '',
              data?.company?.company_country || ''
            )
            append({
              id: uuid,
              role: 'inline_card',
              content: '',
              data: newCompanyCardData,
            })
            setIsCanvasOpen(true)
          }

          if (eventType === 'investor_profile_card') {
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
              setStreamingMessage('')
            }
            setStreamingCanvasContent('')
            setMarkdown('')
            const newInvestorCardData: InlineCardData = {
              name: data?.investor?.investor_name,
              city: data?.investor?.investor_city,
              country: data?.investor?.investor_country,
              website: data?.investor?.investor_website,
              logo: data?.investor?.investor_logo,
              type: 'investor',
            }
            setStreamId(uuid)
            setActiveProfile(
              data?.investor?.investor_name,
              'investor',
              data?.investor?.investor_website || '',
              data?.investor?.investor_logo || '',
              data?.investor?.investor_city || '',
              data?.investor?.investor_country || ''
            )
            append({
              id: uuid,
              role: 'inline_card',
              content: '',
              data: newInvestorCardData,
            })
            setIsCanvasOpen(true)
          }

          //--------Company Profile ----------
          if (eventType === 'company_profile') {
            const text = data?.text || ''
            const stage = data?.meta?.stage

            if (stage === 'streaming') {
              setIsCanvasOpen(true)
              setStreamingCanvasContent(prev => prev + text)
            }
            // if (stage === 'sources') {
            //   const incoming = Array.isArray(data?.sources) ? data.sources : []
            //   setSources(incoming)
            // }
          }
          //----Sources -----
          if (eventType === 'sources') {
            // console.log('In sources')
            // console.log(data?.meta?.sources)
            const incoming = Array.isArray(data?.meta?.sources) ? data.meta.sources : []
            // console.log(incoming)
            setSources(prevSources => [...prevSources, ...incoming])
            // console.log(sources)
          }

          //--------Investor Profile ----------
          if (eventType === 'investor_profile') {
            const text = data?.text || ''
            const stage = data?.meta?.stage

            if (stage === 'streaming') {
              setIsCanvasOpen(true)
              setStreamingCanvasContent(prev => prev + text)
            }
            // if (stage === 'sources') {
            //   const incoming = Array.isArray(data?.sources) ? data.sources : []
            //   setSources(incoming)
            // }
          }

          //--------Company List ----------
          if (eventType === 'list_card') {
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
              setStreamingMessage('')
            }
            const itemCount = data?.count || 0
            listCardTitle = data?.title || 'Company List'
            const entityType = data?.meta?.entity_type || 'company'

            setListProfileData([])
            openListPanel(uuid, listCardTitle, [], itemCount, entityType)
            append({
              id: uuid,
              role: 'inline_list_card',
              content: '',
              data: {
                profile: {
                  title: listCardTitle,
                  estimated_list_item_count: itemCount,
                  type: entityType,
                },
              },
            })
          }

          if (eventType === 'entity_properties' || eventType === 'entity_evaluations') {
            const itemId = data?.item_id
            const entityType = data?.entity_type
            const entityData = data?.entity || {}
            // console.log(data)

            if (itemId && entityType === 'company') {
              const currentEntity = companyMap.get(itemId)
              companyMap.set(itemId, {
                ...currentEntity,
                ...entityData,
                item_id: itemId,
                evaluations: data?.evaluations || currentEntity?.evaluations,
              })
              // console.log(companyMap)
              streamListData(Array.from(companyMap.values()))
            }
          }
        }
        if (finalEventReceived) {
          break // This will exit the 'while' loop
        }
      }
    } catch (error) {
      console.error('❌ Error during streaming:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          append({
            role: 'assistant',
            content: processingBuffer,
          })
          append({
            role: 'assistant',
            content: '***Manually stopped the request.*** 🚫',
          })
        } else {
          append({
            role: 'assistant',
            content: `Error: ${error.message}`,
          })
          scrollToBottom()
        }
      } else {
        append({
          role: 'assistant',
          content: 'An error occurred while processing your request.',
        })
      }

      setIsStreaming(false)
      setStreamingMessage('')
      controllerRef.current = null
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    } finally {
      setIsStreaming(false)
      setStreamingMessage('')
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

  console.log(isSearching)

  useEffect(() => {
    if (!!streamingCanvasContent && !isStreaming && streamId) {
      const messageToUpdate = messages.find(m => m.id === streamId)
      if (messageToUpdate) {
        updateMessage(messageToUpdate.id, streamingCanvasContent, sources)
      }
    }
  }, [streamingCanvasContent, isStreaming, streamId, updateMessage, sources])
  return (
    <MainChat
      activeTab={activeTab}
      handleStopStreaming={handleStopStreaming}
      setActiveTab={setActiveTab}
      endRef={endRef}
      streamingMessage={streamingMessage}
      streamingCanvasContent={streamingCanvasContent}
      setStreamingCanvasContent={setStreamingCanvasContent}
      sources={sources}
      handleListCardClick={handleListCardClick}
      isSearching={isSearching}
      handleSend={handleSend}
      handleInputChange={e => {
        setInput(e.target.value)
      }}
    />
  )
}

export default React.memo(Chat)

// data: {"event": "company_profile_card", "data": {"text": "Render company profile card", "meta": {"type": "company_profile_card", "stage": "processing"}, "company_name": "Tesla, Inc.", "company_city": "Austin", "company_country": "United States", "company_website": "https://www.tesla.com", "company_logo": "https://logo.clearbit.com/www.tesla.com", "timestamp": "2025-09-10T11:36:12.840736"}}
