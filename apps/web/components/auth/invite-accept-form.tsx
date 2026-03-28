'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sendOtp, acceptInvite } from '@/lib/actions/auth'
import { Loader2, ArrowLeft } from 'lucide-react'

interface InviteAcceptFormProps {
  token: string
  prefillEmail: string
}

type Step = 'email' | 'otp' | 'profile'

export function InviteAcceptForm({ token, prefillEmail }: InviteAcceptFormProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(prefillEmail)
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isPending, startTransition] = useTransition()

  // Extract workspace slug from URL
  const workspaceSlug = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1]
    : ''

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

  function handleVerifyAndProceed(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length === 6) setStep('profile')
  }

  function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await acceptInvite(token, email, otp, firstName, lastName)
      if (result?.error) {
        toast.error(result.error)
        setStep('otp')
      }
    })
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleSendOtp} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
        <Input
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          disabled={isPending || !!prefillEmail}
          helper={prefillEmail ? 'This invite is tied to this email address.' : undefined}
        />
        <Button type="submit" className="w-full" disabled={isPending || !email}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Continue
        </Button>
      </form>
    )
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyAndProceed} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>
        <Input
          label="Verification code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
          autoFocus
          className="text-center text-xl tracking-[0.3em]"
        />
        <Button type="submit" className="w-full" disabled={otp.length !== 6}>
          Continue
        </Button>
        <button type="button" onClick={() => setStep('email')} className="flex w-full items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleComplete} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
      <p className="text-sm font-medium text-gray-700">Almost there — what&apos;s your name?</p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoFocus disabled={isPending} />
        <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isPending} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !firstName}>
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Join workspace →
      </Button>
    </form>
  )
}
