'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[#0F0F0E]/8 bg-[#FAFAF8]/90 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F46E5] transition-transform group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </span>
          <span
            className="text-[15px] font-semibold tracking-tight text-[#0F0F0E]"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            AbsenceTrack
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '/pricing' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-[#4B5563] transition-colors hover:bg-black/5 hover:text-[#0F0F0E]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="#"
            className="text-sm text-[#4B5563] transition-colors hover:text-[#0F0F0E]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#0F0F0E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1F2937] hover:shadow-md active:scale-[0.98]"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 text-[#4B5563] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[#0F0F0E]/8 bg-[#FAFAF8] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Pricing', href: '/pricing' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-3 py-2.5 text-sm text-[#374151] hover:bg-black/5"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[#0F0F0E]/8 pt-3">
              <Link
                href="#"
                className="rounded-md px-3 py-2.5 text-center text-sm text-[#374151] hover:bg-black/5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#0F0F0E] px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                Get started free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
