'use client'
import React, { useMemo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { AnimatePresence, motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { CompanyData } from '../chat.types'
import { companiesListColumns } from './columns'

import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { ExpandableCell } from '@/components/table/epandable-cell'
import { GenerateSkeleton } from './generate-skeleton'

interface MainChatProps {
  listData: CompanyData[]
  title: string
}

export default function ListBuilder({ listData, title }: MainChatProps) {
  const { isStreaming, closeListPanel } = useChatStore()
  const columns = useMemo((): ColumnDef<CompanyData>[] => {
    const baseColumns: ColumnDef<CompanyData>[] = [
      {
        id: 'select',
        size: 60,
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
      },
      {
        accessorKey: 'company_name',
        header: 'Company',
        size: 180,
        cell: ({ row }) => {
          const { openCompanyPopup } = useChatStore.getState()
          return (
            <div className="inline-flex items-center">
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
        size: 350,
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
    ]

    if (listData.some(company => company.company_revenue)) {
      baseColumns.push({
        accessorKey: 'company_revenue',
        header: 'Revenue',
        size: 120,
        cell: ({ row }) => <GenerateSkeleton text={row.original.company_revenue} />,
      })
    }

    if (listData.some(company => company.company_products)) {
      baseColumns.push({
        accessorKey: 'company_products',
        header: 'Products',
        size: 150,
        cell: ({ row }) => <GenerateSkeleton text={row.original.company_products} />,
      })
    }

    baseColumns.push({
      accessorKey: 'company_location',
      header: 'HQ',
      size: 150,
      cell: ({ row }) => <GenerateSkeleton text={row.original.company_location} />,
    })

    return baseColumns
  }, [listData])

  return (
    <motion.div
      className="flex flex-col border-l shadow-xl bg-white"
      style={{ width: '65%' }}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: '65%' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      layout
    >
      <div className="flex-1 p-2 overflow-auto">
        <AddColumnProvider>
          <ChatDataTable<CompanyData>
            data={listData}
            // columns={companiesListColumns as ColumnDef<CompanyData>[]}
            columns={columns}
            isLoading={isStreaming}
            hasMoreData={false}
            loadMoreData={() => {}}
            titleName={title}
            togglePanel={() => {}}
            closeTabPanel={closeListPanel}
          />
        </AddColumnProvider>
      </div>
    </motion.div>
  )
}
