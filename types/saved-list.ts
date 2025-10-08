export interface ListTypeBadgeProps {
  type: string
}

export interface UserList {
  saved_list_id: string
  list_name: string
  list_type: string
  item_count: number
  created_at: string
  list_status: 'active' | 'archived'
}


export interface CompanyListItem {
  saved_list_item_id: string
  company_name: string
  company_website: string
  company_logo: string | null
  company_industry: string | null
  company_description: string | null
  company_employees: number | null
  company_location: string | null
}

export interface ListItemsResponse {
  items: CompanyListItem[]
  list_name?: string
  item_count?: number
}