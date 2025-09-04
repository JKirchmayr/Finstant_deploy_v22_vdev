'use client'

import React, { CSSProperties, useCallback, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDownUp, ArrowDown, ArrowUp, CopyIcon, Trash, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { handleCopyAsTSV } from '@/lib/utils'
import { ExportOptions } from '../../table/export-options'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip'
import { useChatStore } from '@/store/chatStore'
import { CompanyData } from '../chat.types'

const TABLE_STATE_KEY = 'chat-data-table-state'

interface IChatDataTableProps<T extends any> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading: boolean
  skeletonRowCount?: number
  hasMoreData: boolean
  loadMoreData: () => void
  closeTabPanel: () => void
  titleName: string
  noHeader?: boolean
}

/** Pinned column styles — no extra shadows so we don't create double lines */
const getPinningStyles = <T,>(column: Column<T>): CSSProperties => {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 2 : 0,
    // background: isPinned ? 'rgba(255,255,255,0.95)' : undefined,
    // backdropFilter: isPinned ? 'blur(2px)' : undefined,
  }
}

const ChatDataTable = <T extends any,>({
  data,
  columns,
  isLoading,
  skeletonRowCount,
  hasMoreData,
  loadMoreData,
  noHeader = false,
  titleName,
  closeTabPanel,
}: IChatDataTableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const { deleteRows } = useChatStore()

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange',
    initialState: {
      ...(() => {
        try {
          const savedStateJSON = localStorage.getItem(TABLE_STATE_KEY)
          if (!savedStateJSON) return {}
          const savedState = JSON.parse(savedStateJSON)
          const validColumnIds = new Set(
            columns.map(col => (col as any).accessorKey || (col as any).id)
          )
          if (savedState.sorting) {
            savedState.sorting = savedState.sorting.filter((sort: SortingState[0]) =>
              validColumnIds.has(sort.id)
            )
          }
          if (savedState.columnFilters) {
            savedState.columnFilters = savedState.columnFilters.filter(
              (filter: ColumnFiltersState[0]) => validColumnIds.has(filter.id)
            )
          }
          return savedState
        } catch {
          return {}
        }
      })(),
      columnPinning: {
        left: ['select', 'rowNumber', 'name'],
        right: [],
      },
    },
    onStateChange: updater => {
      const state =
        typeof updater === 'function' ? updater(table.getState()) : updater
      const stateToSave = {
        sorting: state.sorting,
        columnFilters: state.columnFilters,
        columnVisibility: state.columnVisibility,
      }
      localStorage.setItem(TABLE_STATE_KEY, JSON.stringify(stateToSave))
    },
  })

  const observer = useRef<IntersectionObserver | null>(null)
  const lastRowRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreData) {
          loadMoreData()
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, hasMoreData, loadMoreData]
  )

  const exportToExcel = (dataToExport: any[], filename = 'export.xlsx') => {
    if (!dataToExport.length) return toast.warning('No data to export.')
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, filename)
  }

  const exportToCSV = (dataToExport: any[], filename = 'export.csv') => {
    if (!dataToExport.length) return toast.warning('No data to export.')
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)

  const handleExport = (format: 'csv' | 'excel') => {
    const exportData = selectedRows.length > 0 ? selectedRows : data
    if (format === 'csv') return exportToCSV(exportData, 'export.csv')
    exportToExcel(exportData, 'export.xlsx')
  }

  const handleCopySelected = () => {
    if (selectedRows.length === 0)
      return toast.warning('No data selected to Copy')
    handleCopyAsTSV(selectedRows)
    toast.success('Copied to clipboard!')
  }

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0)
      return toast.warning('No data selected to Delete')
    deleteRows(selectedRows as CompanyData[])
    setRowSelection({})
    toast.success('Rows deleted successfully')
  }

  return (
    <div className="w-full flex h-full flex-col">
      {!noHeader && (
        <div className=" px-2 py-1">
          <div className="flex justify-between items-center">
            <p className="text-base font-semibold px-2 text-gray-900">
              {titleName}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={closeTabPanel}
                  aria-label="Close Panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close Panel</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="p-2 flex justify-between items-center gap-2">
            <div className="flex gap-2 shrink-0">
              {selectedRows.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleDeleteSelected}
                  >
                    Delete <Trash className="size-4 ml-1" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleCopySelected}
                  >
                    Copy <CopyIcon className="size-4 ml-1" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <ExportOptions
                data={selectedRows.length > 0 ? selectedRows : data}
                onExport={handleExport}
              />
            </div>
          </div>
        </div>
      )}

      {/* No top border -> prevents extra line above sticky header */}
      <div className="flex-1 w-full overflow-auto rounded-md border-x border-b border-t shadow-sm">
        <Table className="!w-full table-fixed border-separate border-spacing-0">
          {/* Sticky header without extra shadow */}
          <TableHeader className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="h-11">
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted() as false | 'asc' | 'desc'
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ ...getPinningStyles(header.column) }}
                      className="relative h-11 px-3 text-center border-b border-r text-[12px] font-semibold bg-gray-100 text-slate-700 tracking-wide uppercase select-none"
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                          ? 'descending'
                          : 'none'
                      }
                    >
                      <div className="flex items-center justify-center gap-1.5 truncate">
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {canSort && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={header.column.getToggleSortingHandler()}
                            aria-label="Toggle sort"
                          >
                            {sorted === 'asc' ? (
                              <ArrowUp className="size-4" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="size-4" />
                            ) : (
                              <ArrowDownUp className="size-4 opacity-60" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Resizer overlays the SAME pixel as border-r → single line */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-0 right-0 h-full w-3 cursor-col-resize select-none touch-none group"
                          aria-label="Resize column"
                          role="separator"
                        >
                          <div className="w-px h-full ml-auto bg-transparent group-hover:bg-blue-500 group-active:bg-blue-600 transition-colors" />
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row, idx) => {
              const isLast = idx === table.getRowModel().rows.length - 1
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-gray-50/80 even:bg-gray-50/[0.25] focus-within:bg-gray-50 h-12"
                  ref={isLast ? (lastRowRef as any) : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{ ...getPinningStyles(cell.column) }}
                      className="px-3 py-2 border-b border-r align-middle text-sm text-gray-800"
                    >
                      <div className="truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}

            {/* Skeleton rows */}
            {isLoading &&
              skeletonRowCount &&
              skeletonRowCount - table.getRowModel().rows.length > 0 &&
              [...Array(
                Math.max(0, skeletonRowCount - table.getRowModel().rows.length)
              )].map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="h-12">
                  {columns.map((_, j) => (
                    <TableCell
                      key={`skeleton-cell-${j}`}
                      className="px-3 py-2 border-b border-r align-middle"
                    >
                      <Skeleton className="w-full h-4 bg-gray-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!isLoading && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-sm text-gray-600"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ChatDataTable
