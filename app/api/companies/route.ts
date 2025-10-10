import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai'
import { Database } from '@/types/supabase.public'

export async function GET(req: NextRequest) {
  type CompanyRow = Database['public']['Tables']['companies']['Row']
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const url = req.nextUrl
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const hqCountries = url.searchParams.getAll('hqCountry')
  const industries = url.searchParams.getAll('industry')
  const ebitdaMax = url.searchParams.get('ebitdaMax')
  const ebitdaMin = url.searchParams.get('ebitdaMin')
  const revenueMax = url.searchParams.get('revenueMax')
  const revenueMin = url.searchParams.get('revenueMin')
  const description = url.searchParams.get('description') || ''

  const allowedFields = Object.keys({} as CompanyRow)
    .filter(
      key =>
        !['company_name_vector_embedding', 'company_description_vector_embedding'].includes(key)
    )
    .join(',')

  try {
    const supabase = await createClient()
    let query = supabase
      .schema('development')
      .from('companies')
      .select(allowedFields, { count: 'exact' }) // Include count for pagination

    // Apply filters
    if (hqCountries.length > 0) {
      query = query.in('companies_LLM_country', hqCountries)
    }

    if (industries.length > 0) {
      query = query.overlaps('companies_linkedin_industries', industries)
    }

    if (ebitdaMax) {
      query = query.lt('companies_EBITDA_estimate_mEUR', Number(ebitdaMax))
    }

    if (ebitdaMin) {
      query = query.gt('companies_EBITDA_estimate_mEUR', Number(ebitdaMin))
    }

    if (revenueMax) {
      query = query.lt('companies_revenue_estimate_mEUR', Number(revenueMax))
    }

    if (revenueMin) {
      query = query.gt('companies_revenue_estimate_mEUR', Number(revenueMin))
    }

    // Handle semantic search
    if (description.trim()) {
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: description,
      })

      const embedding = embeddingRes.data[0].embedding
      const { data, error } = await supabase.schema('development').rpc('semantic_match_companies', {
        // @ts-ignore
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 10,
      })

      if (error) {
        console.error('❌ Supabase match_companies error:', error.message)
        return NextResponse.json(
          { error: 'Semantic search failed', message: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Semantic search results',
      })
    }

    // Apply pagination only after filters
    query = query.range(from, to)

    const { data: companies, error, count } = await query

    if (error) {
      console.error('❌ Supabase error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: companies,
      total: count,
      message: 'Fetched companies successfully',
      pagination: {
        page,
        pageSize,
        from,
        to,
      },
    })
  } catch (err) {
    console.error('❌ Companies API Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
