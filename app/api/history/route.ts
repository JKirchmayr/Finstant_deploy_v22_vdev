import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from '@/actions/auth'
import supabaseAdmin from '@/lib/supabase/admin'
import { differenceInDays, parseISO } from 'date-fns'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const user = await getUserProfile()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' })
    }
    const { data, error } = await supabaseAdmin
      .schema('session_management')
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      return NextResponse.json({ error: error.message })
    }

    const now = new Date()
    const sessions =
      data?.map(session => {
        const createdAt = parseISO(session.created_at)
        const diffDays = differenceInDays(now, createdAt)

        let date_group = 'Older'
        if (diffDays === 0) date_group = 'Today'
        else if (diffDays === 1) date_group = 'Yesterday'
        else if (diffDays <= 7) date_group = 'Last 7 days'
        else if (diffDays <= 30) date_group = 'Last 30 days'

        return { ...session, date_group }
      }) || []
    const grouped = sessions.reduce((acc, session) => {
      if (!acc[session.date_group]) {
        acc[session.date_group] = []
      }
      acc[session.date_group].push(session)
      return acc
    }, {} as Record<string, typeof sessions>)

    return NextResponse.json({
      success: true,
      data: grouped,
      total: data.length,
      message: 'Fetched History successfully',
      pagination: {
        page,
        pageSize,
        from,
        to,
      },
    })
  } catch (err) {
    console.error('❌ History API Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
