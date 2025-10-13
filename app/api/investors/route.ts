import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai'
import { Database } from '@/types/supabase.public'

export async function GET(req: NextRequest) {
  type InvestorRow = Database['public']['Tables']['investors']['Row']

  const url = req.nextUrl
  const from = parseInt(url.searchParams.get('from') || '0')
  const to = parseInt(url.searchParams.get('to') || '30')

  const investorType = url.searchParams.getAll('investorType')
  const revenueMin = url.searchParams.get('revenueMin')
  const revenueMax = url.searchParams.get('revenueMax')
  const ebitdaMin = url.searchParams.get('ebitdaMin')
  const ebitdaMax = url.searchParams.get('ebitdaMax')
  const industry = url.searchParams.getAll('industry')
  const investorLocation = url.searchParams.getAll('investorLocation')
  const description = url.searchParams.get('description') || ''

  // Select only allowed fields (exclude vector fields)
  const allowedFields = Object.keys({} as InvestorRow)
    .filter(key => !key.includes('vector_embedding'))
    .join(',')

  try {
    const supabase = await createClient()
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
    let query = supabase.schema('development').from('investors').select(allowedFields)

    // Apply filters if they exist
    if (investorType.length > 0) {
      query = query.in('investor_type', investorType)
    }

    // if (revenueMin) {
    //   query = query.gte('revenue_min', revenueMin)
    // }
    // if (revenueMax) {
    //   query = query.lte('revenue_max', revenueMax)
    // }

    // if (ebitdaMin) {
    //   query = query.gte('ebitda_min', ebitdaMin)
    // }
    // if (ebitdaMax) {
    //   query = query.lte('ebitda_max', ebitdaMax)
    // }

    if (industry.length > 0) {
      query = query.overlaps('investor_linkedin_industry', industry)
    }

    if (investorLocation.length > 0) {
      query = query.in('investor_LLM_country', investorLocation)
    }

    if (description.trim()) {
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: description,
      })

      const embedding = embeddingRes.data[0].embedding
      const { data: companies, error } = await supabase
        .schema('development')
        .rpc('semantic_match_companies', {
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

      // Extract company_id from companies and find it on the investment table company_id
      const companyIds = companies.map((company: { company_id: string }) => company.company_id)
      console.log('companyIds: ', companyIds)
      const { data: investments, error: investmentError } = await supabase
        .schema('development')
        .from('investments')
        .select('*')

      console.log('investments: ', investments)
      if (!investments) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No investments found',
        })
      }

      // Now we need to get the investor_id from the investments table
      const investorIds = investments
        .map(investment => investment.investor_id)
        .filter((id): id is string => id !== null) as string[]

      const { data: investors, error: investorError } = await supabase
        .schema('development')
        .from('investors')
        .select('*')
        .in('investor_id', investorIds)

      return NextResponse.json({
        success: true,
        data: investors,
        message: 'Semantic search results',
      })
    }

    // Pagination
    query = query.range(from, to)

    const { data: investors, error } = await query

    if (error) {
      console.error('❌ Supabase error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: investors,
      message: 'Fetched investors successfully',
    })
  } catch (err) {
    console.error('❌ Investors API Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
