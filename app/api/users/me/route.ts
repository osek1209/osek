import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase/server'
import { getSession, setSessionCookie } from '@/lib/session'

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { name, currentPassword, newPassword } = await request.json()
  const supabase = createServerClient()

  if (newPassword) {
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', session.id)
      .single()

    if (!user || !(await bcrypt.compare(currentPassword ?? '', user.password_hash))) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(newPassword, 10)
    await supabase.from('users').update({ password_hash }).eq('id', session.id)
  }

  if (name && name.trim() !== session.name) {
    await supabase.from('users').update({ name: name.trim() }).eq('id', session.id)
    await setSessionCookie({ ...session, name: name.trim() })
  }

  return NextResponse.json({ success: true })
}
