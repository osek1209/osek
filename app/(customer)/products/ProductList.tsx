'use client'

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ShoppingBag } from 'lucide-react'
import type { Product, Category } from '@/lib/types'
import { useCart } from '@/lib/CartContext'

const EASE = [0.32, 0.72, 0, 1] as const

export default function ProductList({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { cart, addToCart, updateQty, openDrawer } = useCart()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [toast, setToast] = useState('')

  function josa(word: string) {
    const code = word.charCodeAt(word.length - 1)
    if (code < 0xAC00 || code > 0xD7A3) return '이'
    return (code - 0xAC00) % 28 === 0 ? '가' : '이'
  }

  function handleAddToCart(p: Product) {
    addToCart(p)
    setToast(p.name)
    setTimeout(() => setToast(''), 1800)
  }

  const hasTabs = categories.length > 0
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === activeCategory)

  if (!products.length) {
    return (
      <div className="text-center py-32" style={{ color: 'rgba(23,24,45,0.35)' }}>
        <ShoppingBag size={32} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm">현재 예약 가능한 상품이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold text-white shadow-lg"
            style={{ background: 'rgba(23,24,45,0.85)', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}
          >
            <ShoppingBag size={13} />
            {toast}{josa(toast)} 담겼어요
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs */}
      {hasTabs && (
        <div className="flex gap-2 flex-wrap mb-5">
          {[{ id: 'all', name: '전체' }, ...categories].map((cat) => {
            const active = activeCategory === cat.id
            const count = cat.id === 'all' ? products.length : products.filter(p => p.category_id === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all"
                style={active
                  ? { background: '#F5A623', color: '#fff' }
                  : { background: '#FFFFFF', color: 'rgba(23,24,45,0.5)', border: '1px solid rgba(23,24,45,0.12)' }
                }
              >
                {cat.name} <span className="ml-1 font-normal opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      )}

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {filteredProducts.map((p) => {
          const inCart = cart.find((c) => c.product.id === p.id)
          const soldOut = p.stock === 0
          const lowStock = !soldOut && p.stock <= 10

          return (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
              }}
              className="rounded-[16px] overflow-hidden"
              style={{ background: '#FFFFFF', boxShadow: '0 2px 10px rgba(23,24,45,0.06)', opacity: soldOut ? 0.65 : 1 }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: 130, background: '#FFF0E5' }}>
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,166,35,0.12)' }} />
                  </div>
                )}
                {soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.78)' }}>
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(23,24,45,0.08)', color: 'rgba(23,24,45,0.45)' }}>품절</span>
                  </div>
                )}
                {(() => { const [bt, bc] = (p.badge ?? '').split('|'); return bt ? <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: bc || '#F5A623' }}>{bt}</span> : null })()}
                {lowStock && !soldOut && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF4B8', color: '#92400e' }}>
                    잔여 {p.stock}개
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-[13px] leading-snug mb-0.5" style={{ color: '#17182D' }}>{p.name}</h3>
                <p className="font-bold text-[13px] mb-2.5" style={{ color: '#F5A623' }}>{p.price.toLocaleString()}원</p>

                {soldOut ? (
                  <div className="w-full py-2 text-center text-[12px] rounded-[10px]" style={{ background: 'rgba(23,24,45,0.05)', color: 'rgba(23,24,45,0.3)' }}>
                    품절
                  </div>
                ) : inCart ? (
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      onClick={() => updateQty(p.id, -1)}
                      whileTap={{ scale: 0.92 }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                      style={{ border: '1px solid rgba(23,24,45,0.15)' }}
                    >
                      <Minus size={11} style={{ color: '#17182D' }} />
                    </motion.button>
                    <span className="font-bold text-[14px] flex-1 text-center" style={{ color: '#17182D' }}>{inCart.quantity}</span>
                    <motion.button
                      onClick={() => updateQty(p.id, 1)}
                      whileTap={{ scale: 0.92 }}
                      disabled={inCart.quantity >= p.stock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-40"
                      style={{ background: '#F5A623' }}
                    >
                      <Plus size={11} className="text-white" />
                    </motion.button>
                    <motion.button onClick={openDrawer} whileTap={{ scale: 0.96 }} className="ml-1">
                      <ShoppingBag size={15} style={{ color: '#F5A623' }} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleAddToCart(p)}
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-2 text-[12px] font-semibold rounded-[10px]"
                    style={{ border: '1.5px solid rgba(23,24,45,0.15)', color: '#17182D' }}
                  >
                    담기
                  </motion.button>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
