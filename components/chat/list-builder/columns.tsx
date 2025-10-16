'use client'

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useChatStore } from '@/store/chatStore'
import Image from 'next/image'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpandableCell } from '@/components/table/expandable-cell'

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
import { cn } from '@/lib/utils'

const PulseLoading = () => {
  return (
    <p className="flex gap-1 items-center animate-pulse">
      <span className="animate-ping size-1 bg-green-600 rounded-full mx-1" />
      Reading
    </p>
  )
}

const HeaderWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex items-center justify-center gap-2">
    {icon}
    <span className="truncate">{label}</span>
  </div>
)

const toTitle = (key: string) => {
  if (!key) return ''
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, s => s.toUpperCase())
}

const ensureProtocol = (url?: string) => {
  if (!url) return undefined
  const u = url.trim()
  return u.startsWith('http') ? u : `https://${u}`
}

export const generateColumns = (
  data: any[],
  type: 'company' | 'investor' | 'transaction' | 'people',
  expand: boolean
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
      'INVESTOR_TYPE',
    ],
    transaction: [
      'DEAL_DATE_ENRICHED',
      'TARGET_NAME',
      'DESCRIPTION',
      'BUYER_NAME',
      'TRANSACTION_VALUE_MUSD',
      'DEAL_SOURCE_URL',
    ],
    people: [
      'NAME',
      'DESCRIPTION',
      'POSITION',
      'COMPANY_NAME',
      // 'EMPLOYEES',
      'LOCATION',
      'PROFILE_URL',
    ],
  }
  const defaultKeys = defaultColumnsConfig[type] || []
  const primaryColumnHeader = toTitle(type === 'people' ? 'Person Name' : type)

  const allColumnDefs: Record<string, ColumnDef<any>> = {
    NAME: {
      accessorKey: 'NAME',
      size: 200,
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
        const fallbackUrl = `https://ui-avatars.com/api/?name=${name}&background=random`

        return (
          <div className="inline-flex items-center cursor-pointer min-w-0">
            <Image
              src={logo || fallbackUrl}
              alt={`logo`}
              width={25}
              height={25}
              className="mr-2 rounded-sm flex-shrink-0"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = fallbackUrl
              }}
              unoptimized
            />

            <button
              onClick={() => openListItemPopup(row.original)}
              className={cn(
                'text-left cursor-pointer font-medium text-gray-900 hover:underline whitespace-pre-wrap line-clamp-2',
                { 'line-clamp-none': expand }
              )}
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
      size: 400,
      header: () => <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />,
      cell: ({ row }) => (
        <ExpandableCell
          TriggerCell={
            <p className={cn('cursor-pointer', { 'line-clamp-2': !expand })}>
              {row.original.DESCRIPTION || <span className="text-muted-foreground">n/a</span>}
            </p>
          }
        >
          {!expand && (
            <p className=" ">
              {row.original.DESCRIPTION || (
                <span className="text-muted-foreground">No description available.</span>
              )}
            </p>
          )}
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
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    INDUSTRY: {
      accessorKey: 'INDUSTRY',
      header: () => (
        <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Industry" />
      ),
      cell: ({ row }) => (
        <span>{row.original.INDUSTRY || <span className="text-muted-foreground">n/a</span>}</span>
      ),
    },
    EMPLOYEES: {
      accessorKey: 'EMPLOYEES',
      header: () => <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />,
      cell: ({ row }) => {
        const val = row.original.EMPLOYEES
        return (
          <span>
            {typeof val === 'number'
              ? new Intl.NumberFormat().format(val)
              : val || <span className="text-muted-foreground">n/a</span>}
          </span>
        )
      },
    },
    LOCATION: {
      accessorKey: 'LOCATION',
      header: () => <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="Location" />,
      cell: ({ row }) => (
        <span>{row.original.LOCATION || <span className="text-muted-foreground">n/a</span>}</span>
      ),
    },
    REVENUE_ESTIMATE: {
      accessorKey: 'REVENUE_ESTIMATE',
      header: () => (
        <HeaderWithIcon icon={<BanknotesIcon className="h-4 w-4" />} label="Revenue (Est)" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.REVENUE_ESTIMATE || <span className="text-muted-foreground">n/a</span>}
        </span>
      ),
    },
    INVESTOR_TYPE: {
      accessorKey: 'INVESTOR_TYPE',
      header: () => (
        <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Investor Type" />
      ),
      cell: ({ row }) => {
        const { isReading } = useChatStore.getState()
        return isReading ? (
          row.original.INVESTOR_TYPE ? (
            <span>{row.original.INVESTOR_TYPE}</span>
          ) : (
            <PulseLoading />
          )
        ) : (
          <span>
            {row.original.INVESTOR_TYPE || <span className="text-muted-foreground">n/a</span>}
          </span>
        )
      },
    },
    DEAL_DATE_ENRICHED: {
      accessorKey: 'DEAL_DATE_ENRICHED',
      size: 100,
      maxSize: 100,
      header: () => <HeaderWithIcon icon={<CalendarDaysIcon className="h-4 w-4" />} label="Date" />,
      cell: ({ row }) => {
        const { isReading } = useChatStore.getState()
        return isReading ? (
          row.original.DEAL_DATE_ENRICHED ? (
            <span>{row.original.DEAL_DATE_ENRICHED}</span>
          ) : (
            <PulseLoading />
          )
        ) : (
          <span>
            {row.original.DEAL_DATE_ENRICHED || <span className="text-muted-foreground">n/a</span>}
          </span>
        )
      },
    },
    TARGET_NAME: {
      accessorKey: 'TARGET_NAME',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Target Name" />
      ),
      cell: ({ row }) => {
        const { isReading, openListItemPopup } = useChatStore.getState()
        return isReading ? (
          row.original.TARGET_NAME ? (
            <span className="line-clamp-2 break-all">{row.original.TARGET_NAME}</span>
          ) : (
            <PulseLoading />
          )
        ) : (
          <span className="line-clamp-2 break-all">
            {row.original.TARGET_NAME ? (
              <button
                className="cursor-pointer hover:underline line-clamp-2 break-all text-start"
                onClick={() => openListItemPopup(row.original)}
              >
                {row.original.TARGET_NAME}
              </button>
            ) : (
              <span className="text-muted-foreground">n/a</span>
            )}
          </span>
        )
      },
    },
    BUYER_NAME: {
      accessorKey: 'BUYER_NAME',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Buyer Name" />
      ),
      cell: ({ row }) => {
        const { isReading } = useChatStore.getState()
        return isReading ? (
          row.original.BUYER_NAME ? (
            <span>{row.original.BUYER_NAME}</span>
          ) : (
            <PulseLoading />
          )
        ) : (
          <span>
            {row.original.BUYER_NAME || <span className="text-muted-foreground">n/a</span>}
          </span>
        )
      },
    },
    TRANSACTION_VALUE_MUSD: {
      accessorKey: 'TRANSACTION_VALUE_MUSD',
      size: 160,
      header: () => (
        <HeaderWithIcon
          icon={<BuildingOffice2Icon className="h-4 w-4" />}
          label="Transaction Value"
        />
      ),
      cell: ({ row }) => {
        const { isReading } = useChatStore.getState()
        return isReading ? (
          row.original.TRANSACTION_VALUE_MUSD ? (
            <span>{row.original.TRANSACTION_VALUE_MUSD}</span>
          ) : (
            <PulseLoading />
          )
        ) : (
          <span>
            {row.original.TRANSACTION_VALUE_MUSD || (
              <span className="text-muted-foreground">n/a</span>
            )}
          </span>
        )
      },
    },
    DEAL_SOURCE_URL: {
      accessorKey: 'DEAL_SOURCE_URL',
      size: 100,
      maxSize: 100,
      header: () => <HeaderWithIcon icon={<LinkIcon className="h-4 w-4" />} label="Source" />,
      cell: ({ row }) => {
        const url = ensureProtocol(row.original.DEAL_SOURCE_URL)
        return url ? (
          <Link href={url} target="_blank" className="text-blue-600 hover:underline ">
            <p className=" w-full">Link</p>
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    POSITION: {
      accessorKey: 'POSITION',
      header: () => (
        <HeaderWithIcon icon={<BriefcaseIcon className="h-4 w-4" />} label="Position" />
      ),
      cell: ({ row }) => (
        <span>{row.original.POSITION || <span className="text-muted-foreground">n/a</span>}</span>
      ),
    },
    COMPANY_NAME: {
      accessorKey: 'COMPANY_NAME',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Company Name" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.COMPANY_NAME || <span className="text-muted-foreground">n/a</span>}
        </span>
      ),
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
          <span className="text-muted-foreground">-</span>
        )
      },
    },
  }

  let columns: ColumnDef<any>[] = [
    {
      id: 'select',
      size: 50,
      maxSize: 50,
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
      maxSize: 50,
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
    'LINKEDIN_URL',
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

  return columns
}
