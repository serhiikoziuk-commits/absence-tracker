import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OtpLoginForm } from '@/components/auth/otp-login-form'

export const metadata: Metadata = { title: 'Sign In' }

interface LoginPageProps {
  params: Promise<{ workspace: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { workspace: slug } = await params
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, logo_url')
    .eq('slug', slug)
    .single()

  if (!workspace) notFound()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Sign in to {workspace.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            We&apos;ll send a 6-digit code to your email.
          </p>
        </div>
        <OtpLoginForm workspaceSlug={slug} />
      </div>
    </div>
  )
}
