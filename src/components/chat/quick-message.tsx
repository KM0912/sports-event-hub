'use client';

import { Button } from '@/components/ui/button';
import { QUICK_MESSAGES } from '@/constants/quick-messages';
import { sendMessage } from '@/actions/chat-actions';
import { toast } from 'sonner';

interface QuickMessageProps {
  eventId: string;
  receiverId: string;
  onMessageSent?: (messageId: string, content: string) => void;
}

export function QuickMessage({
  eventId,
  receiverId,
  onMessageSent,
}: QuickMessageProps) {
  async function handleClick(msg: string) {
    const result = await sendMessage(eventId, receiverId, msg);
    if (result.success) {
      onMessageSent?.(result.data.messageId, msg);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {QUICK_MESSAGES.map((msg) => (
        <Button
          key={msg}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => handleClick(msg)}
        >
          {msg}
        </Button>
      ))}
    </div>
  );
}
