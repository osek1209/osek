'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ClipboardList, Tag, LogOut, Menu, X, Users, FileText } from 'lucide-react'

const navItems = [
  { href: '/admin', label: '대시보드', Icon: LayoutDashboard },
  { href: '/admin/categories', label: '카테고리', Icon: Tag },
  { href: '/admin/products', label: '상품 관리', Icon: Package },
  { href: '/admin/reservations', label: '예약 관리', Icon: ClipboardList },
  { href: '/admin/users', label: '회원 관리', Icon: Users },
  { href: '/admin/terms', label: '약관 관리', Icon: FileText },
]

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}

function NavItems({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <>
      {navItems.map(({ href, label, Icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[14px]"
            style={active
              ? { background: '#FFF0E5', color: '#F5A623', fontWeight: 600 }
              : { color: 'rgba(23,24,45,0.55)' }
            }
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </>
  )
}

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const brand = (
    <div className="flex items-center gap-2.5">
      <img src="/logo.png" alt="오색청과" style={{ height: 30, width: 30, objectFit: 'contain' }} />
      <div>
        <p className="font-bold text-sm leading-none" style={{ color: '#17182D' }}>오색청과</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(23,24,45,0.4)' }}>관리자</p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{ height: 56, background: '#FFFFFF', borderBottom: '1px solid rgba(23,24,45,0.07)' }}
      >
        {brand}
        <button onClick={() => setOpen(true)} style={{ color: '#17182D' }}>
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile slide-in overlay (right) ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end" onClick={() => setOpen(false)}>
          <div className="flex-1 bg-black/30 backdrop-blur-sm" />
          <div
            className="w-72 h-full flex flex-col"
            style={{ background: '#FFFFFF', boxShadow: '-4px 0 24px rgba(23,24,45,0.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(23,24,45,0.07)' }}>
              {brand}
              <button onClick={() => setOpen(false)} style={{ color: 'rgba(23,24,45,0.4)' }}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <NavItems pathname={pathname} onClose={() => setOpen(false)} />
            </nav>
            <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(23,24,45,0.07)' }}>
              <p className="text-[13px] font-medium mb-2" style={{ color: '#17182D' }}>{name}</p>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-60"
                style={{ color: 'rgba(23,24,45,0.4)' }}
              >
                <LogOut size={13} /> 로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col" style={{ background: '#FFFFFF', borderRight: '1px solid rgba(23,24,45,0.07)' }}>
        <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(23,24,45,0.06)' }}>
          {brand}
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <NavItems pathname={pathname} />
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid rgba(23,24,45,0.06)' }}>
          <p className="text-[12px] font-medium mb-2" style={{ color: '#17182D' }}>{name}</p>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-60"
            style={{ color: 'rgba(23,24,45,0.4)' }}
          >
            <LogOut size={12} /> 로그아웃
          </button>
        </div>
      </aside>
    </>
  )
}
