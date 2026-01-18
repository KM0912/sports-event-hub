import { Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseTemplate, emailStyles } from './BaseTemplate'

type ParticipantCanceledProps = {
  hostName: string
  participantName: string
  eventTitle: string
  eventDate: string
  applicationsUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function ParticipantCanceled({
  hostName,
  participantName,
  eventTitle,
  eventDate,
  applicationsUrl,
}: ParticipantCanceledProps) {
  return (
    <BaseTemplate
      previewText={`【キャンセル】${participantName}さんが参加をキャンセルしました`}
      heading="参加者からキャンセルがありました"
    >
      <Text style={emailStyles.paragraph}>
        {hostName} さん
      </Text>

      <Text style={emailStyles.paragraph}>
        以下の練習会で、参加者からキャンセルがありました。
      </Text>

      <Section style={canceledBox}>
        <Text style={emailStyles.infoLabel}>キャンセルした参加者</Text>
        <Text style={emailStyles.infoValue}>{participantName}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>練習会名</Text>
        <Text style={emailStyles.infoValue}>{eventTitle}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>開催日時</Text>
        <Text style={emailStyles.infoValue}>{eventDate}</Text>
      </Section>

      <Text style={emailStyles.paragraph}>
        ビジター枠に空きが出ました。申請一覧から他の申請者を承認することができます。
      </Text>

      <Section style={{ margin: '32px 0', textAlign: 'center' as const }}>
        <Link href={applicationsUrl} style={emailStyles.button}>
          申請一覧を確認する
        </Link>
      </Section>
    </BaseTemplate>
  )
}

const canceledBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  borderLeft: '4px solid #ef4444',
}

// Preview用のデフォルトprops
ParticipantCanceled.PreviewProps = {
  hostName: '主催者',
  participantName: '山田 太郎',
  eventTitle: '初心者歓迎！週末バドミントン練習会',
  eventDate: '2025年2月15日（土）10:00〜12:00',
  applicationsUrl: `${baseUrl}/events/123/applications`,
}

export default ParticipantCanceled
