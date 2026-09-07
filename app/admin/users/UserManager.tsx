'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { Trash2 } from 'lucide-react'
import type { User } from '@/lib/types'

export default function UserManager({ initialUsers, initialTotal }: { initialUsers: User[]; initialTotal: number }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const makeUrl = useCallback(
    (offset: number, limit: number) =>
      `/api/users?offset=${offset}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
    [debouncedSearch],
  )

  const { items: users, setItems, total, loading, sentinelRef, reset } = useInfiniteScroll<User>(
    makeUrl, initialUsers, initialTotal,
  )

  useEffect(() => { reset(makeUrl) }, [debouncedSearch])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name}님을 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) setItems((prev) => prev.filter((u) => u.id !== id))
    else alert(data.error ?? '삭제 중 오류가 발생했습니다.')
  }

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 전화번호 검색"
          className="flex-1 max-w-xs px-4 py-2.5 text-[14px] focus:outline-none"
          style={{ border: '1px solid rgba(23,24,45,0.15)', borderRadius: 12, color: '#17182D', background: '#FFFFFF' }}
        />
        <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.4)' }}>총 {total}명</span>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden rounded-[20px] overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
        {!users.length && !loading ? (
          <p className="text-center py-12 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
            {debouncedSearch ? '검색 결과가 없습니다.' : '가입한 회원이 없습니다.'}
          </p>
        ) : users.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(23,24,45,0.06)' : 'none' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-[13px]" style={{ background: u.role === 'admin' ? '#FFF0E5' : '#E5F3E9', color: u.role === 'admin' ? '#F5A623' : '#15803d' }}>
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-[14px]" style={{ color: '#17182D' }}>{u.name}</p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={u.role === 'admin' ? { background: '#FFF0E5', color: '#F5A623' } : { background: '#E5F3E9', color: '#15803d' }}>
                  {u.role === 'admin' ? '관리자' : '일반'}
                </span>
              </div>
              <p className="text-[12px]" style={{ color: 'rgba(23,24,45,0.5)' }}>{u.phone}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
                {new Date(u.created_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric' })}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                {(u.no_show_count ?? 0) > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#dc2626' }}>
                    노쇼 {u.no_show_count}
                  </span>
                )}
                {u.role !== 'admin' && (
                  <button onClick={() => handleDelete(u.id, u.name)} style={{ color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-[20px] overflow-x-auto" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(23,24,45,0.05)' }}>
              {['이름', '전화번호', '권한', '노쇼', '가입일', '액션'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[12px] font-medium whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(23,24,45,0.04)' }}>
                <td className="px-5 py-3.5 font-medium text-[14px] whitespace-nowrap" style={{ color: '#17182D' }}>{u.name}</td>
                <td className="px-5 py-3.5 text-[13px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.55)' }}>{u.phone}</td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={u.role === 'admin' ? { background: '#FFF0E5', color: '#F5A623' } : { background: '#E5F3E9', color: '#15803d' }}>
                    {u.role === 'admin' ? '관리자' : '일반'}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {(u.no_show_count ?? 0) > 0
                    ? <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#dc2626' }}>{u.no_show_count}회</span>
                    : <span className="text-[12px]" style={{ color: 'rgba(23,24,45,0.25)' }}>—</span>
                  }
                </td>
                <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.35)' }}>
                  {new Date(u.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.id, u.name)} className="flex items-center gap-1 text-[12px] font-medium hover:opacity-60" style={{ color: '#ef4444' }}>
                      <Trash2 size={13} /> 삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && !loading && (
          <p className="text-center py-12 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
            {debouncedSearch ? '검색 결과가 없습니다.' : '가입한 회원이 없습니다.'}
          </p>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-2 text-center">
        {loading && <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.35)' }}>불러오는 중...</span>}
      </div>
    </div>
  )
}
