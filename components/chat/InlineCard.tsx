// src/components/chat/FileCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'
import { useChatStore } from '@/store/chatStore'
import { Source } from './chat.types'

type FileCardProps = {
  name: string
  city: string
  country: string
  onClick?: () => void
  date?: string
  content?: string
  isStreaming: boolean
}

export const InlineCard = ({
  name,
  city,
  country,
  onClick,
  content,
  isStreaming,
}: FileCardProps) => {
  const { setMarkdown, setMarkdownSources, setIsCanvasOpen } = useChatStore()

  const onClickHandler = () => {
    if (isStreaming) return
    if (!!content && content?.trim().length > 0) {
      setMarkdown(content || '')
      setIsCanvasOpen(true)
    }
    onClick?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full items-center gap-3 p-3 px-6 bg-gray-100 rounded-lg ${
        !isStreaming ? 'cursor-pointer hover:bg-gray-200' : 'cursor-default'
      } transition-colors`}
      role="button"
      tabIndex={isStreaming ? -1 : 0}
      onClick={onClickHandler}
    >
      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
        <BuildingOffice2Icon className="h-4 w-4 text-gray-800" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500">
          {city && <span>{city}</span>}
          {country && <span>, {country}</span>}
        </p>
      </div>
    </motion.div>
  )
}
