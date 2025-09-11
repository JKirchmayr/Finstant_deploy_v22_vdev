'use client'
import { useWSStore } from '@/store/wsStore'
import { useState, useMemo } from 'react'
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PinnableDataTable from '@/components/table/pinnable-data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { useTabPanelStore } from '@/store/tabStore'
import CompanyProfile from '@/components/CompanyProfile'
import { GenerateSkeleton } from './generate-skeleton'
import Image from 'next/image'
import ChatDataTable from '@/components/chat/list-builder/ChatDataTable'
import { AddNewColumn } from '@/components/chat/AddNewColumn'
import CompanySheet from '@/components/CompanySheet'
import { ExpandableCell } from '@/components/table/epandable-cell'
import Link from 'next/link'

export type Company = {
  company_id: number
  company_name: string
  company_logo: string
  company_description: string
  company_country: string
  similarity_score: string
}

export default function CompaniesData({
  companies,
  loading,
  togglePanel,
  closeTabPanel,
}: {
  companies: Company[]
  loading: boolean
  togglePanel: () => void
  closeTabPanel: () => void
}) {
  const columns: ColumnDef<Company>[] = [
    {
      id: 'select',
      size: 50,
      minSize: 50,
      maxSize: 50,
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
    {
      accessorKey: 'company_name',
      header: loading ? 'Generating' : 'Company',
      maxSize: 100,
      cell: ({ row }) => {
        const [open, setOpen] = useState(false)
        return (
          <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
            <Image
              src={row.original.company_logo || 'https://placehold.co/50x50.png'}
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
          // <CompanySheet
          //   open={open}
          //   onOpenChange={setOpen}
          //   company={{
          //     ...row.original,
          //     companies_linkedin_logo_url: row.original.company_logo,
          //     companies_LLM_country: row.original.company_country,
          //   }}
          // >
          //   <button
          //     disabled={loading}
          //     className="hover:underline items-center inline-flex cursor-pointer hover:font-medium transition-all duration-200 text-left w-full"
          //     type="button"
          //   >
          //     {row.original.company_logo && (
          //       <Image
          //         src={row.original.company_logo ?? "https://placehold.co/50x50.png"}
          //         alt={`${row.original.company_name} logo`}
          //         width={18}
          //         height={18}
          //         className="mr-1.5 rounded"
          //         unoptimized={true}
          //       />
          //     )}
          //     <GenerateSkeleton isPlaceholder={loading} text={row.original.company_name} />
          //   </button>
          // </CompanySheet>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'company_description',
      header: loading ? 'Generating' : 'Description',
      cell: ({ row }) => (
        <ExpandableCell
          TriggerCell={
            <p className="whitespace-pre-line line-clamp-2">{row.original.company_description}</p>
          }
        >
          <GenerateSkeleton isPlaceholder={loading} text={row.original.company_description}>
            <p>{row.original.company_description}</p>
          </GenerateSkeleton>
        </ExpandableCell>
      ),
    },
    {
      accessorKey: 'company_country',
      header: loading ? 'Generating' : 'Country',
      size: 80,
      cell: ({ row }) => (
        <GenerateSkeleton isPlaceholder={loading} text={row.original.company_country || '-'} />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'similarity_score',
      header: loading ? 'Generating' : 'Similarity',
      size: 70,
      cell: ({ row }) => (
        <GenerateSkeleton isPlaceholder={loading} text={row.original.similarity_score} />
      ),
      enableSorting: true,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-white w-full">
      <ChatDataTable
        data={companies ? companies : []}
        columns={columns}
        isLoading={false}
        hasMoreData={false}
        loadMoreData={() => console.log('loadmore')}
        filterBy="company_name"
        topbarClass="px-1.5 mb-1.5"
        defaultPinnedColumns={['index', 'select', 'company_name']}
        titleName="Companies List"
        // togglePanel={togglePanel}
      />
    </div>
  )
}
