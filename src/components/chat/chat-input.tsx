'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/actions/chat-actions';
import { toast } from 'sonner';

interface ChatInputProps {
  eventId: string;
  receiverId: string;
}

export function ChatInput({ eventId, receiverId }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    const result = await sendMessage(eventId, receiverId, trimmed);
    setSending(false);

    if (result.success) {
      setContent('');
    } else {
      toast.error(result.error);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2">
      <Textarea
        placeholder="メッセージを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={500}
        rows={2}
        className="resize-none"
      />
      <Button
        onClick={handleSend}
        disabled={sending || !content.trim()}
        className="shrink-0"
      >
        {sending ? '送信中' : '送信'}
      </Button>
    </div>
  );
}
