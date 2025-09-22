// import CompanySheet from "@/components/CompanySheet"
// import CompanySheet from "@/components/CompanySheet"
import CompanySheet from '@/components/CompanySheet'
import { ExpandableCell } from '@/components/table/expandable-cell'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

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
  //   cell: ({ row }) => <div className="text-center mx-auto">{row.index + 1}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  //   enablePinning: false,
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
    accessorKey: 'company_name',
    minSize: 260,
    header: ({ column }) => {
      return <div className="text-left">Company Name</div>
    },
    cell: ({ row }) => {
      const [isCompanySheetOpen, setIsCompanySheetOpen] = useState(false)

      return (
        // <CompanySheet
        //   company={row.original}
        //   open={isCompanySheetOpen}
        //   onOpenChange={setIsCompanySheetOpen}
        // >
        //   <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
        //     <Image
        //       src={row.original.companies_linkedin_logo_url || "https://placehold.co/50x50.png"}
        //       alt="logo"
        //       width={20}
        //       height={20}
        //       className="mr-1.5 rounded"
        //       unoptimized={true}
        //     />
        //     {row.getValue("company_name") || "-"}
        //   </div>
        // </CompanySheet>
        <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
          <Image
            src={row.original.companies_linkedin_logo_url || 'https://placehold.co/50x50.png'}
            alt="logo"
            width={20}
            height={20}
            className="mr-1.5 rounded"
            unoptimized={true}
          />
          <Link target="_blank" href={`/companies/${row.original.company_id}` || '#'}>
            {row.getValue('company_name') || '-'}
          </Link>
        </div>
      )
    },
    enablePinning: true,
  },
  {
    accessorKey: 'companies_LLM_description',
    minSize: 600,
    header: () => (
      <div className="text-left overflow-hidden w-[300px] line-clamp-2">Description</div>
    ),
    cell: ({ row, column }) => {
      const width = column.getSize()
      return (
        <ExpandableCell
          className={`w-${width}px`}
          TriggerCell={<p className="line-clamp-2 ">{row.getValue('companies_LLM_description')}</p>}
        >
          {row.getValue('companies_LLM_description')}
        </ExpandableCell>
      )
    },
  },
  {
    accessorKey: 'company_website',
    header: () => <div className="text-left">Website</div>,
    cell: ({ row }) => {
      return (
        <Link target="_blank" href={row.original.company_website || '/'}>
          {!row.original.company_website && '-'}
          {row.original.company_website && (
            <Badge
              className="bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
              variant="outline"
            >
              visit site
              <ExternalLink size={12} className="size-3 ml-1 mt-.5" />
            </Badge>
          )}
        </Link>
      )
    },
  },
  {
    accessorKey: 'companies_linkedin_city',
    header: () => <div className="text-left">City</div>,
    cell: ({ row }) => <div>{row.original.companies_linkedin_city || '-'}</div>,
  },
  {
    accessorKey: 'companies_LLM_country',
    header: () => <div className="text-left">Country</div>,
    cell: ({ row }) => <div>{row.original.companies_LLM_country || '-'}</div>,
  },
  {
    accessorKey: 'companies_linkedin_company_size',
    header: () => <div className="text-left">Company Size</div>,
    cell: ({ row }) => <div>{row.original.companies_linkedin_company_size || '-'}</div>,
  },
  {
    accessorKey: 'companies_linkedin_founded',
    header: () => <div className="text-left">Founded</div>,
    cell: ({ row }) => <div>{row.original.companies_linkedin_founded || '-'}</div>,
  },
  {
    accessorKey: 'companies_linkedin_industries',
    header: () => <div className="text-left">Industry</div>,
    cell: ({ row }) => <div>{row.original.companies_linkedin_industries || '-'}</div>,
  },
  {
    accessorKey: 'companies_Revenue_estimate_eurM',
    header: () => <div className="text-left">Revenue (EURm)</div>,
    cell: ({ row }) => <div>{row.original.companies_Revenue_estimate_eurM || '-'}</div>,
  },
  {
    accessorKey: 'companies_EBITDA_estimate_eurM',
    header: () => <div className="text-left">EBITDA (EURm)</div>,
    cell: ({ row }) => <div>{row.original.companies_EBITDA_estimate_eurM || '-'}</div>,
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
