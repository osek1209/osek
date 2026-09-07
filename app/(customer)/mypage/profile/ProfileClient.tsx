'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Eye, EyeOff } from 'lucide-react'
import type { SessionUser } from '@/lib/types'

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  background: '#FFFFFF',
  border: '1px solid rgba(23,24,45,0.13)',
  borderRadius: 10,
  color: '#17182D',
  outline: 'none',
}

export default function ProfileClient({ session }: { session: SessionUser }) {
  const router = useRouter()
  const [name, setName] = useState(session.name)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [nameOk, setNameOk] = useState(false)
  const [pwOk, setPwOk] = useState(false)
  const [nameErr, setNameErr] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  async function saveName() {
    if (!name.trim() || name.trim() === session.name) return
    setSaving(true); setNameErr('')
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) { setNameOk(true); setTimeout(() => setNameOk(false), 2000) }
    else { const d = await res.json(); setNameErr(d.error) }
    setSaving(false)
  }

  async function savePassword() {
    if (!currentPw || !newPw) return
    setPwSaving(true); setPwErr('')
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    if (res.ok) { setPwOk(true); setCurrentPw(''); setNewPw(''); setTimeout(() => setPwOk(false), 2000) }
    else { const d = await res.json(); setPwErr(d.error) }
    setPwSaving(false)
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-4">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 mb-5 text-[13px]" style={{ color: 'rgba(23,24,45,0.45)' }}>
        <ChevronLeft size={16} /> 마이페이지
      </button>

      <h1 className="text-[18px] font-bold mb-5" style={{ color: '#17182D' }}>내 정보 수정</h1>

      {/* Name */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold mb-2 px-0.5" style={{ color: 'rgba(23,24,45,0.4)' }}>이름</p>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(23,24,45,0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(23,24,45,0.06)' }}>
            <p className="text-[11px] mb-1" style={{ color: 'rgba(23,24,45,0.4)' }}>전화번호</p>
            <p className="text-[14px]" style={{ color: '#17182D' }}>{session.phone}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[11px] mb-1.5" style={{ color: 'rgba(23,24,45,0.4)' }}>이름 변경</p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                style={{ ...inputStyle, flex: 1 }}
                placeholder={session.name}
              />
              <button
                onClick={saveName}
                disabled={saving || !name.trim() || name.trim() === session.name}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40"
                style={{ background: nameOk ? '#15803d' : '#F5A623', minWidth: 56, transition: 'background 0.2s' }}
              >
                {nameOk ? <Check size={15} /> : saving ? '...' : '저장'}
              </button>
            </div>
            {nameErr && <p className="text-[12px] mt-1.5" style={{ color: '#ef4444' }}>{nameErr}</p>}
          </div>
        </div>
      </div>

      {/* Password */}
      <div>
        <p className="text-[11px] font-semibold mb-2 px-0.5" style={{ color: 'rgba(23,24,45,0.4)' }}>비밀번호 변경</p>
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(23,24,45,0.08)', borderRadius: 12, padding: '16px' }} className="space-y-2">
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="현재 비밀번호"
              style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(23,24,45,0.35)' }}>
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="새 비밀번호"
              onKeyDown={(e) => e.key === 'Enter' && savePassword()}
              style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(23,24,45,0.35)' }}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwErr && <p className="text-[12px]" style={{ color: '#ef4444' }}>{pwErr}</p>}
          <button
            onClick={savePassword}
            disabled={pwSaving || !currentPw || !newPw}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ background: pwOk ? '#15803d' : '#F5A623', transition: 'background 0.2s' }}
          >
            {pwOk ? '변경 완료!' : pwSaving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </div>
    </div>
  )
}
