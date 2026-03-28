'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sendOtp, verifyOtp } from '@/lib/actions/auth'
import { Loader2, ArrowLeft } from 'lucide-react'

interface OtpLoginFormProps {
  workspaceSlug: string
  prefillEmail?: string
}

export function OtpLoginForm({ workspaceSlug, prefillEmail = '' }: OtpLoginFormProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState(prefillEmail)
  const [otp, setOtp] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await sendOtp(email, workspaceSlug)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Check your email for the verification code.')
        setStep('otp')
      }
    })
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await verifyOtp(email, otp, workspaceSlug)
      if (result?.error) {
        toast.error(result.error)
        setOtp('')
      }
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <Input
            label="Work email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={isPending}
          />
          <Button type="submit" className="w-full" disabled={isPending || !email}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Continue with email
          </Button>
          <p className="text-center text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-600">Terms of Use</a>.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div className="mb-1 text-center">
            <p className="text-sm text-gray-600">
              Enter the verification code sent to
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>
          <Input
            label="Verification code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6,8}"
            maxLength={8}
            placeholder="00000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            disabled={isPending}
            className="text-center text-xl tracking-[0.3em]"
          />
          <Button type="submit" className="w-full" disabled={isPending || otp.length < 6}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Verify & sign in
          </Button>
          <button
            type="button"
            onClick={() => { setStep('email'); setOtp('') }}
            className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-3 w-3" /> Use a different email
          </button>
        </form>
      )}
    </div>
  )
}
