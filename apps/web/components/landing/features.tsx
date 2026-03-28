const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: 'Shared team calendar',
    description:
      'See who\'s out at a glance. Dot indicators on each day show exactly how many people are absent, with full breakdowns below.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    ),
    title: 'One-tap approvals',
    description:
      'Managers get notified instantly. Approve, reject, or suggest modified dates — all from a single view, with optional comments.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 6h18M3 12h12M3 18h8" strokeLinecap="round" />
        <circle cx="19" cy="17" r="3" />
        <path d="M19 15.5v1.5l1 1" strokeLinecap="round" />
      </svg>
    ),
    title: 'Auto-tracked balances',
    description:
      'Configure accrual rules once. Vacation, sick leave, and custom types accrue automatically — monthly or yearly, your choice.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
      </svg>
    ),
    title: 'Teams & workspaces',
    description:
      'Organize people into teams with dedicated managers. Each company gets its own isolated workspace — secure and private.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M9 7h6M9 11h6M9 15h4" strokeLinecap="round" />
      </svg>
    ),
    title: 'Attachment support',
    description:
      'Require medical certificates for sick leave. Users attach PDFs or images right to their request — no emails needed.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Mobile-first',
    description:
      'Full-featured iOS and Android apps. Submit requests, check your balance, or approve a teammate\'s vacation from anywhere.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section label */}
        <div className="mb-14 text-center">
          <span
            className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#4F46E5]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Features
          </span>
          <h2
            className="text-4xl tracking-tight text-[#0F0F0E] md:text-5xl"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
          >
            Everything your team needs.
            <br />
            <span className="italic text-[#6B7280]">Nothing it doesn't.</span>
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-[#0F0F0E]/8 bg-[#0F0F0E]/8 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="group flex flex-col gap-4 bg-[#FAFAF8] p-8 transition-colors hover:bg-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0F0F0E]/8 bg-white text-[#4F46E5] shadow-xs transition-shadow group-hover:shadow-sm">
                {feature.icon}
              </div>
              <div>
                <h3
                  className="mb-2 text-base font-semibold text-[#0F0F0E]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-[#6B7280]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
