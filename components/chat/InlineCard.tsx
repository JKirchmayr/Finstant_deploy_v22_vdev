// src/components/chat/FileCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  BanknotesIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import { useChatStore } from '@/store/chatStore'
import { Source } from './chat.types'
import { Skeleton } from '../ui/skeleton'

type FileCardProps = {
  name: string
  city: string
  country: string
  website: string
  logo: string
  type: 'company' | 'investor'
  onClick?: () => void
  date?: string
  content?: string
  isStreaming: boolean
  isLoading?: boolean
}

export const InlineCard = ({
  name,
  city,
  country,
  type,
  website = '',
  logo = '',
  onClick,
  content,
  isStreaming,
  isLoading = false,
}: FileCardProps) => {
  // console.log({ isLoading })

  const { setMarkdown, setMarkdownSources, setIsCanvasOpen, setActiveProfile } = useChatStore()
  const onClickHandler = () => {
    if (isStreaming) return
    if (!!content && content?.trim().length > 0) {
      setMarkdown(content || '')
      setIsCanvasOpen(true)
    }
    setActiveProfile(name, type, website, logo, city, country)
    onClick?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full items-center gap-3 p-3 px-6 relative bg-gray-100 rounded-lg ${
        !isStreaming ? 'cursor-pointer hover:bg-gray-200' : 'cursor-default'
      } transition-colors`}
      role="button"
      tabIndex={isStreaming ? -1 : 0}
      onClick={onClickHandler}
    >
      {isLoading && <Skeleton className="absolute inset-0 z-10 bg-gray-200/20 backdrop-blur-lg" />}

      <div className="flex gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
          {type === 'company' && <BuildingOffice2Icon className="h-4 w-4 text-gray-800" />}
          {type === 'investor' && <BanknotesIcon className="h-4 w-4 text-gray-800" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500">
            {city && <span>{city}</span>}
            {country && <span>, {country}</span>}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
