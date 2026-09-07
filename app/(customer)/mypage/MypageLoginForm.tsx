'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { formatPhone } from '@/lib/formatPhone'

export default function MypageLoginForm() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ''), password }),
    })
    const data = await res.json()
    if (res.ok) {
      window.location.href = data.role === 'admin' ? '/admin' : '/mypage'
    } else {
      setError(data.error ?? '로그인 실패')
    }
    setLoading(false)
  }

  const inputStyle = {
    border: '1.5px solid rgba(23,24,45,0.13)',
    color: '#17182D',
    background: '#FFFFFF',
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF0E5' }}>
          <span style={{ fontSize: 26 }}>🍊</span>
        </div>
        <h1 className="text-[22px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>로그인</h1>
        <p className="text-[13px]" style={{ color: 'rgba(23,24,45,0.45)' }}>예약 내역 확인은 로그인이 필요해요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium mb-1" style={{ color: 'rgba(23,24,45,0.5)' }}>전화번호</label>
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            type="tel"
            placeholder="010-0000-0000"
            required
            className="w-full px-4 py-3 text-[14px] focus:outline-none rounded-[14px]"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1" style={{ color: 'rgba(23,24,45,0.5)' }}>비밀번호</label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? 'text' : 'password'}
              placeholder="비밀번호"
              required
              className="w-full px-4 py-3 pr-11 text-[14px] focus:outline-none rounded-[14px]"
              style={inputStyle}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(23,24,45,0.35)' }}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-[12px]" style={{ color: '#ef4444' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white text-[15px] font-semibold rounded-[14px] disabled:opacity-60"
          style={{ background: '#F5A623' }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-[13px] mt-5" style={{ color: 'rgba(23,24,45,0.4)' }}>
        아직 계정이 없으신가요?{' '}
        <Link href="/register" className="font-semibold" style={{ color: '#F5A623' }}>회원가입</Link>
      </p>
    </div>
  )
}
