'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getMessages, markAsRead } from '@/actions/chat-actions';
import { ChatMessageBubble } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { QuickMessage } from '@/components/chat/quick-message';
import type { ChatMessageWithSender } from '@/types/chat';

export default function ChatPage() {
  const params = useParams<{ eventId: string; userId: string }>();
  const eventId = params.eventId;
  const otherUserId = params.userId;

  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 初回ロード + ユーザーID取得
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const result = await getMessages(eventId, otherUserId);
      if (result.success) {
        setMessages(result.data);
      }
      setLoading(false);

      // 既読にする
      await markAsRead(eventId, otherUserId);
    }
    init();
  }, [eventId, otherUserId]);

  // Realtime購読
  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${eventId}:${currentUserId}:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'sports_event_hub',
          table: 'chat_messages',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            event_id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            is_read: boolean;
            created_at: string;
          };

          // この会話に関係するメッセージのみ
          const isRelevant =
            (newMsg.sender_id === currentUserId &&
              newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId &&
              newMsg.receiver_id === currentUserId);

          if (!isRelevant) return;

          // sender情報を取得
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name')
            .eq('id', newMsg.sender_id)
            .single();

          const messageWithSender: ChatMessageWithSender = {
            id: newMsg.id,
            eventId: newMsg.event_id,
            senderId: newMsg.sender_id,
            receiverId: newMsg.receiver_id,
            content: newMsg.content,
            isRead: newMsg.is_read,
            createdAt: newMsg.created_at,
            sender: {
              id: profile?.id || newMsg.sender_id,
              displayName: profile?.display_name || '不明',
            },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === messageWithSender.id)) return prev;
            return [...prev, messageWithSender];
          });

          // 受信メッセージを既読にする
          if (newMsg.sender_id === otherUserId) {
            await markAsRead(eventId, otherUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, eventId, otherUserId]);

  // 新メッセージ時にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-[calc(100dvh-4rem)] max-w-2xl flex-col px-4 py-3 sm:h-[calc(100dvh-8rem)] sm:py-4">
      <div className="flex-1 space-y-3 overflow-y-auto pb-3 sm:pb-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            メッセージはまだありません
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="shrink-0 space-y-2 border-t pt-2 sm:pt-3">
        <QuickMessage eventId={eventId} receiverId={otherUserId} />
        <ChatInput eventId={eventId} receiverId={otherUserId} />
      </div>
    </div>
  );
}
