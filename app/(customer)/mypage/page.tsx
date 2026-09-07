import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import MypageClient from './MypageClient'
import MypageLoginForm from './MypageLoginForm'
import type { Reservation } from '@/lib/types'

export default async function MyPage() {
  const session = await getSession()
  if (!session) return <MypageLoginForm />

  const supabase = createServerClient()
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, reservation_items(*, products(name, price))')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })

  return <MypageClient session={session} reservations={(reservations as Reservation[]) ?? []} />
}
