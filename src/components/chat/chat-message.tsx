import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ChatMessageWithSender } from '@/types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessageWithSender;
  isOwn: boolean;
}

export function ChatMessageBubble({ message, isOwn }: ChatMessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {!isOwn && (
          <p className="mb-1 text-xs font-medium opacity-70">
            {message.sender.displayName}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-xs',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {format(new Date(message.createdAt), 'HH:mm', { locale: ja })}
        </p>
      </div>
    </div>
  );
}
