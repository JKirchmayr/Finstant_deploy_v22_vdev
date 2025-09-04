'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { GenerateSkeleton } from './generate-skeleton'
import Image from 'next/image'
import ChatDataTable from '@/components/chat/list-builder/ChatDataTable'
import InvestorSheet from '@/components/InvestorSheet'
import { Globe } from 'lucide-react'
import Link from 'next/link'
import LogoShowcase from '@/components/ui/LogoShowcase'
import CompanySheet from '@/components/CompanySheet'
import { useState, useCallback } from 'react'
import { ExpandableCell } from '@/components/table/epandable-cell'
import { Button } from '@/components/ui/button'

export type InvestorsProps = {
  investor_id: string
  investor_name?: string
  investor_description?: string
  investor_website?: string
  investor_type?: string
  investor_country?: string
  investor_city?: string
  investor_founded_year?: number
  investor_strategy?: string
  investor_sector_focus?: string
  investor_investment_criteria?: string
  similarity_score?: number
  investor_logo?: string
  investor_selected_investments?: {
    company_id: number
    company_name: string
    company_logo: string
    investment_year: number | null
  }[]
}

export default function InvestorsResponseData({
  investors,
  loading,
  togglePanel,
  closeTabPanel,
}: {
  investors: InvestorsProps[]
  loading: boolean
  togglePanel: () => void
  closeTabPanel: () => void
}) {
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string
    src: string
    alt: string
    name: string
  } | null>(null)
  const [isCompanySheetOpen, setIsCompanySheetOpen] = useState(false)

  const handleCompanyClick = useCallback(
    (comp: { id: string; src: string; alt: string; name: string }) => {
      setSelectedCompany(comp)
      setIsCompanySheetOpen(true)
    },
    []
  )

  const columns: ColumnDef<InvestorsProps>[] = [
    {
      id: 'select',
      size: 65,
      minSize: 65,
      maxSize: 65,
      header: ({ table }) => (
        <div className="flex justify-center items-center w-full gap-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
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
      accessorKey: 'investor_name',
      header: loading ? 'Generating' : 'Investor Name',
      minSize: 200,
      cell: ({ row }) => {
        return (
          // <InvestorSheet
          //   investor={{
          //     id: Number(row.original.investor_id),
          //     name: row.original.investor_name,
          //     investor_linkedin_logo: row.original.investor_logo,
          //     description: row.original.investor_description,
          //     investor_LLM_country: row.original.investor_country,
          //     investor_linkedin_city: row.original.investor_city,
          //     investor_linkedin_description: row.original.investor_description,
          //     founded_year: row.original.investor_founded_year,
          //     investment_criteria_description: row.original.investor_investment_criteria,
          //   }}
          // >
          //   <button
          //     disabled={loading}
          //     className="hover:underline items-center inline-flex cursor-pointer hover:font-medium transition-all duration-200 text-left w-full"
          //     type="button"
          //   >
          //     <Image
          //       src={row.original.investor_logo || "https://placehold.co/50x50.png"}
          //       alt={`${row.original.investor_name} logo`}
          //       width={18}
          //       height={18}
          //       className="mr-1.5 rounded"
          //       unoptimized={true}
          //     />
          //     <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_name} />
          //   </button>
          // </InvestorSheet>
          <div className="inline-flex items-center hover:font-semibold transition-all duration-200">
            <Image
              src={
                (row.original.investor_logo?.trimEnd?.() && row.original.investor_logo.trimEnd()) ||
                'https://placehold.co/50x50.png'
              }
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
        )
      },
      enableSorting: true,
    },

    {
      accessorKey: 'investor_website',
      header: loading ? 'Generating' : 'Website',
      size: 100,
      cell: ({ row }) => (
        <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_website}>
          <Link
            href={row.original.investor_website ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Website
          </Link>
        </GenerateSkeleton>
      ),
    },
    {
      accessorKey: 'investor_country',
      header: loading ? 'Generating' : 'City',
      cell: ({ row }) => (
        <GenerateSkeleton
          isPlaceholder={loading}
          text={`${row.original.investor_city}, ${row.original.investor_country}`}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'investor_description',
      header: loading ? 'Generating' : 'Description',
      minSize: 300,
      cell: ({ row, column }) => {
        const width = column.getSize()
        return (
          <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_description}>
            <ExpandableCell
              className={`w-${width}px`}
              TriggerCell={
                <p className="whitespace-pre-line line-clamp-2">
                  {row.original.investor_description}
                </p>
              }
            >
              <p className="">{row.original.investor_description}</p>
            </ExpandableCell>
          </GenerateSkeleton>
        )
      },
    },
    {
      accessorKey: 'similar_investments',
      header: loading ? 'Generating' : 'Similar Transactions',
      minSize: 160,
      cell: ({ row }) => {
        const investments =
          row.original.investor_selected_investments?.map(investment => ({
            id: investment.company_id.toString(),
            src: investment.company_logo || 'https://placehold.co/400x400.png',
            alt: `${investment.company_name} logo`,
            name: `${investment.company_name}${
              investment.investment_year ? ` (${investment.investment_year})` : ''
            }`,
          })) || []

        return (
          <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_description}>
            <div className="overflow-x-auto">
              <LogoShowcase
                className="flex-nowrap"
                logos={investments}
                onLogoClick={handleCompanyClick}
              />
            </div>
          </GenerateSkeleton>
        )
      },
    },
    // {
    //   accessorKey: "investor_founded_year",
    //   header: loading ? "Generating" : "Founded",
    //   cell: ({ row }) => (
    //     <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_description} />
    //   ),
    //   enableSorting: true,
    // },

    {
      accessorKey: 'investor_type',
      header: loading ? 'Generating' : 'Type',
      cell: ({ row }) => (
        <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_type} />
      ),
    },
    {
      accessorKey: 'investor_strategy',
      header: loading ? 'Generating' : 'Strategy',
      cell: ({ row }) => (
        <GenerateSkeleton isPlaceholder={loading} text={row.original.investor_strategy} />
      ),
    },
  ]

  return (
    <>
      <ChatDataTable<InvestorsProps>
        data={investors}
        columns={columns}
        isLoading={loading}
        // togglePanel={togglePanel}
        closeTabPanel={closeTabPanel}
        loadMoreData={() => {}}
        hasMoreData={false}
        titleName="Investors List"
        defaultPinnedColumns={['select', 'investor_name']}
      />
      {selectedCompany && (
        <CompanySheet
          company={{
            company_id: Number(selectedCompany.id),
            companies_linkedin_logo_url: selectedCompany.src,
            company_name: selectedCompany.name,
          }}
          open={isCompanySheetOpen}
          onOpenChange={setIsCompanySheetOpen}
        >
          <div />
        </CompanySheet>
      )}
    </>
  )
}
