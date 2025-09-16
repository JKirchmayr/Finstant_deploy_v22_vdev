'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { MagnifyingGlassIcon, BuildingOffice2Icon, ChartBarIcon } from '@heroicons/react/24/outline'

export type TabKey = 'research' | 'profiles' | 'analysis'

export const SUGGESTION_BANK: Record<TabKey, string[]> = {
  research: [
    'Summarize recent news on the European luxury goods sector',
    'What are the current trends shaping the global data center market',
    'Summarize recent news related to M&A activity in the semiconductor sector',
  ],
  profiles: [
    'Create a company profile of Tesla',
    'Create a company profile of Selux AG',
    'Create an investor profile of Investindustrial',
  ],
  analysis: [
    'List of 3 companies in the pet food industry that are based in Germany',
    'List of 3 private equity investors with car parts manufacture in their portfolio',
    'Create a precedent transaction analysis on gym chain deals',
  ],
}

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>
const TABS: Array<{ key: string; label: string; Icon: IconType }> = [
  { key: 'research', label: 'Research', Icon: MagnifyingGlassIcon },
  { key: 'profiles', label: 'Profiles', Icon: BuildingOffice2Icon },
  { key: 'analysis', label: 'Analysis', Icon: ChartBarIcon },
]

interface SuggestionsProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  className?: string
}
export const Suggestions: React.FC<SuggestionsProps> = ({ activeTab, onTabChange, className }) => {
  return (
    <div className={cn('flex flex-col w-full items-center justify-center  md:my-8', className)}>
      <Image src="/images/logo_small.jpg" alt="logo" width={40} height={40} />
      <h1
        className="  font-normal text-gray-800 my-6 text-center md:text-2xl"
        style={{ fontFamily: 'Times New Roman' }}
      >
        Instant Corporate Finance Workflows
      </h1>
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <Button
                key={key}
                onClick={() => onTabChange(key as TabKey)}
                variant={isActive ? 'default' : 'outline'}
                className={cn(
                  'h-12 w-full px-4 gap-3 rounded-2xl text-base font-medium justify-center',
                  !isActive && 'bg-muted/60',
                  isActive && 'shadow-sm'
                )}
              >
                <Icon className="w-7 h-7" />
                <span className="tracking-tight">{label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface BottomSuggestionsProps {
  setInput: (input: string) => void
  items?: string[]
  className?: string
}
export const BottomSuggestions: React.FC<BottomSuggestionsProps> = ({
  setInput,
  items = [],
  className,
}) => (
  <div className={cn('w-full max-w-3xl', className)}>
    <ul className="rounded-xl border-b bg-muted/20 divide-y divide-border">
      {items.map((suggestion, idx) => (
        <li key={idx}>
          <Button
            type="button"
            onClick={() => setInput(suggestion)}
            variant="ghost"
            className="w-full justify-start h-12 px-4 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Use suggestion: ${suggestion}`}
          >
            <span className="truncate">{suggestion}</span>
          </Button>
        </li>
      ))}
    </ul>
  </div>
)
