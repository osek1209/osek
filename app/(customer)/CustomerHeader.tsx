'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Home, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/CartContext'

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/'
}

export default function CustomerHeader({ session }: { session: { name: string } | null }) {
  const pathname = usePathname()
  const { totalCount, openDrawer } = useCart()

  const bottomNav = [
    { href: '/', label: '홈', Icon: Home },
    { href: '/products', label: '상품', Icon: ShoppingBag },
    { href: session ? '/mypage' : '/login', label: session ? '마이페이지' : '로그인', Icon: User },
  ]

  return (
    <>
      {/* ── Top header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(248,248,245,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(23,24,45,0.07)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 lg:px-10 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="오색청과" style={{ height: 28, width: 28, objectFit: 'contain' }} />
            <span className="font-bold text-[16px]" style={{ color: '#17182D', letterSpacing: '-0.01em' }}>오색청과</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {[{ href: '/', label: '홈' }, { href: '/products', label: '상품 예약' }, { href: '/mypage', label: '마이페이지', authOnly: true }].map(({ href, label, authOnly }) => {
              if (authOnly && !session) return null
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link key={href} href={href} className="text-[14px] transition-opacity hover:opacity-60" style={{ color: active ? '#F5A623' : 'rgba(23,24,45,0.55)', fontWeight: active ? 700 : 500 }}>
                  {label}
                </Link>
              )
            })}

            {session ? (
              <button onClick={logout} className="text-[13px] transition-opacity hover:opacity-60" style={{ color: 'rgba(23,24,45,0.4)' }}>
                로그아웃
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-[13px] font-semibold transition-opacity hover:opacity-80 px-4 py-2 rounded-xl" style={{ border: '1.5px solid rgba(23,24,45,0.15)', color: '#17182D' }}>로그인</Link>
                <Link href="/register" className="text-[13px] font-semibold text-white transition-opacity hover:opacity-80 px-4 py-2 rounded-xl" style={{ background: '#F5A623' }}>회원가입</Link>
              </div>
            )}

            <button onClick={openDrawer} className="relative transition-opacity hover:opacity-60" style={{ color: 'rgba(23,24,45,0.55)' }}>
              <ShoppingBag size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-white flex items-center justify-center" style={{ background: '#F5A623', borderRadius: '50%', width: 16, height: 16 }}>
                  {totalCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile: cart icon top-right */}
          <button onClick={openDrawer} className="md:hidden relative p-1" style={{ color: '#17182D' }}>
            <ShoppingBag size={22} />
            {totalCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: '#F5A623', borderRadius: '50%', width: 17, height: 17 }}
              >
                {totalCount}
              </motion.span>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(23,24,45,0.08)',
          height: 60,
        }}
      >
        {bottomNav.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <Icon size={20} style={{ color: active ? '#F5A623' : 'rgba(23,24,45,0.3)' }} />
              <span className="text-[10px] font-semibold" style={{ color: active ? '#F5A623' : 'rgba(23,24,45,0.3)' }}>{label}</span>
            </Link>
          )
        })}
      </nav>

    </>
  )
}
