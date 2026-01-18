'use server'

import { createClient } from '@/lib/supabase/server'

// 主催者向け: 承認待ち申請数を取得
export async function getPendingApplicationsCount(): Promise<number> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return 0
  }

  // 自分が主催しているイベントの承認待ち申請を取得
  const { count, error } = await supabase
    .from('applications')
    .select('id, events!inner(host_user_id)', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('events.host_user_id', user.id)

  if (error) {
    console.error('Error fetching pending applications:', error)
    return 0
  }

  return count ?? 0
}

// ユーザー向け: 未読チャット数を取得
export async function getUnreadChatsCount(): Promise<number> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return 0
  }

  // 自分が参加している会話を取得
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id, host_user_id, participant_user_id')
    .or(`host_user_id.eq.${user.id},participant_user_id.eq.${user.id}`)

  if (convError || !conversations) {
    console.error('Error fetching conversations:', convError)
    return 0
  }

  if (conversations.length === 0) {
    return 0
  }

  const conversationIds = conversations.map((c) => c.id)

  // 各会話の最新メッセージと既読情報を取得
  let unreadCount = 0

  for (const conv of conversations) {
    // 会話の最新メッセージを取得（自分が送ったメッセージ以外）
    const { data: latestMessage } = await supabase
      .from('messages')
      .select('id, created_at')
      .eq('conversation_id', conv.id)
      .neq('sender_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!latestMessage) {
      continue
    }

    // 既読情報を取得
    const { data: readRecord } = await supabase
      .from('conversation_reads')
      .select('last_read_at')
      .eq('conversation_id', conv.id)
      .eq('user_id', user.id)
      .single()

    // 既読情報がないか、最新メッセージが既読より新しい場合は未読
    if (
      !readRecord ||
      new Date(latestMessage.created_at) > new Date(readRecord.last_read_at)
    ) {
      unreadCount++
    }
  }

  return unreadCount
}
