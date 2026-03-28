import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingNavbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Terms of Use — AbsenceTrack',
  description: 'Terms of Use for AbsenceTrack — please read before using the service.',
}

const LAST_UPDATED = 'March 27, 2026'

export default function TermsPage() {
  return (
    <div className="landing-page min-h-screen">
      <LandingNavbar />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        {/* Header */}
        <div className="mb-12 border-b border-[#0F0F0E]/8 pb-8">
          <div className="mb-2 flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-[#9CA3AF] transition-colors hover:text-[#374151]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Home
            </Link>
            <span className="text-xs text-[#D1D5DB]">/</span>
            <span className="text-xs text-[#374151]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Terms of Use
            </span>
          </div>
          <h1
            className="mb-3 text-4xl text-[#0F0F0E]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}
          >
            Terms of Use
          </h1>
          <p className="text-sm text-[#9CA3AF]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content */}
        <div
          className="prose prose-sm max-w-none space-y-8 text-[#374151]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using AbsenceTrack (&ldquo;the Service&rdquo;), you agree to be bound by
              these Terms of Use (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do
              not use the Service. These Terms apply to all users, including workspace administrators
              and regular members.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              AbsenceTrack is a cloud-based team absence management platform that allows companies
              (&ldquo;Customers&rdquo;) to create workspaces for tracking employee vacations, sick
              leaves, and other types of time off. Each Customer workspace is logically isolated and
              independently managed.
            </p>
          </Section>

          <Section title="3. Account Registration & Workspaces">
            <p>
              To use the Service, the first user of a company must register a workspace with a unique
              identifier (slug). By registering, you represent that:
            </p>
            <ul>
              <li>You are at least 18 years of age.</li>
              <li>You are authorized to create the workspace on behalf of your organization.</li>
              <li>The information you provide is accurate and complete.</li>
            </ul>
            <p>
              You are responsible for maintaining the security of your account credentials and for all
              activities that occur under your workspace.
            </p>
          </Section>

          <Section title="4. User Roles & Responsibilities">
            <p>
              The Service assigns roles within each workspace: <strong>Admin</strong> (first
              registered user, with full management access) and <strong>User</strong> (standard
              member). Admins are responsible for:
            </p>
            <ul>
              <li>Managing workspace members, teams, and absence type configurations.</li>
              <li>Ensuring that their use of the Service complies with applicable employment laws.</li>
              <li>The accuracy of absence data entered into the Service.</li>
            </ul>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of any applicable regulations.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or another user&apos;s data.</li>
              <li>Upload malicious code, viruses, or harmful content.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
              <li>Resell, sublicense, or otherwise commercialize the Service without prior written consent.</li>
            </ul>
          </Section>

          <Section title="6. Data & Privacy">
            <p>
              Your privacy is important to us. Our{' '}
              <Link href="#" className="text-[#4F46E5] underline underline-offset-2">
                Privacy Policy
              </Link>{' '}
              describes how we collect, use, and protect your data. By using the Service, you consent
              to the data practices described therein.
            </p>
            <p>
              All workspace data is isolated using row-level security. We will never access, share, or
              sell your company&apos;s absence data to third parties, except as required by law.
            </p>
          </Section>

          <Section title="7. Subscription & Billing">
            <p>
              The Service is offered under a freemium model with paid subscription plans. By
              subscribing to a paid plan, you authorize AbsenceTrack to charge your payment method
              on a recurring basis according to the plan selected. You may cancel your subscription at
              any time; access continues until the end of the paid billing period.
            </p>
            <p>
              All fees are exclusive of taxes. AbsenceTrack reserves the right to modify pricing with
              30 days&apos; notice to active subscribers.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The Service, including its design, software, and content, is owned by AbsenceTrack and
              protected by intellectual property laws. You retain ownership of all data you upload to
              the Service. You grant AbsenceTrack a limited license to process your data solely to
              provide the Service.
            </p>
          </Section>

          <Section title="9. Availability & Support">
            <p>
              AbsenceTrack aims for high availability but does not guarantee uninterrupted access.
              Scheduled maintenance will be announced in advance where possible. Support is provided
              via email for all plans, with priority support for Enterprise customers.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              Either party may terminate the agreement at any time. Upon termination, you may export
              your data within 30 days. After this period, data may be permanently deleted. AbsenceTrack
              reserves the right to suspend or terminate workspaces that violate these Terms.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, AbsenceTrack shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of the
              Service. Our total liability shall not exceed the fees paid by you in the 12 months
              preceding the claim.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Material changes will be notified via email
              or an in-app notice at least 14 days before taking effect. Continued use of the Service
              after changes take effect constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For questions about these Terms, please contact us at{' '}
              <a
                href="mailto:legal@absencetrack.com"
                className="text-[#4F46E5] underline underline-offset-2"
              >
                legal@absencetrack.com
              </a>
              .
            </p>
          </Section>
        </div>

        {/* Back link */}
        <div className="mt-16 border-t border-[#0F0F0E]/8 pt-8">
          <Link
            href="/"
            className="text-sm text-[#6B7280] transition-colors hover:text-[#0F0F0E]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="mb-3 text-lg font-semibold text-[#0F0F0E]"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#4B5563]">{children}</div>
    </section>
  )
}
