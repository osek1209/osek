import { createServerClient } from '@/lib/supabase/server'
import type { Term } from '@/lib/types'
import TermsManager from './TermsManager'

export default async function AdminTermsPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('terms').select('*').order('sort_order').order('created_at')

  return (
    <div className="p-6 lg:p-8">
      <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#F5A623' }}>Terms</p>
      <h1 className="text-[22px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>약관 관리</h1>
      <p className="text-[13px] mb-8" style={{ color: 'rgba(23,24,45,0.4)' }}>
        회원가입 시 표시할 필수·선택 동의 항목을 관리하세요.
      </p>
      <TermsManager initialTerms={(data as Term[]) ?? []} />
    </div>
  )
}
