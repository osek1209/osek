import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { ArrowRight } from 'lucide-react'
import HeroSection from './HeroSection'
import type { Product } from '@/lib/types'

export default async function LandingPage() {
  const supabase = createServerClient()
  const [session, { data: products }] = await Promise.all([
    getSession(),
    supabase.from('products').select('id, name, price, image_url, badge, stock').eq('is_available', true).order('created_at', { ascending: false }).limit(6),
  ])

  return (
    <div>
      <HeroSection isLoggedIn={!!session} />

      {/* Products */}
      <section className="py-10 md:py-16" style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: '#F5A623' }}>Today&apos;s Pick</p>
              <h2 className="text-[20px] md:text-[28px] font-bold" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>지금 예약 가능한 상품</h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-[13px] font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-70 shrink-0"
              style={{ color: '#F5A623', border: '1.5px solid rgba(245,166,35,0.3)' }}
            >
              전체보기 <ArrowRight size={13} />
            </Link>
          </div>

          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {(products as Product[]).map((p) => (
                  <Link
                    key={p.id}
                    href="/products"
                    className="group block rounded-[16px] overflow-hidden"
                    style={{ background: '#F8F8F5', boxShadow: '0 2px 8px rgba(23,24,45,0.06)' }}
                  >
                    <div className="h-32 md:h-44 overflow-hidden relative" style={{ background: '#FFF0E5' }}>
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-4xl">🍊</div>
                      )}
                      {(() => { const [bt, bc] = (p.badge ?? '').split('|'); return bt ? <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: bc || '#F5A623' }}>{bt}</span> : null })()}
                    </div>
                    <div className="p-3 md:p-4">
                      <p className="font-bold text-[13px] md:text-[14px] truncate mb-0.5" style={{ color: '#17182D' }}>{p.name}</p>
                      <p className="font-black text-[15px] md:text-[17px]" style={{ color: '#F5A623' }}>{p.price.toLocaleString()}원</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-5 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-[14px] font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#F8F8F5', color: '#17182D', border: '1px solid rgba(23,24,45,0.1)' }}
                >
                  상품 전체보기 <ArrowRight size={14} />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[14px]" style={{ color: 'rgba(23,24,45,0.35)' }}>현재 등록된 상품이 없습니다.</div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 md:py-16" style={{ background: '#F8F8F5' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1 text-center" style={{ color: '#F5A623' }}>How it works</p>
          <h2 className="text-[20px] md:text-[26px] font-bold text-center mb-6 md:mb-10" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>3단계면 완료</h2>
          {/* Mobile: vertical step list */}
          <div className="flex flex-col gap-2 md:hidden">
            {[
              { step: '01', title: '회원가입', desc: '이름·연락처로 가입', bg: '#FFF0E5', color: '#F5A623' },
              { step: '02', title: '상품 선택', desc: '수량 지정해서 담기', bg: '#DCEBFF', color: '#1d4ed8' },
              { step: '03', title: '픽업', desc: '방문 후 현장 결제', bg: '#E5F3E9', color: '#15803d' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl" style={{ background: '#FFFFFF', boxShadow: '0 1px 6px rgba(23,24,45,0.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <span className="text-[11px] font-black" style={{ color: s.color }}>{s.step}</span>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold leading-tight" style={{ color: '#17182D' }}>{s.title}</h3>
                  <p className="text-[12px]" style={{ color: 'rgba(23,24,45,0.5)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: card grid */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {[
              { step: '01', title: '회원가입', desc: '이름·연락처로 가입', bg: '#FFF0E5', color: '#F5A623' },
              { step: '02', title: '상품 선택', desc: '수량 지정해서 담기', bg: '#DCEBFF', color: '#1d4ed8' },
              { step: '03', title: '픽업', desc: '방문 후 현장 결제', bg: '#E5F3E9', color: '#15803d' },
            ].map((s) => (
              <div key={s.step} className="rounded-[20px] p-8" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(23,24,45,0.05)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: s.bg }}>
                  <span className="text-[13px] font-black" style={{ color: s.color }}>{s.step}</span>
                </div>
                <h3 className="text-[18px] font-bold mb-1" style={{ color: '#17182D' }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(23,24,45,0.5)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-12" style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="rounded-[24px] px-6 py-8 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8" style={{ background: '#FFF0E5' }}>
            <div>
              <h2 className="text-[20px] md:text-[26px] font-bold mb-1" style={{ color: '#17182D', letterSpacing: '-0.02em' }}>지금 바로 시작하세요</h2>
              <p className="text-[13px] md:text-[15px]" style={{ color: 'rgba(23,24,45,0.5)' }}>회원가입 1분이면 첫 예약 완료</p>
            </div>
            <Link
              href="/register"
              className="shrink-0 inline-flex items-center gap-2 font-bold text-[14px] md:text-[15px] text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl transition-opacity hover:opacity-85"
              style={{ background: '#F5A623', whiteSpace: 'nowrap' }}
            >
              무료 회원가입 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
