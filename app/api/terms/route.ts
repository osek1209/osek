import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { title, content, is_required, is_active, sort_order } = await req.json()
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: '제목과 내용을 입력하세요' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('terms')
    .insert({ title: title.trim(), content: content.trim(), is_required: !!is_required, is_active: !!is_active, sort_order: sort_order ?? 0 })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
