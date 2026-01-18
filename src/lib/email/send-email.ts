import { getResend, FROM_EMAIL } from './resend'
import { ReactElement } from 'react'

type SendEmailParams = {
  to: string
  subject: string
  react: ReactElement
}

type SendBatchEmailsParams = {
  emails: {
    to: string
    subject: string
    react: ReactElement
  }[]
}

// 単一メール送信
export async function sendEmail({ to, subject, react }: SendEmailParams): Promise<boolean> {
  try {
    const resend = getResend()
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    })

    if (error) {
      console.error('Email send error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send exception:', error)
    return false
  }
}

// バッチメール送信（イベント中止時など、複数の宛先に送信）
export async function sendBatchEmails({ emails }: SendBatchEmailsParams): Promise<boolean> {
  try {
    const resend = getResend()
    // Resendのバッチ送信は最大100通まで
    const batchSize = 100
    const batches: typeof emails[] = []

    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const { error } = await resend.batch.send(
        batch.map((email) => ({
          from: FROM_EMAIL,
          to: email.to,
          subject: email.subject,
          react: email.react,
        }))
      )

      if (error) {
        console.error('Batch email send error:', error)
        // 失敗してもDB処理は継続（UX優先）
      }
    }

    return true
  } catch (error) {
    console.error('Batch email send exception:', error)
    return false
  }
}
