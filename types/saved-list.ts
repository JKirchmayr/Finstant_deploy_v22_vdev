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

// export interface CompanyListItem {
//   saved_list_item_id: string
//   company_name: string
//   company_website: string
//   company_logo: string | null
//   company_industry: string | null
//   company_description: string | null
//   company_employees: number | null
//   company_location: string | null
// }

// export interface ListItemsResponse {
//   items: CompanyListItem[]
//   list_name?: string
//   item_count?: number
// }

// export type InvestorListItem = {
//   saved_list_item_id: string;
//   list_item_position: number;
//   user_note: string | null;
//   added_at: string;
//   id: number;
//   investor_name: string;
//   investor_website: string | null;
//   investor_logo: string | null;
//   investor_location: string | null;
//   investor_employees: number | null;
//   investor_description: string | null;
//   investor_industry: string | null;
//   investor_target_industry: string | null;
// };

// A generic base for all list items
interface BaseListItem {
  saved_list_item_id: string
  list_item_position: number
  user_note: string | null
  added_at: string
  id: number
}

// Specific type for Investor items from your API
export interface InvestorListItem extends BaseListItem {
  investor_name: string
  investor_website: string | null
  investor_logo: string | null
  investor_location: string | null
  investor_employees: number | null
  investor_description: string | null
  investor_industry: string | null
}

// Specific type for Company items from your API
export interface CompanyListItem extends BaseListItem {
  company_name: string | null // Can be null as per your data
  company_website: string | null
  company_logo: string | null
  company_location: string | null
  company_employees: number | null
  company_description: string | null
  company_industry: string | null
}

// An assumed type for People items (you can adjust properties)
export interface PeopleListItem extends BaseListItem {
  person_name: string
  person_title: string | null
  person_company: string | null
  person_avatar: string | null
  person_location: string | null
  person_description: string | null 
  person_linkedin_url: string | null
}

// A Union Type that can be any of the above
export type AnyListItem = InvestorListItem | CompanyListItem | PeopleListItem

// --- Type Guards to safely identify item type at runtime ---
export const isInvestor = (item: AnyListItem): item is InvestorListItem => {
  return 'investor_name' in item
}
export const isCompany = (item: AnyListItem): item is CompanyListItem => {
  return 'company_name' in item
}
export const isPeople = (item: AnyListItem): item is PeopleListItem => {
  return 'person_name' in item
}

// Type for the list type itself
export type ListType = 'investor' | 'company' | 'people' | 'unknown' 

// The full API response for a list's details
export type ListItemsResponse = {
  list_details: {
    list_name: string
    list_type: string // e.g., "investor", "company list"
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
  created_at: string // ISO timestamp
  last_updated: string // ISO timestamp
  list_status: string
}
