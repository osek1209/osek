import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

const LIMIT = 20

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const offset = Number(searchParams.get('offset') ?? 0)
  const limit = Number(searchParams.get('limit') ?? LIMIT)

  const supabase = createServerClient()
  let query = supabase
    .from('users')
    .select('id, name, phone, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  query = query.range(offset, offset + limit - 1)

  const [{ data, error, count }, { data: noShows }] = await Promise.all([
    query,
    supabase.from('reservations').select('user_id').eq('status', 'no_show'),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const noShowMap: Record<string, number> = {}
  for (const r of noShows ?? []) {
    noShowMap[r.user_id] = (noShowMap[r.user_id] ?? 0) + 1
  }

  const enriched = (data ?? []).map((u) => ({ ...u, no_show_count: noShowMap[u.id] ?? 0 }))
  return NextResponse.json({ data: enriched, total: count ?? 0 })
}
