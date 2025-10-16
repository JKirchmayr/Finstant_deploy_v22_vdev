'use client'

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpandableCell } from '@/components/table/expandable-cell'
// This import will now work correctly
import {
  AnyListItem,
  isCompany,
  isInvestor,
  isPeople,
  isTransaction,
  ListType,
} from '@/types/saved-list'

import {
  BuildingOffice2Icon,
  Bars3Icon,
  MapPinIcon,
  Bars3BottomLeftIcon,
  GlobeAltIcon,
  UsersIcon,
  BriefcaseIcon,
  LinkIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { GripVertical, LandmarkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const ensureProtocol = (url?: string | null) => {
  if (!url) return undefined
  const u = url.trim()
  return u.startsWith('http') ? u : `https://${u}`
}

export const generateColumns = (listType: ListType, expand: boolean): ColumnDef<AnyListItem>[] => {
  const defaultColumnsConfig: Record<ListType, string[]> = {
    company: ['NAME', 'DESCRIPTION', 'WEBSITE', 'INDUSTRY', 'EMPLOYEES', 'LOCATION'],
    transaction: [
      'DEAL_DATE',
      'TARGET_NAME',
      'DESCRIPTION',
      'BUYER_NAME',
      'DEAL_SOURCE_URL',
      'TRANSACTION_VALUE',
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
    people: ['NAME', 'DESCRIPTION', 'POSITION', 'COMPANY_NAME', 'LOCATION', 'PROFILE_URL'],
    unknown: [],
  }

  const defaultKeys = defaultColumnsConfig[listType] || []
  const primaryColumnHeader = toTitle(listType === 'people' ? 'Person Name' : listType)

  const allColumnDefs: Record<string, ColumnDef<AnyListItem>> = {
    NAME: {
      id: 'NAME',
      accessorFn: row => {
        if (isCompany(row)) return row.company_name
        if (isInvestor(row)) return row.investor_name
        if (isPeople(row)) return row.name // CORRECTED
        return ''
      },
      size: 250,
      header: () => (
        <HeaderWithIcon
          icon={
            listType === 'people' ? (
              <UserIcon className="h-4 w-4" />
            ) : (
              <BuildingOffice2Icon className="h-4 w-4" />
            )
          }
          label={primaryColumnHeader}
        />
      ),
      cell: ({ row }) => {
        const item = row.original
        let name: string = 'Details'
        let logo: string | null | undefined
        let website: string | null | undefined

        if (isCompany(item)) {
          name = item.company_name || 'Untitled Company'
          logo = item.company_logo
          website = item.company_website
        } else if (isInvestor(item)) {
          name = item.investor_name || 'Untitled Investor'
          logo = item.investor_logo
          website = item.investor_website
        } else if (isPeople(item)) {
          name = item.name
          logo = item.profile_pic_url
        }

        const fallbackUrl = `https://ui-avatars.com/api/?name=${name}&background=random`

        return (
          <div className="inline-flex items-center gap-2 min-w-0">
            <Image
              src={logo || fallbackUrl}
              alt={`${name} logo`}
              width={25}
              height={25}
              className="mr-1 rounded-sm flex-shrink-0 object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = fallbackUrl
              }}
              unoptimized
            />
            <span className="truncate font-medium text-gray-900" title={name}>
              {name}
            </span>
          </div>
        )
      },
    },
    DESCRIPTION: {
      id: 'DESCRIPTION',
      accessorFn: row => {
        if (isCompany(row)) return row.company_description
        if (isInvestor(row)) return row.investor_description
        if (isPeople(row)) return row.description
        if (isTransaction(row)) return row.deal_description
        return ''
      },
      size: 400,
      header: () => <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />,
      cell: ({ row }) => {
        const description = row.getValue('DESCRIPTION') as string | null
        return (
          <ExpandableCell
            TriggerCell={
              <p className={cn('cursor-pointer', { 'line-clamp-2': !expand })}>
                {description || <span className="text-muted-foreground">N/A</span>}
              </p>
            }
          >
            <p>
              {description || (
                <span className="text-muted-foreground">No description available.</span>
              )}
            </p>
          </ExpandableCell>
        )
      },
    },
    WEBSITE: {
      id: 'WEBSITE',
      accessorFn: row => {
        if (isCompany(row)) return row.company_website
        if (isInvestor(row)) return row.investor_website
        return null
      },
      header: () => <HeaderWithIcon icon={<GlobeAltIcon className="h-4 w-4" />} label="Website" />,
      cell: ({ row }) => {
        const url = ensureProtocol(row.getValue('WEBSITE') as string | null)
        return url ? (
          <Link
            href={url}
            target="_blank"
            className="text-blue-600 hover:underline truncate"
            onClick={e => e.stopPropagation()}
          >
            {new URL(url).hostname.replace(/^www\./, '')}
          </Link>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    INDUSTRY: {
      id: 'INDUSTRY',
      accessorFn: row => {
        if (isCompany(row)) return row.company_industry
        if (isInvestor(row)) return row.investor_industry
        return null
      },
      header: () => (
        <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Industry" />
      ),
      cell: ({ row }) => {
        const industry = row.getValue('INDUSTRY') as string | null
        return <span>{industry || <span className="text-muted-foreground">N/A</span>}</span>
      },
    },
    EMPLOYEES: {
      id: 'EMPLOYEES',
      accessorFn: row => {
        if (isCompany(row)) return row.company_employees
        if (isInvestor(row)) return row.investor_employees
        return null
      },
      header: () => <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />,
      cell: ({ row }) => {
        const val = row.getValue('EMPLOYEES') as number | string | null
        return (
          <span>
            {typeof val === 'number'
              ? new Intl.NumberFormat().format(val)
              : val || <span className="text-muted-foreground">N/A</span>}
          </span>
        )
      },
    },
    LOCATION: {
      id: 'LOCATION',
      accessorFn: row => {
        if (isCompany(row)) return row.company_location
        if (isInvestor(row)) return row.investor_location
        if (isPeople(row)) return row.location
        return null
      },
      header: () => <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="Location" />,
      cell: ({ row }) => {
        const location = row.getValue('LOCATION') as string | null
        return <span>{location || <span className="text-muted-foreground">N/A</span>}</span>
      },
    },
    INVESTOR_TYPE: {
      accessorKey: 'investor_type',
      header: () => (
        <HeaderWithIcon icon={<LandmarkIcon className="h-4 w-4" />} label="Investor Type" />
      ),
      cell: ({ row }) => (
        <span>
          {(isInvestor(row.original) && row.original.investor_type) || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </span>
      ),
    },
    POSITION: {
      accessorKey: 'position',
      header: () => (
        <HeaderWithIcon icon={<BriefcaseIcon className="h-4 w-4" />} label="Position" />
      ),
      cell: ({ row }) => (
        <span>
          {(isPeople(row.original) && row.original.position) || (
            <span className="text-muted-foreground">M/A</span>
          )}
        </span>
      ),
    },
    COMPANY_NAME: {
      accessorKey: 'company_name',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Company Name" />
      ),
      cell: ({ row }) => (
        <span>
          {(isPeople(row.original) && row.original.company_name) || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </span>
      ),
    },
    PROFILE_URL: {
      accessorKey: 'linkedin_url',
      header: () => (
        <HeaderWithIcon icon={<LinkIcon className="h-4 w-4" />} label="LinkedIn Profile" />
      ),
      cell: ({ row }) => {
        const url = ensureProtocol(isPeople(row.original) ? row.original.linkedin_url : null)
        return url ? (
          <Link
            href={url}
            target="_blank"
            className="text-blue-600 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            View Profile
          </Link>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    DEAL_DATE: {
      accessorKey: 'deal_date',
      header: () => (
        <HeaderWithIcon icon={<CalendarDaysIcon className="h-4 w-4" />} label="Deal Date" />
      ),
      cell: ({ row }) => {
        const item = row.original
        if (!isTransaction(item)) return null
        const date = item.deal_date
        return (
          <span>
            {date ? (
              new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </span>
        )
      },
      size: 150,
    },
    TARGET_NAME: {
      accessorKey: 'target_name',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Target" />
      ),
      cell: ({ row }) => {
        const item = row.original
        if (!isTransaction(item)) return null
        return (
          <span className="font-medium">
            {item.target_name || <span className="text-muted-foreground">N/A</span>}
          </span>
        )
      },
      size: 200,
    },
    BUYER_NAME: {
      accessorKey: 'buyer_name',
      header: () => (
        <HeaderWithIcon icon={<BuildingOffice2Icon className="h-4 w-4" />} label="Buyer" />
      ),
      cell: ({ row }) => {
        const item = row.original
        if (!isTransaction(item)) return null
        return <span>{item.buyer_name || <span className="text-muted-foreground">N/A</span>}</span>
      },
      size: 200,
    },
    DEAL_SOURCE_URL: {
      accessorKey: 'deal_source_url',
      header: () => <HeaderWithIcon icon={<LinkIcon className="h-4 w-4" />} label="Source" />,
      cell: ({ row }) => {
        const item = row.original
        if (!isTransaction(item)) return null
        const url = ensureProtocol(item.deal_source_url)
        return url ? (
          <Link
            href={url}
            target="_blank"
            className="text-blue-600 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            View Source
          </Link>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
      size: 120,
    },
    TRANSACTION_VALUE: {
      accessorKey: 'transaction_value_musd',
      header: () => (
        <HeaderWithIcon icon={<CurrencyDollarIcon className="h-4 w-4" />} label="Value (USD)" />
      ),
      cell: ({ row }) => {
        const item = row.original
        if (!isTransaction(item)) return null
        const value = item.transaction_value_musd
        if (value === null || typeof value === 'undefined') {
          return <span className="text-muted-foreground">N/A</span>
        }
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(Number(value))
        return <span className="font-mono">{formattedValue}</span>
      },
      size: 150,
    },
  }

  let columns: ColumnDef<AnyListItem>[] = [
    {
      id: 'drag',
      header: () => <p className="w-full text-center">#</p>,
      cell: ({ row }) => (
        <div className="text-center font-medium tabular-nums group flex items-center">
          <p className="">{row.index + 1}</p>
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground mx-auto cursor-grab active:cursor-grabbing" />
        </div>
      ),
      size: 60,
      maxSize: 60,
    },
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 50,
      maxSize: 50,
    },
  ]

  defaultKeys.forEach(key => {
    if (allColumnDefs[key]) {
      columns.push(allColumnDefs[key])
    }
  })

  return columns
}
