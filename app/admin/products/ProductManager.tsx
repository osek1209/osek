'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { Upload, X, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Product, Category } from '@/lib/types'

type Form = {
  name: string; description: string; price: string; stock: string
  image_url: string; is_available: boolean; category_id: string
  badge_text: string; badge_color: string
}

const emptyForm: Form = {
  name: '', description: '', price: '', stock: '0',
  image_url: '', is_available: true, category_id: '',
  badge_text: '', badge_color: '#F5A623',
}

const BADGE_PRESETS = [
  { text: 'HIT', color: '#ef4444' },
  { text: 'SALE', color: '#f97316' },
  { text: 'NEW', color: '#16a34a' },
  { text: 'BEST', color: '#7c3aed' },
]

function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('압축 실패')), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = url
  })
}

function ProductForm({
  form, setForm, editId, loading, uploading, categories,
  onSubmit, onCancel, fileRef, onFileChange,
}: {
  form: Form; setForm: (f: Form) => void; editId: string | null
  loading: boolean; uploading: boolean; categories: Category[]
  onSubmit: (e: React.FormEvent) => void; onCancel: () => void
  fileRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const inputStyle = { border: '1px solid rgba(23,24,45,0.15)', borderRadius: 10, color: '#17182D', background: '#FFFFFF' }
  const labelStyle = { color: 'rgba(23,24,45,0.5)' }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium mb-1" style={labelStyle}>카테고리</label>
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 text-[14px] focus:outline-none" style={inputStyle}>
          <option value="">카테고리 없음</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[12px] font-medium mb-1" style={labelStyle}>상품명 *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 text-[14px] focus:outline-none" style={inputStyle} />
      </div>
      <div>
        <label className="block text-[12px] font-medium mb-1" style={labelStyle}>상품 이미지</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        {form.image_url ? (
          <div className="relative rounded-xl overflow-hidden" style={{ background: '#F8F8F5', aspectRatio: '4/3' }}>
            <img src={form.image_url} alt="" className="w-full h-full object-contain" />
            <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <X size={12} className="text-white" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(23,24,45,0.15)', color: 'rgba(23,24,45,0.4)' }}>
            <Upload size={18} />
            <span className="text-[12px]">{uploading ? '업로드 중...' : '클릭하여 사진 선택'}</span>
          </button>
        )}
      </div>
      <div>
        <label className="block text-[12px] font-medium mb-1" style={labelStyle}>설명</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-[14px] focus:outline-none resize-none" style={inputStyle} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-[12px] font-medium mb-1" style={labelStyle}>가격 (원) *</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min={0} className="w-full px-3 py-2 text-[14px] focus:outline-none" style={inputStyle} />
        </div>
        <div className="w-24">
          <label className="block text-[12px] font-medium mb-1" style={labelStyle}>재고 *</label>
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min={0} className="w-full px-3 py-2 text-[14px] focus:outline-none" style={inputStyle} />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium mb-1.5" style={labelStyle}>뱃지 (선택)</label>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {BADGE_PRESETS.map((b) => (
            <button key={b.text} type="button"
              onClick={() => setForm({ ...form, badge_text: form.badge_text === b.text ? '' : b.text, badge_color: b.color })}
              className="px-2.5 py-1 rounded-lg text-[12px] font-bold"
              style={{ background: form.badge_text === b.text ? b.color : 'rgba(23,24,45,0.1)', color: form.badge_text === b.text ? '#fff' : 'rgba(23,24,45,0.5)' }}
            >{b.text}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} placeholder="직접 입력" maxLength={8} className="flex-1 px-3 py-2 text-[13px] focus:outline-none" style={inputStyle} />
          <input type="color" value={form.badge_color} onChange={(e) => setForm({ ...form, badge_color: e.target.value })} className="w-10 h-9 rounded-lg cursor-pointer p-0.5" style={{ border: '1px solid rgba(23,24,45,0.15)' }} />
        </div>
        {form.badge_text && (
          <div className="mt-2">
            <span className="text-[11px] mr-1.5" style={{ color: 'rgba(23,24,45,0.4)' }}>미리보기:</span>
            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold text-white" style={{ background: form.badge_color }}>{form.badge_text}</span>
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: 'rgba(23,24,45,0.6)' }}>
        <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
        판매 중
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading || uploading} className="flex-1 py-2.5 text-white text-[13px] font-semibold rounded-xl disabled:opacity-50" style={{ background: '#F5A623' }}>
          {loading ? '저장 중...' : editId ? '수정 완료' : '추가'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-[13px] rounded-xl" style={{ border: '1px solid rgba(23,24,45,0.12)', color: 'rgba(23,24,45,0.5)' }}>취소</button>
      </div>
    </form>
  )
}

export default function ProductManager({ initialProducts, initialTotal, categories }: { initialProducts: Product[]; initialTotal: number; categories: Category[] }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [form, setForm] = useState<Form>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const makeUrl = useCallback(
    (offset: number, limit: number) =>
      `/api/products?offset=${offset}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
    [debouncedSearch],
  )

  const { items: products, setItems: setProducts, total, loading: scrollLoading, sentinelRef, reset } =
    useInfiniteScroll<Product>(makeUrl, initialProducts, initialTotal)

  useEffect(() => { reset(makeUrl) }, [debouncedSearch])

  function openAdd() { setEditId(null); setForm(emptyForm); setSheetOpen(true) }

  function startEdit(p: Product) {
    setEditId(p.id)
    const [badge_text = '', badge_color = '#F5A623'] = (p.badge ?? '').split('|')
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), stock: String(p.stock ?? 0), image_url: p.image_url ?? '', is_available: p.is_available, category_id: p.category_id ?? '', badge_text, badge_color })
    setSheetOpen(true)
  }

  function cancelEdit() { setEditId(null); setForm(emptyForm); setSheetOpen(false) }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const blob = await compressImage(file)
      const fd = new FormData()
      fd.append('file', blob, 'image.jpg')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setForm((f) => ({ ...f, image_url: data.url }))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    const badge = form.badge_text.trim() ? `${form.badge_text.trim()}|${form.badge_color}` : null
    const body = { ...form, price: Number(form.price), stock: Number(form.stock), category_id: form.category_id || null, badge }
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))
    if (editId) {
      const res = await fetch(`/api/products/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const updated = await res.json()
        setProducts((prev) => prev.map((p) => p.id === editId ? { ...updated, categories: updated.category_id ? catMap[updated.category_id] ?? null : null } : p))
        cancelEdit()
      }
    } else {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const created = await res.json()
        setProducts((prev) => [{ ...created, categories: created.category_id ? catMap[created.category_id] ?? null : null }, ...prev])
        cancelEdit()
      }
    }
    setFormLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  async function toggleAvailable(p: Product) {
    const res = await fetch(`/api/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: !p.is_available }) })
    if (res.ok) { const updated = await res.json(); setProducts((prev) => prev.map((x) => x.id === p.id ? { ...updated, categories: x.categories } : x)) }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#F5A623' }}>Products</p>
          <h1 className="text-[22px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>상품 관리</h1>
          <p className="text-[13px]" style={{ color: 'rgba(23,24,45,0.4)' }}>판매할 과일 상품을 등록하고 관리하세요.</p>
        </div>
        <button onClick={openAdd} className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white shrink-0 mt-1" style={{ background: '#F5A623' }}>
          <Plus size={14} /> 상품 추가
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="상품명 검색"
          className="flex-1 max-w-xs px-4 py-2.5 text-[14px] focus:outline-none"
          style={{ border: '1px solid rgba(23,24,45,0.15)', borderRadius: 12, color: '#17182D', background: '#FFFFFF' }}
        />
        <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.4)' }}>총 {total}개</span>
      </div>

    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop sidebar form */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="rounded-[20px] p-5 sticky top-6" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
          <h2 className="font-semibold text-[14px] mb-4" style={{ color: '#17182D' }}>{editId ? '상품 수정' : '상품 추가'}</h2>
          <ProductForm form={form} setForm={setForm} editId={editId} loading={formLoading} uploading={uploading} categories={categories} onSubmit={handleSubmit} onCancel={cancelEdit} fileRef={fileRef} onFileChange={handleFileChange} />
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 min-w-0">
        {/* Mobile list */}
        <div className="lg:hidden rounded-[20px] overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
          {!products.length && !scrollLoading ? (
            <p className="text-center py-10 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
              {debouncedSearch ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
            </p>
          ) : (
            <ul>
              {products.map((p, i) => {
                const [bt, bc] = (p.badge ?? '').split('|')
                return (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < products.length - 1 ? '1px solid rgba(23,24,45,0.06)' : 'none' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      : <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl" style={{ background: '#FFF0E5' }}>🍊</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[14px] truncate" style={{ color: '#17182D' }}>{p.name}</p>
                        {bt && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0" style={{ background: bc || '#F5A623' }}>{bt}</span>}
                      </div>
                      <p className="text-[13px]" style={{ color: '#F5A623' }}>{p.price.toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleAvailable(p)} className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={p.is_available ? { background: '#E5F3E9', color: '#15803d' } : { background: 'rgba(23,24,45,0.06)', color: 'rgba(23,24,45,0.4)' }}>
                        {p.is_available ? '판매중' : '숨김'}
                      </button>
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: '#F5A623', background: '#FFF8E1' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: '#ef4444', background: '#FEF2F2' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block rounded-[20px] overflow-x-auto" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}>
          <table className="w-full text-sm" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(23,24,45,0.05)' }}>
                {['상품명', '카테고리', '가격', '재고', '상태', '액션'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-medium whitespace-nowrap" style={{ color: 'rgba(23,24,45,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const [badgeText, badgeColor] = (p.badge ?? '').split('|')
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(23,24,45,0.04)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {p.image_url && <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-[14px] whitespace-nowrap" style={{ color: '#17182D' }}>{p.name}</p>
                            {badgeText && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: badgeColor || '#F5A623' }}>{badgeText}</span>}
                          </div>
                          {p.description && <p className="text-[12px] truncate max-w-[160px]" style={{ color: 'rgba(23,24,45,0.4)' }}>{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {p.categories?.name
                        ? <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#DCEBFF', color: '#1d4ed8' }}>{p.categories.name}</span>
                        : <span className="text-[12px]" style={{ color: 'rgba(23,24,45,0.3)' }}>—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] whitespace-nowrap" style={{ color: '#17182D' }}>{p.price.toLocaleString()}원</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={p.stock === 0 ? { background: 'rgba(23,24,45,0.06)', color: 'rgba(23,24,45,0.4)' } : p.stock <= 5 ? { background: '#FFF4B8', color: '#92400e' } : { background: '#E5F3E9', color: '#15803d' }}>
                        {p.stock}개
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button onClick={() => toggleAvailable(p)} className="text-[12px] px-2.5 py-1 rounded-full font-semibold" style={p.is_available ? { background: '#E5F3E9', color: '#15803d' } : { background: 'rgba(23,24,45,0.06)', color: 'rgba(23,24,45,0.4)' }}>
                        {p.is_available ? '판매중' : '숨김'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: '#F5A623', background: '#FFF8E1' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: '#ef4444', background: '#FEF2F2' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!products.length && !scrollLoading && (
            <p className="text-center py-10 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>
              {debouncedSearch ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-2 text-center">
        {scrollLoading && <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.35)' }}>불러오는 중...</span>}
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={cancelEdit}>
          <div className="flex-1" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} />
          <div className="rounded-t-[24px] px-5 pt-4 pb-8 overflow-y-auto" style={{ background: '#FFFFFF', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(23,24,45,0.15)' }} />
            </div>
            <h2 className="font-semibold text-[15px] mb-4" style={{ color: '#17182D' }}>{editId ? '상품 수정' : '상품 추가'}</h2>
            <ProductForm form={form} setForm={setForm} editId={editId} loading={formLoading} uploading={uploading} categories={categories} onSubmit={handleSubmit} onCancel={cancelEdit} fileRef={fileRef} onFileChange={handleFileChange} />
          </div>
        </div>
      )}
    </div>
  )
}
