'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Term } from '@/lib/types'

const CARD: React.CSSProperties = { background: '#FFFFFF', borderRadius: 14, border: '1px solid rgba(23,24,45,0.08)', overflow: 'hidden' }

type Mode = 'list' | 'create' | 'edit'

const BLANK = { title: '', content: '', is_required: true, is_active: true, sort_order: 0 }

export default function TermsManager({ initialTerms }: { initialTerms: Term[] }) {
  const [terms, setTerms] = useState<Term[]>(initialTerms)
  const [mode, setMode] = useState<Mode>('list')
  const [editing, setEditing] = useState<Term | null>(null)
  const [form, setForm] = useState(BLANK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  function startCreate() {
    setForm(BLANK)
    setEditing(null)
    setError('')
    setMode('create')
  }

  function startEdit(t: Term) {
    setForm({ title: t.title, content: t.content, is_required: t.is_required, is_active: t.is_active, sort_order: t.sort_order })
    setEditing(t)
    setError('')
    setMode('edit')
  }

  function cancelForm() {
    setMode('list')
    setEditing(null)
    setError('')
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) { setError('제목과 내용을 입력하세요'); return }
    setLoading(true); setError('')
    try {
      if (mode === 'create') {
        const res = await fetch('/api/terms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        setTerms(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)))
      } else if (editing) {
        const res = await fetch(`/api/terms/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        setTerms(prev => prev.map(t => t.id === editing.id ? data : t))
      }
      setMode('list')
    } finally { setLoading(false) }
  }

  async function handleDelete(t: Term) {
    if (!confirm(`"${t.title}" 항목을 삭제할까요?`)) return
    const res = await fetch(`/api/terms/${t.id}`, { method: 'DELETE' })
    if (res.ok) setTerms(prev => prev.filter(x => x.id !== t.id))
  }

  async function toggleField(t: Term, field: 'is_active' | 'is_required') {
    const update = { [field]: !t[field] }
    const res = await fetch(`/api/terms/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update) })
    const data = await res.json()
    if (res.ok) setTerms(prev => prev.map(x => x.id === t.id ? data : x))
  }

  const inputCls = "w-full px-3 py-2.5 text-[14px] rounded-xl focus:outline-none"
  const inputStyle: React.CSSProperties = { background: '#F8F8F5', border: '1px solid rgba(23,24,45,0.12)', color: '#17182D' }

  if (mode !== 'list') {
    return (
      <div style={CARD} className="p-5 max-w-2xl">
        <h2 className="font-bold text-[16px] mb-4" style={{ color: '#17182D' }}>
          {mode === 'create' ? '새 약관 추가' : '약관 수정'}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-semibold mb-1" style={{ color: 'rgba(23,24,45,0.5)' }}>제목</label>
            <input className={inputCls} style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="예) 개인정보 수집 및 이용 동의" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1" style={{ color: 'rgba(23,24,45,0.5)' }}>내용</label>
            <textarea
              className={inputCls}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 140, fontFamily: 'inherit', lineHeight: 1.6 }}
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="약관 내용을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1" style={{ color: 'rgba(23,24,45,0.5)' }}>정렬 순서 (낮을수록 위)</label>
            <input type="number" className={inputCls} style={{ ...inputStyle, width: 100 }} value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_required} onChange={e => setForm(p => ({ ...p, is_required: e.target.checked }))}
                className="w-4 h-4 accent-orange-400" />
              <span className="text-[13px] font-semibold" style={{ color: '#17182D' }}>필수 동의</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="w-4 h-4 accent-orange-400" />
              <span className="text-[13px] font-semibold" style={{ color: '#17182D' }}>활성화 (회원가입에 표시)</span>
            </label>
          </div>
          {error && <p className="text-[13px] px-3 py-2 rounded-lg" style={{ background: '#FFF0E5', color: '#c2410c' }}>{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={loading}
              className="px-5 py-2.5 text-[14px] font-bold text-white rounded-xl disabled:opacity-50"
              style={{ background: '#F5A623' }}>
              {loading ? '저장 중...' : '저장'}
            </button>
            <button onClick={cancelForm} className="px-5 py-2.5 text-[14px] font-semibold rounded-xl"
              style={{ background: '#F8F8F5', color: 'rgba(23,24,45,0.5)', border: '1px solid rgba(23,24,45,0.1)' }}>
              취소
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={startCreate}
        className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white rounded-xl"
        style={{ background: '#F5A623' }}>
        <Plus size={15} /> 새 약관 추가
      </button>

      {terms.length === 0 ? (
        <div className="py-12 text-center rounded-xl" style={{ background: '#FFFFFF', border: '1px solid rgba(23,24,45,0.08)' }}>
          <p className="text-[13px]" style={{ color: 'rgba(23,24,45,0.4)' }}>등록된 약관이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {terms.map(t => (
            <div key={t.id} style={CARD}>
              {/* Header row */}
              <div className="px-4 py-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px]" style={{ color: '#17182D' }}>{t.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={t.is_required ? { background: '#FFF0E5', color: '#F5A623' } : { background: '#F0F9FF', color: '#0369a1' }}>
                      {t.is_required ? '필수' : '선택'}
                    </span>
                    {!t.is_active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(23,24,45,0.06)', color: 'rgba(23,24,45,0.35)' }}>
                        비활성
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(23,24,45,0.35)' }}>순서 {t.sort_order}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Toggle active */}
                  <button onClick={() => toggleField(t, 'is_active')} title={t.is_active ? '비활성화' : '활성화'}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-60"
                    style={{ color: t.is_active ? '#F5A623' : 'rgba(23,24,45,0.3)' }}>
                    {t.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  {/* Toggle required */}
                  <button onClick={() => toggleField(t, 'is_required')} title={t.is_required ? '선택으로 변경' : '필수로 변경'}
                    className="px-2 py-1 text-[10px] font-bold rounded-lg transition-opacity hover:opacity-60"
                    style={t.is_required ? { background: '#FFF0E5', color: '#F5A623' } : { background: '#F0F9FF', color: '#0369a1' }}>
                    {t.is_required ? '필수' : '선택'}
                  </button>
                  <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: 'rgba(23,24,45,0.4)' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: '#dc2626' }}>
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setExpanded(p => p === t.id ? null : t.id)}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: 'rgba(23,24,45,0.4)' }}>
                    {expanded === t.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Content preview */}
              {expanded === t.id && (
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={{ background: '#F8F8F5', color: 'rgba(23,24,45,0.65)' }}>
                    {t.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
