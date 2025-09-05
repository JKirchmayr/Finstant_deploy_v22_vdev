'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const CanvasSkeleton = () => {
  return (
    <div className="mx-auto max-w-[900px] p-3 animate-pulse space-y-8">
      {/* Company Name */}
      <Skeleton className="h-10 w-64 bg-gray-200 rounded-md" />

      {/* Logo */}
      <Skeleton className="h-32 w-32 bg-gray-200 rounded-lg" />

      {/* Key Facts */}
      <div className="space-y-3">
        {['Website', 'Location', 'Industry', 'Founded', 'Employees', 'Revenue'].map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-5 w-24 bg-gray-200 rounded-md" />
            <Skeleton className="h-5 w-56 bg-gray-200 rounded-md" />
          </div>
        ))}
      </div>

      {/* Company Overview */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-56 bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-full bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-11/12 bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-full bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-10/12 bg-gray-200 rounded-md" />
      </div>

      {/* Business Model & Products */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-72 bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-full bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-11/12 bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-full bg-gray-200 rounded-md" />
        <Skeleton className="h-5 w-10/12 bg-gray-200 rounded-md" />
      </div>
    </div>
  )
}
