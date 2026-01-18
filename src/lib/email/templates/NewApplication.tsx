import { Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseTemplate, emailStyles } from './BaseTemplate'

type NewApplicationProps = {
  hostName: string
  applicantName: string
  eventTitle: string
  eventDate: string
  comment: string | null
  applicationsUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function NewApplication({
  hostName,
  applicantName,
  eventTitle,
  eventDate,
  comment,
  applicationsUrl,
}: NewApplicationProps) {
  return (
    <BaseTemplate
      previewText={`【新規申請】${applicantName}さんから参加申請があります`}
      heading="新しい参加申請があります"
    >
      <Text style={emailStyles.paragraph}>
        {hostName} さん
      </Text>

      <Text style={emailStyles.paragraph}>
        あなたの練習会に新しい参加申請がありました。
      </Text>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>練習会名</Text>
        <Text style={emailStyles.infoValue}>{eventTitle}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>開催日時</Text>
        <Text style={emailStyles.infoValue}>{eventDate}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>申請者</Text>
        <Text style={emailStyles.infoValue}>{applicantName}</Text>
      </Section>

      {comment && (
        <Section style={emailStyles.infoBox}>
          <Text style={emailStyles.infoLabel}>ひとこと</Text>
          <Text style={emailStyles.infoValue}>{comment}</Text>
        </Section>
      )}

      <Section style={{ margin: '32px 0', textAlign: 'center' as const }}>
        <Link href={applicationsUrl} style={emailStyles.button}>
          申請を確認する
        </Link>
      </Section>

      <Text style={emailStyles.paragraph}>
        申請一覧から承認・却下を行ってください。
      </Text>
    </BaseTemplate>
  )
}

// Preview用のデフォルトprops
NewApplication.PreviewProps = {
  hostName: '主催者',
  applicantName: '山田 太郎',
  eventTitle: '初心者歓迎！週末バドミントン練習会',
  eventDate: '2025年2月15日（土）10:00〜12:00',
  comment: 'バドミントン歴3年です。よろしくお願いします！',
  applicationsUrl: `${baseUrl}/events/123/applications`,
}

export default NewApplication
