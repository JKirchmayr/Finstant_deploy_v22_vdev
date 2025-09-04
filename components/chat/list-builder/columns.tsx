import { ColumnDef } from '@tanstack/react-table'
import { CompanyData } from '../chat.types'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import Link from 'next/link'
import { ExpandableCell } from '@/components/table/epandable-cell'
import { GenerateSkeleton } from './generate-skeleton'
import { useChatStore } from '@/store/chatStore'

export const companiesListColumns: ColumnDef<CompanyData>[] = [
  {
    id: 'select',
    size: 60, // Increased size slightly for better spacing
    header: ({ table }) => (
      <div className="flex justify-center items-center w-full gap-2">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <div className="text-center">#</div>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center w-full gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <div className="text-center">{row.index + 1}</div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'company_name',
    header: 'Company',
    size: 180, // Slightly decreased width to save space
    cell: ({ row }) => {
      const { openCompanyPopup } = useChatStore()
      return (
        <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
          <Image
            src={row.original.company_logo || 'https://placehold.co/50x50.png'}
            alt="logo"
            width={20}
            height={20}
            className="mr-1.5 rounded flex-shrink-0"
            unoptimized={true}
          />
          <button
            onClick={() => openCompanyPopup(row.original)}
            className="truncate text-left bg-transparent p-0 h-auto font-medium hover:underline focus:outline-none"
          >
            {row.original.company_name || 'Details'}
          </button>
        </div>
      )
    },
  },
  {
    accessorKey: 'company_description',
    header: 'Description',
    size: 350, // Increased width for better readability, then let it wrap
    cell: ({ row }) => (
      <ExpandableCell
        TriggerCell={
          <p className="whitespace-pre-line line-clamp-2">{row.original.company_description}</p>
        }
      >
        <p>{row.original.company_description}</p>
      </ExpandableCell>
    ),
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    size: 120, // Adjusted size
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.company_revenue} />
    ),
  },
  {
    accessorKey: 'products',
    header: 'Products',
    size: 150,
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.company_products} />
    ),
  },
  {
    accessorKey: 'company_location',
    header: 'HQ',
    size: 150, // Increased last column's size
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.company_location} />
    ),
  },
]
