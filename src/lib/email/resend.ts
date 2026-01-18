import { Resend } from 'resend'

// Resend クライアントの遅延初期化
let resendClient: Resend | null = null

export function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// 送信元アドレス（Resendで検証済みのドメイン）
export const FROM_EMAIL = 'バドミントン練習会 <noreply@miyagi-badminton.jp>'
