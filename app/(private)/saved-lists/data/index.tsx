'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

import { useUserLists, useUpdateUserList, useUpdateUserListsBulk } from '@/queries/saved-lists'
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
  HandCoins,
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
import { Badge } from '@/components/ui/badge'
import { ButtonGroup } from '@/components/ui/button-group'
import { CreateNewList } from './create-list'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAuthStore } from '@/store/authStore'

type TabTypes = 'all' | 'company' | 'investor' | 'people' | 'archive' | 'transaction'

const tabsList = [
  { value: 'all', label: 'All', icon: List },
  { value: 'company', label: 'Companies', icon: Building2Icon },
  { value: 'investor', label: 'Investors', icon: Banknote },
  { value: 'transaction', label: 'Transaction', icon: HandCoins },
  { value: 'people', label: 'People', icon: Users },
]

export const SavedListPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabTypes>('all')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const { user, } = useAuthStore()
  const [counts, setCounts] = useState(null)
  const userId = user?.user_id ?? ''
  // const limit = activeTab === 'all' ? 20 : 10
  const { data: apiResponse, isLoading } = useUserLists(userId, activeTab, 50)
  const { mutateAsync: updateUserLists, isPending: isUpdating } = useUpdateUserListsBulk()
  const isComponentLoading = isLoading
  const [sorting, setSorting] = useState<SortingState>([])
  const [type, setType] = useState<'active' | 'archived'>('active')
  const tabCounts = apiResponse?.count
  const displayedLists: SavedList[] = (apiResponse as any)?.lists?.filter((list: SavedList) => list.list_status === type) || [];

  useEffect(() => {
    if (!!tabCounts && !counts) {
      setCounts(tabCounts)
    }
  }, [tabCounts, counts])

  const listTypeCounts = useMemo(() => {
    if (!apiResponse?.lists) return {}
    const filtered = apiResponse.lists.filter(
      (list: SavedList) => list.list_status === type
    )
    const countsByType = filtered.reduce((acc: Record<string, number>, list: SavedList) => {
      acc[list.list_type] = (acc[list.list_type] || 0) + (list.item_count || 0)
      return acc
    }, {})

    return countsByType
  }, [apiResponse, type, activeTab])


  const table = useReactTable({
    data: displayedLists,
    columns,
    state: { rowSelection, globalFilter, sorting },
    initialState: {
      pagination: { pageSize: 50 },
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    table.resetRowSelection()
  }, [activeTab])

  const handleBulkAction = async (action: UpdateUserListAction) => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map(row => row.original.saved_list_id)

    if (selectedIds.length === 0) {
      toast.warning(`Please select items for ${action}.`, { position: 'top-center' })
      return
    }

    try {
      await updateUserLists({
        userId,
        action,
        saved_list_ids: selectedIds,
      }, {
        onSuccess: (data) => {
          console.log({ data })
        }
      })
      table.resetRowSelection()
    } catch (error) {
      toast.error(`Failed to ${action} lists. Please try again.`)
      console.error(`Error performing bulk action '${action}':`, error)
    }
  }

  const handleDownload = () => {
    const data = table.getSelectedRowModel().rows.map(row => row.original) as any[]
    if (data?.length === 0) {
      toast('Please select rows to download.')
      return
    }
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    XLSX.writeFile(workbook, activeTab + '.xlsx')
  }

  const isDisabled = !table.getSelectedRowModel().rows.length || isUpdating

  return (
    <div className="p-4 w-full mx-auto">
      <h1 className="text-xl font-semibold pb-2 ">Saved Lists</h1>

      <div className="pt-4 border-y-2">
        <div className='flex justify-between items-center'>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name..."
              value={(table?.getColumn("list_name")?.getFilterValue() as string) ?? ""}
              onChange={e => {
                const value = e.target.value
                table.getColumn('list_name')?.setFilterValue(value || undefined)
              }}
              className='w-xs text-md font-semibold border-border focus-visible:ring-0 '

            />
            <div>
              <ToggleGroup
                type="single"
                variant="segmented"
                value={type}
                onValueChange={(value: "archived" | "active") => {
                  if (value) {
                    setType(value)
                    router.replace(`/saved-lists?status=${value}`)
                  }
                }}
              >
                <ToggleGroupItem className="flex-1 border cursor-pointer" value="active">
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem className="flex-1 border cursor-pointer" value="archived">
                  Archive
                </ToggleGroupItem>

              </ToggleGroup>

            </div>
          </div>
          <CreateNewList  >
            <Button>Create New List</Button>
          </CreateNewList>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Tabs
            value={activeTab}
            onValueChange={value => {
              setActiveTab(value as TabTypes)
              table?.getColumn('list_name')?.setFilterValue('')
            }}
          >
            <TabsList className="h-auto gap-2 rounded-none border-b bg-transparent px-0 py-0.5 text-foreground">
              {tabsList.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative gap-2 cursor-pointer after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                >
                  {tab.label} <Badge variant='secondary' className='font-medium'>
                    {counts?.[tab.value as keyof typeof tabCounts] || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-between items-center py-2 pt-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isDisabled && <Button
            variant="outline"
            size="xs"
            onClick={() => handleBulkAction('delete')}

          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>}
          {!isDisabled && type !== 'archived' && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkAction('archive')}

            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}
          {!isDisabled && type === 'archived' && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkAction('reactivate')}
            >
              <RefreshCcw className="h-4 w-4" />
              Reactivate
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={handleDownload}
        // disabled={!table.getSelectedRowModel().rows.length}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="rounded-md border mt-2 ">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isComponentLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-b-0">
                  {columns.map((column, j) => (
                    <TableCell
                      key={j}
                      className="py-1.5 min-h-[40px] border-b px-4"
                      style={{ width: (column as any).size }}
                    >
                      <Skeleton className="w-full h-4 bg-gray-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) :
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='py-1.5'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>

        </Table>
      </div>

      {
        displayedLists?.length > 50 && (
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
        )
      }
    </div >
  )
}
