import React from 'react'
import { motion } from 'framer-motion'
import { ListBulletIcon } from '@heroicons/react/24/outline'
import { Skeleton } from '../ui/skeleton'

type InlineListCardProps = {
  title?: string
  itemCount?: number
  type?: string
  onClick?: () => void
  isStreaming: boolean
  isLoading?: boolean
}

export const InlineListCard = ({
  title,
  itemCount,
  onClick,
  isStreaming,
  isLoading = false,
}: InlineListCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative flex w-full max-w-sm items-center gap-3 p-3 px-6 bg-gray-100 overflow-hidden rounded-lg ${
        !isStreaming ? 'cursor-pointer hover:bg-gray-200' : 'cursor-default'
      } transition-colors`}
      role="button"
      tabIndex={isStreaming ? -1 : 0}
      onClick={onClick}
    >
      {/* ✅ Subtle overlay for loading */}
      {/* {isLoading && (
        <Skeleton className="absolute inset-0 z-10 bg-gray-200/40 backdrop-blur-sm pointer-events-none" />
      )} */}

      <div className="flex items-center gap-3 min-w-0 w-full">
        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
          <ListBulletIcon className="h-4 w-4 text-gray-800" />
        </div>

        {/* ✅ Ensure truncation within bounds */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-gray-900 truncate" title={title}>
            {title || 'Untitled List'}
          </p>
          {itemCount !== undefined && (
            <p className="text-xs text-gray-500 truncate">~{itemCount} items</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
