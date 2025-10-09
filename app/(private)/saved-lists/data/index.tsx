'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
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
  HouseIcon,
  List,
  Loader2,
  RefreshCcw,
  Trash,
  Users,
} from 'lucide-react'
import { UpdateUserListAction } from '@/services/saved-lists'
import { SavedList, UserList } from '@/types/saved-list'
import { toast } from 'sonner'
import { columns, normalizeListType } from './columns'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

type TabTypes = 'all' | 'company' | 'investor' | 'people' | 'transaction' | 'archive'

const tabsList = [
  { value: 'all', label: 'All', count: 0, icon: List },
  { value: 'company', label: 'Companies', count: 0, icon: Building2Icon },
  { value: 'investor', label: 'Investors', count: 0, icon: Banknote },
  { value: 'people', label: 'People', count: 0, icon: Users },
  { value: 'archive', label: 'Archive', count: 0, icon: Archive },
]

export const SavedListPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabTypes>('all')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const { user, loading: isAuthLoading } = useAuth()
  const userId = user?.user_id ?? ''
  const { data: apiResponse, isLoading, isError } = useUserLists(userId)
  const { mutateAsync: updateUserList, isPending: isUpdating } = useUpdateUserList()

  const isAllLoading = isAuthLoading || isLoading

  const userListsArray: SavedList[] = apiResponse?.lists ?? []

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

  const filteredLists = useMemo(() => {
    return userListsArray.filter(list => {
      const nType = normalizeListType(list.list_type)
      const isArchived = list.list_status === 'archived'
      if (activeTab === 'all') return !isArchived
      if (activeTab === 'archive') return isArchived
      if (activeTab === 'company') return nType === 'company' && !isArchived
      if (activeTab === 'investor') return nType === 'investor' && !isArchived
      if (activeTab === 'people') return nType === 'people' && !isArchived
      return true
    })
  }, [userListsArray, activeTab])

  const table = useReactTable({
    data: filteredLists,
    columns: columns,
    state: { rowSelection, globalFilter },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const tabCounts = useMemo(() => {
    const lists = userListsArray as SavedList[]
    return {
      all: lists.filter(l => l.list_status !== 'archived').length,
      company: lists.filter(
        l => normalizeListType(l.list_type) === 'company' && l.list_status !== 'archived'
      ).length,
      investor: lists.filter(
        l => normalizeListType(l.list_type) === 'investor' && l.list_status !== 'archived'
      ).length,
      people: lists.filter(
        l => normalizeListType(l.list_type) === 'people' && l.list_status !== 'archived'
      ).length,
      archive: lists.filter(l => l.list_status === 'archived').length,
    }
  }, [userListsArray])

  useEffect(() => {
    table.resetRowSelection()
    ;(table as any).setPageIndex?.(0)
  }, [activeTab])

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

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-xl font-semibold pb-2 border-b-2">Saved Lists</h1>
      {/* Tabs + Search */}
      <div className="flex justify-between py-4 items-center border-b-2">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabTypes)}>
          <ScrollArea>
            <TabsList className="mb-3">
              {tabsList.map(tab => (
                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
                  key={tab.value}
                  value={tab.value}
                >
                  <tab.icon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
                  {tab.label} ({tabCounts[tab.value as keyof typeof tabCounts] || 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>

        <div className="w-xs text-md font-semibold">
          <Input
            placeholder="Search Any keyword....."
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center py-4">
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

      {/* Table */}
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
            {isAllLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading lists...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={(row.original as any).saved_list_id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => router.push(`/saved-lists/${(row.original as any).saved_list_id}`)}
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
    </div>
  )
}
