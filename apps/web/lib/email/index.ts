import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Absence Tracker <notifications@absence-tracker.app>'

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string | string[]
  subject: string
  template: ReactElement
}) {
  if (!process.env.RESEND_API_KEY) return

  const html = await render(template)
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) console.error('[email] send error:', error)
}
