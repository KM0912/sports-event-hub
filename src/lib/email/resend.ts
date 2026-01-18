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

// 送信元アドレス
// 開発環境: Resendのテスト用アドレスを使用
// 本番環境: 検証済みドメインを環境変数で設定
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  (process.env.NODE_ENV === 'production'
    ? 'バドミントン練習会 <noreply@miyagi-badminton.jp>'
    : 'バドミントン練習会 <onboarding@resend.dev>')
