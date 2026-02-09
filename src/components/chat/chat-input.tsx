'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/actions/chat-actions';
import { toast } from 'sonner';

interface ChatInputProps {
  eventId: string;
  receiverId: string;
  onMessageSent?: (messageId: string, content: string) => void;
}

export function ChatInput({
  eventId,
  receiverId,
  onMessageSent,
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const composingRef = useRef(false);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    const result = await sendMessage(eventId, receiverId, trimmed);
    setSending(false);

    if (result.success) {
      setContent('');
      onMessageSent?.(result.data.messageId, trimmed);
    } else {
      toast.error(result.error);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (
      e.key === 'Enter' &&
      (e.ctrlKey || e.metaKey) &&
      !composingRef.current
    ) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        placeholder="メッセージを入力... (Ctrl+Enterで送信)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
        }}
        maxLength={500}
        rows={2}
        className="resize-none"
      />
      <Button
        onClick={handleSend}
        disabled={sending || !content.trim()}
        className="h-[60px] shrink-0"
      >
        {sending ? '送信中' : '送信'}
      </Button>
    </div>
  );
}
