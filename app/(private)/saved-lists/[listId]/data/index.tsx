'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import * as XLSX from 'xlsx'

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
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from '@/components/ui/sortable'
import { AnyListItem, ListType } from '@/types/saved-list'
import { toast } from 'sonner'
import { useRemoveItemsFromList } from '@/queries/saved-lists'
import { Download, Trash } from 'lucide-react'

interface DataTableProps {
  columns: ColumnDef<AnyListItem>[]
  data: AnyListItem[]
  listType: ListType
  userId: string
  listId: string
  isLoading: boolean
}

export function ListDetailsDataTable({
  columns,
  data,
  listType,
  userId,
  listId,
  isLoading,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [items, setItems] = React.useState(data)

  const { mutate: removeItems, isPending: isDeleting } = useRemoveItemsFromList(true)

  React.useEffect(() => {
    setItems(data)
  }, [data])

  const getFilterColumnId = (type: string) => {
    switch (type) {
      case 'investor':
        return 'investor_name'
      case 'company':
        return 'company_name'
      case 'people':
        return 'person_name'
      default:
        return 'id'
    }
  }

  const filterColumnId = getFilterColumnId(listType)
  console.log('data', items)

  const table = useReactTable({
    data: items,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: row => row.saved_list_item_id,
    state: { sorting, columnFilters, rowSelection },
    autoResetPageIndex: false,
  })

  const handleDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.warning('Please select items to delete.')
      return
    }

    // This correctly gets the unique item IDs for the list
    const selectedItemIds = selectedRows.map(row => row.original.saved_list_item_id)

    const payload = {
      saved_list_item_ids: selectedItemIds,
    }

    removeItems(
      { userId, listId, data: payload },
      {
        onSuccess: () => {
          toast.success(`${selectedItemIds.length} item(s) deleted successfully.`)
          table.resetRowSelection()
        },
        onError: error => {
          toast.error('Failed to delete items. Please try again.')
          console.error('Deletion failed:', error)
        },
      }
    )
  }
  const handleDownload = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      console.log('No rows selected for download.')
      return
    }

    const selectedData = selectedRows.map(row => row.original)
    const worksheet = XLSX.utils.json_to_sheet(selectedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Saved List Items')
    XLSX.writeFile(workbook, 'list_items.xlsx')
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder={`Filter by ${listType} name...`}
          value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ''}
          onChange={event => table.getColumn(filterColumnId)?.setFilterValue(event.target.value)}
          className="max-w-sm ml-0.5"
        />
        <Button
          variant="danger"
          size="xs"
          onClick={handleDelete}
          disabled={Object.keys(rowSelection).length === 0}
          className="ml-auto"
        >
          <Trash /> Delete
        </Button>
        <Button
          size="xs"
          variant="blue"
          onClick={handleDownload}
          disabled={Object.keys(rowSelection).length === 0}
        >
          <Download /> Download
        </Button>
      </div>

      <div className="rounded-md border-2 overflow-auto mt-6 shadow-xl">
        <Sortable
          value={items}
          onValueChange={setItems}
          getItemValue={item => item.saved_list_item_id}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="py-1 text-sm"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <SortableContent asChild items={items.map(item => item.saved_list_item_id)}>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading items...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <SortableItem key={row.id} value={row.id} asChild>
                      <TableRow data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map(cell => {
                          const content = (
                            <TableCell key={cell.id} className="py-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          )
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </SortableContent>
          </Table>
        </Sortable>
      </div>

      {/* Pagination */}
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
