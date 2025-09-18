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
  favicon: string
  content_preview: string
}

export type InlineCardData = {
  name: string
  city: string
  country: string
  website: string
  logo: string
  type: 'company' | 'investor' | 'list'
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
  sources?: Source[]
  createdAt?: Date
}

export type EntityData = {
  NAME: string
  WEBSITE?: string
  LOGO?: string
  INDUSTRY?: string
  LOCATIONS?: string
  EMPLOYEES?: number
  DESCRIPTION?: string
  REVENUE?: string
  PRODUCTS?: string

  // company_name: string;
  // company_website?: string;
  // company_logo?: string;
  // company_industry?: string;
  // company_location?: string;
  // company_revenue?: string;
  // company_products?: string;
  // company_employees?: number;
  // company_description?: string;
  EVALUATIONS?: Evaluation[]
  hq?: string
}

export interface Reference {
  TITLE: string
  SNIPPET: string
  URL: string
}

export interface Evaluation {
  CRITERION: string
  REASONING: string
  SATISFIED: 'yes' | 'no'
  REFERENCES: Reference[]
}
