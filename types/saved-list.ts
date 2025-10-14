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

interface BaseListItem {
  saved_list_item_id: string
  list_item_position: number
  user_note: string | null
  added_at: string
  id: number
}

export interface InvestorListItem extends BaseListItem {
  investor_type: any
  investor_name: string
  investor_website: string | null
  investor_logo: string | null
  investor_location: string | null
  investor_employees: number | null
  investor_description: string | null
  investor_industry: string | null
}

export interface CompanyListItem extends BaseListItem {
  company_name: string | null
  company_website: string | null
  company_logo: string | null
  company_location: string | null
  company_employees: number | null
  company_description: string | null
  company_industry: string | null
}

export interface PeopleListItem extends BaseListItem {
  name: string
  profile_pic_url: string | null
  description: string | null
  position: string | null
  location: string | null
  company_name: string | null
  company_location: string | null
  linkedin_url: string | null
}

export interface TransactionListItem extends BaseListItem {
  entity_type: 'transaction'
  entity_id: string
  deal_date: string | null
  target_name: string | null
  deal_description: string | null
  buyer_name: string | null
  deal_source_url: string | null
  transaction_value: number | null
}

export type AnyListItem = InvestorListItem | CompanyListItem | PeopleListItem | TransactionListItem

export const isInvestor = (item: AnyListItem): item is InvestorListItem => {
  return 'investor_name' in item
}

export const isPeople = (item: AnyListItem): item is PeopleListItem => {
  return 'position' in item
}

export const isCompany = (item: AnyListItem): item is CompanyListItem => {
  return 'company_name' in item && !isPeople(item) && !isInvestor(item)
}

export const isTransaction = (item: AnyListItem): item is TransactionListItem => {
  return 'transaction' in item
}

export type ListType = 'investor' | 'company' | 'people' | 'unknown' | 'transaction'

export type ListItemsResponse = {
  list_details: {
    list_name: string
    list_type: string
  }
  items: AnyListItem[]
  pagination: {
    total_count: number
  }
}

export type SavedList = {
  saved_list_id: string
  list_name: string
  list_type: string
  list_description: string | null
  item_count: number
  created_at: string
  last_updated: string
  list_status: string
}
