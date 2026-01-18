import { Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseTemplate, emailStyles } from './BaseTemplate'

type NewChatMessageProps = {
  recipientName: string
  senderName: string
  eventTitle: string
  messagePreview: string
  chatUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function NewChatMessage({
  recipientName,
  senderName,
  eventTitle,
  messagePreview,
  chatUrl,
}: NewChatMessageProps) {
  return (
    <BaseTemplate
      previewText={`【新着メッセージ】${senderName}さんからメッセージが届きました`}
      heading="新しいメッセージがあります"
    >
      <Text style={emailStyles.paragraph}>
        {recipientName} さん
      </Text>

      <Text style={emailStyles.paragraph}>
        {senderName}さんから新しいメッセージが届きました。
      </Text>

      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>練習会</Text>
        <Text style={emailStyles.infoValue}>{eventTitle}</Text>
      </Section>

      <Section style={messageBox}>
        <Text style={messageText}>
          {messagePreview}
        </Text>
        <Text style={messageSender}>
          — {senderName}
        </Text>
      </Section>

      <Section style={{ margin: '32px 0', textAlign: 'center' as const }}>
        <Link href={chatUrl} style={emailStyles.button}>
          メッセージを確認する
        </Link>
      </Section>
    </BaseTemplate>
  )
}

const messageBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  borderLeft: '4px solid #10b981',
}

const messageText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px',
  fontStyle: 'italic' as const,
}

const messageSender = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  textAlign: 'right' as const,
}

// Preview用のデフォルトprops
NewChatMessage.PreviewProps = {
  recipientName: '山田 太郎',
  senderName: '主催者',
  eventTitle: '初心者歓迎！週末バドミントン練習会',
  messagePreview: '入口が分からず迷っています。どうしたらいいでしょうか？',
  chatUrl: `${baseUrl}/events/123/chat/456`,
}

export default NewChatMessage
