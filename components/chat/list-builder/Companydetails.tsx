'use client'
import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CompanyData, Evaluation, Reference } from '../chat.types'
import { CheckCircle2, XCircle, Link as LinkIcon, Briefcase, DollarSign, Package } from 'lucide-react'
import Image from 'next/image'

interface CompanyPopupProps {
  isOpen: boolean
  onClose: () => void
  company: CompanyData | null
}

export const CompanyPopup: React.FC<CompanyPopupProps> = ({ isOpen, onClose, company }) => {
  if (!isOpen || !company) return null

  const evaluations = company.evaluations as Evaluation[] || []

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
      <div
        className="relative bg-white w-full h-full shadow-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white flex-shrink-0">
          <div className="flex items-start gap-3">
            {company.company_logo && (
              <Image
                src={company.company_logo}
                alt={`${company.company_name || 'Company'} logo`}
                width={32}
                height={32}
                className="rounded-sm"
                unoptimized={true}
              />
            )}
            <h2 className="font-semibold text-lg">{company.company_name || 'Profile'}</h2>
          </div>
          <Button size="xs" onClick={onClose} aria-label="Close" variant="secondary">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar-hide min-h-0">
          {company.company_description && (
            <div className="mb-6">
              <h3 className="font-semibold text-md text-gray-800 mb-2">Relevance Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{company.company_description}</p>
            </div>
          )}

          <div className="mb-6 space-y-3">
            <h3 className="font-semibold text-md text-gray-800">Company Details</h3>
            {company.company_revenue && (
              <div className="flex items-start gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Revenue</p>
                  <p className="text-gray-600">{company.company_revenue}</p>
                </div>
              </div>
            )}
            {company.company_products && (
              <div className="flex items-start gap-3 text-sm">
                <Package className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Products</p>
                  <p className="text-gray-600">{company.company_products}</p>
                </div>
              </div>
            )}
          </div>
          
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
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sources</h5>
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