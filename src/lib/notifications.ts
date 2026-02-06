'use server';

import { createClient } from '@/lib/supabase/server';

interface NotificationPayload {
  type:
    | 'application_received'
    | 'application_approved'
    | 'application_rejected'
    | 'new_chat_message';
  data: Record<string, string>;
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    const supabase = await createClient();
    await supabase.functions.invoke('send-notification', {
      body: payload,
    });
  } catch {
    // 通知の失敗はサイレントに処理（メイン処理を止めない）
    console.error('Failed to send notification');
  }
}
