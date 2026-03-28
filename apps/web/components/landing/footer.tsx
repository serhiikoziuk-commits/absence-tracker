import Link from 'next/link'

const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: 'mailto:hello@absencetrack.com' },
  ],
  Legal: [
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[#0F0F0E]/8 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F46E5]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
                </svg>
              </span>
              <span
                className="text-[15px] font-semibold text-[#0F0F0E]"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                AbsenceTrack
              </span>
            </Link>
            <p
              className="mt-4 max-w-[220px] text-sm leading-relaxed text-[#6B7280]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Simple, modern absence management for teams of all sizes.
            </p>
            {/* App store badges placeholder */}
            <div className="mt-5 flex gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-[#0F0F0E]/10 bg-[#F9FAFB] px-3 py-1.5">
                <svg className="h-4 w-4 text-[#374151]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.79.03 2.99 2.63 3.99 2.66 4l-.05.12zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-xs font-medium text-[#374151]">App Store</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#0F0F0E]/10 bg-[#F9FAFB] px-3 py-1.5">
                <svg className="h-4 w-4 text-[#374151]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.18 23.5a1 1 0 01-.59-.19 1 1 0 01-.41-.81V1.5a1 1 0 01.41-.81 1 1 0 011.07-.07l18 10.5a1 1 0 010 1.76l-18 10.5a1 1 0 01-.48.12z"/>
                </svg>
                <span className="text-xs font-medium text-[#374151]">Google Play</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#374151]"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B7280] transition-colors hover:text-[#0F0F0E]"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-[#0F0F0E]/6 pt-8 sm:flex-row">
          <p
            className="text-xs text-[#9CA3AF]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            © {new Date().getFullYear()} AbsenceTrack. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-[#9CA3AF]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <span>Built with care for teams everywhere</span>
            <span className="text-[#F43F5E]">♥</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
