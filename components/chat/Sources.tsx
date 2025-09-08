import React, { useState, useEffect } from 'react'
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

// --- TYPE DEFINITIONS ---
type BasicSource = {
  id: number
  title: string
  url: string
}

type EnrichedSource = BasicSource & {
  description?: string
  image?: string
  favicon?: string
}

const SkeletonItem = () => (
  <div className="flex items-start gap-4 p-2">
    <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full mt-1" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-3 w-full mt-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
)

// --- MAIN SOURCES COMPONENT ---
type SourcesProps = {
  open: boolean
  onClose: () => void
  sources: BasicSource[]
  isStreaming: boolean
}

const SourcesComponent: React.FC<SourcesProps> = ({ open, onClose, sources, isStreaming }) => {
  const [enrichedSources, setEnrichedSources] = useState<EnrichedSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    if (!open || !sources.length) return
    const fetchAllMetadata = async () => {
      setIsLoading(true)
      const sourcesPromises = sources.map(async source => {
        try {
          const response = await fetch(`/api/scrape?url=${encodeURIComponent(source.url)}`)
          if (!response.ok) return source
          const richData = await response.json()
          return { ...source, ...richData }
        } catch (error) {
          return source
        }
      })
      const finalSources = await Promise.all(sourcesPromises)
      setEnrichedSources(finalSources)
      setIsLoading(false)
    }
    fetchAllMetadata()
  }, [open, sources])

  if (!open || isStreaming) return null

  return (
    <motion.div
      className="absolute inset-0 z-50 flex justify-end"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
    >
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />
      <div className="relative w-full h-full bg-white shadow-lg" onClick={e => e.stopPropagation()}>
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-base">Sources</h2>
          <Button size="xs" onClick={onClose} aria-label="Close" variant="secondary">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="h-[calc(100%-52px)] overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </div>
          ) : enrichedSources.length ? (
            <div className="space-y-3">
              {enrichedSources.map(s => (
                <motion.a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-2 rounded-md transition-colors duration-200 hover:bg-gray-100"
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {s.favicon ? (
                    <img
                      src={s.favicon}
                      alt=""
                      className="h-5 w-5 flex-shrink-0 rounded-full mt-1"
                    />
                  ) : (
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 mt-1">
                      <LinkIcon className="h-3 w-3 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 truncate">
                      {new URL(s.url).hostname.replace(/^www\./, '')}
                    </p>
                    <h3 className="font-medium text-gray-800 leading-snug">{s.title}</h3>

                    {s.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</p>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-gray-500 mt-8">No sources available.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default SourcesComponent
