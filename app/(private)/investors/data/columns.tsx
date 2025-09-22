// import CompanySheet from "@/components/CompanySheet"
// import CompanySheet from "@/components/CompanySheet"
import InvestorSheet from '@/components/InvestorSheet'
import { ExpandableCell } from '@/components/table/expandable-cell'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const allColumns: ColumnDef<any>[] = [
  {
    id: 'select',
    // maxSize: 45,
    size: 65,
    header: ({ table }) => (
      <div className="flex justify-center items-center w-full gap-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          // className="mx-auto"
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
          // className="mx-auto"
        />
        <div className="text-center">{row.index + 1}</div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: "index",
  //   header: () => <span className="text-center mx-auto">#</span>,
  //   maxSize: 40,
  //   cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: "logo",
  //   header: "Logo",
  //   cell: ({ row }) => (
  //     <div className="w-[70px] h-[40px] flex items-center justify-center overflow-hidden rounded-md">
  //       <img
  //         src={
  //           row.getValue("logo") !== null
  //             ? row.getValue("logo")
  //             : "/images/no-logo.png"
  //         }
  //         alt="logo"
  //         className="h-full object-contain"
  //       />
  //     </div>
  //   ),
  // },
  {
    accessorKey: 'investor_name',
    minSize: 300,
    header: () => <div className="text-left min-w-[110px]">Investor Name</div>,
    cell: ({ row }) => {
      return (
        <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
          <Image
            src={row.original.investor_linkedin_logo.trimEnd() || 'https://placehold.co/50x50.png'}
            alt="logo"
            width={20}
            height={20}
            className="mr-1.5 rounded"
            unoptimized={true}
          />
          <Link target="_blank" href={`/investors/${row.original.investor_id}` || '#'}>
            {row.getValue('investor_name') || '-'}
          </Link>
        </div>
        // <InvestorSheet investor={row.original}>
        //   <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
        //     <Image
        //       src={
        //         row.original.investor_linkedin_logo.trimEnd() || "https://placehold.co/50x50.png"
        //       }
        //       alt="logo"
        //       width={20}
        //       height={20}
        //       className="mr-1.5 rounded"
        //       unoptimized={true}
        //     />
        //     {row.getValue("investor_name") || "-"}
        //   </div>
        // </InvestorSheet>
      )
    },
  },
  {
    accessorKey: 'investor_type',
    minSize: 150,
    header: () => <div className="text-left">Type</div>,
    cell: ({ row }) => <div>{row.getValue('investor_type') || '-'}</div>,
  },
  {
    accessorKey: 'investor_asset_classes',
    minSize: 150,
    header: () => <div className="text-left">Asset Class</div>,
    cell: ({ row }) => <div>{row.getValue('investor_asset_classes') || '-'}</div>,
  },
  {
    accessorKey: 'investor_strategy',
    minSize: 150,
    header: () => <div className="text-left">Strategy</div>,
    cell: ({ row }) => <div>{row.getValue('investor_strategy') || '-'}</div>,
  },
  {
    accessorKey: 'investor_LLM_country',
    minSize: 150,
    header: () => <div className="text-left">Country</div>,
    cell: ({ row }) => <div>{row.getValue('investor_LLM_country') || '-'}</div>,
  },
  {
    accessorKey: 'investor_linkedin_city',
    minSize: 150,
    header: () => <div className="text-left">City</div>,
    cell: ({ row }) => <div>{row.getValue('investor_linkedin_city') || '-'}</div>,
  },
  {
    accessorKey: 'investor_linkedin_founded',
    minSize: 100,
    header: () => <div className="text-left">Founded</div>,
    cell: ({ row }) => <div>{row.getValue('investor_linkedin_founded') || '-'}</div>,
  },
  {
    accessorKey: 'investor_website',
    minSize: 150,
    header: () => <div className="text-left">Website</div>,
    cell: ({ row }) => {
      return (
        <Link target="_blank" href={row.original.investor_website || '#'}>
          {!row.original.investor_website && '-'}
          {row.original.investor_website && (
            <Badge
              className="bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
              variant="outline"
            >
              visit site
              <ExternalLink size={12} className="size-3 ml-1" />
            </Badge>
          )}
        </Link>
      )
    },
  },
  {
    accessorKey: 'investor_linekdin_url',
    minSize: 150,
    header: () => <div className="text-left">LinkedIn</div>,
    cell: ({ row }) => {
      return (
        <Link target="_blank" href={row.original.investor_linekdin_url || '#'}>
          {!row.original.investor_linekdin_url && '-'}
          {row.original.investor_linekdin_url && (
            <Badge
              className="bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
              variant="outline"
            >
              LinkedIn
              <ExternalLink size={12} className="size-3 ml-1" />
            </Badge>
          )}
        </Link>
      )
    },
  },
  {
    accessorKey: 'investors_LLM_description',
    minSize: 400,
    header: () => (
      <div className="text-left overflow-hidden w-[300px] line-clamp-2">Description</div>
    ),
    cell: ({ row }) => {
      return (
        <ExpandableCell
          className="w-[600px]"
          TriggerCell={<p>{row.getValue('investors_LLM_description')}</p>}
        >
          {row.getValue('investors_LLM_description')}
        </ExpandableCell>
      )
    },
  },
  // {
  //   accessorKey: "status",
  //   header: () => <div className="text-left min-w-[100px]">Status</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.status !== null || "" ? row.original.status : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "sector",
  //   header: () => <div className="text-left min-w-[100px]">Sector</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.sector !== null || "" ? row.original.sector : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "sales_in_meur",
  //   header: () => <div className="text-left min-w-[110px]">Sales in EURm</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.sales_in_meur !== null || ""
  //         ? row.original.sales_in_meur
  //         : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "ebitda_in_meur",
  //   header: () => <div className="text-left min-w-[110px]">EBITDA in EURm</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.ebitda_in_meur !== null || ""
  //         ? row.original.ebitda_in_meur
  //         : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "marge",
  //   header: () => <div className="text-left min-w-[110px]">Marge</div>,
  //   cell: ({ row }) => (
  //     <div>{row.original.marge !== null || "" ? row.original.marge : "-"}</div>
  //   ),
  // },
  // {
  //   accessorKey: "min_ticket_meur",
  //   header: () => (
  //     <div className="text-left min-w-[110px]">
  //       Min Ticket <span className="text-[10px]">(mEUR)</span>
  //     </div>
  //   ),
  //   cell: ({ row }) => <div>-</div>,
  // },
  // {
  //   accessorKey: "hq_country",
  //   header: () => <div className="text-left min-w-[110px]">HQ Country</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.hq_country !== null || "" ? row.original.hq_country : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "year_finacials",
  //   header: () => <div className="text-left min-w-[110px]">Year Finacials</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.year_finacials !== null || ""
  //         ? row.original.year_finacials
  //         : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "entry_year",
  //   header: () => <div className="text-left min-w-[110px]">Entry Year</div>,
  //   cell: ({ row }) => (
  //     <div>
  //       {row.original.entry_year !== null || "" ? row.original.entry_year : "-"}
  //     </div>
  //   ),
  // },
]

export function getColumnsForData(data: any[]): ColumnDef<any>[] {
  if (!data || data.length === 0) return allColumns
  const dataKeys = Object.keys(data[0])
  return allColumns.filter(
    col =>
      col.id === 'select' ||
      col.id === 'index' ||
      ('accessorKey' in col && dataKeys.includes(col.accessorKey as string))
  )
}
