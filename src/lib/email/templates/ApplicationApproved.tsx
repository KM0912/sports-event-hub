import { Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseTemplate, emailStyles } from './BaseTemplate'

type ApplicationApprovedProps = {
  applicantName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventUrl: string
  chatUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function ApplicationApproved({
  applicantName,
  eventTitle,
  eventDate,
  eventLocation,
  eventUrl,
  chatUrl,
}: ApplicationApprovedProps) {
  return (
    <BaseTemplate
      previewText={`【参加承認】${eventTitle}への参加が承認されました`}
      heading="参加が承認されました"
    >
      <Text style={emailStyles.paragraph}>
        {applicantName} さん
      </Text>

      <Text style={emailStyles.paragraph}>
        以下の練習会への参加申請が承認されました。当日お待ちしています！
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
        <Text style={emailStyles.infoLabel}>場所</Text>
        <Text style={emailStyles.infoValue}>{eventLocation}</Text>
      </Section>

      <Section style={{ margin: '32px 0', textAlign: 'center' as const }}>
        <Link href={eventUrl} style={emailStyles.button}>
          練習会の詳細を見る
        </Link>
      </Section>

      <Text style={emailStyles.paragraph}>
        主催者への連絡は、
        <Link href={chatUrl} style={emailStyles.link}>
          チャット機能
        </Link>
        をご利用ください。
      </Text>
    </BaseTemplate>
  )
}

// Preview用のデフォルトprops
ApplicationApproved.PreviewProps = {
  applicantName: '山田 太郎',
  eventTitle: '初心者歓迎！週末バドミントン練習会',
  eventDate: '2025年2月15日（土）10:00〜12:00',
  eventLocation: '渋谷区スポーツセンター',
  eventUrl: `${baseUrl}/events/123`,
  chatUrl: `${baseUrl}/events/123/chat`,
}

export default ApplicationApproved
