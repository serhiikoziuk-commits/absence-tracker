import type { Metadata } from 'next'
import { LandingNavbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { PricingCards } from '@/components/landing/pricing-cards'
import { CtaBanner } from '@/components/landing/cta-banner'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'AbsenceTrack — Simple Team Absence Management',
  description:
    'Track vacations, sick days, and time off for your entire team. Shared calendar, one-tap approvals, and automatic balance tracking.',
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen">
      <LandingNavbar />
      <Hero />

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-[#0F0F0E]/8" />
      </div>

      <Features />

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-[#0F0F0E]/8" />
      </div>

      <HowItWorks />

      {/* Pricing section on landing */}
      <section id="pricing" className="bg-[#F3F4F6]/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <PricingCards />
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  )
}
