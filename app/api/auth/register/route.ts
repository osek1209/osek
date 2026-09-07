import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase/server'
import { setSessionCookie } from '@/lib/session'

export async function POST(request: NextRequest) {
  const { name, phone, password } = await request.json()

  if (!name || !phone || !password) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 가입된 전화번호입니다.' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 10)
  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, phone, password_hash, role: 'customer' })
    .select('id, name, phone, role')
    .single()

  if (error || !user) {
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 })
  }

  await setSessionCookie({ id: user.id, name: user.name, phone: user.phone, role: user.role })
  return NextResponse.json({ success: true })
}
