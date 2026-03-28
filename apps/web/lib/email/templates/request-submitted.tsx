import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview, Row, Column,
} from '@react-email/components'

interface RequestSubmittedEmailProps {
  managerName: string
  employeeName: string
  absenceType: string
  startDate: string
  endDate: string
  totalDays: number
  comment?: string | null
  reviewUrl: string
}

export function RequestSubmittedEmail({
  managerName,
  employeeName,
  absenceType,
  startDate,
  endDate,
  totalDays,
  comment,
  reviewUrl,
}: RequestSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{employeeName} submitted a {absenceType} request</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Absence Tracker</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>New absence request</Heading>
            <Text style={text}>
              Hi {managerName}, <strong>{employeeName}</strong> has submitted a new absence request
              that needs your review.
            </Text>

            <Section style={detailBox}>
              <Row style={detailRow}>
                <Column style={detailLabel}>Type</Column>
                <Column style={detailValue}>{absenceType}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>From</Column>
                <Column style={detailValue}>{startDate}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>To</Column>
                <Column style={detailValue}>{endDate}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Duration</Column>
                <Column style={detailValue}>{totalDays} day{totalDays !== 1 ? 's' : ''}</Column>
              </Row>
              {comment && (
                <Row style={detailRow}>
                  <Column style={detailLabel}>Note</Column>
                  <Column style={detailValue}>{comment}</Column>
                </Row>
              )}
            </Section>

            <Button style={button} href={reviewUrl}>
              Review Request
            </Button>
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
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 24px' }
const detailBox = { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }
const detailRow = { marginBottom: '8px' }
const detailLabel = { fontSize: '13px', color: '#6b7280', fontWeight: '600', width: '80px' }
const detailValue = { fontSize: '14px', color: '#111827' }
const button = {
  backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px 24px',
  borderRadius: '8px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
