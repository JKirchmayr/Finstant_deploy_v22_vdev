'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  Building2,
  Globe,
  MapPin,
  Users,
  ArrowLeft,
  NotebookIcon,
  List,
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useUserListItems } from '@/queries/saved-lists'
import { CompanyListItem, ListItemsResponse } from '@/types/saved-list'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SavedListDetailsPage() {
  const params = useParams()
  const listId = params?.listId as string

  const { user, loading: isAuthLoading } = useAuth()
  const userId = user?.user_id ?? ''

  const {
    data: listItems,
    isLoading: isItemsLoading,
    isError,
  } = useUserListItems(userId, listId, !!listId) as {
    data: ListItemsResponse | undefined
    isLoading: boolean
    isError?: boolean
  }

  // Safely gets a fallback logo URL
  const getFaviconUrl = (websiteUrl: string | null) => {
    if (!websiteUrl) return 'https://www.google.com/s2/favicons?domain=google.com'
    try {
      const hostname = new URL(websiteUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${hostname}`
    } catch (error) {
      console.error('Invalid URL for favicon:', websiteUrl)
      return 'https://www.google.com/s2/favicons?domain=google.com'
    }
  }

  if (isAuthLoading || isItemsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>Loading list details...</span>
      </div>
    )
  }

  if (isError || !listItems) {
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

  const { items } = listItems

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-x-2 pb-2">
            <List />
            <span>{listItems?.list_details?.list_name}</span>
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Total Lists Available: {listItems?.pagination?.total_count}
          </p>
        </div>
        <Link href="/saved-lists">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {items && items.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px]">Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: CompanyListItem) => (
                <TableRow key={item.saved_list_item_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.company_logo || getFaviconUrl(item.company_website)}
                        alt={`${item.company_name} logo`}
                        // FIX: Increased image size, which also increases row height
                        className="h-20 w-20 rounded-md object-contain"
                      />
                      <div>
                        <p className="text-sm font-semibold capitalize">{item.company_name}</p>
                        {item.company_website && (
                          <a
                            href={item.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {item.company_description ?? 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.company_industry ? (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-5 w-5 flex-shrink-0" />
                        {item.company_industry}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.company_employees ? (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-5 w-5 flex-shrink-0" />
                        {item.company_employees.toLocaleString()}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.company_location ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-5 w-5 flex-shrink-0" />
                        {item.company_location}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-gray-500 p-6">No items found in this list.</p>
      )}
    </div>
  )
}
