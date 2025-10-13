'use client'

import { Row, Table, type ColumnDef } from '@tanstack/react-table'
import {
  AlignLeft,
  ArrowUpDown,
  Briefcase,
  Building2,
  Factory,
  Globe,
  GripVertical,
  Landmark,
  Linkedin,
  MapPin,
  User,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AnyListItem, isCompany, isInvestor, isPeople, ListType } from '@/types/saved-list'
import Image from 'next/image'
import { ExpandableCell } from '@/components/table/expandable-cell'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState } from 'react'

const getFaviconUrl = (websiteUrl: string | null) => {
  if (!websiteUrl) return '/default-favicon.png'
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(websiteUrl).hostname}`
  } catch {
    return '/default-favicon.png'
  }
}

const HeaderWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex items-center justify-center gap-2">
    {icon}
    <span className="truncate">{label}</span>
  </div>
)

const EmptyCell = () => <span className="text-muted-foreground">—</span>
interface HoverableCellProps {
  row: Row<AnyListItem>
  table: Table<AnyListItem>
}

const HoverableCell: React.FC<HoverableCellProps> = ({ row, table }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate the serial number based on the current page and row index
  const { pageIndex, pageSize } = table.getState().pagination
  const serialNumber = pageIndex * pageSize + row.index + 1

  return (
    <div
      className="flex items-center justify-center h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <GripVertical className="h-5 w-5 cursor-grab active:cursor-grabbing text-muted-foreground" />
      ) : (
        <span className="text-sm font-medium text-muted-foreground">{serialNumber}</span>
      )}
    </div>
  )
}

const createEntityColumns = (entityType: 'company' | 'investor'): ColumnDef<AnyListItem>[] => {
  const Icon = entityType === 'company' ? Building2 : Landmark

  return [
    {
      accessorKey: `${entityType}_name`,
      size: 250,
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <Icon className="h-4 w-4" />
          <span className="capitalize">{entityType}</span>
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
        const item = row.original
        if (entityType === 'company' && isCompany(item)) {
          return (
            <div className="flex items-center gap-3 font-medium min-w-[150px]">
              <Image
                src={item.company_logo || getFaviconUrl(item.company_website)}
                alt={`${item.company_name || 'company'} logo`}
                width={25}
                height={25}
                className="rounded-sm object-contain"
                unoptimized
              />
              <p className="font-semibold">{item.company_name || 'Untitled Company'}</p>
            </div>
          )
        }
        if (entityType === 'investor' && isInvestor(item)) {
          return (
            <div className="flex items-center gap-3 font-medium min-w-[150px]">
              <Image
                src={item.investor_logo || getFaviconUrl(item.investor_website)}
                alt={`${item.investor_name || 'investor'} logo`}
                width={25}
                height={25}
                className="rounded-sm object-contain"
                unoptimized
              />
              <p className="font-semibold">{item.investor_name || 'Untitled Investor'}</p>
            </div>
          )
        }
        return <EmptyCell />
      },
    },
    {
      accessorKey: `${entityType}_description`,
      size: 400,
      header: () => <HeaderWithIcon icon={<AlignLeft className="h-4 w-4" />} label="Description" />,
      cell: ({ row }) => {
        const item = row.original
        let description: string | null | undefined
        if (entityType === 'company' && isCompany(item)) description = item.company_description
        else if (entityType === 'investor' && isInvestor(item))
          description = item.investor_description

        if (!description) return <EmptyCell />
        return (
          <ExpandableCell
            TriggerCell={<p className="line-clamp-2 cursor-pointer">{description}</p>}
          >
            <p>{description}</p>
          </ExpandableCell>
        )
      },
    },
    {
      accessorKey: `${entityType}_website`,
      header: () => <HeaderWithIcon icon={<Globe className="h-4 w-4" />} label="Website" />,
      cell: ({ row }) => {
        const item = row.original
        let websiteUrl: string | null | undefined
        if (entityType === 'company' && isCompany(item)) websiteUrl = item.company_website
        else if (entityType === 'investor' && isInvestor(item)) websiteUrl = item.investor_website

        if (!websiteUrl) return <EmptyCell />
        let displayUrl = ''
        try {
          displayUrl = new URL(websiteUrl).hostname.replace(/^www\./, '')
        } catch {
          return <span className="text-xs text-red-500">Invalid URL</span>
        }
        return (
          <Link
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={websiteUrl}
            className="text-blue-500 hover:underline flex items-center gap-1.5"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-xs truncate font-medium">{displayUrl}</span>
          </Link>
        )
      },
    },
    {
      accessorKey: `${entityType}_industry`,
      header: () => <HeaderWithIcon icon={<Factory className="h-4 w-4" />} label="Industry" />,
      cell: ({ row }) => {
        const item = row.original
        let industry: string | null | undefined
        if (entityType === 'company' && isCompany(item)) industry = item.company_industry
        else if (entityType === 'investor' && isInvestor(item)) industry = item.investor_industry

        return industry ? (
          <div className="text-xs text-muted-foreground">{industry}</div>
        ) : (
          <EmptyCell />
        )
      },
    },
    {
      accessorKey: `${entityType}_employees`,
      header: () => <HeaderWithIcon icon={<Users className="h-4 w-4" />} label="Employees" />,
      cell: ({ row }) => {
        const item = row.original
        let employees: number | null | undefined
        if (entityType === 'company' && isCompany(item)) employees = item.company_employees
        else if (entityType === 'investor' && isInvestor(item)) employees = item.investor_employees

        return employees ? (
          <Badge variant="secondary">{employees.toLocaleString()}</Badge>
        ) : (
          <EmptyCell />
        )
      },
    },
    {
      accessorKey: `${entityType}_location`,
      header: () => <HeaderWithIcon icon={<MapPin className="h-4 w-4" />} label="Location" />,
      cell: ({ row }) => {
        const item = row.original
        let location: string | null | undefined
        if (entityType === 'company' && isCompany(item)) location = item.company_location
        else if (entityType === 'investor' && isInvestor(item)) location = item.investor_location

        return location ? (
          <div className="text-xs text-muted-foreground">{location}</div>
        ) : (
          <EmptyCell />
        )
      },
    },
  ]
}
export const generateColumns = (listType: ListType): ColumnDef<AnyListItem>[] => {
  const commonStartColumns: ColumnDef<AnyListItem>[] = [
    {
      id: 'drag',
      header: () => <div className="text-center ">Sl No.</div>,
      cell: ({ row, table }) => <HoverableCell row={row} table={table} />,
      size: 70,
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
      size: 10,
    },
  ]

  let specificColumns: ColumnDef<AnyListItem>[] = []

  switch (listType) {
    case 'company':
      specificColumns = createEntityColumns('company')
      break

    case 'investor':
      specificColumns = createEntityColumns('investor')
      break

    case 'people':
      specificColumns = [
        {
          accessorKey: 'person_name',
          header: ({ column }) => (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Name</span>
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
            if (!isPeople(row.original)) return null
            const { person_name, person_avatar } = row.original
            return (
              <div className="flex items-center gap-3 font-medium">
                <Image
                  src={
                    person_avatar ||
                    `https://ui-avatars.com/api/?name=${person_name}&background=random`
                  }
                  alt={`${person_name} avatar`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover border"
                />
                <p className="font-semibold">{person_name}</p>
              </div>
            )
          },
        },
        {
          accessorKey: 'person_description',
          header: () => (
            <HeaderWithIcon icon={<AlignLeft className="h-4 w-4" />} label="Description" />
          ),
          cell: ({ row }) => {
            if (!isPeople(row.original) || !row.original.person_description) return <EmptyCell />
            return (
              <ExpandableCell
                TriggerCell={
                  <p className="line-clamp-2 cursor-pointer">{row.original.person_description}</p>
                }
              >
                <p>{row.original.person_description}</p>
              </ExpandableCell>
            )
          },
        },
        {
          accessorKey: 'person_title',
          header: () => (
            <HeaderWithIcon icon={<Briefcase className="h-4 w-4" />} label="Position" />
          ),
          cell: ({ row }) => {
            if (!isPeople(row.original) || !row.original.person_title) return <EmptyCell />
            return <div className="text-sm">{row.original.person_title}</div>
          },
        },
        {
          accessorKey: 'person_company',
          header: () => <HeaderWithIcon icon={<Building2 className="h-4 w-4" />} label="Company" />,
          cell: ({ row }) => {
            if (!isPeople(row.original) || !row.original.person_company) return <EmptyCell />
            return <div className="text-sm">{row.original.person_company}</div>
          },
        },
        {
          accessorKey: 'person_location',
          header: () => <HeaderWithIcon icon={<MapPin className="h-4 w-4" />} label="Location" />,
          cell: ({ row }) => {
            if (!isPeople(row.original) || !row.original.person_location) return <EmptyCell />
            return (
              <div className="text-xs text-muted-foreground">{row.original.person_location}</div>
            )
          },
        },
        {
          accessorKey: 'person_linkedin_url',
          header: () => <HeaderWithIcon icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />,
          cell: ({ row }) => {
            if (!isPeople(row.original) || !row.original.person_linkedin_url) return <EmptyCell />
            return (
              <Link
                href={row.original.person_linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View LinkedIn Profile"
                className="text-blue-500 hover:opacity-80"
                onClick={e => e.stopPropagation()}
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )
          },
        },
      ]
      break

    default:
      specificColumns = [{ accessorKey: 'id', header: 'ID' }]
  }

  return [...commonStartColumns, ...specificColumns]
}
