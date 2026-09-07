import { createServerClient } from '@/lib/supabase/server'
import { CalendarCheck, Clock, Boxes } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createServerClient()
  const [
    { count: totalReservations },
    { count: pendingCount },
    { count: productCount },
    { data: recent },
  ] = await Promise.all([
    supabase.from('reservations').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_available', true),
    supabase
      .from('reservations')
      .select('*, users(name, phone), reservation_items(quantity, products(name))')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: '전체 예약', value: totalReservations ?? 0, Icon: CalendarCheck, bg: '#DCEBFF', color: '#1d4ed8' },
    { label: '대기중',    value: pendingCount ?? 0,      Icon: Clock,         bg: '#FFF4B8', color: '#92400e' },
    { label: '판매중 상품', value: productCount ?? 0,    Icon: Boxes,         bg: '#E5F3E9', color: '#15803d' },
  ]

  return (
    <div className="p-5 lg:p-8">
      <div className="mb-5">
        <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#F5A623' }}>Overview</p>
        <h1 className="text-[20px] font-bold" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>대시보드</h1>
      </div>

      {/* KPI — 3 cols on all sizes */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[16px] p-3 md:p-5"
            style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}>
              <s.Icon size={15} style={{ color: s.color }} />
            </div>
            <p className="text-[11px] md:text-[12px] mb-0.5" style={{ color: 'rgba(23,24,45,0.4)' }}>{s.label}</p>
            <p className="text-[22px] md:text-[26px] font-bold leading-tight" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(23,24,45,0.06)' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: '#17182D' }}>최근 예약</h2>
        </div>

        {!recent?.length ? (
          <p className="text-center py-10 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>예약 내역이 없습니다.</p>
        ) : (
          <>
            {/* Mobile list */}
            <ul className="lg:hidden">
              {recent.map((r, i) => (
                <li key={r.id} className="px-5 py-3" style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(23,24,45,0.06)' : 'none' }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-[14px]" style={{ color: '#17182D' }}>{r.users?.name}</span>
                    <span className="font-mono text-[11px]" style={{ color: 'rgba(23,24,45,0.35)' }}>#{r.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <p className="text-[12px] truncate" style={{ color: 'rgba(23,24,45,0.5)' }}>
                    {r.reservation_items?.map((item: { products?: { name: string }; quantity: number }) =>
                      `${item.products?.name} ×${item.quantity}`
                    ).join(', ')}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(23,24,45,0.3)' }}>{r.users?.phone} · {new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 580 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(23,24,45,0.05)' }}>
                    {['예약번호', '이름', '연락처', '상품', '일시'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[12px] font-medium whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(23,24,45,0.04)' }}>
                      <td className="px-5 py-3 font-mono text-[12px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.35)' }}>{r.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-3 font-medium text-[14px] whitespace-nowrap" style={{ color: '#17182D' }}>{r.users?.name}</td>
                      <td className="px-5 py-3 text-[13px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.5)' }}>{r.users?.phone}</td>
                      <td className="px-5 py-3 text-[12px]" style={{ color: 'rgba(23,24,45,0.5)' }}>
                        {r.reservation_items?.map((item: { products?: { name: string }; quantity: number }) =>
                          `${item.products?.name} ×${item.quantity}`
                        ).join(', ')}
                      </td>
                      <td className="px-5 py-3 text-[12px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.35)' }}>{new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
