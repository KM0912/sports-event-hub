'use server';

import { createClient } from '@/lib/supabase/server';
import { chatMessageSchema } from '@/lib/validations/chat-schema';
import type { ActionResult } from '@/types/action-result';
import type { ChatMessageWithSender } from '@/types/chat';
import { getAuthUser } from './auth-actions';
import { isChatExpired } from '@/lib/utils/date-utils';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/lib/notifications';

export async function sendMessage(
  eventId: string,
  receiverId: string,
  content: string
): Promise<ActionResult<{ messageId: string }>> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const parsed = chatMessageSchema.safeParse({ eventId, receiverId, content });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    };
  }

  const supabase = await createClient();

  // イベント存在チェック + チャット期限チェック
  const { data: event } = await supabase
    .from('events')
    .select('id, end_datetime')
    .eq('id', eventId)
    .single();

  if (!event) {
    return {
      success: false,
      error: 'イベントが見つかりません',
      code: 'NOT_FOUND',
    };
  }

  if (isChatExpired(event.end_datetime)) {
    return {
      success: false,
      error: 'チャット期限が過ぎています（イベント終了後48時間）',
      code: 'BUSINESS_RULE_ERROR',
    };
  }

  // メッセージ送信
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      event_id: eventId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    })
    .select('id')
    .single();

  if (error) {
    return {
      success: false,
      error: 'メッセージの送信に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  // チャット通知送信
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();
  const { data: receiverProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', receiverId)
    .single();
  sendNotification({
    type: 'new_chat_message',
    data: {
      receiverId,
      receiverName: receiverProfile?.display_name || '',
      senderId: user.id,
      senderName: senderProfile?.display_name || '',
      eventTitle: '',
      eventId,
    },
  });

  revalidatePath(`/chat/${eventId}/${receiverId}`);
  return { success: true, data: { messageId: message.id } };
}

export async function getMessages(
  eventId: string,
  otherUserId: string
): Promise<ActionResult<ChatMessageWithSender[]>> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, sender:profiles!sender_id(id, display_name)')
    .eq('event_id', eventId)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    return {
      success: false,
      error: 'メッセージの取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: true,
    data: (data || []).map((m) => {
      const sender = m.sender as unknown as {
        id: string;
        display_name: string;
      };
      return {
        id: m.id,
        eventId: m.event_id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        content: m.content,
        isRead: m.is_read,
        createdAt: m.created_at,
        sender: {
          id: sender.id,
          displayName: sender.display_name,
        },
      };
    }),
  };
}

export async function markAsRead(
  eventId: string,
  senderId: string
): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('event_id', eventId)
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  if (error) {
    return {
      success: false,
      error: '既読処理に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return { success: true, data: undefined };
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
  const user = await getAuthUser();
  if (!user) {
    return {
      success: false,
      error: 'ログインしてください',
      code: 'AUTH_ERROR',
    };
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  if (error) {
    return {
      success: false,
      error: '未読数の取得に失敗しました',
      code: 'INTERNAL_ERROR',
    };
  }

  return { success: true, data: count || 0 };
}
