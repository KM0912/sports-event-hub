import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

type BaseTemplateProps = {
  previewText: string
  heading: string
  children: React.ReactNode
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export function BaseTemplate({
  previewText,
  heading,
  children,
}: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logo}>
              バドミントン練習会
            </Link>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{heading}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              このメールは{' '}
              <Link href={baseUrl} style={link}>
                バドミントン練習会
              </Link>{' '}
              から自動送信されています。
            </Text>
            <Text style={footerText}>
              ご不明な点がございましたら、サイト内のチャット機能よりお問い合わせください。
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
}

const header = {
  padding: '20px 40px',
  borderBottom: '1px solid #e6e6e6',
}

const logo = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const content = {
  padding: '40px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
}

const footer = {
  padding: '20px 40px',
  borderTop: '1px solid #e6e6e6',
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
}

const link = {
  color: '#10b981',
  textDecoration: 'underline',
}

// 再利用可能なスタイル（テンプレートで使用）
export const emailStyles = {
  paragraph: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
  },
  infoValue: {
    color: '#1f2937',
    fontSize: '16px',
    margin: '0',
  },
  link: {
    color: '#10b981',
    textDecoration: 'underline',
  },
}
