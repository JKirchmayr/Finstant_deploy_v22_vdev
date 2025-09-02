export type Role =
  | 'user'
  | 'assistant'
  | 'system'
  | 'list_builder'
  | 'data'
  | 'inline_card'
  | 'inline_list_card'

export type Source = {
  id: number
  title: string
  url: string
}

export type InlineCardData = {
  name?: string
  city?: string
  country?: string
  title?: string
  estimated_list_item_count?: number
  time?: string
  type?: string
}

export type InlineListCardData = {
  title: string
  estimated_list_item_count: number
  time: string
  type: string
}

export type Message = {
  role: Role
  content: string
  data?: any
  createdAt?: Date
}

export type CompanyData = {
  company_name: string
  company_description: string
  company_logo?: string
  company_location?: string
  evaluations?: any[]
  company_id?: string | number
  revenue?: string
  products?: string
  hq?: string
}
