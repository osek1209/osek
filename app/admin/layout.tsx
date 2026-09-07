import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F8F5' }}>
      <AdminSidebar name={session.name} />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  )
}
