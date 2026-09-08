'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { formatPhone } from '@/lib/formatPhone'
import type { Term } from '@/lib/types'

export default function AuthPage({ defaultTab }: { defaultTab: 'login' | 'register' }) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()

  // Terms
  const [terms, setTerms] = useState<Term[]>([])
  const [agreed, setAgreed] = useState<Record<string, boolean>>({})
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
  const [allChecked, setAllChecked] = useState(false)

  useEffect(() => {
    if (tab === 'register') {
      fetch('/api/terms').then(r => r.json()).then((data: Term[]) => {
        if (Array.isArray(data)) {
          setTerms(data)
          const init: Record<string, boolean> = {}
          data.forEach(t => { init[t.id] = false })
          setAgreed(init)
        }
      }).catch(() => {})
    }
  }, [tab])

  useEffect(() => {
    if (terms.length === 0) { setAllChecked(false); return }
    setAllChecked(terms.every(t => agreed[t.id]))
  }, [agreed, terms])

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {}
    terms.forEach(t => { next[t.id] = checked })
    setAgreed(next)
  }

  function switchTab(t: 'login' | 'register') {
    setTab(t)
    setError('')
    setPhone('')
    setPassword('')
    setName('')
    setShowPw(false)
  }

  async function handleRegister() {
    setError('')
    const rawPhone = phone.replace(/\D/g, '')
    if (!name.trim()) { setError('이름을 입력해 주세요'); return }
    if (rawPhone.length < 10) { setError('전화번호를 정확히 입력해 주세요'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상 입력해 주세요'); return }

    const requiredTerms = terms.filter(t => t.is_required)
    const missingRequired = requiredTerms.find(t => !agreed[t.id])
    if (missingRequired) { setError(`"${missingRequired.title}"에 동의해 주세요`); return }

    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: rawPhone, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/')
    router.refresh()
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ''), password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push(data.role === 'admin' ? '/admin' : '/')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid rgba(23,24,45,0.15)',
    borderRadius: 12,
    color: '#17182D',
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F8F5' }}>
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16" style={{ background: '#FFF0E5' }}>
        <div className="flex items-center gap-2.5 mb-6">
          <img src="/logo.png" alt="오색청과" style={{ height: 36, width: 36, objectFit: 'contain' }} />
          <span className="text-sm font-bold" style={{ color: '#17182D' }}>오색청과</span>
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#17182D', letterSpacing: '-0.025em' }}>
          신선한 과일을<br />미리 예약하세요
        </h2>
        <p className="text-[15px] leading-relaxed mb-10" style={{ color: 'rgba(23,24,45,0.5)' }}>
          실명 예약으로 대기 없이<br />편하게 픽업하실 수 있습니다.
        </p>
        <div className="space-y-3">
          {['매일 직접 선별한 신선한 과일', '실명 예약으로 노쇼 없는 신뢰', '픽업 시 현장 결제로 간편하게'].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-[14px]" style={{ color: 'rgba(23,24,45,0.55)' }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#F5A623' }} />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col">
        <div className="px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-1 text-[13px] transition-opacity hover:opacity-60" style={{ color: 'rgba(23,24,45,0.45)' }}>
            <ChevronLeft size={15} /> 홈으로
          </Link>
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 pt-2 pb-12">
          <div className="w-full max-w-sm">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(23,24,45,0.06)' }}>
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className="flex-1 py-2.5 text-[14px] font-semibold rounded-lg transition-all"
                  style={tab === t
                    ? { background: '#FFFFFF', color: '#17182D', boxShadow: '0 1px 6px rgba(23,24,45,0.1)' }
                    : { color: 'rgba(23,24,45,0.45)' }
                  }
                >
                  {t === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>

            {/* ── LOGIN ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#17182D' }}>전화번호</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="010-0000-0000" required
                    className="w-full px-4 py-3 text-[15px] focus:outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#17182D' }}>비밀번호</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      className="w-full px-4 py-3 pr-11 text-[15px] focus:outline-none" style={inputStyle} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(23,24,45,0.35)' }}>
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                {error && <div className="px-4 py-3 text-[13px]" style={{ background: '#FFF0E5', borderRadius: 10, color: '#c2410c' }}>{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 font-bold text-[15px] text-white disabled:opacity-50 mt-1"
                  style={{ background: '#F5A623', borderRadius: 12 }}>
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            )}

            {/* ── REGISTER ── */}
            {tab === 'register' && (
              <div className="space-y-3">
                {/* Fields */}
                    <div>
                      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#17182D' }}>이름</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 text-[15px] focus:outline-none" style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#17182D' }}>전화번호</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="010-0000-0000"
                        className="w-full px-4 py-3 text-[15px] focus:outline-none" style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#17182D' }}>비밀번호</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} value={password}
                          onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" minLength={6}
                          className="w-full px-4 py-3 pr-11 text-[15px] focus:outline-none" style={inputStyle} />
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(23,24,45,0.35)' }}>
                          {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    {terms.length > 0 && (
                      <div className="pt-2">
                        <div className="p-3.5 rounded-xl space-y-2" style={{ background: '#F8F8F5', border: '1px solid rgba(23,24,45,0.08)' }}>
                          {/* 전체동의 */}
                          <label className="flex items-center gap-2.5 cursor-pointer select-none pb-2"
                            style={{ borderBottom: '1px solid rgba(23,24,45,0.08)' }}>
                            <input type="checkbox" checked={allChecked}
                              onChange={e => toggleAll(e.target.checked)}
                              className="w-4 h-4 accent-orange-400" />
                            <span className="font-bold text-[13px]" style={{ color: '#17182D' }}>전체 동의</span>
                          </label>

                          {/* Individual terms */}
                          {terms.map(t => (
                            <div key={t.id}>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none flex-1 min-w-0">
                                  <input type="checkbox" checked={!!agreed[t.id]}
                                    onChange={e => setAgreed(p => ({ ...p, [t.id]: e.target.checked }))}
                                    className="w-4 h-4 accent-orange-400 shrink-0" />
                                  <span className="text-[12px]" style={{ color: 'rgba(23,24,45,0.7)' }}>
                                    <span className="font-semibold" style={{ color: t.is_required ? '#F5A623' : '#0369a1' }}>
                                      [{t.is_required ? '필수' : '선택'}]
                                    </span>
                                    {' '}{t.title}
                                  </span>
                                </label>
                                <button type="button"
                                  onClick={() => setExpandedTerm(p => p === t.id ? null : t.id)}
                                  className="shrink-0 p-0.5" style={{ color: 'rgba(23,24,45,0.35)' }}>
                                  {expandedTerm === t.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                              </div>
                              {expandedTerm === t.id && (
                                <div className="mt-2 ml-6 p-3 rounded-lg text-[11px] leading-relaxed whitespace-pre-wrap"
                                  style={{ background: '#FFFFFF', color: 'rgba(23,24,45,0.55)', maxHeight: 140, overflowY: 'auto' }}>
                                  {t.content}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && <div className="px-4 py-3 text-[13px]" style={{ background: '#FFF0E5', borderRadius: 10, color: '#c2410c' }}>{error}</div>}

                    <button onClick={handleRegister} disabled={loading}
                      className="w-full py-3.5 font-bold text-[15px] text-white disabled:opacity-50"
                      style={{ background: '#F5A623', borderRadius: 12 }}>
                      {loading ? '가입 중...' : '가입하기'}
                    </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
