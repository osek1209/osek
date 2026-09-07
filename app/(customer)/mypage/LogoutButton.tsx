'use client'

import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <button
      onClick={logout}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-[14px] font-semibold transition-opacity hover:opacity-80"
      style={{ background: '#FFFFFF', color: 'rgba(23,24,45,0.5)', border: '1px solid rgba(23,24,45,0.1)', boxShadow: '0 2px 12px rgba(23,24,45,0.06)' }}
    >
      <LogOut size={15} />
      로그아웃
    </button>
  )
}
