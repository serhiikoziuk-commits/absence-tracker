import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview,
} from '@react-email/components'

interface InviteEmailProps {
  workspaceName: string
  invitedByName: string
  acceptUrl: string
}

export function InviteEmail({ workspaceName, invitedByName, acceptUrl }: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to join {workspaceName} on Absence Tracker</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Absence Tracker</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>You&apos;re invited!</Heading>
            <Text style={text}>
              <strong>{invitedByName}</strong> has invited you to join{' '}
              <strong>{workspaceName}</strong> on Absence Tracker.
            </Text>
            <Text style={text}>
              Click the button below to accept your invitation and set up your account.
            </Text>
            <Button style={button} href={acceptUrl}>
              Accept Invitation
            </Button>
            <Text style={smallText}>
              This invitation link will expire in 7 days. If you didn&apos;t expect this email,
              you can safely ignore it.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Absence Tracker · Manage your team&apos;s time off</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }
const header = { marginBottom: '32px' }
const logo = { fontSize: '20px', fontWeight: '700', color: '#4f46e5', margin: '0' }
const content = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px', border: '1px solid #e5e7eb' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const button = {
  backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px 24px',
  borderRadius: '8px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', display: 'inline-block',
}
const smallText = { fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: '24px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
