import { createServerClient } from '@/lib/supabase/server'
import ReservationManager from './ReservationManager'

export default async function AdminReservationsPage() {
  const supabase = createServerClient()
  const { data: reservations, count } = await supabase
    .from('reservations')
    .select('*, users(name, phone), reservation_items(*, products(name, price))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 19)

  return (
    <div className="p-5 lg:p-8">
      <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#F5A623' }}>Reservations</p>
      <h1 className="text-[22px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>예약 관리</h1>
      <p className="text-[13px] mb-6" style={{ color: 'rgba(23,24,45,0.4)' }}>예약 현황을 확인하고 상태를 변경하세요.</p>
      <ReservationManager initialReservations={reservations ?? []} initialTotal={count ?? 0} />
    </div>
  )
}
