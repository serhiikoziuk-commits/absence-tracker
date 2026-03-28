import Link from 'next/link'

export function CtaBanner() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl px-10 py-20 text-center"
          style={{
            background: 'linear-gradient(135deg, #0F0F0E 0%, #1a1a2e 50%, #16213e 100%)',
          }}
        >
          {/* Background decoration */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '800px',
              height: '400px',
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 60%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Content */}
          <div className="relative">
            <h2
              className="mx-auto max-w-2xl text-4xl text-white md:text-5xl"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
            >
              Your team deserves{' '}
              <span className="italic" style={{ color: '#A5B4FC' }}>
                better than spreadsheets.
              </span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-lg text-[#9CA3AF]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Join hundreds of companies already using AbsenceTrack to manage team time off
              without the chaos.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-[#0F0F0E] shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              >
                Get started free
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none" viewBox="0 0 16 16"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-xl border border-white/15 px-7 py-3 text-sm font-medium text-white transition-all hover:border-white/30"
              >
                See all plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
