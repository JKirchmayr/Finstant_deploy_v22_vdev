import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'

type Source = {
  id: number
  title: string
  url: string
}

type SourcesProps = {
  open: boolean
  onClose: () => void
  sources: Source[]
  isStreaming: boolean
}

const SourcesComponent: React.FC<SourcesProps> = ({ open, onClose, sources, isStreaming }) => {
  if (!open || isStreaming) return null

  return (
    <motion.div
      className="absolute inset-0 z-50"
      onClick={onClose}
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative bg-white w-full h-full shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white">
          <h2 className="font-semibold text-base">Sources</h2>
          <Button size="xs" onClick={onClose} aria-label="Close" variant="secondary">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <div className="h-[calc(100%-52px)] overflow-y-auto px-4 py-3">
          {sources && sources.length ? (
            <ul className="list-decimal pl-5 space-y-2">
              {sources.map(s => (
                <li key={s.id} className="text-sm">
                  <div className="font-semibold text-gray-800">{s.title}</div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:underline break-all"
                  >
                    {s.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No sources available</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default SourcesComponent
