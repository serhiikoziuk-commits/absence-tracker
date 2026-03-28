import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview, Row, Column,
} from '@react-email/components'

type ReviewStatus = 'approved' | 'rejected' | 'modified'

interface RequestReviewedEmailProps {
  employeeName: string
  reviewerName: string
  status: ReviewStatus
  absenceType: string
  startDate: string
  endDate: string
  totalDays: number
  reviewerComment?: string | null
  modifiedStartDate?: string | null
  modifiedEndDate?: string | null
  requestsUrl: string
}

const STATUS_LABELS: Record<ReviewStatus, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  modified: 'Modification proposed',
}

const STATUS_COLORS: Record<ReviewStatus, string> = {
  approved: '#16a34a',
  rejected: '#dc2626',
  modified: '#d97706',
}

export function RequestReviewedEmail({
  employeeName,
  reviewerName,
  status,
  absenceType,
  startDate,
  endDate,
  totalDays,
  reviewerComment,
  modifiedStartDate,
  modifiedEndDate,
  requestsUrl,
}: RequestReviewedEmailProps) {
  const statusLabel = STATUS_LABELS[status]
  const statusColor = STATUS_COLORS[status]

  return (
    <Html>
      <Head />
      <Preview>Your {absenceType} request has been {statusLabel.toLowerCase()}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Absence Tracker</Heading>
          </Section>

          <Section style={content}>
            <Section style={{ ...statusBadge, backgroundColor: statusColor + '1a', borderColor: statusColor + '33' }}>
              <Text style={{ ...statusText, color: statusColor }}>{statusLabel}</Text>
            </Section>

            <Heading style={h1}>Your request has been reviewed</Heading>
            <Text style={text}>
              Hi {employeeName}, <strong>{reviewerName}</strong> has reviewed your absence request.
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
            </Section>

            {status === 'modified' && modifiedStartDate && modifiedEndDate && (
              <>
                <Text style={modifiedTitle}>Proposed new dates:</Text>
                <Section style={{ ...detailBox, borderLeft: '3px solid #d97706' }}>
                  <Row style={detailRow}>
                    <Column style={detailLabel}>New from</Column>
                    <Column style={detailValue}>{modifiedStartDate}</Column>
                  </Row>
                  <Row style={detailRow}>
                    <Column style={detailLabel}>New to</Column>
                    <Column style={detailValue}>{modifiedEndDate}</Column>
                  </Row>
                </Section>
              </>
            )}

            {reviewerComment && (
              <Section style={commentBox}>
                <Text style={commentLabel}>Comment from {reviewerName}:</Text>
                <Text style={commentText}>{reviewerComment}</Text>
              </Section>
            )}

            <Button style={button} href={requestsUrl}>
              {status === 'modified' ? 'Review Modification' : 'View My Requests'}
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
const statusBadge = { display: 'inline-block', borderRadius: '6px', border: '1px solid', padding: '4px 12px', marginBottom: '16px' }
const statusText = { fontSize: '13px', fontWeight: '700', margin: '0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 12px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 24px' }
const detailBox = { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }
const detailRow = { marginBottom: '8px' }
const detailLabel = { fontSize: '13px', color: '#6b7280', fontWeight: '600', width: '80px' }
const detailValue = { fontSize: '14px', color: '#111827' }
const modifiedTitle = { fontSize: '14px', fontWeight: '600', color: '#374151', margin: '8px 0 8px' }
const commentBox = { backgroundColor: '#fffbeb', borderRadius: '8px', padding: '16px', marginBottom: '24px', border: '1px solid #fde68a' }
const commentLabel = { fontSize: '13px', fontWeight: '600', color: '#92400e', margin: '0 0 4px' }
const commentText = { fontSize: '14px', color: '#374151', margin: '0', lineHeight: '1.5' }
const button = {
  backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px 24px',
  borderRadius: '8px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
