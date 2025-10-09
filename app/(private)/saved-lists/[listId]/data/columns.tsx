'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Globe, GripVertical, Building2, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AnyListItem, ListType, isCompany, isInvestor, isPeople } from '@/types/saved-list'

const getFaviconUrl = (websiteUrl: string | null) => {
    if (!websiteUrl) return 'https://www.google.com/s2/favicons?domain=google.com';
    try {
        return `https://www.google.com/s2/favicons?domain=${new URL(websiteUrl).hostname}`;
    } catch {
        return 'https://www.google.com/s2/favicons?domain=google.com';
    }
};


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
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
  ];

 

  // --- These columns are specific to each list type ---
  let specificColumns: ColumnDef<AnyListItem>[] = [];

  switch (listType) {
    case 'company':
      specificColumns = [
        {
          accessorKey: 'company_name',
          header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Company <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
          cell: ({ row }) => {
              if (!isCompany(row.original)) return null;
              const { company_name, company_logo, company_website } = row.original;
              return (
                  <div className="flex items-center gap-3 font-medium min-w-[150px]">
                      <img src={company_logo || getFaviconUrl(company_website)} alt={`${company_name || 'Company'} logo`} className="h-15 w-15 rounded-md object-contain" />
                      <div>
                          <p className="font-semibold">{company_name || 'Untitled Company'}</p>
                          {company_website && <a href={company_website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}><Globe className="h-3 w-3" />Website</a>}
                      </div>
                  </div>
              )
          }
        },
        { accessorKey: 'company_description', header: 'Description', cell: ({ row }) => <p className="text-sm text-muted-foreground max-w-sm truncate">{isCompany(row.original) ? (row.original.company_description ?? 'N/A') : 'N/A'}</p> },
        { accessorKey: 'company_industry', header: 'Industry', cell: ({ row }) => isCompany(row.original) ? <div className="flex items-center gap-1.5"><Building2 className="h-5 w-5 flex-shrink-0" />{row.original.company_industry ?? 'N/A'}</div> : 'N/A'},
        { accessorKey: 'company_employees', header: 'Employees', cell: ({ row }) => isCompany(row.original) ? <div className="flex items-center gap-1.5"><Users className="h-5 w-5 flex-shrink-0" />{row.original.company_employees?.toLocaleString() ?? 'N/A'}</div> : 'N/A'},
        { accessorKey: 'company_location', header: 'Location', cell: ({ row }) => isCompany(row.original) ? <div className="flex items-center gap-1.5"><MapPin className="h-5 w-5 flex-shrink-0" />{row.original.company_location ?? 'N/A'}</div> : 'N/A'},
      ];
      break;

    case 'investor':
      specificColumns = [
        {
          accessorKey: 'investor_name',
          header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Investor <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
          cell: ({ row }) => {
              if (!isInvestor(row.original)) return null;
              const { investor_name, investor_logo, investor_website } = row.original;
              return (
                  <div className="flex items-center gap-3 font-medium min-w-[250px]">
                      <img src={investor_logo || getFaviconUrl(investor_website)} alt={`${investor_name || 'Investor'} logo`} className="h-15 w-15 rounded-md object-contain" />
                      <div>
                          <p className="font-semibold">{investor_name || 'Untitled Investor'}</p>
                          {investor_website && <a href={investor_website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}><Globe className="h-3 w-3" />Website</a>}
                      </div>
                  </div>
              )
          }
        },
        { accessorKey: 'investor_description', header: 'Description', cell: ({ row }) => <p className="text-sm text-muted-foreground max-w-xs truncate">{isInvestor(row.original) ? (row.original.investor_description ?? 'N/A') : 'N/A'}</p> },
        { accessorKey: 'investor_industry', header: 'Industry', cell: ({ row }) => isInvestor(row.original) ? <div className="flex items-center gap-1.5"><Building2 className="h-4 w-4 flex-shrink-0" />{row.original.investor_industry ?? 'N/A'}</div> : 'N/A'},
        { accessorKey: 'investor_employees', header: 'Employees', cell: ({ row }) => isInvestor(row.original) ? <div className="flex items-center gap-1.5"><Users className="h-4 w-4 flex-shrink-0" />{row.original.investor_employees?.toLocaleString() ?? 'N/A'}</div> : 'N/A'},
        { accessorKey: 'investor_location', header: 'Location', cell: ({ row }) => isInvestor(row.original) ? <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 flex-shrink-0" />{row.original.investor_location ?? 'N/A'}</div> : 'N/A'},
      ];
      break;

    case 'people':
      specificColumns = [
        {
          accessorKey: 'person_name',
          header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Name <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
          cell: ({ row }) => {
            if (!isPeople(row.original)) return null;
            const { person_name, person_avatar } = row.original;
            return (
                <div className="flex items-center gap-3 font-medium">
                    <img src={person_avatar || getFaviconUrl(null)} alt={`${person_name} avatar`} className="h-10 w-10 rounded-full object-cover border" />
                    <p className="font-semibold">{person_name}</p>
                </div>
            )
          }
        },
        { accessorKey: 'person_title', header: 'Title', cell: ({ row }) => isPeople(row.original) ? row.original.person_title : 'N/A' },
        { accessorKey: 'person_company', header: 'Company', cell: ({ row }) => isPeople(row.original) ? row.original.person_company : 'N/A'},
      ];
      break;

    default:
        specificColumns = [{ accessorKey: 'id', header: 'ID' }, { id: 'data', header: 'Data', cell: ({row}) => <pre className="text-xs">{JSON.stringify(row.original, null, 2)}</pre>}];
  }

  return [...commonStartColumns, ...specificColumns];
};