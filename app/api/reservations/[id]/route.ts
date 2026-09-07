import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await request.json()
  const supabase = createServerClient()

  // Get current status before updating
  const { data: current } = await supabase
    .from('reservations')
    .select('status')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Restore stock when cancelling a non-cancelled reservation
  if (status === 'cancelled' && current?.status !== 'cancelled') {
    await supabase.rpc('restore_stock_on_cancel', { p_reservation_id: id })
  }

  return NextResponse.json(data)
}
