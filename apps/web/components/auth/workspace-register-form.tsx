'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { registerWorkspace, completeRegistration } from '@/lib/actions/auth'
import { slugify } from '@/lib/utils'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

type Step = 'details' | 'otp' | 'profile'

export function WorkspaceRegisterForm() {
  const [step, setStep] = useState<Step>('details')
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isPending, startTransition] = useTransition()

  // Auto-generate slug from company name
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(companyName))
    }
  }, [companyName, slugManuallyEdited])

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('company_name', companyName)
    fd.append('email', email)
    fd.append('slug', slug)

    startTransition(async () => {
      const result = await registerWorkspace(fd)
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
      // After OTP we go to profile step — verifyOtp handled in completeRegistration
      setStep('profile')
    })
  }

  function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await completeRegistration(slug, companyName, email, otp, firstName, lastName)
      if (result?.error) {
        toast.error(result.error)
        setStep('otp')
      }
    })
  }

  if (step === 'details') {
    return (
      <form onSubmit={handleRegister} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
        <Input
          label="Company name"
          placeholder="Acme Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          autoFocus
          disabled={isPending}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Workspace URL</label>
          <div className="flex items-center rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
            <span className="pl-3 text-sm text-gray-400 whitespace-nowrap">absencetrack.com/</span>
            <input
              type="text"
              className="flex-1 bg-transparent py-2 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="acme-corp"
              value={slug}
              onChange={(e) => {
                setSlugManuallyEdited(true)
                setSlug(slugify(e.target.value))
              }}
              required
              disabled={isPending}
            />
          </div>
        </div>
        <Input
          label="Your work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
        />
        <Button type="submit" className="w-full" disabled={isPending || !companyName || !email || !slug}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Create workspace
        </Button>
      </form>
    )
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Enter the verification code sent to</p>
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
          className="text-center text-xl tracking-[0.3em]"
          disabled={isPending}
        />
        <Button type="submit" className="w-full" disabled={isPending || otp.length < 6}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Continue
        </Button>
        <button type="button" onClick={() => setStep('details')} className="flex w-full items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleCompleteProfile} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
      <div className="flex items-center gap-2 text-sm text-success-600 mb-2">
        <CheckCircle2 className="h-4 w-4" />
        Email verified
      </div>
      <p className="text-sm font-medium text-gray-700">Just one more step — tell us your name.</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          placeholder="Jane"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          autoFocus
          disabled={isPending}
        />
        <Input
          label="Last name"
          placeholder="Smith"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !firstName}>
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Enter my workspace →
      </Button>
    </form>
  )
}
