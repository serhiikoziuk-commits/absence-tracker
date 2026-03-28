import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNavbar } from '@/components/landing/navbar'
import { PricingCards } from '@/components/landing/pricing-cards'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Pricing — AbsenceTrack',
  description:
    'Simple, honest pricing for teams of all sizes. Start free, upgrade when you grow.',
}

const FAQ = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — all paid plans include a 14-day free trial with no credit card required. You can upgrade, downgrade, or cancel any time.',
  },
  {
    q: 'What happens when we exceed the user limit?',
    a: 'We\'ll notify you when you\'re close. You can upgrade your plan at any time — we won\'t cut off access abruptly.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. Upgrades are instant and prorated. Downgrades take effect at the next billing cycle.',
  },
  {
    q: 'How does billing work?',
    a: 'Plans are billed monthly or annually (annual saves ~20%). All billing is handled securely through Stripe.',
  },
  {
    q: 'What counts as a "user"?',
    a: 'Any active workspace member counts as a user. Blocked or invited (not yet accepted) members do not count toward the limit.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is isolated per workspace using row-level security. We never share your data with other customers.',
  },
]

export default function PricingPage() {
  return (
    <div className="landing-page min-h-screen">
      <LandingNavbar />

      {/* Hero */}
      <section className="pb-6 pt-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span
            className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#4F46E5]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Pricing
          </span>
          <h1
            className="text-5xl tracking-tight text-[#0F0F0E] md:text-6xl"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
          >
            Simple, honest pricing.
          </h1>
          <p
            className="mt-5 text-lg text-[#6B7280]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            All plans include a 14-day free trial.
            <br />
            No credit card required to start.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <PricingCards showTitle={false} />
        </div>
      </section>

      {/* Feature comparison note */}
      <section className="py-6">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            All plans include unlimited absence types (Free: 3), shared calendar, push notifications,
            invite links, and GDPR-compliant data storage in the EU.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2
            className="mb-12 text-center text-3xl tracking-tight text-[#0F0F0E]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
          >
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[#0F0F0E]/8">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#0F0F0E] marker:hidden"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {item.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-[#9CA3AF] transition-transform group-open:rotate-45"
                    fill="none" viewBox="0 0 20 20"
                  >
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <p
                  className="mt-3 text-sm leading-relaxed text-[#6B7280]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Still unsure? */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-[#0F0F0E]/8 bg-white px-10 py-10 text-center">
            <h3
              className="mb-2 text-2xl text-[#0F0F0E]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
            >
              Still not sure?
            </h3>
            <p className="mb-6 text-sm text-[#6B7280]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Try AbsenceTrack free for 14 days — no commitment, no credit card.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="rounded-xl bg-[#0F0F0E] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1F2937]"
              >
                Start your free trial
              </Link>
              <Link
                href="mailto:hello@absencetrack.com"
                className="rounded-xl border border-[#0F0F0E]/12 px-6 py-2.5 text-sm font-medium text-[#374151] transition-all hover:border-[#0F0F0E]/25"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
