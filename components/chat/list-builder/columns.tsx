'use client'
import React, { useMemo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { ExpandableCell } from '@/components/table/epandable-cell'
import { GenerateSkeleton } from './generate-skeleton'
import Link from 'next/link'

// Heroicons (outline)
import {
  BuildingOffice2Icon,
  Bars3Icon,
  BanknotesIcon,
  MapPinIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline'
import { Globe, UsersIcon } from 'lucide-react'

const HeaderWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex items-center justify-center gap-2">
    <span className="inline-flex items-center justify-center">{icon}</span>
    <span className="truncate">{label}</span>
  </div>
)

const toTitle = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, s => s.toUpperCase())

const ensureProtocol = (url?: string) => {
  if (!url) return undefined
  const u = url.trim()
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

export const generateColumns = (data: any[]): ColumnDef<any>[] => {
  const { isStreaming } = useChatStore()
  const isLoading = isStreaming && !data?.length

  const baseColumns: ColumnDef<any>[] = [
    {
      id: 'select',
      size: 50,
      maxSize: 50,
      minSize: 50,
      header: ({ table }) =>
        isLoading ? (
          <GenerateSkeleton isPlaceholder={true} />
        ) : (
          <div className="flex justify-center items-center">
            <Checkbox
              disabled={isStreaming}
              className="cursor-pointer"
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
      cell: ({ row }) => (
        <div className="mr-auto">
          <Checkbox
            className="cursor-pointer"
            disabled={isStreaming}
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
      header: () =>
        isLoading ? (
          <GenerateSkeleton isPlaceholder={true} />
        ) : (
          <p className="w-full  text-center">#</p>
        ),
      size: 50,
      maxSize: 50,
      minSize: 50,
      cell: ({ row }) => (
        <div className="text-center font-medium text-gray-600 tabular-nums">{row.index + 1}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: () =>
        isLoading ? (
          <GenerateSkeleton isPlaceholder={true} />
        ) : (
          <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Company" />
        ),
      size: 220,
      cell: ({ row }) => {
        const { openListItemPopup } = useChatStore.getState()
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
              onClick={() => openListItemPopup(row.original)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openListItemPopup(row.original)
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
      header: () =>
        isLoading ? (
          <GenerateSkeleton isPlaceholder={true} />
        ) : (
          <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />
        ),
      size: 420,
      cell: ({ row }) => (
        <ExpandableCell
          TriggerCell={
            <p className="whitespace-pre-line line-clamp-2 cursor-pointer">
              {row.original.description || 'N/A'}
            </p>
          }
        >
          <p>{row.original.description || 'N/A'}</p>
        </ExpandableCell>
      ),
    },
  ]

  // Determine additional dynamic keys from data
  const exclude = new Set(['name', 'description', 'logo', 'evaluations', 'item_id'])
  const dynamicKeys: string[] = []
  for (const item of data || []) {
    if (!item || typeof item !== 'object') continue
    Object.keys(item).forEach(k => {
      if (exclude.has(k)) return
      if (!dynamicKeys.includes(k)) dynamicKeys.push(k)
    })
  }

  // Generate columns for dynamic keys with special renderers for known fields
  for (const key of dynamicKeys) {
    if (key === 'website') {
      baseColumns.push({
        accessorKey: 'website',
        header: () =>
          isLoading ? (
            <GenerateSkeleton isPlaceholder={true} />
          ) : (
            <HeaderWithIcon icon={<Globe className="h-4 w-4" />} label="Website" />
          ),
        size: 200,
        cell: ({ row }) => {
          const url = ensureProtocol(row.original.website)
          return url ? (
            <Link href={url} target="_blank" className="text-blue-600 hover:underline truncate">
              {row.original.website}
            </Link>
          ) : (
            <span>-</span>
          )
        },
      })
      continue
    }
    if (key === 'employees') {
      baseColumns.push({
        accessorKey: 'employees',
        header: () =>
          isLoading ? (
            <GenerateSkeleton isPlaceholder={true} />
          ) : (
            <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />
          ),
        size: 120,
        cell: ({ row }) => {
          const v = row.original.employees
          const text = typeof v === 'number' ? new Intl.NumberFormat().format(v) : v || 'N/A'
          return <GenerateSkeleton isPlaceholder={false} text={text} />
        },
      })
      continue
    }
    if (key === 'location') {
      baseColumns.push({
        accessorKey: 'location',
        header: () => <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="HQ" />,
        size: 160,
        cell: ({ row }) =>
          isLoading ? (
            <GenerateSkeleton isPlaceholder={true} />
          ) : (
            <GenerateSkeleton isPlaceholder={false} text={row.original.location || 'N/A'} />
          ),
      })
      continue
    }
    if (key === 'revenue') {
      baseColumns.push({
        accessorKey: 'revenue',
        header: () =>
          isLoading ? (
            <GenerateSkeleton isPlaceholder={true} />
          ) : (
            <HeaderWithIcon icon={<BanknotesIcon className="h-4 w-4" />} label="Revenue" />
          ),
        size: 140,
        cell: ({ row }) => (
          <GenerateSkeleton isPlaceholder={false} text={row.original.revenue || 'N/A'} />
        ),
      })
      continue
    }
    if (key === 'products') {
      baseColumns.push({
        accessorKey: 'products',
        header: () =>
          isLoading ? (
            <GenerateSkeleton isPlaceholder={true} />
          ) : (
            <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Products" />
          ),
        size: 180,
        cell: ({ row }) => (
          <GenerateSkeleton isPlaceholder={false} text={row.original.products || 'N/A'} />
        ),
      })
      continue
    }

    // Generic column for any other key
    baseColumns.push({
      accessorKey: key,
      header: () =>
        isLoading ? (
          <GenerateSkeleton isPlaceholder={true} />
        ) : (
          <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label={toTitle(key)} />
        ),
      size: 160,
      cell: ({ row }) => {
        const value = row.original?.[key]
        if (value == null) return <span>-</span>
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return <GenerateSkeleton isPlaceholder={false} text={String(value)} />
        }
        // Fallback: show JSON in expandable
        const json = (() => {
          try {
            return JSON.stringify(value, null, 2)
          } catch {
            return String(value)
          }
        })()
        return (
          <ExpandableCell TriggerCell={<span className="truncate">Details</span>}>
            <pre className="whitespace-pre-wrap text-xs">{json}</pre>
          </ExpandableCell>
        )
      },
    })
  }
  console.log(baseColumns)
  return baseColumns
}

export const companyColumns: ColumnDef<any>[] = [
  {
    id: 'select',
    size: 50,
    maxSize: 50,
    minSize: 50,
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
      <div className="mr-auto">
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
    size: 50,
    maxSize: 50,
    minSize: 50,
    header: () => <p className="w-full text-center">#</p>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-gray-600 tabular-nums">{row.index + 1}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    size: 220,
    header: () => (
      <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Company" />
    ),
    cell: ({ row }) => {
      const { openListItemPopup } = useChatStore.getState()
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
            onClick={() => openListItemPopup(row.original)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openListItemPopup(row.original)
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
    size: 420,
    header: () => <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />,
    cell: ({ row }) => (
      <ExpandableCell
        TriggerCell={
          <p className="whitespace-pre-line line-clamp-2 cursor-pointer">
            {row.original.description || 'N/A'}
          </p>
        }
      >
        <p>{row.original.description || 'N/A'}</p>
      </ExpandableCell>
    ),
  },
  {
    accessorKey: 'website',
    size: 200,
    header: () => <HeaderWithIcon icon={<Globe className="h-4 w-4" />} label="Website" />,
    cell: ({ row }) => {
      const url = ensureProtocol(row.original.website)
      return url ? (
        <Link href={url} target="_blank" className="text-blue-600 hover:underline truncate">
          {row.original.website}
        </Link>
      ) : (
        <span>-</span>
      )
    },
  },
  {
    accessorKey: 'industry',
    size: 160,
    header: () => (
      <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Industry" />
    ),
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.industry || 'N/A'} />
    ),
  },
  {
    accessorKey: 'location',
    size: 160,
    header: () => <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="HQ" />,
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.location || 'N/A'} />
    ),
  },
  {
    accessorKey: 'employees',
    size: 120,
    header: () => <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />,
    cell: ({ row }) => {
      const v = row.original.employees
      const text = typeof v === 'number' ? new Intl.NumberFormat().format(v) : v || 'N/A'
      return <GenerateSkeleton isPlaceholder={false} text={text} />
    },
  },
]

export const investorColumns: ColumnDef<any>[] = [
  {
    id: 'select',
    size: 50,
    maxSize: 50,
    minSize: 50,
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
      <div className="mr-auto">
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
    size: 50,
    maxSize: 50,
    minSize: 50,
    header: () => <p className="w-full text-center">#</p>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-gray-600 tabular-nums">{row.index + 1}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    size: 220,
    header: () => (
      <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Investor" />
    ),
    cell: ({ row }) => {
      const { openListItemPopup } = useChatStore.getState()
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
            onClick={() => openListItemPopup(row.original)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openListItemPopup(row.original)
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
    size: 420,
    header: () => <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />,
    cell: ({ row }) => (
      <ExpandableCell
        TriggerCell={
          <p className="whitespace-pre-line line-clamp-2 cursor-pointer">
            {row.original.description || 'N/A'}
          </p>
        }
      >
        <p>{row.original.description || 'N/A'}</p>
      </ExpandableCell>
    ),
  },
  {
    accessorKey: 'website',
    size: 200,
    header: () => <HeaderWithIcon icon={<Globe className="h-4 w-4" />} label="Website" />,
    cell: ({ row }) => {
      const url = ensureProtocol(row.original.website)
      return url ? (
        <Link href={url} target="_blank" className="text-blue-600 hover:underline truncate">
          {row.original.website}
        </Link>
      ) : (
        <span>-</span>
      )
    },
  },
  {
    accessorKey: 'firm_type',
    size: 160,
    header: () => (
      <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Firm Type" />
    ),
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.firm_type || 'N/A'} />
    ),
  },
  {
    accessorKey: 'location',
    size: 160,
    header: () => <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="HQ" />,
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.location || 'N/A'} />
    ),
  },
  {
    accessorKey: 'employees',
    size: 120,
    header: () => <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />,
    cell: ({ row }) => {
      const v = row.original.employees
      const text = typeof v === 'number' ? new Intl.NumberFormat().format(v) : v || 'N/A'
      return <GenerateSkeleton isPlaceholder={false} text={text} />
    },
  },
  {
    accessorKey: 'geographic_focus',
    size: 170,
    header: () => (
      <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Geographic Focus" />
    ),
    cell: ({ row }) => (
      <GenerateSkeleton
        isPlaceholder={false}
        text={row.original.geographic_focus?.join(', ') || 'N/A'}
      />
    ),
  },
  {
    accessorKey: 'ticket_size',
    size: 160,
    header: () => (
      <HeaderWithIcon icon={<BanknotesIcon className="h-4 w-4" />} label="Ticket Size" />
    ),
    cell: ({ row }) => (
      <GenerateSkeleton isPlaceholder={false} text={row.original.ticket_size || 'N/A'} />
    ),
  },
]
