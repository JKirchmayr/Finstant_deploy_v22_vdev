'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Globe, GripVertical, Building2, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AnyListItem, ListType, isCompany, isInvestor, isPeople } from '@/types/saved-list'
import Image from 'next/image'
import {
  Bars3BottomLeftIcon,
  Bars3Icon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  MapPinIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { ExpandableCell } from '@/components/table/expandable-cell'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const getFaviconUrl = (websiteUrl: string | null) => {
  if (!websiteUrl) return 'https://www.google.com/s2/favicons?domain=google.com'
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(websiteUrl).hostname}`
  } catch {
    return 'https://www.google.com/s2/favicons?domain=google.com'
  }
}

const HeaderWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex items-center justify-center gap-2">
    {icon}
    <span className="truncate">{label}</span>
  </div>
)

export const generateColumns = (listType: ListType): ColumnDef<AnyListItem>[] => {
  const commonStartColumns: ColumnDef<AnyListItem>[] = [
    {
      id: 'drag',
      header: '',
      cell: () => <GripVertical className="h-5 w-5 cursor-grab active:cursor-grabbing" />,
      size: 10,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
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
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
  ]

  // --- These columns are specific to each list type ---
  let specificColumns: ColumnDef<AnyListItem>[] = []

  switch (listType) {
    case 'company':
      specificColumns = [
        {
          accessorKey: 'company_name',
          size: 200,
          header: ({ column }) => (
            <div className="flex items-center gap-1">
              <span className="flex gap-1">
                <BuildingOffice2Icon className="h-4 w-4" />
                Company
              </span>
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="p-0 hover:bg-transparent"
              >
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ),
          cell: ({ row }) => {
            if (!isCompany(row.original)) return null
            const { company_name, company_logo, company_website } = row.original
            return (
              <div className="flex items-center gap-3 font-medium min-w-[150px]">
                <Image
                  src={company_logo || getFaviconUrl(company_website)}
                  alt={`${name} logo`}
                  width={25}
                  height={25}
                  className="mr-2 rounded-sm flex-shrink-0"
                  unoptimized
                />
                <div>
                  <p className="font-semibold">{company_name || 'Untitled Company'}</p>
                </div>
              </div>
            )
          },
        },
        {
          accessorKey: 'company_description',
          size: 400,
          header: () => (
            <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />
          ),
          cell: ({ row }) => (
            <ExpandableCell
              className="bg-background rounded-2xl text-sm shadow-xl font-style: italic"
              TriggerCell={
                <p className="line-clamp-2 cursor-pointer">
                  {isCompany(row.original) ? row.original.company_description ?? 'N/A' : 'N/A'}
                </p>
              }
            >
              <p className=" ">
                {isCompany(row.original) ? row.original.company_description ?? 'N/A' : 'N/A'}
              </p>
            </ExpandableCell>
          ),
        },
        {
          accessorKey: 'company_website',
          header: () => (
            <HeaderWithIcon icon={<GlobeAltIcon className="h-4 w-4" />} label="Visit" />
          ),
          cell: ({ row }) => {
            if (!isCompany(row.original) || !row.original.company_website) {
              return <span>N/A</span>
            }
            const websiteUrl = row.original.company_website
            let displayUrl = ''
            try {             
              displayUrl = new URL(websiteUrl).hostname.replace(/^www\./, '')
            } catch {             
              displayUrl = 'Invalid URL'
            }

            return (
              <Link
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={websiteUrl}
                className="text-blue-500 hover:underline "
                onClick={e => e.stopPropagation()}
              >                
                <span className="text-xs font-medium">{displayUrl}</span>
              </Link>
            )
          },
        },
        {
          accessorKey: 'company_industry',
          header: () => (
            <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Industry" />
          ),
          cell: ({ row }) =>
            isCompany(row.original) ? (
              <div className=" text-xs text-muted-foreground">
                {row.original.company_industry ?? 'N/A'}
              </div>
            ) : (
              'N/A'
            ),
        },
        {
          accessorKey: 'company_employees',
          header: () => (
            <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />
          ),
          cell: ({ row }) =>
            isCompany(row.original) ? (
              <div className="pl-2">
                <Badge className="font-medium" variant="secondary">
                  {row.original.company_employees?.toLocaleString() ?? 'N/A'}
                </Badge>
              </div>
            ) : (
              'N/A'
            ),
        },
        {
          accessorKey: 'company_location',
          header: () => (
            <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="Location" />
          ),
          cell: ({ row }) =>
            isCompany(row.original) ? (
              <div className="text-xs text-muted-foreground">
                {row.original.company_location ?? 'N/A'}
              </div>
            ) : (
              'N/A'
            ),
        },
      ]
      break

    case 'investor':
      specificColumns = [
        {
          accessorKey: 'investor_name',
          header: ({ column }) => (
            <div className="flex items-center">
              <span className="flex gap-1">
                <BuildingLibraryIcon className="h-4 w-4" />
                Investor
              </span>
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="p-0 hover:bg-transparent"
              >
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ),
          cell: ({ row }) => {
            if (!isInvestor(row.original)) return null
            const { investor_name, investor_logo, investor_website } = row.original
            return (
              <div className="flex items-center gap-3 font-medium min-w-[150px]">
                <Image
                  src={investor_logo || getFaviconUrl(investor_website)}
                  alt={`${name} logo`}
                  width={25}
                  height={25}
                  className="mr-2 rounded-sm flex-shrink-0"
                  unoptimized
                />
                <div>
                  <p className="font-semibold">{investor_name || 'Untitled Company'}</p>
                </div>
              </div>
            )
          },
        },
        {
          accessorKey: 'investor_description',
          size: 400,
          header: () => (
            <HeaderWithIcon icon={<Bars3Icon className="h-4 w-4" />} label="Description" />
          ),
          cell: ({ row }) => (
            <ExpandableCell
              className="bg-background rounded-2xl text-sm shadow-xl font-style: italic"
              TriggerCell={
                <p className="line-clamp-2 cursor-pointer">
                  {isInvestor(row.original) ? row.original.investor_description ?? 'N/A' : 'N/A'}
                </p>
              }
            >
              <p className="">
                {isInvestor(row.original) ? row.original.investor_description ?? 'N/A' : 'N/A'}
              </p>
            </ExpandableCell>
          ),
        },
        {
          accessorKey: 'Investor_website',
          header: () => (
            <HeaderWithIcon icon={<GlobeAltIcon className="h-4 w-4" />} label="Visit" />
          ),
          cell: ({ row }) => {
            if (!isInvestor(row.original) || !row.original.investor_website) {
              return <span>N/A</span>
            }

            return (
              <Link
                href={row.original.investor_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center pl-2 gap-1"
                onClick={e => e.stopPropagation()}
              >
                <Globe className="h-3 w-3" />
                Website
              </Link>
            )
          },
        },
        {
          accessorKey: 'investor_industry',
          header: () => (
            <HeaderWithIcon icon={<Bars3BottomLeftIcon className="h-4 w-4" />} label="Industry" />
          ),
          cell: ({ row }) =>
            isInvestor(row.original) ? (
              <p className=" text-muted-foreground text-xs">
                {row.original.investor_industry ?? 'N/A'}
              </p>
            ) : (
              'N/A'
            ),
        },
        {
          accessorKey: 'investor_employees',
          header: () => (
            <HeaderWithIcon icon={<UsersIcon className="h-4 w-4" />} label="Employees" />
          ),
          cell: ({ row }) =>
            isInvestor(row.original) ? (
              <div className="pl-2">
                <Badge className="text-muted-foreground font-medium" variant="secondary">
                  {row.original.investor_employees?.toLocaleString() ?? 'N/A'}
                </Badge>
              </div>
            ) : (
              'N/A'
            ),
        },
        {
          accessorKey: 'investor_location',
          header: () => (
            <HeaderWithIcon icon={<MapPinIcon className="h-4 w-4" />} label="Location" />
          ),
          cell: ({ row }) =>
            isInvestor(row.original) ? (
              <div className="text-muted-foreground text-xs">
                {row.original.investor_location ?? 'N/A'}
              </div>
            ) : (
              'N/A'
            ),
        },
      ]
      break

    case 'people':
      specificColumns = [
        {
          accessorKey: 'person_name',
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            if (!isPeople(row.original)) return null
            const { person_name, person_avatar } = row.original
            return (
              <div className="flex items-center gap-3 font-medium">
                <img
                  src={person_avatar || getFaviconUrl(null)}
                  alt={`${person_name} avatar`}
                  className="h-10 w-10 rounded-full object-cover border"
                />
                <p className="font-semibold">{person_name}</p>
              </div>
            )
          },
        },
        {
          accessorKey: 'person_title',
          header: 'Title',
          cell: ({ row }) => (isPeople(row.original) ? row.original.person_title : 'N/A'),
        },
        {
          accessorKey: 'person_company',
          header: 'Company',
          cell: ({ row }) => (isPeople(row.original) ? row.original.person_company : 'N/A'),
        },
      ]
      break

    default:
      specificColumns = [
        { accessorKey: 'id', header: 'ID' },
        {
          id: 'data',
          header: 'Data',
          cell: ({ row }) => <pre className="text-xs">{JSON.stringify(row.original, null, 2)}</pre>,
        },
      ]
  }

  return [...commonStartColumns, ...specificColumns]
}
