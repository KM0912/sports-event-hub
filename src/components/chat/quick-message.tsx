'use client';

import { Button } from '@/components/ui/button';
import { QUICK_MESSAGES } from '@/constants/quick-messages';
import { sendMessage } from '@/actions/chat-actions';
import { toast } from 'sonner';

interface QuickMessageProps {
  eventId: string;
  receiverId: string;
}

export function QuickMessage({ eventId, receiverId }: QuickMessageProps) {
  async function handleClick(msg: string) {
    const result = await sendMessage(eventId, receiverId, msg);
    if (!result.success) {
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
