import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80', bg: '#FFF0E5' },
  { src: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=700&q=80', bg: '#E5F3E9' },
  { src: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80', bg: '#DCEBFF' },
  { src: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=700&q=80', bg: '#FFF4B8' },
]

export default function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden" style={{ background: '#F8F8F5' }}>
      {/* Background blobs — static, no animation */}
      <div className="absolute pointer-events-none rounded-full" style={{ width: 500, height: 500, top: '-15%', right: '15%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 65%)' }} />
      <div className="absolute pointer-events-none rounded-full" style={{ width: 380, height: 380, bottom: '5%', right: '8%', filter: 'blur(70px)', background: 'radial-gradient(circle, rgba(229,243,233,0.8) 0%, transparent 65%)' }} />

      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-10 relative z-10 py-8 lg:py-0 lg:min-h-[88vh]">

        {/* Left: text */}
        <div className="flex-1 flex flex-col justify-center">
          <span
            className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase mb-6 px-4 py-2 rounded-full self-start"
            style={{ background: '#FFF0E5', color: '#F5A623' }}
          >
            ✦ 오색청과 송천점
          </span>

          <h1 className="font-black leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)', letterSpacing: '-0.03em', color: '#17182D' }}>
            매일 아침<br />
            직접 고른<br />
            <span style={{ color: '#F5A623' }}>신선한 과일</span>
          </h1>

          <p className="text-[15px] leading-relaxed mb-8" style={{ color: 'rgba(23,24,45,0.5)', maxWidth: 340 }}>
            제철 과일을 미리 예약하고 대기 없이 픽업하세요.
          </p>

          <div className="flex gap-3 flex-wrap mb-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-bold text-[15px] px-7 py-3.5 text-white transition-opacity hover:opacity-80"
              style={{ background: '#F5A623', borderRadius: 14 }}
            >
              지금 예약하기 <ArrowRight size={15} />
            </Link>
            {!isLoggedIn && (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 font-bold text-[15px] px-7 py-3.5 transition-opacity hover:opacity-80"
                style={{ background: '#FFFFFF', color: '#17182D', borderRadius: 14, border: '1.5px solid rgba(23,24,45,0.12)' }}
              >
                회원가입
              </Link>
            )}
          </div>

          <div className="flex gap-8">
            {[{ num: '매일', label: '직접 선별' }, { num: '100%', label: '실명 예약' }, { num: '0분', label: '픽업 대기' }].map((s) => (
              <div key={s.label}>
                <p className="text-[20px] font-black" style={{ color: '#17182D', letterSpacing: '-0.025em' }}>{s.num}</p>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: 'rgba(23,24,45,0.4)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mobile: 2 photo cards */}
          <div className="lg:hidden flex gap-3 mt-6" style={{ height: 180 }}>
            {[PHOTOS[0], PHOTOS[2]].map((p, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 18, overflow: 'hidden', background: p.bg }}>
                <img src={p.src} alt="과일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo collage — desktop only */}
        <div className="hidden lg:flex w-[47%] shrink-0 gap-3" style={{ height: 580 }}>
          <div className="flex-1 flex flex-col gap-3">
            <div style={{ flex: '1.65', borderRadius: 24, overflow: 'hidden', background: PHOTOS[0].bg }}>
              <img src={PHOTOS[0].src} alt="과일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, borderRadius: 24, overflow: 'hidden', background: PHOTOS[1].bg }}>
              <img src={PHOTOS[1].src} alt="과일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3" style={{ paddingTop: 44 }}>
            <div style={{ flex: 1, borderRadius: 24, overflow: 'hidden', background: PHOTOS[2].bg }}>
              <img src={PHOTOS[2].src} alt="과일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1.45', borderRadius: 24, overflow: 'hidden', background: PHOTOS[3].bg }}>
              <img src={PHOTOS[3].src} alt="과일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
