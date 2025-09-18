'use client'

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useChatStore } from '@/store/chatStore'
import Image from 'next/image'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpandableCell } from '@/components/table/epandable-cell'

import {
  BuildingOffice2Icon,
  Bars3Icon,
  BanknotesIcon,
  MapPinIcon,
  Bars3BottomLeftIcon,
  GlobeAltIcon,
  UsersIcon,
  BriefcaseIcon,
  LinkIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

const HeaderWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex items-center justify-center gap-2">
    {icon}
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
  return u.startsWith('http') ? u : `https://${u}`
}

export const generateColumns = (
  data: any[],
  type: 'company' | 'investor' | 'transaction' | 'people'
): ColumnDef<any>[] => {
  const defaultColumnsConfig = {
    company: [
      'NAME',
      'DESCRIPTION',
      'WEBSITE',
      'INDUSTRY',
      'EMPLOYEES',
      'LOCATION',
      'REVENUE_ESTIMATE',
    ],
    investor: [
      'NAME',
      'DESCRIPTION',
      'WEBSITE',
      'INDUSTRY',
      'EMPLOYEES',
      'LOCATION',
      'FOCUS_INDUSTRY',
    ],
    transaction: ['DEAL_DATE', 'TARGET_NAME', 'DESCRIPTION', 'BUYER_NAME', 'DEAL_SOURCE_URL'],
    people: [
      'NAME',
      'DESCRIPTION',
      'POSITION',
      'COMPANY_NAME',
      'EMPLOYEES',
      'LOCATION',
      'PROFILE_URL',
    ],
  }

  const defaultKeys = defaultColumnsConfig[type] || []
  const primaryColumnHeader = toTitle(type === 'people' ? 'Person Name' : type)

  const allColumnDefs: Record<string, ColumnDef<any>> = {
    NAME: {
      accessorKey: 'NAME',
      header: () => (
        <HeaderWithIcon
          icon={<BuildingOffice2Icon className="h-4 w-4" />}
          label={primaryColumnHeader}
        />
      ),
      cell: ({ row }) => {
        const { openListItemPopup } = useChatStore.getState()
        const name = row.original.NAME || 'Details'
        const logo = row.original.LOGO || row.original.PROFILE_PIC_URL
        return (
          <div className="inline-flex items-center cursor-pointer min-w-0">
            <Image
              src={logo || 'https://placehold.co/50x50.png'}
              alt={`${name} logo`}
              width={20}
              height={20}
              className="mr-2 rounded-sm flex-shrink-0"
              unoptimized
            />
            <button
              onClick={() => openListItemPopup(row.original)}
              className="truncate text-left cursor-pointer font-medium text-gray-900 hover:underline"
              title={name}
            >
              {name}
            </button>
          </div>
        )
      },
    },
    DESCRIPTION: {
      accessorKey: 'DESCRIPTION',
      header: () => <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />,
      cell: ({ row }) => (
        <ExpandableCell
          TriggerCell={
            <p className="line-clamp-2 cursor-pointer">{row.original.DESCRIPTION || 'N/A'}</p>
          }
        >
          <p className="whitespace-pre-line line-clamp-2 cursor-pointer ">
            {row.original.DESCRIPTION || 'No description available.'}
          </p>
        </ExpandableCell>
      ),
    },
    WEBSITE: {
      accessorKey: 'WEBSITE',
      header: () => <HeaderWithIcon icon={<GlobeAltIcon className="h-4 w-4" />} label="Website" />,
      cell: ({ row }) => {
        const url = ensureProtocol(row.original.WEBSITE)
        return url ? (
          <Link href={url} target="_blank" className="text-blue-600 hover:underline truncate">
            {row.original.WEBSITE}
          </Link>
        ) : (
          <span>-</span>
        )
      },
    },
    INDUSTRY: {
      accessorKey: 'INDUSTRY',
      header: () => (
        <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Industry" />
      ),
      cell: ({ row }) => <span>{row.original.INDUSTRY || 'N/A'}</span>,
    },
    EMPLOYEES: {
      accessorKey: 'EMPLOYEES',
      header: () => <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />,
      cell: ({ row }) => {
        const val = row.original.EMPLOYEES
        return (
          <span>
            {typeof val === 'number' ? new Intl.NumberFormat().format(val) : val || 'N/A'}
          </span>
        )
      },
    },
    LOCATION: {
      accessorKey: 'LOCATION',
      header: () => <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="Location" />,
      cell: ({ row }) => <span>{row.original.LOCATION || 'N/A'}</span>,
    },
    REVENUE_ESTIMATE: {
      accessorKey: 'REVENUE_ESTIMATE',
      header: () => (
        <HeaderWithIcon icon={<BanknotesIcon className="h-4 w-4" />} label="Revenue (Est)" />
      ),
      cell: ({ row }) => <span>{row.original.REVENUE_ESTIMATE || 'N/A'}</span>,
    },
    FOCUS_INDUSTRY: {
      accessorKey: 'FOCUS_INDUSTRY',
      header: () => (
        <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Focus Industry" />
      ),
      cell: ({ row }) => <span>{row.original.FOCUS_INDUSTRY || 'N/A'}</span>,
    },
    DEAL_DATE: {
      accessorKey: 'DEAL_DATE',
      header: () => <HeaderWithIcon icon={<CalendarDaysIcon className="h-4 w-4" />} label="Date" />,
      cell: ({ row }) => (
        <span>
          {row.original.DEAL_DATE ? new Date(row.original.DEAL_DATE).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    TARGET_NAME: {
      accessorKey: 'TARGET_NAME',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Target Name" />
      ),
      cell: ({ row }) => <span>{row.original.TARGET_NAME || 'N/A'}</span>,
    },
    BUYER_NAME: {
      accessorKey: 'BUYER_NAME',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Buyer Name" />
      ),
      cell: ({ row }) => <span>{row.original.BUYER_NAME || 'N/A'}</span>,
    },
    DEAL_SOURCE_URL: {
      accessorKey: 'DEAL_SOURCE_URL',
      header: () => <HeaderWithIcon icon={<LinkIcon className="h-4 w-4" />} label="Source" />,
      cell: ({ row }) => {
        const url = ensureProtocol(row.original.DEAL_SOURCE_URL)
        return url ? (
          <Link href={url} target="_blank" className="text-blue-600 hover:underline">
            Link
          </Link>
        ) : (
          <span>-</span>
        )
      },
    },
    POSITION: {
      accessorKey: 'POSITION',
      header: () => (
        <HeaderWithIcon icon={<BriefcaseIcon className="h-4 w-4" />} label="Position" />
      ),
      cell: ({ row }) => <span>{row.original.POSITION || 'N/A'}</span>,
    },
    COMPANY_NAME: {
      accessorKey: 'COMPANY_NAME',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Company Name" />
      ),
      cell: ({ row }) => <span>{row.original.COMPANY_NAME || 'N/A'}</span>,
    },
    PROFILE_URL: {
      accessorKey: 'PROFILE_URL',
      header: () => (
        <HeaderWithIcon icon={<LinkIcon className="h-4 w-4" />} label="LinkedIn Link" />
      ),
      cell: ({ row }) => {
        const url = ensureProtocol(row.original.PROFILE_URL)
        return url ? (
          <Link href={url} target="_blank" className="text-blue-600 hover:underline">
            View Profile
          </Link>
        ) : (
          <span>-</span>
        )
      },
    },
  }

  let columns: ColumnDef<any>[] = [
    {
      id: 'select',
      size: 50,
      header: ({ table }) => (
        <div className="flex justify-center items-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      id: 'rowNumber',
      size: 50,
      header: () => <p className="w-full text-center">#</p>,
      cell: ({ row }) => (
        <div className="text-center font-medium tabular-nums">{row.index + 1}</div>
      ),
    },
  ]

  defaultKeys.forEach(key => {
    if (allColumnDefs[key]) {
      columns.push(allColumnDefs[key])
    }
  })

  const defaultKeysSet = new Set(defaultKeys)
  const excludedKeys = new Set([
    'LOGO',
    'PROFILE_PIC_URL',
    'EVALUATIONS',
    'ITEM_ID',
    'meta',
    'session_id',
    'text',
    'STAGE',
    'LIST_TYPE',
    'ENTITY_TYPE',
    'SESSION_ID',
  ])
  const extraKeys = new Set<string>()

  for (const item of data || []) {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => {
        if (!defaultKeysSet.has(key) && !excludedKeys.has(key)) {
          extraKeys.add(key)
        }
      })
    }
  }

  extraKeys.forEach(key => {
    columns.push({
      accessorKey: key,
      header: () => (
        <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label={toTitle(key)} />
      ),
      cell: ({ row }) => {
        const value = row.original?.[key]
        return <div className="truncate">{value != null ? String(value) : 'N/A'}</div>
      },
    })
  })

  return columns
}
