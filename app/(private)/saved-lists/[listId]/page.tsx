'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, List } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUserListItems } from '@/queries/saved-lists'
import { ListItemsResponse, ListType } from '@/types/saved-list'
import { Button } from '@/components/ui/button'

import { generateColumns } from './data/columns'
import { ListDetailsDataTable } from './data'
import { Skeleton } from '@/components/ui/skeleton'

const normalizeListType = (typeString: string = ''): ListType => {
  const lowerType = typeString.toLowerCase()
  if (lowerType.includes('investor')) return 'investor'
  if (lowerType.includes('company')) return 'company'
  if (lowerType.includes('people')) return 'people'
  return 'unknown'
}

export default function SavedListDetailsPage() {
  const params = useParams()
  const listId = params?.listId as string

  const { user, loading: isAuthLoading } = useAuth()
  const userId = user?.user_id ?? ''

  const {
    data: listData,
    isLoading: isItemsLoading,
    isError,
  } = useUserListItems(userId, listId, !!listId) as {
    data: ListItemsResponse | undefined
    isLoading: boolean
    isError?: boolean
  }

  const isLoading = isAuthLoading || isItemsLoading

  const { items, list_details, pagination } = listData || {}
  const listType = normalizeListType(list_details?.list_type)
  const columns = generateColumns(listType)

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 items-center">
        <Link href="/saved-lists" className="flex-shrink-0 ">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          {!isLoading ? (
            <h1 className="text-[16px] font-semibold flex items-center gap-x-2 ">
              {list_details?.list_name}
            </h1>
          ) : (
            <Skeleton className="w-[250px] h-4 rounded-sm" />
          )}
          {isLoading ? (
            <Skeleton className="w-36 h-3 mt-1 rounded-sm" />
          ) : (
            <p className="text-xs ">
              Type:
              <span className="capitalize">
                {' '}
                {list_details?.list_type?.replace('_', ' ')} ({pagination?.total_count})
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="overflow-auto">
        <ListDetailsDataTable
          columns={columns}
          data={items ?? []}
          listType={listType}
          userId={userId}
          listId={listId}
          // isLoading={isLoading}
        />
      </div>
    </div>
  )
}
