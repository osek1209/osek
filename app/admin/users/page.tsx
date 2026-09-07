import { createServerClient } from '@/lib/supabase/server'
import UserManager from './UserManager'
import type { User } from '@/lib/types'

export default async function AdminUsersPage() {
  const supabase = createServerClient()
  const [{ data: users, count }, { data: noShows }] = await Promise.all([
    supabase.from('users').select('id, name, phone, role, created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(0, 19),
    supabase.from('reservations').select('user_id').eq('status', 'no_show'),
  ])

  const noShowMap: Record<string, number> = {}
  for (const r of noShows ?? []) {
    noShowMap[r.user_id] = (noShowMap[r.user_id] ?? 0) + 1
  }

  const enriched = (users ?? []).map((u) => ({ ...u, no_show_count: noShowMap[u.id] ?? 0 }))

  return (
    <div className="p-5 lg:p-8">
      <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#F5A623' }}>Members</p>
      <h1 className="text-[22px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>회원 관리</h1>
      <p className="text-[13px] mb-6" style={{ color: 'rgba(23,24,45,0.4)' }}>가입한 회원 목록을 확인하고 관리하세요.</p>
      <UserManager initialUsers={(enriched as User[]) ?? []} initialTotal={count ?? 0} />
    </div>
  )
}
