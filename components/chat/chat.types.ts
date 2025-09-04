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
  name: string
  city: string
  country: string
  // title?: string
  // estimated_list_item_count?: number
  // time?: string
  // type?: string
}

export type InlineListCardData = {
  title: string
  estimated_list_item_count: number
  time: string
  type: string
}

export type Message = {
  id: string
  role: Role
  content: string
  data?: any
  createdAt?: Date
}

export type CompanyData = {
  name: string
  website?: string
  logo?: string
  industry?: string
  location?: string
  employees?: number
  description?: string
  revenue?: string
  products?: string

  // company_name: string;
  // company_website?: string;
  // company_logo?: string;
  // company_industry?: string;
  // company_location?: string;
  // company_revenue?: string;
  // company_products?: string;
  // company_employees?: number;
  // company_description?: string;
  evaluations?: Evaluation[]
  hq?: string
}

export interface Reference {
  title: string
  snippet: string
  url: string
}

export interface Evaluation {
  criterion: string
  reasoning: string
  satisfied: 'yes' | 'no'
  references: Reference[]
}
