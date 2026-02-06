import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessageWithSender } from '@/types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessageWithSender;
  isOwn: boolean;
}

export function ChatMessageBubble({ message, isOwn }: ChatMessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      {/* アバター（相手のみ） */}
      {!isOwn && (
        <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {message.sender.displayName.charAt(0)}
        </div>
      )}
      <div
        className={cn(
          'max-w-[75%] px-3.5 py-2.5',
          isOwn
            ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground shadow-sm'
            : 'rounded-2xl rounded-bl-md bg-card text-foreground shadow-sm ring-1 ring-border/60'
        )}
      >
        {!isOwn && (
          <p className="mb-0.5 text-[11px] font-semibold text-primary/80">
            {message.sender.displayName}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground/70'
          )}
        >
          <span>
            {format(new Date(message.createdAt), 'HH:mm', { locale: ja })}
          </span>
          {isOwn &&
            (message.isRead ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            ))}
        </div>
      </div>
    </div>
  );
}
