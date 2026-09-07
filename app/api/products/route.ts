import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

const LIMIT = 20

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const available = searchParams.get('available')
  const offset = Number(searchParams.get('offset') ?? 0)
  const limit = Number(searchParams.get('limit') ?? LIMIT)

  const supabase = createServerClient()
  let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false })

  if (search) query = query.ilike('name', `%${search}%`)
  if (available === 'true') query = query.eq('is_available', true)
  query = query.range(offset, offset + limit - 1)

  const [{ data, error, count }, { data: cats }] = await Promise.all([
    query,
    supabase.from('categories').select('id, name'),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]))
  const enriched = (data ?? []).map((p) => ({ ...p, categories: p.category_id ? catMap[p.category_id] ?? null : null }))

  return NextResponse.json({ data: enriched, total: count ?? 0 })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = createServerClient()
  const { data, error } = await supabase.from('products').insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
