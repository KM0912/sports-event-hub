'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserEmail } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send-email'
import { NewChatMessage } from '@/lib/email/templates/NewChatMessage'
import { revalidatePath } from 'next/cache'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// メッセージを送信
export async function sendChatMessage(
  conversationId: string,
  body: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // メッセージを作成
  const { error: insertError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_user_id: user.id,
    body: body.trim(),
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  // 会話情報を取得
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id,
      event_id,
      host_user_id,
      participant_user_id,
      events (
        title
      )
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation) {
    // メッセージ送信は成功しているので、メール送信失敗してもOK
    return { success: true }
  }

  // 送信先を決定（自分以外のユーザー）
  const recipientUserId = conversation.host_user_id === user.id
    ? conversation.participant_user_id
    : conversation.host_user_id

  // 送信者と受信者のプロフィールを取得
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', [user.id, recipientUserId])

  const senderProfile = profiles?.find(p => p.id === user.id)
  const recipientProfile = profiles?.find(p => p.id === recipientUserId)

  // 受信者にメールを送信
  const recipientEmail = await getUserEmail(recipientUserId)
  if (recipientEmail) {
    // メッセージのプレビュー（最大100文字）
    const messagePreview = body.length > 100 ? body.substring(0, 100) + '...' : body

    // チャットURLを生成
    // ホストの場合は参加者ID、参加者の場合はホストIDをパスに含める
    const chatPath = conversation.host_user_id === recipientUserId
      ? `/events/${conversation.event_id}/chat/${conversation.participant_user_id}`
      : `/events/${conversation.event_id}/chat`

    await sendEmail({
      to: recipientEmail,
      subject: `【新着メッセージ】${senderProfile?.display_name || 'ユーザー'}さんからメッセージが届きました`,
      react: NewChatMessage({
        recipientName: recipientProfile?.display_name || 'ゲスト',
        senderName: senderProfile?.display_name || 'ユーザー',
        eventTitle: (conversation.events as { title: string } | null)?.title || '練習会',
        messagePreview,
        chatUrl: `${baseUrl}${chatPath}`,
      }),
    })
  }

  revalidatePath(`/events/${conversation.event_id}/chat`)
  return { success: true }
}
