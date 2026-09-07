'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Product } from './types'

export type CartItem = { product: Product; quantity: number }

type CartCtx = {
  cart: CartItem[]
  note: string
  drawerOpen: boolean
  addToCart: (product: Product) => void
  updateQty: (productId: string, delta: number) => void
  removeFromCart: (productId: string) => void
  setNote: (note: string) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
  totalCount: number
  totalPrice: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [note, setNote] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  function addToCart(product: Product) {
    if (product.stock === 0) return
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => prev
      .map((c) => {
        if (c.product.id !== productId) return c
        const newQty = c.quantity + delta
        if (delta > 0 && newQty > c.product.stock) return c
        return { ...c, quantity: newQty }
      })
      .filter((c) => c.quantity > 0)
    )
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== productId))
  }

  function clearCart() {
    setCart([])
    setNote('')
  }

  const totalCount = cart.reduce((s, c) => s + c.quantity, 0)
  const totalPrice = cart.reduce((s, c) => s + c.product.price * c.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, note, drawerOpen,
      addToCart, updateQty, removeFromCart,
      setNote, clearCart,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      totalCount, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
