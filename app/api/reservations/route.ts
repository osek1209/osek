import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()

  if (session.role === 'admin') {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? ''
    const offset = Number(searchParams.get('offset') ?? 0)
    const limit = Number(searchParams.get('limit') ?? 20)

    let query = supabase
      .from('reservations')
      .select('*, users(name, phone), reservation_items(*, products(name, price))', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.or(`users.name.ilike.%${search}%,users.phone.ilike.%${search}%`)
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: count ?? 0 })
  }

  const { data, error } = await supabase
    .from('reservations')
    .select('*, reservation_items(*, products(name, price))')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, note } = await request.json()
  if (!items?.length) {
    return NextResponse.json({ error: '상품을 선택해주세요.' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Atomic stock decrement + reservation creation via RPC
  const { data, error } = await supabase.rpc('create_reservation_atomic', {
    p_user_id: session.id,
    p_note: note ?? null,
    p_items: items,
  })

  if (error) {
    if (error.message?.includes('STOCK_EXHAUSTED')) {
      return NextResponse.json({ error: '재고가 부족합니다. 수량을 줄이거나 다른 상품을 선택해주세요.' }, { status: 400 })
    }
    return NextResponse.json({ error: '예약 중 오류가 발생했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: (data as { id: string }).id }, { status: 201 })
}
