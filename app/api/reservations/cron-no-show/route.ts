import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  // 7pm KST = 10:00 UTC. Cron runs at this time daily.
  // Regular: pending/confirmed, created before NOW(), no "내일 픽업" in note
  const { data: regular, error: e1 } = await supabase
    .from('reservations')
    .update({ status: 'no_show' })
    .in('status', ['pending', 'confirmed'])
    .lt('created_at', new Date().toISOString())
    .not('note', 'ilike', '%내일 픽업%')
    .select('id')

  // "내일 픽업" reservations older than 24h → also no-show
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: nextDay, error: e2 } = await supabase
    .from('reservations')
    .update({ status: 'no_show' })
    .in('status', ['pending', 'confirmed'])
    .lt('created_at', yesterday)
    .ilike('note', '%내일 픽업%')
    .select('id')

  if (e1 || e2) {
    return NextResponse.json({ error: e1?.message ?? e2?.message }, { status: 500 })
  }

  const count = (regular?.length ?? 0) + (nextDay?.length ?? 0)
  return NextResponse.json({ ok: true, processed: count })
}
