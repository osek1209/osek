import Link from 'next/link'
import { getSession } from '@/lib/session'
import CustomerHeader from './CustomerHeader'
import CartDrawer from './CartDrawer'
import { CartProvider } from '@/lib/CartContext'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col" style={{ background: '#F8F8F5' }}>
        <CustomerHeader session={session ? { name: session.name } : null} />

        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        <CartDrawer isLoggedIn={!!session} />

        <footer className="hidden md:block mt-16" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(23,24,45,0.07)' }}>
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="오색청과" style={{ height: 22, width: 22, objectFit: 'contain' }} />
              <p className="font-bold text-[14px]" style={{ color: '#17182D' }}>오색청과</p>
            </div>
            <div className="flex gap-6 text-[13px]">
              <Link href="/products" className="hover:opacity-70 transition-opacity" style={{ color: 'rgba(23,24,45,0.45)' }}>상품 예약</Link>
              <Link href="/mypage" className="hover:opacity-70 transition-opacity" style={{ color: 'rgba(23,24,45,0.45)' }}>내 예약</Link>
              <Link href="/login" className="hover:opacity-70 transition-opacity" style={{ color: 'rgba(23,24,45,0.45)' }}>로그인</Link>
            </div>
            <p className="text-[12px]" style={{ color: 'rgba(23,24,45,0.3)' }}>© 2025 오색청과</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
