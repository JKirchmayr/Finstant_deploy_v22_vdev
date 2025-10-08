'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

import { useUserLists, useUpdateUserList } from '@/queries/saved-lists'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { UpdateUserListAction } from '@/services/saved-lists'
import { UserList } from '@/types/saved-list'
import { toast } from 'sonner'

// Heroicons (icons requested)
import {
  BuildingOffice2Icon,
  BanknotesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

/** ------ Utils ------ */

type NormalizedType = 'company' | 'investor' | 'people' | 'unknown'
const normalizeListType = (value?: string): NormalizedType => {
  const v = (value ?? '').toLowerCase()
  if (v.includes('company')) return 'company'
  if (v.includes('investor')) return 'investor'
  if (v.includes('people') || v.includes('person')) return 'people'
  return 'unknown'
}

const ListTypeIcon: React.FC<{ type: NormalizedType }> = ({ type }) => {
  if (type === 'company') {
    return <BuildingOffice2Icon className="h-4 w-4 text-gray-800" aria-hidden />
  }
  if (type === 'investor') {
    return <BanknotesIcon className="h-4 w-4 text-gray-800" aria-hidden />
  }
  if (type === 'people') {
    return <UserGroupIcon className="h-4 w-4 text-gray-800" aria-hidden />
  }
  return <span className="inline-block h-4 w-4 rounded bg-gray-300" aria-hidden />
}

export const SavedListPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'All' | 'Companies' | 'Investors' | 'People' | 'Archive'>('All')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const { user, loading: isAuthLoading } = useAuth()
  const userId = user?.user_id ?? ''
  const { data: apiResponse, isLoading, isError } = useUserLists(userId)
  const { mutateAsync: updateUserList, isPending: isUpdating } = useUpdateUserList()

  const userListsArray: UserList[] = apiResponse?.lists ?? []

  const handleDownload = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast('Please select rows to download.')
      return
    }
    const dataToExport = selectedRows.map(row => row.original)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Saved Lists')
    XLSX.writeFile(workbook, 'selected_lists.xlsx')
  }

  const tabFilteredLists = useMemo(() => {
    return userListsArray.filter(list => {
      const nType = normalizeListType((list as any).list_type)
      const isArchived = (list as any).list_status === 'archived'
      if (activeTab === 'All') return !isArchived
      if (activeTab === 'Archive') return isArchived
      if (activeTab === 'Companies') return nType === 'company' && !isArchived
      if (activeTab === 'Investors') return nType === 'investor' && !isArchived
      if (activeTab === 'People') return nType === 'people' && !isArchived
      return true
    })
  }, [userListsArray, activeTab])

  const columns = useMemo<ColumnDef<UserList>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')}
          onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
          aria-label="Select all"
          className="cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={e => e.stopPropagation()}
          className="cursor-pointer"
        />
      ),
    },
    {
      accessorKey: 'list_name',
      header: 'List Name',
      cell: ({ row }) => {
        const name = (row.original as any).list_name || 'Untitled'
        return <span className="font-medium">{name}</span>
      },
    },
    {
      accessorKey: 'list_type',
      header: 'Type',
      cell: ({ row }) => {
        const nType = normalizeListType((row.original as any).list_type)
        return (
          <div className="inline-flex items-center gap-2">
            <ListTypeIcon type={nType} />
            <span className="text-gray-700 capitalize">
              {nType !== 'unknown' ? nType : (row.original as any).list_type}
            </span>
          </div>
        )
      },
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
          const date = new Date((row.original as any).created_at)
          return date.toLocaleDateString('de-DE')
        } catch {
          return (row.original as any).created_at
        }
      },
    },
  ], [])

  const table = useReactTable({
    data: tabFilteredLists as any[],
    columns,
    state: { rowSelection, globalFilter },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    // Reset selection and (if present) pagination page when changing tabs
    table.resetRowSelection()
    ;(table as any).setPageIndex?.(0)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBulkAction = async (action: UpdateUserListAction) => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => (row.original as any).saved_list_id)
    if (selectedIds.length === 0) return
    try {
      await Promise.all(selectedIds.map(listId => updateUserList({ userId, listId, action })))
      table.resetRowSelection()
    } catch (error) {
      console.error(`Failed to ${action} lists:`, error)
    }
  }

  const tabCounts = useMemo(() => {
    const lists = userListsArray as any[]
    return {
      All: lists.filter(l => l.list_status !== 'archived').length,
      Companies: lists.filter(l => normalizeListType(l.list_type) === 'company' && l.list_status !== 'archived').length,
      Investors: lists.filter(l => normalizeListType(l.list_type) === 'investor' && l.list_status !== 'archived').length,
      People: lists.filter(l => normalizeListType(l.list_type) === 'people' && l.list_status !== 'archived').length,
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

      {/* Tabs + Search */}
      <div className="flex justify-between py-4 items-center">
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as any)}>
          <TabsList className="bg-transparent gap-6 p-0">
            {Object.entries(tabCounts).map(([name, count]) => (
              <TabsTrigger
                key={name}
                value={name}
                className="cursor-pointer data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-b-black rounded-none"
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

      {/* Bulk Actions */}
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
            disabled={!table.getSelectedRowModel().rows.length || activeTab === 'Archive' || isUpdating}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Archive
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!table.getSelectedRowModel().rows.length}
        >
          Download
        </Button>
      </div>

      {/* Table */}
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
                  key={(row.original as any).saved_list_id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => router.push(`/saved-lists/${(row.original as any).saved_list_id}`)}
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
    </div>
  )
}
