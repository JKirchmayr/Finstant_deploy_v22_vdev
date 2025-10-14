'use client'

import React from 'react'
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
  const listDetails = listData?.list_details as SavedList | undefined
  const items: AnyListItem[] = listData?.items ?? []
  const title = listDetails?.list_name || searchParams.get('title') || ''
  const type = listDetails?.list_type || searchParams.get('type') || ''
  const totalCount = listData?.pagination?.total_count ?? 0
  const listType = normalizeListType(type)

  const columns = generateColumns(listType)
  console.log('items', items)

  return (
    <MainLayout
      headerChildren={
        <div className="flex gap-2 items-center w-full">
          <Link href="/saved-lists" className="flex-shrink-0 hidden sm:block">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="max-w-[180px] sm:max-w-full">
            <h1 className="text-xs sm:text-[14px] font-semibold flex items-center gap-x-2 truncate">
              {title}
            </h1>
            <p className="text-[10px] sm:text-xs ">
              Type:
              <span className="capitalize">
                {' '}
                {listType?.replace('_', ' ')} {totalCount > 0 && <span>({totalCount})</span>}
              </span>
            </p>
          </div>
        </div>
      }
    >
      <div className="p-4 space-y-6 oveflow-hidden ">
        <ListDetailsDataTable
          columns={columns}
          data={items}
          listType={listType}
          userId={userId}
          listId={listId}
          isLoading={isLoading}
          title={title}
        />
      </div>
    </MainLayout>
  )
}
