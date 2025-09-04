'use client'
import { cn, tryParseJSON } from '@/lib/utils'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/store/chatStore'
import { useFileStore } from '@/store/useCompanyProfile'
import { v4 } from 'uuid'
import { CompanyData, InlineCardData, InlineListCardData } from './chat.types'
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
    streamListData,
  } = useChatStore()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('research')
  const endRef = useRef<HTMLDivElement>(null)
  const [streamId, setStreamId] = useState<string>('')
  const [streamingCanvasContent, setStreamingCanvasContent] = useState<string>('')
  const [sources, setSources] = useState<Array<{ id: number; title: string; url: string }>>([])
  const { addFile, setIsProfileStreaming } = useFileStore()
  const controllerRef = useRef<AbortController | null>(null)

  const handleCardClick = (data: any) => {
    setMarkdown(data)
    setIsCanvasOpen(true)
  }

  const handleListCardClick = (id: string, cardData: any) => {
    const title = cardData?.profile?.title || 'Company List'
    const list = cardData?.list || []
    const itemCount = cardData?.profile?.estimated_list_item_count || list.length
    openListPanel(id, title, list, itemCount)
  }

  const handleStopStreaming = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
  }

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    let processingBuffer = ''
    e.preventDefault()
    if (!input.trim()) return

    const promptToSend = input.trim()

    setStreamingMessage('')
    setStreamingCanvasContent('')
    setSources([])
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
      const companyMap = new Map<string, CompanyData>()

      let listCardTitle = 'Company List'
      let leftoverChunk = ''
      let finalEventReceived = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (processingBuffer.trim()) {
            append({ role: 'assistant', content: processingBuffer })
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

          if (data?.meta?.stage === 'final') {
            console.log('DEBUG: Final stage reached. Buffer content is:', `"${processingBuffer}"`)
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              console.log('DEBUG: Appending final message to store.')
            }
            if (companyMap.size > 0) {
              const finalListData = Array.from(companyMap.values())
              updateListData(uuid, finalListData)
            }

            break
          }

          if (eventType === 'company_list_card') {
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
            }

            const itemCount = data?.estimated_list_item_count || 0
            listCardTitle = data?.list_title || 'Company List'

            openListPanel(uuid, listCardTitle, [], itemCount)

            append({
              id: uuid,
              role: 'inline_list_card',
              content: '',
              data: {
                profile: { title: listCardTitle, estimated_list_item_count: itemCount, ...data },
              },
            })
          }

          if (eventType === 'company_properties' || eventType === 'company_evaluations') {
            const companyName = data?.company?.name
            const companyData = data?.company || {}

            if (companyName) {
              const currentCompany = companyMap.get(companyName) || ({} as CompanyData)

              companyMap.set(companyName, {
                ...currentCompany,
                ...companyData,
                company_name: companyName, // Ensure name from nested object is used
                evaluations: data.evaluations || currentCompany.evaluations,
              })

              streamListData(Array.from(companyMap.values()))
            }
          }

          if (eventType === 'text') {
            if (data?.meta?.stage === 'processing') {
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
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
              setStreamingMessage('')
            }
            const newCompanyCardData: InlineCardData = {
              name: data?.investor_name,
              city: data?.investor_city,
              country: data?.investor_country,
            }
            setStreamId(uuid)
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
        if (finalEventReceived) {
          break // This will exit the 'while' loop
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('❌ Error during streaming:', error)
      }
    } finally {
      setIsStreaming(false)
      setStreamingMessage('')
      setIsProfileStreaming(false)
      controllerRef.current = null
      scrollToBottom()
    }
  }

  // useEffect(() => {
  //   if (!!streamingCanvasContent && !isStreaming && streamId) {
  //     const messageToUpdate = messages.find(m => m.id === streamId)
  //     if (messageToUpdate) {
  //       updateMessage(messageToUpdate.id, streamingCanvasContent, sources)
  //     }
  //   }
  // }, [streamingCanvasContent, isStreaming, streamId, messages, updateMessage, sources])
  useEffect(() => {
    if (!isStreaming && streamId && streamingCanvasContent) {
      //const updateMessage = useChatStore.getState().updateMessage
      updateMessage(streamId, streamingCanvasContent, sources)
      setStreamId('')
    }
  }, [isStreaming, streamId, streamingCanvasContent, sources, updateMessage])

  return (
    <MainChat
      activeTab={activeTab}
      handleStopStreaming={handleStopStreaming}
      setActiveTab={setActiveTab}
      endRef={endRef}
      streamingMessage={streamingMessage}
      streamingCanvasContent={streamingCanvasContent}
      sources={sources}
      handleCardClick={handleCardClick}
      handleListCardClick={handleListCardClick}
      handleSend={handleSend}
      handleInputChange={e => {
        setInput(e.target.value)
      }}
    />
  )
}

export default Chat
