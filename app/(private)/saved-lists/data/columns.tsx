import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { SavedList } from '@/types/saved-list'
import { BanknotesIcon, BuildingOffice2Icon, UserGroupIcon } from '@heroicons/react/24/outline'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

export const columns: ColumnDef<SavedList>[] = [
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
      const name = row.getValue('list_name') || ''
      return <span className="font-medium text-[14px]">{String(name)}</span>
    },
  },
  {
    accessorKey: 'list_type',
    header: () => <p className="ml-2">Type</p>,
    cell: ({ row }) => {
      const nType = normalizeListType(row.original.list_type) || ''
      return (
        <Badge variant="secondary" className="font-medium">
          <ListTypeIcon type={nType} />
          <span className="capitalize">
            {nType !== 'unknown' ? nType : (row.original as any).list_type}
          </span>
        </Badge>
      )
    },
  },
  {
    accessorKey: 'item_count',
    header: 'Items',
    cell: ({ row }) => (
      <Badge className="font-medium" variant="secondary">
        {row.original.item_count || 0}
      </Badge>
    ),
  },
  {
    accessorKey: 'created_at',
    header: () => <p className="text-center">Created on</p>,
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="secondary" className="font-medium">
          {format(new Date(row.getValue('created_at')), 'dd MMMM yyyy')}
        </Badge>
      </div>
    ),
  },
]

export type NormalizedType = 'company' | 'investor' | 'people' | 'transaction' | 'unknown'

const ListTypeIcon: React.FC<{ type: NormalizedType }> = ({ type }) => {
  if (type === 'company') {
    return <BuildingOffice2Icon className="" aria-hidden />
  }
  if (type === 'investor') {
    return <BanknotesIcon className="" aria-hidden />
  }
  if (type === 'people') {
    return <UserGroupIcon className="" aria-hidden />
  }
  return <span className="inline-block h-6 w-6 rounded bg-gray-300" aria-hidden />
}

export const normalizeListType = (value?: string): NormalizedType => {
  const v = (value ?? '').toLowerCase()
  if (v.includes('company')) return 'company'
  if (v.includes('investor')) return 'investor'
  if (v.includes('people') || v.includes('person')) return 'people'
  if (v.includes('transaction') || v.includes('person')) return 'transaction'
  return 'unknown'
}
