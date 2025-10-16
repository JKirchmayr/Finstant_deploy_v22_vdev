'use client'

import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  ListChecks,
  MoveVertical,
  Plus,
  Trash,
  X,
} from 'lucide-react'
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
import Image from 'next/image'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip'
import { useChatStore } from '@/store/chatStore'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'
import { useIsMobile } from '@/hooks/use-mobile'
import { AddToListDialog, CreateNewListDialog, Item } from './ListDialogs'
import { useDeleteSessionListItems } from '@/queries/sessions'
import { cn } from '@/lib/utils'

interface IChatDataTableProps<T extends any> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading: boolean
  loadMoreData?: () => void
  hasMoreData?: boolean
  paginationOption?: boolean
  filterBy?: string
  defaultPinnedColumns?: string[]
  topbarClass?: string
  noSearch?: boolean
  titleName: string
  noHeader?: boolean
  addColumn?: boolean
  expand?: boolean
  toggleExpand: () => void
}

// Helper function to compute pinning styles for columns
const getPinningStyles = <T,>(column: Column<T>): CSSProperties => {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

const ChatDataTable = <T extends any>({
  data,
  columns,
  isLoading,
  noHeader = false,
  titleName,
  addColumn = true,
  defaultPinnedColumns,
  expand,
  toggleExpand,
}: IChatDataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const isMobile = useIsMobile()
  const tableRef = useRef<HTMLDivElement>(null)
  const [isScrolledX, setIsScrolledX] = useState(false)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: 'onChange',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      columnPinning: {
        left: isMobile ? [] : defaultPinnedColumns,
        right: [],
      },
    },
    onStateChange: state => {
      setRowSelection([])
      // Reset scroll position when column state changes
      // if (tableRef.current) {
      //   tableRef.current.scrollLeft = 0
      //   setIsScrolledX(false)
      // }
    },
  })

  useEffect(() => {
    table.setColumnPinning({
      left: isMobile ? [] : defaultPinnedColumns,
      right: [],
    })
  }, [isMobile, table, defaultPinnedColumns])

  useEffect(() => {
    const checkScroll = () => {
      if (tableRef.current) {
        setIsScrolledX(tableRef.current.scrollLeft > 0)
      }
    }

    const element = tableRef.current
    if (element) {
      element.scrollLeft = 0
      setIsScrolledX(false)

      element.addEventListener('scroll', checkScroll)
      return () => element.removeEventListener('scroll', checkScroll)
    }
  }, [])

  const {
    isStreaming,
    deleteRows,
    activeListItemCount,
    setIsCopilotOpen,
    isCopilotOpen,
    closeCompanyPopup,
    closeListPanel,
    activeListMessageId,
  } = useChatStore()

  const toggleChatPanel = () => {
    setIsCopilotOpen(!isCopilotOpen)
  }

  const exportToCSV = (data: any[], filename = 'export.csv') => {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(field => {
            const val = row[field]
            const escaped = typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            return escaped ?? ''
          })
          .join(',')
      ),
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = (data: any[], filename = 'export.xlsx') => {
    if (!data.length) return

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    XLSX.writeFile(workbook, filename)
  }

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
  const handleExport = (format: 'csv' | 'excel') => {
    const exportData = selectedRows.length ? selectedRows : data
    const filename = `${selectedRows.length ? 'selected' : 'all'}-data.${
      format === 'csv' ? 'csv' : 'xlsx'
    }`

    format === 'csv' ? exportToCSV(exportData, filename) : exportToExcel(exportData, filename)
  }

  const { mutate: deleteRowItems, isPending } = useDeleteSessionListItems()

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.warning('No data selected, Please select data to Delete')
      return
    }
    console.log({ selectedRows })
    const selectedRowsIds = selectedRows.map(row => (row as any).ITEM_ID)
    deleteRows(selectedRowsIds)
    toast.success('Data Deleted Successfully')
  }

  const rowDisabled = selectedRows?.length <= 0 || isStreaming
  // console.log({ activeListItemCount })
  return (
    <div className="w-full flex h-full flex-col gap-3">
      {!noHeader && (
        <div className="">
          <div className="pb-1 pt-0 pl-2 pr-2 flex justify-between items-center ">
            <div className="flex gap-2 items-center">
              <Tooltip>
                <TooltipTrigger asChild className="hidden md:block">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={toggleChatPanel}
                    disabled={isStreaming}
                  >
                    {isCopilotOpen ? <ChevronLeft className="" /> : <ChevronRight className="" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>{!isCopilotOpen ? 'Open Chat Panel' : 'Expand List Panel'}</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-base font-medium mb-0">{titleName}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="xs"
                    disabled={isMobile ? false : isStreaming}
                    onClick={() => {
                      if (!isCopilotOpen) {
                        setIsCopilotOpen(true)
                      }
                      closeListPanel()
                    }}
                  >
                    <X className="" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>Close This Panel</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="pt-2 pb-0 pr-2 pl-2">
            <div
              className={cn(
                'flex justify-between items-center gap-2 overflow-hidden transition-transform duration-300',
                {
                  hidden: isStreaming,
                }
              )}
            >
              <div className="flex gap-2 shrink-0 min-h-[28px] items-center">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={rowDisabled}
                  className="h-7 hover:bg-gray-300 gap-0.5 "
                  onClick={handleDeleteSelected}
                >
                  Delete <Trash className="size-4 ml-1" />
                </Button>
                <AddToListDialog
                  initialSelected={selectedRows.map(item => ({
                    NAME: (item as any)?.NAME || (item as any)?.TARGET_NAME,
                    ITEM_ID: (item as any)?.ITEM_ID,
                    LOGO: (item as any).LOGO || (item as any)?.PROFILE_PIC_URL || '',
                  }))}
                  onConfirm={() => setRowSelection([])}
                >
                  <Button
                    variant="secondary"
                    size="xs"
                    disabled={rowDisabled}
                    className="h-7 hover:bg-gray-300"

                    // onClick={handleDeleteSelected}
                  >
                    Add to list <ListChecks />
                  </Button>
                </AddToListDialog>
              </div>
              <div className="flex gap-2 items-center pr-0">
                <div className="hidden sm:flex gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    className={cn(
                      'h-7 hover:bg-gray-300 gap-1'
                      // { 'bg-foreground/30': !expand }
                    )}
                    onClick={toggleExpand}
                    disabled={isStreaming}
                  >
                    <ChevronsDownUp />
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    className={cn('h-7 hover:bg-foreground/30 gap-1', {
                      // 'bg-foreground/30': expand,
                    })}
                    onClick={toggleExpand}
                    disabled={isStreaming}
                  >
                    <ChevronsUpDown />
                  </Button>
                </div>
                <CreateNewListDialog
                  initialSelected={selectedRows.map(item => ({
                    NAME: (item as any)?.NAME || (item as any)?.TARGET_NAME,
                    ITEM_ID: (item as any)?.ITEM_ID,
                    LOGO: (item as any).LOGO || (item as any)?.PROFILE_PIC_URL || '',
                  }))}
                  onConfirm={() => setRowSelection([])}
                >
                  <Button
                    variant="secondary"
                    size="xs"
                    disabled={rowDisabled}
                    className="h-7 hover:bg-gray-300 gap-1"

                    // onClick={handleDeleteSelected}
                  >
                    Create List <Plus />
                  </Button>
                </CreateNewListDialog>
                <Button
                  variant="secondary"
                  size="xs"
                  className="h-7 py-1 text-xs hover:bg-gray-300"
                  onClick={() => handleExport('excel')}
                  disabled={isStreaming}
                >
                  <span className="hidden sm:block">Download</span> <Download className="size-4 " />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className="flex flex-col w-full bg-white overflow-auto overflow-x-auto thin-scroll border-t border-gray-300"
        ref={tableRef}
      >
        <Table
          className="!w-full bg-background [&_td]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b [&_thead]:border-b-0"
          // style={{ width: table.getTotalSize() }}
        >
          <TableHeader className="bg-white text-[13px] h-8 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map(header => {
                  const { column } = header
                  const isPinned = column.getIsPinned()
                  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left')
                  const isFirstRightPinned =
                    isPinned === 'right' && column.getIsFirstColumn('right')

                  return (
                    <TableHead
                      key={header.id}
                      className="text-foreground/70 group border-b relative h-10 truncate data-pinned:bg-background px-4 text-left"
                      colSpan={header.colSpan}
                      style={{ ...getPinningStyles(column) }}
                      data-pinned={isPinned || undefined}
                      data-last-col={
                        isLastLeftPinned ? 'left' : isFirstRightPinned ? 'right' : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate w-full flex">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanResize() && (
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className:
                                'absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px',
                            }}
                          />
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="max-h-[400px] overflow-auto">
            {isLoading ? (
              [...Array(activeListItemCount || 5)].map((_, i) => (
                <TableRow key={i} className="border-b border-gray-300">
                  {[...Array(columns.length)].map((_, j) => (
                    <TableCell key={j} className="py-4 min-h-[73px] border-r border-gray-300">
                      <Skeleton className="w-full h-4 bg-gray-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {table.getRowModel().rows.length ? (
                  <>
                    {table.getRowModel().rows.map((row, index) => {
                      const isLastRow = index === table.getRowModel().rows.length - 5
                      return (
                        <TableRow
                          key={row.id}
                          className="h-auto border-b transition-colors hover:bg-gray-100/80"
                        >
                          {row.getVisibleCells().map((cell: any) => {
                            const { column } = cell
                            const isPinned = column.getIsPinned()
                            const isLastLeftPinned =
                              isPinned === 'left' && column.getIsLastColumn('left')
                            const isFirstRightPinned =
                              isPinned === 'right' && column.getIsFirstColumn('right')

                            return (
                              <TableCell
                                key={cell.id}
                                className="py-1.5 border-r border-gray-300 bg-background h-auto"
                                style={{ ...getPinningStyles(column) }}
                                data-pinned={isPinned || undefined}
                                data-last-col={
                                  isLastLeftPinned
                                    ? 'left'
                                    : isFirstRightPinned
                                    ? 'right'
                                    : undefined
                                }
                              >
                                <div className="">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}

                    {/* Additional placeholder rows placed below all data rows when not streaming */}
                    {isStreaming &&
                      Array.from({
                        length: Math.max(0, (activeListItemCount || 0) - data.length),
                      }).map((_, i) => (
                        <TableRow key={`filler-${i}`} className="border-b border-gray-300">
                          {[...Array(columns.length)].map((_, j) => (
                            <TableCell
                              key={j}
                              className="py-4 min-h-[73px] border-r border-gray-300"
                            >
                              <Skeleton className="w-full h-4 bg-gray-100" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="h-40 text-center text-lg font-medium flex justify-center items-center flex-col shrink-0">
                        <Image
                          src="/images/no-data.png"
                          alt="No data"
                          width={150}
                          height={150}
                          className="shrink-0"
                          style={{ mixBlendMode: 'multiply' }}
                          unoptimized
                        />
                        <p className="text-sm text-muted-foreground"> No results.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ChatDataTable
