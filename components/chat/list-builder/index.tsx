'use client'
import React, { useMemo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { CompanyData } from '../chat.types'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { ExpandableCell } from '@/components/table/epandable-cell'
import { GenerateSkeleton } from './generate-skeleton'

// Heroicons (outline)
import {
  BuildingOffice2Icon,
  Bars3Icon,
  BanknotesIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

interface ListBuilderProps {
  listData: CompanyData[]
  title: string
}

const HeaderWithIcon = ({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) => (
  <div className="inline-flex items-center justify-center gap-2">
    <span className="inline-flex items-center justify-center">{icon}</span>
    <span className="truncate">{label}</span>
  </div>
)

const generateColumns = (data: CompanyData[]): ColumnDef<CompanyData>[] => {
  const baseColumns: ColumnDef<CompanyData>[] = [
    {
      id: 'select',
      size: 44,
      header: ({ table }) => (
        <div className="flex justify-center items-center">
          <Checkbox
            className="cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <Checkbox
            className="cursor-pointer"
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'rowNumber',
      header: '#',
      size: 56,
      cell: ({ row }) => (
        <div className="text-center font-medium text-gray-600 tabular-nums">
          {row.index + 1}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: () => (
        <HeaderWithIcon
          icon={<BuildingOffice2Icon className="h-4 w-4" />}
          label="Company"
        />
      ),
      size: 220,
      cell: ({ row }) => {
        const { openCompanyPopup } = useChatStore.getState()
        const name = row.original.name || 'Details'
        return (
          <div className="inline-flex items-center min-w-0">
            <Image
              src={row.original.logo || 'https://placehold.co/50x50.png'}
              alt="logo"
              width={20}
              height={20}
              className="mr-2 rounded flex-shrink-0"
              unoptimized
            />
            <button
              onClick={() => openCompanyPopup(row.original)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openCompanyPopup(row.original)
                }
              }}
              className="truncate text-left bg-transparent p-0 h-auto font-medium text-gray-900 hover:underline focus:outline-none cursor-pointer"
              role="button"
              title={name}
            >
              {name}
            </button>
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: () => (
        <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />
      ),
      size: 420,
      cell: ({ row }) => (
        <ExpandableCell
          TriggerCell={
            <p className="whitespace-pre-line line-clamp-2 cursor-pointer">
              {row.original.description || '-'}
            </p>
          }
        >
          <p>{row.original.description || '-'}</p>
        </ExpandableCell>
      ),
    },
  ]

  if (data.some(c => c.revenue)) {
    baseColumns.push({
      accessorKey: 'revenue',
      header: () => (
        <HeaderWithIcon icon={<BanknotesIcon className="h-4 w-4" />} label="Revenue" />
      ),
      size: 140,
      cell: ({ row }) => <GenerateSkeleton text={row.original.revenue || '-'} />,
    })
  }
  if (data.some(c => c.products)) {
    baseColumns.push({
      accessorKey: 'products',
      header: () => (
        <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Products" />
      ),
      size: 180,
      cell: ({ row }) => <GenerateSkeleton text={row.original.products || '-'} />,
    })
  }

  baseColumns.push({
    accessorKey: 'location',
    header: () => (
      <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="HQ" />
    ),
    size: 160,
    cell: ({ row }) => <GenerateSkeleton text={row.original.location || '-'} />,
  })

  return baseColumns
}

export default function ListBuilder({ listData, title }: ListBuilderProps) {
  const { isStreaming, closeListPanel, activeListItemCount } = useChatStore()
  const columns = useMemo(() => generateColumns(listData), [listData])

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
          <ChatDataTable
            data={listData}
            columns={columns}
            isLoading={isStreaming}
            skeletonRowCount={activeListItemCount}
            hasMoreData={false}
            loadMoreData={() => {}}
            titleName={title}
            closeTabPanel={closeListPanel}
          />
        </AddColumnProvider>
      </div>
    </motion.div>
  )
}
