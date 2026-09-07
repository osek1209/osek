'use client'

import Link from 'next/link'
import { ClipboardList, ChevronRight } from 'lucide-react'
import type { SessionUser, Reservation } from '@/lib/types'

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: '대기중',   color: '#92400e' },
  confirmed: { label: '확인됨',   color: '#1d4ed8' },
  completed: { label: '픽업완료', color: '#15803d' },
  cancelled: { label: '취소',     color: '#6b7280' },
  no_show:   { label: '노쇼',     color: '#dc2626' },
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}

export default function MypageClient({ session, reservations }: { session: SessionUser; reservations: Reservation[] }) {
  return (
    <>
      {/* Content */}
      <div className="max-w-xl mx-auto px-5 pt-4 pb-24 md:pb-6">

        {/* Profile row → 내 정보 페이지 */}
        <Link
          href="/mypage/profile"
          className="flex items-center gap-3 py-3.5 px-4 rounded-xl mb-4"
          style={{ background: '#FFFFFF', border: '1px solid rgba(23,24,45,0.08)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[18px]" style={{ background: '#FFF0E5' }}>🍊</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px]" style={{ color: '#17182D' }}>{session.name}</p>
            <p className="text-[12px]" style={{ color: 'rgba(23,24,45,0.4)' }}>{session.phone}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0" style={{ color: 'rgba(23,24,45,0.3)' }}>
            <span className="text-[12px]">내 정보</span>
            <ChevronRight size={14} />
          </div>
        </Link>

        {/* Reservations */}
        <p className="text-[11px] font-semibold mb-2 px-1" style={{ color: 'rgba(23,24,45,0.4)' }}>
          예약 내역 {reservations.length > 0 && `(${reservations.length}건)`}
        </p>

        {!reservations.length ? (
          <div className="py-8 text-center rounded-xl" style={{ background: '#FFFFFF', border: '1px solid rgba(23,24,45,0.08)' }}>
            <ClipboardList size={20} className="mx-auto mb-2" style={{ color: 'rgba(23,24,45,0.2)' }} />
            <p className="text-[13px] mb-3" style={{ color: 'rgba(23,24,45,0.4)' }}>아직 예약 내역이 없습니다.</p>
            <Link href="/products" className="text-[13px] font-semibold" style={{ color: '#F5A623' }}>상품 보러가기</Link>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(23,24,45,0.08)', overflow: 'hidden' }}>
            {reservations.map((r, i) => {
              const st = STATUS[r.status] ?? STATUS.pending
              const total = r.reservation_items?.reduce((s, item) => s + (item.products?.price ?? 0) * item.quantity, 0) ?? 0
              return (
                <div
                  key={r.id}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: i < reservations.length - 1 ? '1px solid rgba(23,24,45,0.06)' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[10px]" style={{ color: 'rgba(23,24,45,0.3)' }}>#{r.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[10px] font-semibold" style={{ color: st.color }}>· {st.label}</span>
                    </div>
                    <p className="text-[13px] truncate" style={{ color: '#17182D' }}>
                      {r.reservation_items?.map((item) => `${item.products?.name} ×${item.quantity}`).join(', ')}
                    </p>
                    {r.note && (
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: '#F5A623' }}>📌 {r.note}</p>
                    )}
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(23,24,45,0.35)' }}>
                      {new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' })}
                    </p>
                  </div>
                  <p className="font-bold text-[13px] shrink-0" style={{ color: '#17182D' }}>{total.toLocaleString()}원</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Logout — fixed above bottom nav on mobile, static on desktop */}
      <div
        className="md:hidden fixed left-0 right-0 px-5 py-3"
        style={{ bottom: 60, background: 'rgba(248,248,245,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(23,24,45,0.07)' }}
      >
        <button
          onClick={logout}
          className="w-full py-2.5 text-[14px] rounded-xl"
          style={{ color: 'rgba(23,24,45,0.45)', border: '1px solid rgba(23,24,45,0.1)', background: '#FFFFFF' }}
        >
          로그아웃
        </button>
      </div>
      {/* Desktop logout */}
      <div className="hidden md:block max-w-xl mx-auto px-5 pb-8">
        <button
          onClick={logout}
          className="w-full py-2.5 text-[14px] rounded-xl"
          style={{ color: 'rgba(23,24,45,0.45)', border: '1px solid rgba(23,24,45,0.1)' }}
        >
          로그아웃
        </button>
      </div>
    </>
  )
}
