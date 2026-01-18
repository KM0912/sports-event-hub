import { Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseTemplate, emailStyles } from './BaseTemplate'

type EventCanceledProps = {
  participantName: string
  eventTitle: string
  eventDate: string
  hostName: string
  homeUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function EventCanceled({
  participantName,
  eventTitle,
  eventDate,
  hostName,
  homeUrl,
}: EventCanceledProps) {
  return (
    <BaseTemplate
      previewText={`【重要】${eventTitle}が中止になりました`}
      heading="練習会が中止になりました"
    >
      <Text style={emailStyles.paragraph}>
        {participantName} さん
      </Text>

      <Text style={emailStyles.paragraph}>
        参加予定の以下の練習会が、主催者により中止となりました。
      </Text>

      <Section style={canceledBox}>
        <Text style={emailStyles.infoLabel}>練習会名</Text>
        <Text style={emailStyles.infoValue}>{eventTitle}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>開催予定日時</Text>
        <Text style={emailStyles.infoValue}>{eventDate}</Text>
      </Section>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>主催者</Text>
        <Text style={emailStyles.infoValue}>{hostName}</Text>
      </Section>

      <Text style={emailStyles.paragraph}>
        ご迷惑をおかけして申し訳ございません。
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

const canceledBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  borderLeft: '4px solid #ef4444',
}

// Preview用のデフォルトprops
EventCanceled.PreviewProps = {
  participantName: '山田 太郎',
  eventTitle: '初心者歓迎！週末バドミントン練習会',
  eventDate: '2025年2月15日（土）10:00〜12:00',
  hostName: '主催者',
  homeUrl: baseUrl,
}

export default EventCanceled
