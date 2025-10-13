export const normalizeListData = (
  data: any[],
  type: 'company' | 'investor' | 'transaction' | 'people'
) => {
  if (!Array.isArray(data)) return []
  // console.log({ type })
  switch (type) {
    case 'investor':
      return data.map((item: any) => ({
        NAME: item.investor_name || 'N/A',
        DESCRIPTION: item.investor_description || '',
        WEBSITE: item.investor_website || '',
        LOGO: item.investor_logo || '',
        LOCATION: item.investor_location || '',
        EMPLOYEES: item.investor_employees || null,
        INDUSTRY: item.investor_industry || '',
        INVESTOR_TYPE: item.investor_type || '',
        ITEM_ID: item.webset_item_id,
        LIST_ID: item.list_id,
        SESSION_ID: item.session_id,
        CREATED_AT: item.created_at,
        EVALUATIONS: item.evaluation_data || [],
      }))
    case 'company':
      return data.map((item: any) => ({
        NAME: item.company_name || 'N/A',
        DESCRIPTION: item.company_description || '',
        WEBSITE: item.company_website || '',
        LOGO: item.company_logo || '',
        LOCATION: item.company_location || '',
        EMPLOYEES: item.company_employees || null,
        INDUSTRY: item.company_industry || '',
        REVENUE_ESTIMATE: item.revenue_estimate || '',
        ITEM_ID: item.webset_item_id,
        EVALUATIONS: item.evaluation_data || [],
      }))
    case 'people':
      return data.map((item: any) => ({
        NAME: item.name || 'N/A',
        DESCRIPTION: item.description || '',
        POSITION: item.position || '',
        COMPANY_NAME: item.company_name || '',
        LOCATION: item.location || '',
        PROFILE_URL: item.profile_url || '',
        ITEM_ID: item.webset_item_id,
        EVALUATIONS: item.evaluation_data || [],
      }))
    case 'transaction':
    default:
      return data
  }
}

export const normalizeListType = (listType: string) => {
  if (listType === 'company_list') return 'company'
  if (listType === 'investor_list') return 'investor'
  if (listType === 'transaction_list') return 'transaction'
  if (listType === 'people_list') return 'people'
  return listType as 'company' | 'investor' | 'transaction' | 'people'
}
