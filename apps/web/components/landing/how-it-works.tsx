const STEPS = [
  {
    number: '01',
    title: 'Create your workspace',
    description:
      'Register in under a minute. Invite your team via a link, bulk email, or restrict access to your company domain.',
    visual: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.5" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.5" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.2" />
            </svg>
          </div>
          <div>
            <div className="mb-1 h-2.5 w-24 rounded-full bg-[#D1D5DB]" />
            <div className="h-2 w-32 rounded-full bg-[#E5E7EB]" />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#EEF2FF] px-4 py-2.5">
          <span className="text-xs font-medium text-[#4F46E5]">app.absencetrack.com/</span>
          <span className="rounded bg-[#4F46E5]/15 px-2 py-0.5 text-xs font-semibold text-[#4F46E5]">
            acme-corp
          </span>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Team submits requests',
    description:
      'Employees pick the absence type, date range, and add any notes or attachments. One tap to submit.',
    visual: (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0F0F0E]">New request</span>
          <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#D97706]">
            Pending
          </span>
        </div>
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-[#F3F4F6] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
            <span className="text-xs text-[#374151]">Vacation</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#F3F4F6] px-3 py-2">
            <svg className="h-3 w-3 text-[#9CA3AF]" fill="none" viewBox="0 0 16 16">
              <rect x="2" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 1.5v3M11 1.5v3M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xs text-[#374151]">Jun 10 – Jun 17 &middot; 6 days</span>
          </div>
        </div>
        <div className="h-8 w-full rounded-lg bg-[#0F0F0E] flex items-center justify-center">
          <span className="text-[11px] font-medium text-white">Submit request</span>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Managers approve instantly',
    description:
      'The team manager gets a notification and can approve, reject, or suggest new dates. The employee is notified either way.',
    visual: (
      <div className="space-y-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[10px] font-bold text-[#059669]">
              AK
            </div>
            <div>
              <div className="h-2 w-20 rounded-full bg-[#D1D5DB]" />
              <div className="mt-1 h-1.5 w-28 rounded-full bg-[#E5E7EB]" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-[#D1FAE5] py-1.5 text-center text-[11px] font-semibold text-[#059669]">
              ✓ Approve
            </div>
            <div className="flex-1 rounded-lg bg-[#F3F4F6] py-1.5 text-center text-[11px] font-medium text-[#6B7280]">
              ✕ Reject
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-[#D1FAE5] bg-[#F0FDF4] px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-[#059669]" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs text-[#059669]">Request approved · 6 days off confirmed</span>
        </div>
      </div>
    ),
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span
            className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#4F46E5]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            How it works
          </span>
          <h2
            className="text-4xl tracking-tight text-[#0F0F0E] md:text-5xl"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
          >
            Up and running
            <br />
            <span className="italic text-[#6B7280]">in minutes.</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={i} className="relative flex flex-col gap-6">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-4 top-5 hidden h-px w-8 bg-[#E5E7EB] md:block" />
              )}

              {/* Number */}
              <div className="flex items-center gap-3">
                <span
                  className="text-5xl font-bold text-[#0F0F0E]/8"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {step.number}
                </span>
              </div>

              {/* Visual */}
              <div className="rounded-2xl border border-[#0F0F0E]/8 bg-[#F9FAFB] p-5">
                {step.visual}
              </div>

              {/* Text */}
              <div>
                <h3
                  className="mb-2 text-lg font-semibold text-[#0F0F0E]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-[#6B7280]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
