import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import * as XLSX from 'xlsx'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('*, users(name, phone), reservation_items(quantity, products(name, price))')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).flatMap((r) =>
    (r.reservation_items ?? []).map((item: {
      quantity: number
      products: { name: string; price: number } | null
    }) => ({
      예약일시: new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      예약번호: r.id.slice(0, 8).toUpperCase(),
      이름: r.users?.name ?? '',
      전화번호: r.users?.phone ?? '',
      상품: item.products?.name ?? '',
      수량: item.quantity,
      단가: item.products?.price ?? 0,
      금액: (item.products?.price ?? 0) * item.quantity,
      상태: r.status,
      메모: r.note ?? '',
    }))
  )

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '예약내역')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reservations_${Date.now()}.xlsx"`,
    },
  })
}
