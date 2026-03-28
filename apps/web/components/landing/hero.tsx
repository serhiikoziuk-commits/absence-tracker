import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #D1D5DB 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          opacity: 0.5,
        }}
      />

      {/* Indigo glow blob */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Eyebrow */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/25 bg-[#6366F1]/8 px-4 py-1.5 text-xs font-medium tracking-wide text-[#4F46E5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
            Now in public beta — free to get started
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mx-auto max-w-4xl text-center text-5xl leading-[1.1] tracking-tight text-[#0F0F0E] md:text-7xl"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
        >
          Every day off,{' '}
          <span className="relative inline-block">
            <span className="relative z-10 italic text-[#4F46E5]">accounted for.</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9 C 80 2, 220 2, 298 9"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </span>
        </h1>

        {/* Sub */}
        <p
          className="mx-auto mt-7 max-w-2xl text-center text-lg leading-relaxed text-[#6B7280]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          AbsenceTrack gives your team a single place to request, approve, and track
          vacations, sick days, and time off — without the back-and-forth.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#0F0F0E] px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <span>Start for free</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none" viewBox="0 0 16 16"
            >
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0F0F0E]/12 bg-white px-6 py-3 text-sm font-medium text-[#374151] shadow-xs transition-all hover:border-[#0F0F0E]/20 hover:shadow-sm"
          >
            View pricing
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-center text-xs text-[#9CA3AF]">
          No credit card required · Setup in under 5 minutes · Cancel anytime
        </p>

        {/* Product Mockup */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          {/* Glow behind mockup */}
          <div
            className="absolute inset-x-12 -top-6 h-24 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />

          {/* Browser chrome */}
          <div className="relative overflow-hidden rounded-2xl border border-[#0F0F0E]/10 bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)]">
            {/* Browser top bar */}
            <div className="flex items-center gap-3 border-b border-[#0F0F0E]/6 bg-[#F9FAFB] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 rounded-md bg-white border border-[#0F0F0E]/8 py-1 px-3 text-center">
                <span className="text-xs text-[#9CA3AF]">app.absencetrack.com/acme-corp/calendar</span>
              </div>
            </div>

            {/* App interior */}
            <div className="flex h-[420px] overflow-hidden">
              {/* Sidebar */}
              <div className="flex w-52 shrink-0 flex-col border-r border-[#0F0F0E]/6 bg-white p-3">
                <div className="mb-4 flex items-center gap-2 px-2 py-1">
                  <div className="h-6 w-6 rounded-md bg-[#4F46E5]" />
                  <div className="h-3 w-20 rounded-full bg-[#E5E7EB]" />
                </div>
                {[
                  { w: 'w-16', active: false },
                  { w: 'w-14', active: true },
                  { w: 'w-18', active: false },
                  { w: 'w-12', active: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${item.active ? 'bg-[#EEF2FF]' : ''}`}
                  >
                    <div className={`h-3.5 w-3.5 rounded-sm ${item.active ? 'bg-[#6366F1]' : 'bg-[#D1D5DB]'}`} />
                    <div className={`h-2.5 ${item.w} rounded-full ${item.active ? 'bg-[#6366F1]/40' : 'bg-[#E5E7EB]'}`} />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 overflow-hidden bg-[#F9FAFB] p-5">
                {/* Month header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-5 w-24 rounded-full bg-[#D1D5DB]" />
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-lg bg-white border border-[#E5E7EB]" />
                    <div className="h-7 w-7 rounded-lg bg-white border border-[#E5E7EB]" />
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                  {/* Day headers */}
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-[10px] font-medium text-[#9CA3AF]">{d}</div>
                    ))}
                  </div>
                  {/* Day cells */}
                  {[
                    [null, null, 1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10, 11, 12],
                    [13, 14, 15, 16, 17, 18, 19],
                    [20, 21, 22, 23, 24, 25, 26],
                    [27, 28, 29, 30, 31, null, null],
                  ].map((week, wi) => (
                    <div key={wi} className="mb-1 grid grid-cols-7 gap-1">
                      {week.map((day, di) => {
                        const hasDots = [3, 8, 9, 15, 16, 22].includes(day as number)
                        const isToday = day === 15
                        return (
                          <div key={di} className="flex flex-col items-center gap-0.5 py-0.5">
                            {day !== null ? (
                              <>
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium
                                    ${isToday ? 'bg-[#4F46E5] text-white' : 'text-[#374151]'}`}
                                >
                                  {day}
                                </span>
                                {hasDots && (
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: Math.min(3, (day as number) % 3 + 1) }).map((_, k) => (
                                      <span
                                        key={k}
                                        className="h-1 w-1 rounded-full"
                                        style={{
                                          background: ['#6366F1', '#F43F5E', '#F59E0B'][k % 3],
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>

                {/* Absence cards */}
                <div className="space-y-2">
                  {[
                    { name: 'Anna K.', type: 'Vacation', days: 'Mar 8–12', color: '#6366F1' },
                    { name: 'James T.', type: 'Sick Leave', days: 'Mar 9', color: '#F43F5E' },
                  ].map((card) => (
                    <div key={card.name} className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: card.color }}
                      />
                      <div className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
                      <div className="flex-1">
                        <div className="h-2 w-16 rounded-full bg-[#D1D5DB]" />
                      </div>
                      <div className="h-2 w-10 rounded-full bg-[#E5E7EB]" />
                      <div
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          background: card.color + '18',
                          color: card.color,
                        }}
                      >
                        {card.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
