import { createServerClient } from '@/lib/supabase/server'
import type { Category, Product } from '@/lib/types'
import CategoryManager from './CategoryManager'

export default async function AdminCategoriesPage() {
  const supabase = createServerClient()
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order').order('created_at'),
    supabase.from('products').select('*, categories(id, name)').eq('is_available', true).order('created_at', { ascending: false }),
  ])

  return (
    <div className="p-6 lg:p-8">
      <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#F5A623' }}>Categories</p>
      <h1 className="text-[22px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>카테고리 관리</h1>
      <p className="text-[13px] mb-8" style={{ color: 'rgba(23,24,45,0.4)' }}>
        카테고리를 만들고 상품 카드를 드래그해서 배정하세요.
      </p>
      <CategoryManager
        initialCategories={(categories as Category[]) ?? []}
        initialProducts={(products as Product[]) ?? []}
      />
    </div>
  )
}
