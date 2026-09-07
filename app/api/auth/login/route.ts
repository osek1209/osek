import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase/server'
import { setSessionCookie } from '@/lib/session'

export async function POST(request: NextRequest) {
  const { phone, password } = await request.json()

  if (!phone || !password) {
    return NextResponse.json({ error: '전화번호와 비밀번호를 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, name, phone, role, password_hash')
    .eq('phone', phone)
    .single()

  if (!user) {
    return NextResponse.json({ error: '전화번호 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: '전화번호 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  await setSessionCookie({ id: user.id, name: user.name, phone: user.phone, role: user.role })
  return NextResponse.json({ success: true, role: user.role })
}
