'use client'
import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { EntityData, Evaluation, Reference } from '../chat.types'
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
  const evaluations = entity.EVALUATIONS || []

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
    >
      <div
        className="relative bg-white w-full h-[70%] shadow-[0_-10px_10px_0px] shadow-gray-300 md:shadow-lg md:h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2.5 border-b sticky top-0 bg-white flex-shrink-0">
          <div className="flex items-start gap-3">
            {entity.LOGO && (
              <Image
                src={entity.LOGO}
                alt={`${entity.NAME || 'Company'} logo`}
                width={32}
                height={32}
                className="rounded-sm"
                unoptimized={true}
              />
            )}
            <h2 className="font-semibold text-lg">{entity.NAME || 'Profile'}</h2>
          </div>
          <Button size="xs" onClick={onClose} aria-label="Close" variant="secondary">
            <XMarkIcon className="" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar-hide min-h-0">
          {entity.DESCRIPTION && (
            <div className="mb-6">
              <h3 className="font-semibold text-md text-gray-800 mb-2">Relevance Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{entity.DESCRIPTION}</p>
            </div>
          )}

          {evaluations.length > 0 ? (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="font-semibold text-md text-gray-800">Criteria Evaluation</h3>
              {evaluations.map((evaluation, index) => (
                <div key={index} className="bg-gray-50/70 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />

                    {/* {evaluation.SATISFIED === 'yes' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )} */}
                    <div>
                      <h4 className="font-semibold text-gray-900">{evaluation.CRITERION}</h4>
                      <p className="text-sm text-gray-600 mt-1">{evaluation.REASONING}</p>
                    </div>
                  </div>

                  {evaluation.REFERENCES && evaluation.REFERENCES.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Sources
                      </h5>
                      <div className="space-y-2">
                        {evaluation.REFERENCES.map((ref, refIndex) => (
                          <div key={refIndex} className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <a
                              href={ref.URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {ref.TITLE || ref.URL}
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
