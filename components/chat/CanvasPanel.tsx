import React from 'react'
import { motion } from 'framer-motion'
import { BanknotesIcon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ProfileMessages } from './Profile'
import { Source } from './chat.types'
import { Button } from '../ui/button'
import { useChatStore } from '@/store/chatStore'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'

export const CanvasPanel = ({
  streamingCanvasContent,
  sources,
}: {
  streamingCanvasContent: string
  sources: Source[]
  setSourcesOpen: (isOpen: boolean) => void
  setStreamingCanvasContent: (content: string) => void
}) => {
  const { isStreaming, setIsCanvasOpen, setSourcesOpen, activeProfile } = useChatStore()
  // console.log(activeProfile)
  const title = activeProfile?.name ? (
    <div className="flex items-center gap-2">
      {activeProfile?.type === 'list' && <ListBulletIcon className="h-5 w-5 text-gray-600" />}
      {activeProfile?.type === 'company' && (
        <BuildingOffice2Icon className="h-5 w-5 text-gray-600" />
      )}
      {activeProfile?.type === 'investor' && <BanknotesIcon className="h-5 w-5 text-gray-600" />}
      <span className="font-semibold tracking-tight truncate max-w-60 sm:max-w-full">
        {activeProfile?.type === 'company' ? 'Company Profile' : 'Investor Profile'} -{' '}
        {activeProfile?.name}
      </span>
    </div>
  ) : (
    <span className="font-semibold tracking-tight">Canvas</span>
  )
  const isEmpty = streamingCanvasContent?.trim()?.length === 0

  return (
    <motion.div
      className="absolute right-0 top-0 z-30 flex h-full w-full flex-col border-l bg-background md:relative md:w-[65%]"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: '100%' }}
      layout
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
    >
      <div className="border-b flex items-center justify-between sticky top-0 bg-background z-30 p-4 py-2">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        <Button
          disabled={isStreaming}
          onClick={() => {
            setIsCanvasOpen(false)
            setSourcesOpen(false)
          }}
          size="xs"
          variant="secondary"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-1 scrollbar-hide">
        <ProfileMessages
          streamingMarkdownContent={streamingCanvasContent}
          sources={sources}
          isStreaming={isStreaming}
        />
      </div>
    </motion.div>
  )
}
