'use client'

import React, { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

import { useUserLists, useUpdateUserList } from '@/queries/saved-lists'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/button'
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
import {
  Archive,
  Banknote,
  Building2Icon,
  Download,
  List,
  RefreshCcw,
  Trash,
  Users,
  WalletCards,
} from 'lucide-react'
import { UpdateUserListAction } from '@/services/saved-lists'
import { SavedList } from '@/types/saved-list'
import { toast } from 'sonner'
import { columns } from './columns'
import { Skeleton } from '@/components/ui/skeleton'

type TabTypes = 'all' | 'company' | 'investor' | 'people' | 'archive' | 'transaction'

const tabsList = [
  { value: 'all', label: 'All', icon: List },
  { value: 'company', label: 'Companies', icon: Building2Icon },
  { value: 'investor', label: 'Investors', icon: Banknote },
  { value: 'transaction', label: 'Transaction', icon: Building2Icon },
  { value: 'people', label: 'People', icon: Users },
  { value: 'archive', label: 'Archive', icon: Archive },
]

export const SavedListPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabTypes>('all')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const { user, loading: isAuthLoading } = useAuth()
  const userId = user?.user_id ?? ''
  const limit = activeTab === 'all' ? 20 : 10
  const { data: apiResponse, isLoading } = useUserLists(userId, activeTab, limit)
  const displayedLists: SavedList[] = apiResponse?.lists ?? []
  const tabCounts = apiResponse?.count
  const { mutateAsync: updateUserList, isPending: isUpdating } = useUpdateUserList()
  const isComponentLoading = isAuthLoading || isLoading

  const table = useReactTable({
    data: displayedLists,
    columns,
    state: { rowSelection, globalFilter },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  })

  useEffect(() => {
    table.resetRowSelection()
  }, [activeTab])

  const handleBulkAction = async (action: UpdateUserListAction) => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.saved_list_id)
    if (selectedIds.length === 0) {
      toast.warning('No items selected for this action.')
      return
    }

    try {
      await Promise.all(selectedIds.map(listId => updateUserList({ userId, listId, action })))
      toast.success('Action completed successfully!')
      table.resetRowSelection()
    } catch (error) {
      toast.error(`Failed to ${action} lists. Please try again.`)
      console.error(`Error performing bulk action '${action}':`, error)
    }
  }

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

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-xl font-semibold pb-2 border-b-2">Saved Lists</h1>

      <div className="flex justify-between py-4 items-center border-b-2">
        <Tabs
          value={activeTab}
          onValueChange={value => {
            setActiveTab(value as TabTypes)
          }}
        >
          <TabsList className="mb-3">
            {tabsList.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="cursor-pointer data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
              >
                <tab.icon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                {tab.label} ({tabCounts?.[tab.value as keyof typeof tabCounts] || 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-xs text-md font-semibold">
          <Input
            placeholder="Search Any keyword....."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center py-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="xs"
            onClick={() => handleBulkAction('delete')}
            disabled={!table.getSelectedRowModel().rows.length || isUpdating}
          >
            <Trash /> Delete
          </Button>
          {activeTab !== 'archive' && (
            <Button
              variant="warning"
              size="xs"
              onClick={() => handleBulkAction('archive')}
              disabled={!table.getSelectedRowModel().rows.length || isUpdating}
            >
              <Archive /> Archive
            </Button>
          )}
          {activeTab === 'archive' && (
            <Button
              variant="success"
              size="xs"
              onClick={() => handleBulkAction('reactivate')}
              disabled={!table.getSelectedRowModel().rows.length || isUpdating}
            >
              <RefreshCcw /> Reactivate
            </Button>
          )}
        </div>
        <Button
          variant="blue"
          size="xs"
          onClick={handleDownload}
          disabled={!table.getSelectedRowModel().rows.length}
        >
          <Download /> Download
        </Button>
      </div>

      <div className="rounded-md border mt-2 ">
        <Table className="text-sm">
          <TableHeader className="text-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="py-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isComponentLoading ? (
              [...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-32 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.original.saved_list_id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={() =>
                    router.push(
                      `/saved-lists/${row.original.saved_list_id}?title=${row.original.list_name}&type=${row.original.list_type}`
                    )
                  }
                  className="cursor-pointer text-base font-sm"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2">
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

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
