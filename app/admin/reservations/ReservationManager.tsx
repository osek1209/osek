'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { Download, Trash2, X } from 'lucide-react'
import type { Reservation, ReservationStatus } from '@/lib/types'

const statusOptions: { value: ReservationStatus; label: string; bg: string; color: string; desc: string }[] = [
  { value: 'pending',   label: '대기중',   bg: '#FFF8E1', color: '#92400e', desc: '아직 확인 전' },
  { value: 'confirmed', label: '확인됨',   bg: '#EFF6FF', color: '#1d4ed8', desc: '예약 확인 완료' },
  { value: 'completed', label: '픽업완료', bg: '#F0FDF4', color: '#15803d', desc: '고객이 상품 수령' },
  { value: 'cancelled', label: '취소',     bg: '#F3F4F6', color: '#6b7280', desc: '예약 취소됨' },
  { value: 'no_show',   label: '노쇼',     bg: '#FEF2F2', color: '#dc2626', desc: '시간 내 픽업 없음' },
]

const filterTabs: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all',       label: '전체' },
  { value: 'pending',   label: '대기중' },
  { value: 'confirmed', label: '확인됨' },
  { value: 'completed', label: '픽업완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'no_show',   label: '노쇼' },
]

function StatusBadge({ status, onClick }: { status: ReservationStatus; onClick: () => void }) {
  const opt = statusOptions.find((s) => s.value === status) ?? statusOptions[0]
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-opacity active:opacity-60"
      style={{ background: opt.bg, color: opt.color }}
    >
      {opt.label}
    </button>
  )
}

function StatusModal({
  reservation,
  onClose,
  onSelect,
}: {
  reservation: Reservation
  onClose: () => void
  onSelect: (status: ReservationStatus) => void
}) {
  const rowTotal = reservation.reservation_items?.reduce((sum, item) => sum + (item.products?.price ?? 0) * item.quantity, 0) ?? 0
  const items = reservation.reservation_items?.map((item) => `${item.products?.name} ×${item.quantity}`).join(', ') ?? ''

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }} />
      <div
        className="relative w-full lg:w-[400px] rounded-t-[24px] lg:rounded-[20px] px-5 pt-4 pb-8"
        style={{ background: '#FFFFFF' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center mb-3 lg:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(23,24,45,0.15)' }} />
        </div>

        {/* Close (desktop) */}
        <button onClick={onClose} className="hidden lg:flex absolute top-4 right-4 items-center justify-center w-7 h-7 rounded-full" style={{ background: 'rgba(23,24,45,0.06)' }}>
          <X size={14} style={{ color: 'rgba(23,24,45,0.5)' }} />
        </button>

        {/* Reservation info */}
        <p className="font-bold text-[16px] mb-0.5" style={{ color: '#17182D' }}>{reservation.users?.name}</p>
        <p className="text-[12px] mb-0.5" style={{ color: 'rgba(23,24,45,0.45)' }}>{items}</p>
        <p className="text-[12px] mb-4" style={{ color: 'rgba(23,24,45,0.35)' }}>
          {reservation.users?.phone} · {rowTotal.toLocaleString()}원
          {reservation.note && <span className="ml-1.5 font-medium" style={{ color: '#F5A623' }}>📌 {reservation.note}</span>}
        </p>

        {/* Primary action */}
        {reservation.status !== 'completed' && (
          <button
            onClick={() => onSelect('completed')}
            className="w-full py-3.5 rounded-[14px] font-bold text-[15px] text-white mb-3"
            style={{ background: '#16a34a' }}
          >
            픽업 완료 처리
          </button>
        )}

        {/* Other status options */}
        <div className="flex flex-col gap-1.5">
          {statusOptions.filter((s) => s.value !== 'completed' && s.value !== reservation.status).map((s) => (
            <button
              key={s.value}
              onClick={() => onSelect(s.value)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-left"
              style={{ background: s.bg }}
            >
              <div>
                <span className="font-semibold text-[13px]" style={{ color: s.color }}>{s.label}</span>
                <span className="text-[11px] ml-1.5" style={{ color: s.color, opacity: 0.7 }}>{s.desc}</span>
              </div>
              {reservation.status === s.value && (
                <span className="text-[11px] font-bold" style={{ color: s.color }}>현재</span>
              )}
            </button>
          ))}
          {reservation.status === 'completed' && statusOptions.filter((s) => s.value !== reservation.status).map((s) => (
            <button
              key={s.value}
              onClick={() => onSelect(s.value)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-left"
              style={{ background: s.bg }}
            >
              <div>
                <span className="font-semibold text-[13px]" style={{ color: s.color }}>{s.label}</span>
                <span className="text-[11px] ml-1.5" style={{ color: s.color, opacity: 0.7 }}>{s.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ReservationManager({
  initialReservations,
  initialTotal,
}: {
  initialReservations: Reservation[]
  initialTotal: number
}) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all')
  const [resetting, setResetting] = useState(false)
  const [modalReservation, setModalReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const makeUrl = useCallback(
    (offset: number, limit: number) =>
      `/api/reservations?offset=${offset}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}&status=${filter}`,
    [debouncedSearch, filter],
  )

  const { items: reservations, setItems, total, loading, sentinelRef, reset } =
    useInfiniteScroll<Reservation>(makeUrl, initialReservations, initialTotal)

  useEffect(() => { reset(makeUrl) }, [debouncedSearch, filter])

  async function updateStatus(id: string, status: ReservationStatus) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
      setModalReservation((prev) => prev?.id === id ? { ...prev, status } : prev)
    }
    setModalReservation(null)
  }

  async function handleExport() {
    const res = await fetch('/api/reservations/export')
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservations_${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleReset() {
    if (!confirm('모든 예약 내역을 삭제하시겠습니까?\n엑셀 다운로드를 먼저 진행하세요.')) return
    setResetting(true)
    const res = await fetch('/api/reservations/reset', { method: 'DELETE' })
    if (res.ok) setItems([])
    setResetting(false)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 mb-5">
        {/* Row 1: Search + count + action buttons */}
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호 검색"
            className="flex-1 min-w-0 px-4 py-2.5 text-[14px] focus:outline-none"
            style={{ border: '1px solid rgba(23,24,45,0.15)', borderRadius: 12, color: '#17182D', background: '#FFFFFF' }}
          />
          <span className="text-[13px] shrink-0" style={{ color: 'rgba(23,24,45,0.4)' }}>총 {total}건</span>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid rgba(23,24,45,0.12)', color: 'rgba(23,24,45,0.6)' }}
            >
              <Download size={13} />
              엑셀
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg disabled:opacity-50"
              style={{ background: '#FFFFFF', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              <Trash2 size={13} />
              초기화
            </button>
          </div>
        </div>

        {/* Row 2: Filter tabs — independently scrollable */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-1 p-1 rounded-xl w-max" style={{ background: 'rgba(23,24,45,0.06)' }}>
            {filterTabs.map((tab) => {
              const active = filter === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap"
                  style={active
                    ? { background: '#FFFFFF', color: '#17182D', boxShadow: '0 1px 4px rgba(23,24,45,0.1)' }
                    : { color: 'rgba(23,24,45,0.45)' }
                  }
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden rounded-[20px] overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
        {!reservations.length && !loading ? (
          <p className="text-center py-12 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
            {debouncedSearch || filter !== 'all' ? '검색 결과가 없습니다.' : '예약 내역이 없습니다.'}
          </p>
        ) : reservations.map((r, i) => {
          const rowTotal = r.reservation_items?.reduce((sum, item) => sum + (item.products?.price ?? 0) * item.quantity, 0) ?? 0
          return (
            <div key={r.id} className="px-4 py-3" style={{ borderBottom: i < reservations.length - 1 ? '1px solid rgba(23,24,45,0.06)' : 'none' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14px]" style={{ color: '#17182D' }}>{r.users?.name}</span>
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(23,24,45,0.3)' }}>#{r.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <StatusBadge status={r.status} onClick={() => setModalReservation(r)} />
              </div>
              <p className="text-[12px] truncate mb-0.5" style={{ color: 'rgba(23,24,45,0.5)' }}>
                {r.reservation_items?.map((item) => `${item.products?.name} ×${item.quantity}`).join(', ')}
              </p>
              {r.note && (
                <p className="text-[11px] mb-0.5 truncate" style={{ color: '#F5A623' }}>📌 {r.note}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
                  {r.users?.phone} · {new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-bold text-[13px]" style={{ color: '#17182D' }}>{rowTotal.toLocaleString()}원</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-[20px] overflow-x-auto" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
        <table className="w-full text-sm" style={{ minWidth: 680 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(23,24,45,0.05)' }}>
              {['예약번호', '이름', '연락처', '상품', '금액', '상태', '일시'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[12px] font-medium whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const rowTotal = r.reservation_items?.reduce((sum, item) => sum + (item.products?.price ?? 0) * item.quantity, 0) ?? 0
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(23,24,45,0.04)' }}>
                  <td className="px-4 py-3.5 font-mono text-[12px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.35)' }}>{r.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3.5 font-medium text-[14px] whitespace-nowrap" style={{ color: '#17182D' }}>{r.users?.name}</td>
                  <td className="px-4 py-3.5 text-[13px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.5)' }}>{r.users?.phone}</td>
                  <td className="px-4 py-3.5 text-[12px]" style={{ color: 'rgba(23,24,45,0.5)', maxWidth: 180 }}>
                    {r.reservation_items?.map((item) => `${item.products?.name} ×${item.quantity}`).join(', ')}
                    {r.note && <span className="block mt-0.5" style={{ color: '#F5A623' }}>📌 {r.note}</span>}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[13px] whitespace-nowrap" style={{ color: '#17182D' }}>{rowTotal.toLocaleString()}원</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={r.status} onClick={() => setModalReservation(r)} />
                  </td>
                  <td className="px-4 py-3.5 text-[12px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.35)' }}>{new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!reservations.length && !loading && (
          <p className="text-center py-12 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
            {debouncedSearch || filter !== 'all' ? '검색 결과가 없습니다.' : '예약 내역이 없습니다.'}
          </p>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-2 text-center">
        {loading && <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.35)' }}>불러오는 중...</span>}
      </div>

      {/* Status modal */}
      {modalReservation && (
        <StatusModal
          reservation={modalReservation}
          onClose={() => setModalReservation(null)}
          onSelect={(status) => updateStatus(modalReservation.id, status)}
        />
      )}
    </div>
  )
}
