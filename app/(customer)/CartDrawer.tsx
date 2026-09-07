'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, AlertCircle } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

const EASE = [0.32, 0.72, 0, 1] as const

export default function CartDrawer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { cart, note, drawerOpen, closeDrawer, updateQty, removeFromCart, setNote, clearCart, totalCount, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nextDay, setNextDay] = useState(false)
  const router = useRouter()

  async function handleReserve() {
    if (!isLoggedIn) { closeDrawer(); router.push('/login'); return }
    if (!cart.length) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map((c) => ({ product_id: c.product.id, quantity: c.quantity })),
        note: nextDay ? `[내일 픽업 요청]${note ? ' ' + note : ''}` : note,
      }),
    })
    setLoading(false)
    if (res.ok) {
      clearCart()
      closeDrawer()
      router.push('/mypage')
    } else {
      const data = await res.json()
      setError(data.error ?? '예약 중 오류가 발생했습니다.')
    }
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />

          {/* Drawer — bottom sheet on mobile, right panel on desktop */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-96 z-50 flex flex-col"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85vh',
              boxShadow: '0 -8px 40px rgba(23,24,45,0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: EASE }}
          >
              {/* Handle bar (mobile) */}
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(23,24,45,0.15)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(23,24,45,0.07)' }}>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} style={{ color: '#17182D' }} />
                  <span className="font-bold text-[15px]" style={{ color: '#17182D' }}>장바구니</span>
                  {totalCount > 0 && (
                    <span className="text-[11px] font-bold text-white flex items-center justify-center" style={{ background: '#F5A623', borderRadius: '50%', width: 20, height: 20 }}>
                      {totalCount}
                    </span>
                  )}
                </div>
                <button onClick={closeDrawer} style={{ color: 'rgba(23,24,45,0.4)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingBag size={32} style={{ color: 'rgba(23,24,45,0.2)' }} className="mb-3" />
                    <p className="text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>담은 상품이 없습니다.</p>
                    <button
                      onClick={closeDrawer}
                      className="mt-4 text-[13px] font-semibold underline"
                      style={{ color: '#F5A623' }}
                    >
                      상품 보러가기
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((c) => (
                      <li key={c.product.id} className="flex items-center gap-3">
                        {c.product.image_url && (
                          <img src={c.product.image_url} alt={c.product.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate" style={{ color: '#17182D' }}>{c.product.name}</p>
                          <p className="text-[12px]" style={{ color: 'rgba(23,24,45,0.45)' }}>{c.product.price.toLocaleString()}원</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => updateQty(c.product.id, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg"
                              style={{ border: '1px solid rgba(23,24,45,0.15)' }}
                            >
                              <Minus size={11} style={{ color: '#17182D' }} />
                            </button>
                            <span className="font-bold text-[14px] w-5 text-center" style={{ color: '#17182D' }}>{c.quantity}</span>
                            <button
                              onClick={() => updateQty(c.product.id, 1)}
                              disabled={c.quantity >= c.product.stock}
                              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-40"
                              style={{ background: '#F5A623' }}
                            >
                              <Plus size={11} className="text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[13px] font-bold" style={{ color: '#17182D' }}>{(c.product.price * c.quantity).toLocaleString()}원</p>
                          <button onClick={() => removeFromCart(c.product.id)} className="mt-1">
                            <X size={13} style={{ color: 'rgba(23,24,45,0.25)' }} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-5" style={{ borderTop: '1px solid rgba(23,24,45,0.07)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.5)' }}>합계</span>
                    <span className="font-bold text-[17px]" style={{ color: '#17182D' }}>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="요청사항 (선택)"
                    rows={2}
                    className="w-full text-[13px] resize-none mb-2 px-3 py-2.5 focus:outline-none leading-relaxed placeholder:text-neutral-300"
                    style={{ border: '1px solid rgba(23,24,45,0.15)', borderRadius: 10, color: '#17182D' }}
                  />
                  <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={nextDay}
                      onChange={(e) => setNextDay(e.target.checked)}
                      className="w-4 h-4 rounded accent-orange-400"
                    />
                    <span className="text-[13px]" style={{ color: 'rgba(23,24,45,0.6)' }}>내일 픽업 요청</span>
                  </label>
                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 mb-3 text-[12px]" style={{ background: '#FFF0E5', borderRadius: 10, color: '#c2410c' }}>
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                  <p className="text-[11px] mb-3" style={{ color: 'rgba(23,24,45,0.35)' }}>결제는 픽업 시 현장에서 진행됩니다</p>
                  <button
                    onClick={handleReserve}
                    disabled={loading}
                    className="w-full py-4 font-bold text-[15px] text-white rounded-[14px] disabled:opacity-50"
                    style={{ background: '#F5A623' }}
                  >
                    {loading ? '예약 중...' : isLoggedIn ? '예약 완료하기' : '로그인 후 예약하기'}
                  </button>
                </div>
              )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
