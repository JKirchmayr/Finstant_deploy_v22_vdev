'use client'

import React, { useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, List } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUserListItems } from '@/queries/saved-lists'
import { useQueryClient } from '@tanstack/react-query'
import { ListItemsResponse, ListType, SavedList } from '@/types/saved-list'
//import { ListItemsResponse, ListType } from '@/types/saved-list'
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
  const searchParams = useSearchParams()

  const { data: listData, isLoading: isItemsLoading } = useUserListItems(
    userId,
    listId,
    !!listId
  ) as {
    data: ListItemsResponse | undefined
    isLoading: boolean
  }

  const isLoading = isAuthLoading || isItemsLoading
  const listDetails = (listData?.list_details ?? []) as SavedList
  const items = listData?.items ?? []
  const title = listDetails?.list_name || searchParams.get('title') || ''
  const type = listDetails?.list_type || searchParams.get('type') || ''
  const totalCount = listData?.pagination?.total_count ?? 0
  const listType = normalizeListType(type)
  const columns = useMemo(() => generateColumns(listType), [listType])

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 items-center">
        <Link href="/saved-lists" className="flex-shrink-0 ">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          {listDetails ? (
            <>
              <h1 className="text-[16px] font-semibold flex items-center gap-x-2 ">{title}</h1>
              <p className="text-xs ">
                Type:
                <span className="capitalize">
                  {' '}
                  {listType?.replace('_', ' ')} {totalCount && <span>({totalCount})</span>}
                </span>
              </p>
            </>
          ) : (
            <>
              <Skeleton className="w-[250px] h-4 rounded-sm" />
              <Skeleton className="w-36 h-3 mt-1 rounded-sm" />
            </>
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
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
