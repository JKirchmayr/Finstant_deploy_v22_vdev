'use client'

import * as React from 'react'
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import * as XLSX from 'xlsx'
import {
  Download, Trash, X, Maximize2, Minimize2, ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle, // Import handle for drag column
} from '@/components/ui/sortable'
import { AnyListItem, ListType } from '@/types/saved-list'
import { toast } from 'sonner'
import { useRemoveItemsFromList, useUpdateItemPosition } from '@/queries/saved-lists'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface DataTableProps {
  columns: ColumnDef<AnyListItem>[]
  data: AnyListItem[]
  listType: ListType
  userId: string
  listId: string
  isLoading: boolean
  title: string
  expand: boolean
  handleExpand: () => void
  handleCollapse: () => void
}

// Helper function for column pinning styles
const getPinningStyles = <T,>(column: Column<T>): React.CSSProperties => {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export function ListDetailsDataTable({
  columns,
  data,
  listType,
  userId,
  listId,
  isLoading,
  title,
  expand,
  handleExpand,
  handleCollapse,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [rowSelection, setRowSelection] = React.useState({})
  const [items, setItems] = React.useState(data)
  const tableBodyRef = React.useRef<HTMLTableSectionElement>(null)
  const [uniformRowHeight, setUniformRowHeight] = React.useState<number | null>(null)

  const { mutate: removeItems } = useRemoveItemsFromList(true)
  const { mutate: updatePosition } = useUpdateItemPosition(listId)

  React.useEffect(() => {
    setItems(data)
  }, [data])

  const filterColumnId = React.useMemo(() => {
    return 'NAME'
  }, [])

  const handlePositionChange = (nextItems: AnyListItem[]) => {
    const prevItems = items
    setItems(nextItems)

    const oldIds = prevItems.map(i => i.saved_list_item_id)
    const newIds = nextItems.map(i => i.saved_list_item_id)
    if (JSON.stringify(oldIds) === JSON.stringify(newIds)) return

    let k = 0
    while (k < oldIds.length && oldIds[k] === newIds[k]) k++
    if (k === oldIds.length) return

    const equal = (a: string[], b: string[]) =>
      a.length === b.length && a.every((x, i) => x === b[i])
    const strip = (arr: string[], id: string) => arr.filter(x => x !== id)
    const candidateFromNew = newIds[k]
    const movedId = equal(strip(oldIds, candidateFromNew), strip(newIds, candidateFromNew))
      ? candidateFromNew
      : oldIds[k]
    const newPosition = newIds.indexOf(movedId) + 1

    updatePosition(
      { userId, payload: { saved_list_item_id: movedId, new_position: newPosition } },
      {
        onError: () => {
          toast.error('Failed to save new order. Reverting changes.')
          setItems(prevItems)
        },
      }
    )
  }

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, columnFilters, rowSelection, globalFilter },
    initialState: {
      pagination: { pageSize: 50 },
      columnPinning: { left: ['drag'], right: [] },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: row => row.saved_list_item_id,
    columnResizeMode: 'onChange',
  })

  React.useLayoutEffect(() => {
    if (expand && tableBodyRef.current) {
      const rows = Array.from(tableBodyRef.current.children) as HTMLTableRowElement[]

      if (rows.length > 0) {
        const maxHeight = Math.max(...rows.map(row => row.offsetHeight))
        setUniformRowHeight(maxHeight)
      }
    } else {
      setUniformRowHeight(null)
    }
  }, [expand, items])

  const handleDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.warning('Please select items to delete.', { position: 'top-center' })
      return
    }
    const selectedItemIds = selectedRows.map(row => row.original.saved_list_item_id)
    const selectedEntityIds = selectedRows.map(row => row.original.id)

    const payload = {
      saved_list_item_ids: selectedItemIds,
      entity_ids: selectedEntityIds,
    }

    removeItems(
      { userId, listId, data: payload },
      {
        onSuccess: () => {
          toast.success(`${selectedItemIds.length} item(s) deleted successfully.`)
          table.resetRowSelection()
        },
        onError: () => toast.error('Failed to delete items. Please try again.'),
      }
    )
  }

  const handleDownload = () => {
    const rowsToExport =
      table.getFilteredSelectedRowModel().rows.length > 0
        ? table.getFilteredSelectedRowModel().rows
        : table.getCoreRowModel().rows

    if (data?.length === 0) {
      toast.warning('No items to download.')
      return
    }
    const exportItems = rowsToExport?.length ? rowsToExport : data
    const dataToExport = exportItems.map(row => (row as any).original)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, title?.slice(0, 30) || 'Saved List Items')
    XLSX.writeFile(workbook, `${title?.slice(0, 30)}.xlsx` || 'saved_list_items.xlsx')
  }

  return (
    <div className="space-y-4 ">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* <Input
          placeholder="Search Any keyword....."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="sm:w-sm w-full ml-0.5"
        /> */}

        {/* <div className="space-x-4 sm:block flex  flex-col justify-between"> */}
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleDelete}
            // disabled={Object.keys(rowSelection).length === 0}
            className="ml-auto"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={handleDownload}
          // disabled={Object.keys(rowSelection).length === 0}
          >
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleExpand}
            disabled={expand}
            title="Expand all rows"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={handleCollapse}
            disabled={!expand}
            title="Collapse all rows"
          >
            <ChevronsDownUp className="h-4 w-4" />

          </Button>
        </div>
        {/* </div> */}
      </div>

      <div className="rounded-lg border overflow-auto">
        <Sortable
          value={items}
          onValueChange={handlePositionChange}
          getItemValue={item => item.saved_list_item_id}
        >
          <Table className="table-fixed border-separate border-spacing-0">
            <TableHeader className="sticky top-0 z-10 bg-muted backdrop-blur-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="bg-muted border-b-0">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="text-foreground group border-b border-r bg-muted border-gray-300 last:border-r-0 relative h-10 truncate px-4 text-left"
                      style={{ ...getPinningStyles(header.column) }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className="absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10"
                          />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <SortableContent asChild items={items.map(item => item.saved_list_item_id)}>
              <TableBody ref={tableBodyRef}>
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <TableRow key={i} className="border-b-0">
                      {columns.map((column, j) => (
                        <TableCell
                          key={j}
                          className="py-4 min-h-[58px] border-b border-r border-gray-300 last:border-r-0 px-4"
                          style={{ width: (column as any).size }}
                        >
                          <Skeleton className="w-full h-4 bg-gray-100" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <SortableItem key={row.id} value={row.id} asChild>
                      <TableRow
                        data-state={row.getIsSelected() && 'selected'}
                        className="border-b-0"
                        style={{ height: uniformRowHeight ? `${uniformRowHeight}px` : 'auto' }}
                      >
                        {row.getVisibleCells().map(cell => {
                          const content = (
                            <TableCell
                              key={cell.id}
                              className="py-1.5 border-b border-r border-gray-300 last:border-r-0 bg-background px-4"
                              style={{ ...getPinningStyles(cell.column) }}
                            >
                              {/* <div className="line-clamp-2 w-full max-h-[40px]"> */}
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              {/* </div> */}
                            </TableCell>
                          )
                          // Wrap the 'drag' column's cell with the handle
                          return cell.column.id === 'drag' ? (
                            <SortableItemHandle asChild key={cell.id}>
                              {content}
                            </SortableItemHandle>
                          ) : (
                            content
                          )
                        })}
                      </TableRow>
                    </SortableItem>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="h-40 flex justify-center items-center flex-col">
                        <Image
                          src="/images/no-data.png"
                          alt="No data"
                          width={150}
                          height={150}
                          style={{ mixBlendMode: 'multiply' }}
                          unoptimized
                        />
                        <p className="text-sm text-muted-foreground">No results found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </SortableContent>
          </Table>
        </Sortable>
      </div>

      {data.length > 50 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
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
      )}
    </div>
  )
}
