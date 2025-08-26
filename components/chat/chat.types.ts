export type Role =
  | 'user'
  | 'assistant'
  | 'system'
  | 'company-profile'
  | 'data'
  | 'company_profile_card'
  | 'investor_profile_card'
  | 'inline_card'

export type Source = {
  id: number
  title: string
  url: string
}

export type InlineCardData = {
  name: string
  city: string
  country: string
}

export type Message = {
  role: Role
  content: string
  data?: any
  createdAt?: Date
}
