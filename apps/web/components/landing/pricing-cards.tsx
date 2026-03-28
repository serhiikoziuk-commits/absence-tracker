import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For small teams getting started.',
    users: 'Up to 5 users',
    highlight: false,
    cta: 'Get started free',
    href: '/register',
    features: [
      'Core absence tracking',
      'Shared calendar',
      '3 absence types',
      'Email OTP login',
      'Web app',
    ],
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For growing teams that need more.',
    users: 'Up to 25 users',
    highlight: true,
    badge: 'Most popular',
    cta: 'Start free trial',
    href: '/register?plan=starter',
    features: [
      'Everything in Free',
      'Custom absence types',
      'Google & Microsoft SSO',
      'File attachments',
      'Mobile app (iOS & Android)',
      'Email notifications',
    ],
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'For larger organisations.',
    users: 'Up to 100 users',
    highlight: false,
    cta: 'Start free trial',
    href: '/register?plan=pro',
    features: [
      'Everything in Starter',
      'API access',
      'Advanced reports & exports',
      'Custom approval workflows',
      'Priority support',
    ],
  },
]

export function PricingCards({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <div>
      {showTitle && (
        <div className="mb-14 text-center">
          <span
            className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#4F46E5]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Pricing
          </span>
          <h2
            className="text-4xl tracking-tight text-[#0F0F0E] md:text-5xl"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
          >
            Simple, honest pricing.
          </h2>
          <p
            className="mt-4 text-[#6B7280]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="relative flex flex-col rounded-2xl border bg-white p-7 transition-shadow hover:shadow-md"
            style={{
              borderColor: plan.highlight ? '#6366F1' : '#E5E7EB',
              boxShadow: plan.highlight
                ? '0 0 0 1px #6366F1, 0 8px 24px -4px rgba(99,102,241,0.15)'
                : undefined,
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-[#4F46E5] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h3
                className="mb-1 text-base font-semibold text-[#0F0F0E]"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {plan.name}
              </h3>
              <div className="mb-2 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold text-[#0F0F0E]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {plan.price}
                </span>
                <span className="text-sm text-[#9CA3AF]">{plan.period}</span>
              </div>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                {plan.description}
              </p>
              <div className="mt-3 inline-flex items-center rounded-lg bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                {plan.users}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={plan.href}
              className="mb-6 block rounded-xl py-2.5 text-center text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: plan.highlight ? '#4F46E5' : '#0F0F0E',
                color: 'white',
              }}
            >
              {plan.cta}
            </Link>

            {/* Features */}
            <ul className="flex flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-[#374151]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    style={{ color: plan.highlight ? '#4F46E5' : '#059669' }}
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Enterprise row */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#0F0F0E]/8 bg-white px-8 py-5 sm:flex-row">
        <div>
          <p
            className="font-semibold text-[#0F0F0E]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Enterprise
          </p>
          <p className="mt-0.5 text-sm text-[#6B7280]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Unlimited users · SLA · Dedicated support · Custom domain
          </p>
        </div>
        <Link
          href="mailto:sales@absencetrack.com"
          className="shrink-0 rounded-xl border border-[#0F0F0E]/15 px-5 py-2.5 text-sm font-semibold text-[#0F0F0E] transition-all hover:border-[#0F0F0E]/30 hover:shadow-xs"
        >
          Contact sales →
        </Link>
      </div>
    </div>
  )
}
