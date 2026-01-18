import { Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseTemplate, emailStyles } from './BaseTemplate'

type ApplicationRejectedProps = {
  applicantName: string
  eventTitle: string
  eventDate: string
  homeUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function ApplicationRejected({
  applicantName,
  eventTitle,
  eventDate,
  homeUrl,
}: ApplicationRejectedProps) {
  return (
    <BaseTemplate
      previewText={`【申請結果】${eventTitle}への参加申請について`}
      heading="参加申請の結果について"
    >
      <Text style={emailStyles.paragraph}>
        {applicantName} さん
      </Text>

      <Text style={emailStyles.paragraph}>
        以下の練習会への参加申請について、今回はご参加いただけない結果となりました。
      </Text>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>練習会名</Text>
        <Text style={emailStyles.infoValue}>{eventTitle}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>開催日時</Text>
        <Text style={emailStyles.infoValue}>{eventDate}</Text>
      </Section>

      <Text style={emailStyles.paragraph}>
        参加条件との相違などにより、今回はご参加いただけませんでした。
        他の練習会もございますので、ぜひご覧ください。
      </Text>

      <Section style={{ margin: '32px 0', textAlign: 'center' as const }}>
        <Link href={homeUrl} style={emailStyles.button}>
          他の練習会を探す
        </Link>
      </Section>
    </BaseTemplate>
  )
}

// Preview用のデフォルトprops
ApplicationRejected.PreviewProps = {
  applicantName: '山田 太郎',
  eventTitle: '上級者向け練習会',
  eventDate: '2025年2月15日（土）10:00〜12:00',
  homeUrl: baseUrl,
}

export default ApplicationRejected
