'use client'
import React, { useState, useMemo, useEffect } from 'react'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'

import { useUserLists, useUpdateUserList, useUserListItems } from '@/queries/saved-lists'

import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { UpdateUserListAction } from '@/services/saved-lists'
interface ListTypeBadgeProps {
  type: string
}
const ListTypeBadge: React.FC<ListTypeBadgeProps> = ({ type }) => {
  const displayType =
    type.replace('_list', '').charAt(0).toUpperCase() + type.replace('_list', '').slice(1)
  const icons: Record<string, string> = {
    Company: '🏢',
    Investor: '💼',
    People: '👤',
  }
  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-100 py-1 px-2.5 rounded-full text-sm font-medium text-gray-700">
      <span>{icons[displayType] || '📄'}</span>
      <span>{displayType}</span>
    </div>
  )
}
interface UserList {
  saved_list_id: string
  list_name: string
  list_type: string
  item_count: number
  created_at: string
  list_status: 'active' | 'archived'
}

export const SavedListPage = () => {
  const [activeTab, setActiveTab] = useState<
    'All' | 'Companies' | 'Investors' | 'People' | 'Archive'
  >('All')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  const { user, loading: isAuthLoading } = useAuth()
  const userId = user?.user_id ?? ''
  const { data: apiResponse, isLoading, isError } = useUserLists(userId)

  const { data: listItems, isLoading: isItemsLoading } = useUserListItems(
    userId,
    selectedListId ?? '',
    !!selectedListId
  )

  useEffect(() => {
    if (selectedListId && listItems) {
      console.log('Items for list', selectedListId, listItems)
    }
  }, [selectedListId, listItems])

  const { mutateAsync: updateUserList, isPending: isUpdating } = useUpdateUserList()
  const userListsArray: UserList[] = apiResponse?.lists ?? []

  const tabFilteredLists = useMemo(() => {
    return userListsArray.filter(list => {
      if (activeTab === 'All') return list.list_status !== 'archived'
      if (activeTab === 'Archive') return list.list_status === 'archived'
      const typeMap: Record<'Companies' | 'Investors' | 'People', string> = {
        Companies: 'company_list',
        Investors: 'investor_list',
        People: 'people_list',
      }
      return list.list_type === typeMap[activeTab] && list.list_status !== 'archived'
    })
  }, [userListsArray, activeTab])

  const columns = useMemo<ColumnDef<UserList>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      },
      {
        accessorKey: 'list_name',
        header: 'List Name',
      },
      {
        accessorKey: 'list_type',
        header: 'List Type',
        cell: ({ row }) => <ListTypeBadge type={row.original.list_type} />,
      },
      {
        accessorKey: 'item_count',
        header: '# Items',
      },
      {
        accessorKey: 'created_at',
        header: 'Created on',
        cell: ({ row }) => {
          try {
            const date = new Date(row.original.created_at)
            return date.toLocaleDateString('de-DE')
          } catch {
            return row.original.created_at
          }
        },
      },
    ],
    []
  )
  const table = useReactTable({
    data: tabFilteredLists,
    columns,
    state: { rowSelection, globalFilter },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    // @ts-ignore – setPageIndex is defined when the pagination plugin is used
    table.setPageIndex?.(0)
  }, [activeTab, table])

  const handleBulkAction = async (action: UpdateUserListAction) => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.saved_list_id)
    if (selectedIds.length === 0) return
    try {
      await Promise.all(selectedIds.map(listId => updateUserList({ userId, listId, action })))
      table.resetRowSelection()
    } catch (error) {
      console.error(`Failed to ${action} lists:`, error)
    }
  }

  const tabCounts = useMemo(() => {
    const lists = userListsArray
    return {
      All: lists.filter(l => l.list_status !== 'archived').length,
      Companies: lists.filter(l => l.list_type === 'company_list' && l.list_status !== 'archived')
        .length,
      Investors: lists.filter(l => l.list_type === 'investor_list' && l.list_status !== 'archived')
        .length,
      People: lists.filter(l => l.list_type === 'people_list' && l.list_status !== 'archived')
        .length,
      Archive: lists.filter(l => l.list_status === 'archived').length,
    }
  }, [userListsArray])

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-2xl font-semibold pb-2 border-b-2">Saved Lists</h1>
      <div className="flex justify-between py-4 items-center">
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as any)}>
          <TabsList className="bg-transparent gap-6 p-0">
            {Object.entries(tabCounts).map(([name, count]) => (
              <TabsTrigger
                key={name}
                value={name}
                className="  data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-b-black rounded-none"
              >
                {name}
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-64">
          <Input
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between items-center py-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkAction('delete')}
            disabled={!table.getSelectedRowModel().rows.length || isUpdating}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkAction('archive')}
            disabled={
              !table.getSelectedRowModel().rows.length || activeTab === 'Archive' || isUpdating
            }
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Archive
          </Button>
        </div>
        <Button variant="outline">Download</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading lists...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                  Failed to load lists.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.original.saved_list_id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => {
                    setSelectedListId(row.original.saved_list_id)
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No lists found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Optionally render something when items for a selected list are loading */}
      {isItemsLoading && selectedListId && (
        <div className="mt-4 text-gray-500">Loading items for selected list...</div>
      )}
    </div>
  )
}
