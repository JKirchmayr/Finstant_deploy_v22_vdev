"use client"

import React, { CSSProperties, useCallback, useRef, useState } from "react"
import * as XLSX from "xlsx"
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
} from "@tanstack/react-table"
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  CopyIcon,
  Loader,
  PlusIcon,
  ShareIcon,
  Trash,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, handleCopyAsTSV } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { ExportOptions } from "../table/export-options"
import { AddNewColumn } from "./AddNewColumn"
import { toast } from "sonner"
import { useSingleTabStore } from "@/store/singleTabStore"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface IChatDataTableProps<T extends any> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading: boolean
  loadMoreData: () => void
  hasMoreData: boolean
  paginationOption?: boolean
  filterBy?: string
  defaultPinnedColumns?: string[]
  topbarClass?: string
  noSearch?: boolean
  togglePanel: () => void
  closeTabPanel: () => void
  titleName: string
  noHeader?: boolean
  addColumn?: boolean
}

// Helper function to compute pinning styles for columns
const getPinningStyles = <T,>(column: Column<T>): CSSProperties => {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

const ChatDataTable = <T extends any>({
  data,
  columns,
  isLoading,
  loadMoreData,
  hasMoreData,
  noHeader = false,
  togglePanel,
  titleName,
  addColumn = true,
  closeTabPanel,
}: IChatDataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const pathname = usePathname()
  const investors = pathname === "/investors"

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
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      columnPinning: {
        left: ["select", "company_name"],
        right: [],
      },
    },
  })
  const { setSingleTab, isCollapsed } = useSingleTabStore()

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

  const exportToCSV = (data: any[], filename = "export.csv") => {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers
          .map(field => {
            const val = row[field]
            const escaped = typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val
            return escaped ?? ""
          })
          .join(",")
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = (data: any[], filename = "export.xlsx") => {
    if (!data.length) return

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

    XLSX.writeFile(workbook, filename)
  }

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
  const handleExport = (format: "csv" | "excel") => {
    const exportData = selectedRows.length ? selectedRows : data
    const filename = `${selectedRows.length ? "selected" : "all"}-data.${
      format === "csv" ? "csv" : "xlsx"
    }`

    format === "csv" ? exportToCSV(exportData, filename) : exportToExcel(exportData, filename)
  }

  const handleCopySelected = () => {
    if (selectedRows.length === 0) {
      toast.warning("No data selected, Please select data to Copy")
      return
    }

    handleCopyAsTSV(selectedRows)
  }

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.warning("No data selected, Please select data to Delete")
      return
    }

    const updatedData = data.filter(row => !selectedRows.includes(row))
    setRowSelection({})
    setSingleTab("abc", "companies", updatedData, "final")
    toast.success("Data Deleted Successfully")
  }

  return (
    <div className="w-full flex h-full flex-col gap-3">
      {!noHeader && (
        <div className="">
          <div className="p-2 space-y-1 flex justify-between items-center ">
            <p className="text-base font-medium mb-0">{titleName}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="xs"
                  className="!px-[6px] hover:bg-gray-300"
                  onClick={closeTabPanel}
                >
                  <X className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>Close This Panel</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="p-2 space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="xs"
                  className="!px-[6px] hover:bg-gray-300"
                  onClick={togglePanel}
                >
                  {!isCollapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  className="hover:bg-gray-300"
                  onClick={handleDeleteSelected}
                >
                  Delete <Trash className="size-4 ml-1" />
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  className="hover:bg-gray-300"
                  disabled={!selectedRows.length && !data.length}
                  onClick={handleCopySelected}
                >
                  Copy <CopyIcon className="size-4 ml-1" />
                </Button>
              </div>
              <div className="flex gap-2">
                {addColumn && (
                  <AddNewColumn>
                    <Button
                      variant="secondary"
                      size="xs"
                      className="h-7 py-1 text-xs hover:bg-gray-300"
                    >
                      Add Column <PlusIcon className="size-4 ml-1" />
                    </Button>
                  </AddNewColumn>
                )}
                <ExportOptions
                  data={
                    Object.keys(rowSelection).length > 0
                      ? Object.keys(rowSelection).map(index => data[Number(index)])
                      : data
                  }
                  onExport={(format: "csv" | "excel") => handleExport(format)}
                >
                  <Button
                    variant="secondary"
                    size="xs"
                    className="h-7 py-1 text-xs hover:bg-gray-300"
                  >
                    Export <ShareIcon className="size-4 ml-1" />
                  </Button>
                </ExportOptions>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full bg-white border border-l-0 overflow-auto overflow-x-auto">
        <Table
          className="!w-full bg-background [&_td]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b [&_thead]:border-b-0"
          style={{ width: table.getTotalSize() }}
        >
          <TableHeader className="bg-white text-[13px] h-8 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map(header => {
                  const { column } = header
                  const isPinned = column.getIsPinned()
                  const isLastLeftPinned = isPinned === "left" && column.getIsLastColumn("left")
                  const isFirstRightPinned =
                    isPinned === "right" && column.getIsFirstColumn("right")

                  return (
                    <TableHead
                      key={header.id}
                      className="text-foreground/70 group border-b data-pinned:bg-muted/90 relative h-10 truncate data-pinned:backdrop-blur-xs px-4 text-left"
                      colSpan={header.colSpan}
                      style={{ ...getPinningStyles(column) }}
                      data-pinned={isPinned || undefined}
                      data-last-col={isLastLeftPinned ? "left" : isFirstRightPinned ? "right" : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate w-full flex">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {!!header.column.getCanSort() && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <ArrowDownUp className="size-4" />
                          </Button>
                        )}
                        {header.column.getCanResize() && (
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className:
                                "absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px",
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
            {isLoading && !data.length ? (
              [...Array(20)].map((_, i) => (
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
                  table.getRowModel().rows.map((row, index) => {
                    const isLastRow = index === table.getRowModel().rows.length - 5
                    return (
                      <TableRow
                        ref={isLastRow ? lastRowRef : null}
                        key={row.id}
                        className="min-h-6 border-b transition-colors hover:bg-gray-100/80"
                      >
                        {row.getVisibleCells().map((cell: any) => {
                          const { column } = cell
                          const isPinned = column.getIsPinned()
                          const isLastLeftPinned =
                            isPinned === "left" && column.getIsLastColumn("left")
                          const isFirstRightPinned =
                            isPinned === "right" && column.getIsFirstColumn("right")

                          return (
                            <TableCell
                              key={cell.id}
                              className="py-2.5 border-r border-gray-300"
                              style={{ ...getPinningStyles(column) }}
                              data-pinned={isPinned || undefined}
                              data-last-col={
                                isLastLeftPinned ? "left" : isFirstRightPinned ? "right" : undefined
                              }
                            >
                              <div className="truncate">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })
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
                          style={{ mixBlendMode: "multiply" }}
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