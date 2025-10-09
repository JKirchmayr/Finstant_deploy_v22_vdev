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

  if (isAuthLoading || isItemsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>Loading list details...</span>
      </div>
    )
  }

  if (isError || !listData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p>Failed to load list details. Please try again later.</p>
        <Link href="/saved-lists">
          <Button variant="outline" className="mt-4">
            Back to Lists
          </Button>
        </Link>
      </div>
    )
  }

  const { items, list_details, pagination } = listData
  const listType = normalizeListType(list_details?.list_type)
  const columns = generateColumns(listType)

  return (
    <div className="py-6">
      <div className="flex items-center border-b-2 pb-6">
        {/* <Link href="/saved-lists">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link> */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-x-2 ">
            <span className="flex">
              <Link href="/saved-lists">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              {list_details?.list_name}
            </span>
          </h1>
          <p className="pl-10 text-base font-sm capitalize">
            Type: {list_details?.list_type} ({pagination?.total_count})
          </p>
        </div>
      </div>
      <div className="px-6 overflow-auto">
        {items && items.length > 0 ? (
          <ListDetailsDataTable
            columns={columns}
            data={items}
            listType={listType}
            userId={userId}
            listId={listId}
          />
        ) : (
          <p className="text-center text-gray-500 p-6">No items found in this list.</p>
        )}
      </div>
    </div>
  )
}
