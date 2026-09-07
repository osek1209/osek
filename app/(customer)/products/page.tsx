import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import type { Product, Category } from '@/lib/types'
import ProductList from './ProductList'
import { MotionReveal } from '@/components/motion/MotionReveal'

export default async function ProductsPage() {
  const supabase = createServerClient()
  const [{ data: products }, { data: categories }, session] = await Promise.all([
    supabase.from('products').select('*').eq('is_available', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order').order('created_at'),
    getSession(),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 lg:py-12">
      <MotionReveal>
        <p className="text-[12px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#F5A623' }}>Products</p>
        <h1 className="text-[26px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>예약 상품</h1>
        <p className="text-[14px] mb-8" style={{ color: 'rgba(23,24,45,0.45)' }}>원하는 상품을 선택하고 수량을 지정한 뒤 예약해주세요.</p>
      </MotionReveal>
      <ProductList
        products={(products as Product[]) ?? []}
        categories={(categories as Category[]) ?? []}
      />
    </div>
  )
}
