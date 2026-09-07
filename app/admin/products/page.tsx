import { createServerClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/lib/types'
import ProductManager from './ProductManager'

export default async function AdminProductsPage() {
  const supabase = createServerClient()
  const [{ data: products, count }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0, 19),
    supabase.from('categories').select('*').order('sort_order').order('created_at'),
  ])

  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]))
  const enriched = (products ?? []).map((p) => ({
    ...p,
    categories: p.category_id ? catMap[p.category_id] ?? null : null,
  }))

  return (
    <div className="p-5 lg:p-8">
      <ProductManager
        initialProducts={enriched as Product[]}
        initialTotal={count ?? 0}
        categories={(categories as Category[]) ?? []}
      />
    </div>
  )
}
