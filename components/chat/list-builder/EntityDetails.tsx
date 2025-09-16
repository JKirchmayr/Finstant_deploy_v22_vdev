'use client'
import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { EntityData, Evaluation, Reference } from '../chat.types' // Ensure types are imported
import {
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Briefcase,
  DollarSign,
  Package,
} from 'lucide-react'
import Image from 'next/image'
import { useChatStore } from '@/store/chatStore'
import { cn } from '@/lib/utils'

interface EntityPopupProps {
  isOpen: boolean
  onClose: () => void
  entity: EntityData | null
}

export const EntityPopup: React.FC<EntityPopupProps> = ({ isOpen, onClose, entity }) => {
  if (!isOpen || !entity) return null
  const { isCopilotOpen } = useChatStore()

  console.log(entity)
  const evaluations = entity.evaluations || []

  return (
    <motion.div
      className={cn('absolute inset-0 flex items-end justify-end z-50 md:w-[35%] ', {
        'right-0': !isCopilotOpen,
        'left-0': isCopilotOpen,
      })}
      onClick={onClose}
      initial={{
        opacity: 0,
        x: 'var(--source-initial-x)',
        y: 'var(--source-initial-y)',
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      exit={{
        opacity: 0,
        x: 'var(--source-initial-x)',
        y: 'var(--source-initial-y)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      //initial={{ opacity: 0, x: !isCopilotOpen ? '100%' : '-100%' }}
      //animate={{ opacity: 1, x: 0 }}
      //exit={{ opacity: 0, x: !isCopilotOpen ? '100%' : '-100%' }}
      //style={{ width: '35%' }}
      //transition={{ type: 'spring', stiffness: 250, damping: 25 }}
    >
      <div
        className="relative bg-white w-full h-[70%] shadow-[0_-10px_10px_0px] shadow-gray-300 md:shadow-lg md:h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white flex-shrink-0">
          <div className="flex items-start gap-3">
            {/* UPDATED to use 'logo' and 'name' */}
            {entity.logo && (
              <Image
                src={entity.logo}
                alt={`${entity.name || 'Company'} logo`}
                width={32}
                height={32}
                className="rounded-sm"
                unoptimized={true}
              />
            )}
            <h2 className="font-semibold text-lg">{entity.name || 'Profile'}</h2>
          </div>
          <Button size="xs" onClick={onClose} aria-label="Close" variant="secondary">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar-hide min-h-0">
          {/* UPDATED to use 'description' */}
          {entity.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-md text-gray-800 mb-2">Relevance Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{entity.description}</p>
            </div>
          )}

          {evaluations.length > 0 ? (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="font-semibold text-md text-gray-800">Criteria Evaluation</h3>
              {evaluations.map((evaluation, index) => (
                <div key={index} className="bg-gray-50/70 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {evaluation.satisfied === 'yes' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{evaluation.criterion}</h4>
                      <p className="text-sm text-gray-600 mt-1">{evaluation.reasoning}</p>
                    </div>
                  </div>

                  {evaluation.references && evaluation.references.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Sources
                      </h5>
                      <div className="space-y-2">
                        {evaluation.references.map((ref, refIndex) => (
                          <div key={refIndex} className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {ref.title || ref.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">No evaluation criteria available.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
