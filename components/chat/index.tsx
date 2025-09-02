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
import { CompanyData, InlineCardData } from './chat.types'
import ChatDataTable from './ChatDataTable' 
import { companiesListColumns } from './CompanyListTable' 
import { useSingleTabStore } from '@/store/singleTabStore'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import MainChat from './MainChat'



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

  const { setSingleTab, clearSingleTab, singleTab } = useSingleTabStore()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('research')
  const endRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [streamId, setStreamId] = useState<string>('')
  const [streamingCanvasContent, setStreamingCanvasContent] = useState<string>('')
  const [sources, setSources] = useState<Array<{ id: number; title: string; url: string }>>([])
  const [listData, setListData] = useState<CompanyData[]>([])
  const [isListPanelOpen, setIsListPanelOpen] = useState(false)

  const { addFile, setIsProfileStreaming } = useFileStore()

  const handleCardClick = (data: any) => {
    setMarkdown(data)
    setIsCanvasOpen(true)
    setIsListPanelOpen(false);
  }

  const handleListCardClick = (data: any) => {
    setSingleTab("list", "companies", data, "final"); 
    setIsListPanelOpen(true); 
    setIsCanvasOpen(false); 
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

  // let processingBuffer = ''

  const handleSend = async (e: React.FormEvent) => {
    let processingBuffer = ''

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
    setIsListPanelOpen(false)
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

      const streamedCompaniesData: CompanyData[] = [];
      const companyMap = new Map<string, CompanyData>();

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
            if (eventType === 'text' && data?.meta?.type === 'text' && processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
            }
            setIsStreaming(false)

            if (parsed?.data?.session_id) {
              setSessionId(parsed.data.session_id)
            }
            scrollToBottom()
            setIsProfileStreaming(false)
            if (companyMap.size > 0) {
              const finalListData = Array.from(companyMap.values());
              setSingleTab('list_' + new Date().getTime(), 'companies', finalListData, 'final');
              setIsListPanelOpen(true);
            }
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

            // addFile(newCompanyCardData)
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

           if (eventType === 'company_properties') {
            const companyName = data?.company_name;
            if (companyName) {
              const newCompanyData: CompanyData = {
                company_name: companyName,
                company_description: data.company_description || '',
                company_logo: data.company_logo || '',
                company_location: data.company_location || '',
                hq: data.company_location || '',
                // Ensure other properties are initialized with fallback values
              };
              companyMap.set(companyName, { ...companyMap.get(companyName), ...newCompanyData });
              setListData(Array.from(companyMap.values()));
            }
            setIsListPanelOpen(true);
            setIsCanvasOpen(false);
          }

          if (eventType === 'company_evaluations') {
            const companyName = data?.company_name;
            if (companyName) {
              const currentCompany = companyMap.get(companyName) || {} as CompanyData;
              companyMap.set(companyName, { ...currentCompany, evaluations: data.evaluations });
              setListData(Array.from(companyMap.values()));
            }
          }

          if (eventType === 'company_list_card') {
            // This is for the list builder card in the chat pane, not the panel itself
            if (processingBuffer.trim()) {
              append({ role: 'assistant', content: processingBuffer })
              processingBuffer = ''
              setStreamingMessage('')
            }
            const newCompanyListCardData: InlineCardData = {
              title: data?.list_title,
              estimated_list_item_count: data?.estimated_list_item_count,
              time: data?.timestamp_created,
              type: data?.meta?.type,
            }
            setStreamId(uuid)
            append({
              id: uuid,
              role: 'inline_card',
              content: '',
              data: newCompanyListCardData,
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
    <MainChat/>
  )
}

export default Chat
