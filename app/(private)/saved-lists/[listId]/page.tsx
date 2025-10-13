'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
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
  const queryClient = useQueryClient()

  // ✅ Synchronously find the initial data from the cache of the previous page
  const initialData = useMemo(() => {
    // Find all the cached queries that start with ['userLists', userId]
    const queries = queryClient.getQueryCache().findAll({
      queryKey: ['userLists', userId],
    })

    // Search through all cached pages to find our list
    for (const query of queries) {
      const data = query.state.data as { lists?: SavedList[] }
      if (data?.lists) {
        const foundList = data.lists.find(list => list.saved_list_id === listId)
        if (foundList) {
          // ✅ DEBUG: Confirm that we found the data in the cache
          console.log(
            '%cFound initial data in cache:',
            'color: purple; font-weight: bold;',
            foundList
          )
          return foundList
        }
      }
    }
    return undefined // Return undefined if not found
  }, [queryClient, userId, listId])

  const { data: listData, isLoading: isItemsLoading } = useUserListItems(
    userId,
    listId,
    !!listId
  ) as {
    data: ListItemsResponse | undefined
    isLoading: boolean
  }

  const isLoading = isAuthLoading || isItemsLoading
  const listDetails = listData?.list_details ?? initialData
  const items = listData?.items ?? []

  const totalCount = listData?.pagination?.total_count ?? initialData?.item_count ?? 0

  const listType = normalizeListType(listDetails?.list_type)
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
              <h1 className="text-[16px] font-semibold flex items-center gap-x-2 ">
                {listDetails.list_name}
              </h1>
              <p className="text-xs ">
                Type:
                <span className="capitalize">
                  {' '}
                  {listDetails.list_type?.replace('_', ' ')} ({totalCount})
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
