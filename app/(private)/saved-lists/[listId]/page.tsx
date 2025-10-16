'use client'

import React, { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUserListItems } from '@/queries/saved-lists'
import { AnyListItem, ListItemsResponse, ListType, SavedList } from '@/types/saved-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { generateColumns } from './data/columns'
import { ListDetailsDataTable } from './data'
import { MainLayout } from '@/components/layout/MainLayout'

const normalizeListType = (typeString: string = ''): ListType => {
  const lowerType = typeString.toLowerCase()
  if (lowerType.includes('investor')) return 'investor'
  if (lowerType.includes('company')) return 'company'
  if (lowerType.includes('people')) return 'people'
  if (lowerType.includes('transaction')) return 'transaction'
  return 'unknown'
}

export default function SavedListDetailsPage() {
  const params = useParams()
  const listId = params?.listId as string

  const [expand, setExpand] = useState<boolean>(false)
  const handleExpand = () => setExpand(true)
  const handleCollapse = () => setExpand(false)

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
  const listDetails = listData?.list_details as SavedList | undefined
  const items: AnyListItem[] = listData?.items ?? []
  const title = listDetails?.list_name || searchParams.get('title') || ''
  const type = listDetails?.list_type || searchParams.get('type') || ''
  const totalCount = listData?.pagination?.total_count ?? 0
  const listType = normalizeListType(type)

  const columns = generateColumns(listType, expand)
  // console.log('items', items)

  return (
    <MainLayout>
      <div className="p-4 space-y-6 oveflow-hidden ">
        <div className="flex gap-2 items-center w-full">
          <Link href="/copilot" className="flex-shrink-0 ">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="max-w-[180px] sm:max-w-full">
            <h1 className="text-xs sm:text-base font-semibold flex items-center gap-x-2 truncate">
              {title}
            </h1>
          </div>
        </div>
        <ListDetailsDataTable
          columns={columns}
          data={items}
          listType={listType}
          userId={userId}
          listId={listId}
          isLoading={isLoading}
          title={title}
          expand={expand}
          handleExpand={handleExpand}
          handleCollapse={handleCollapse}
        />
      </div>
    </MainLayout>
  )
}
