'use client'
import React from 'react'
import { PromptField } from '@/components/chat/PromptField'
import { BottomSuggestions, SUGGESTION_BANK, Suggestions, TabKey } from './Suggestions'
import { Messages } from './Messages'
import { useChatStore } from '@/store/chatStore'
import { AnimatePresence, motion } from 'framer-motion'
import { CanvasPanel } from './CanvasPanel'
import SourcesComponent from './Sources'
import { InlineCardData, Source } from './chat.types'
import ListBuilder from './list-builder'
import { EntityPopup } from './list-builder/EntityDetails'

interface MainChatProps {
  activeTab: TabKey
  handleSend: (e: React.FormEvent) => Promise<void>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleStopStreaming: () => void
  setActiveTab: (tab: TabKey) => void
  endRef: React.RefObject<HTMLDivElement>
  streamingMessage: string
  streamingCanvasContent: string
  sources: Source[] // Consider creating a proper type for sources
  setStreamingCanvasContent: (content: string) => void
  userId: string
}

export default function MainChat({
  activeTab,
  setActiveTab,
  handleSend,
  handleStopStreaming,
  endRef,
  streamingMessage,
  streamingCanvasContent,
  setStreamingCanvasContent,
  sources,
  userId,
}: MainChatProps) {
  const {
    messages,
    input,
    setInput,
    markdown,
    markdownSources,
    isCanvasOpen,
    isStreaming,
    sourcesOpen,
    setSourcesOpen,
    isCompanyPopupOpen,
    popupCompany,
    closeCompanyPopup,
    isListPanelOpen,
    activeListData,
    activeList,
    setIsListPanelOpen,
    isCopilotOpen,
  } = useChatStore()

  return (
    <div className="flex h-full overflow-hidden relative ">
      {/* LEFT PANE: messages + prompt */}
      <motion.div
        className="flex flex-col flex-1 min-h-min relative z-0 "
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1 }}
        exit={{ x: '100%' }}
      >
        <AnimatePresence>
          {/* ===== LAYOUT 1: EMPTY STATE (WHEN messages.length <= 0) ===== */}
          {isCopilotOpen && messages.length <= 0 && (
            <div className="flex-1 w-screen h-screen flex flex-col justify-center items-center">
              {/* This wrapper will perfectly center all the empty-state content */}
              <div className="w-full max-w-3xl">
                <div className="pt-10 px-2 pb-2">
                  <Suggestions activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
                <div className="px-2 z-10">
                  <PromptField
                    handleSend={handleSend}
                    input={input}
                    handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInput(e.target.value)
                    }
                    isLoading={isStreaming}
                    messages={messages}
                    onStop={handleStopStreaming}
                  />
                </div>
                <div className="w-full max-w-3xl pb-24 text-muted-foreground mx-auto px-2">
                  <BottomSuggestions items={SUGGESTION_BANK[activeTab] ?? []} setInput={setInput} />
                </div>
              </div>
            </div>
          )}

          {/* ===== LAYOUT 2: ACTIVE CHAT (WHEN messages.length > 0) ===== */}
          {isCopilotOpen && messages.length > 0 && (
            <>
              {/* Messages area */}
              <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto overflow-hidden">
                <div className="flex-1 min-h-0 flex flex-col">
                  <Messages
                    messages={messages}
                    isStreaming={isStreaming}
                    streamingMessage={streamingMessage}
                    endRef={endRef}
                    userId={userId}
                  />
                </div>
              </div>

              {/* Prompt box */}
              <div className="w-full max-w-3xl mx-auto z-10">
                <PromptField
                  handleSend={handleSend}
                  input={input}
                  handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInput(e.target.value)
                  }
                  isLoading={isStreaming}
                  messages={messages}
                  onStop={handleStopStreaming}
                />
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
      {/* This component can be triggered in either state, so it lives outside */}
      <AnimatePresence>
        {sourcesOpen && (
          <SourcesComponent
            open={sourcesOpen}
            onClose={() => setSourcesOpen(false)}
            sources={markdownSources.length > 0 ? markdownSources : sources}
            isStreaming={isStreaming}
          />
        )}
        {isCompanyPopupOpen && (
          <EntityPopup
            isOpen={isCompanyPopupOpen}
            onClose={closeCompanyPopup}
            entity={popupCompany}
          />
        )}
      </AnimatePresence>

      {/* RIGHT PANE: canvas */}
      <AnimatePresence initial={false}>
        {isCanvasOpen && (
          <CanvasPanel
            streamingCanvasContent={markdown || streamingCanvasContent}
            sources={markdownSources || sources}
            setSourcesOpen={setSourcesOpen}
            setStreamingCanvasContent={setStreamingCanvasContent}
          />
        )}
        {isListPanelOpen && (
          <ListBuilder listData={activeListData} title={activeList.title} type={activeList.type} />
        )}
      </AnimatePresence>
    </div>
  )
}
