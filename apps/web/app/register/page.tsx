import type { Metadata } from 'next'
import { WorkspaceRegisterForm } from '@/components/auth/workspace-register-form'

export const metadata: Metadata = { title: 'Create your workspace — AbsenceTrack' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
              </svg>
            </span>
            <span className="font-semibold text-gray-900">AbsenceTrack</span>
          </a>
          <h1 className="text-2xl font-semibold text-gray-900">Create your workspace</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up your company&apos;s absence tracking in minutes.
          </p>
        </div>
        <WorkspaceRegisterForm />
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have a workspace?{' '}
          <span className="text-primary-600">Enter your workspace URL in the browser.</span>
        </p>
      </div>
    </div>
  )
}
