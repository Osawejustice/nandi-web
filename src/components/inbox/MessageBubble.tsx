import type { Message } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sentimentVariant(sentiment?: string): 'live' | 'destructive' | 'secondary' | undefined {
  switch (sentiment) {
    case 'positive': return 'live';
    case 'negative': return 'destructive';
    case 'neutral': return 'secondary';
    default: return undefined;
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const isOptimistic = message.id.startsWith('temp-');

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%]',
        isInbound ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback
          className={cn(
            'text-xs',
            isInbound ? 'bg-soft text-textMuted' : 'bg-brand text-white'
          )}
        >
          {isInbound
            ? message.sender?.name?.charAt(0)?.toUpperCase() || 'C'
            : 'Me'}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isInbound
            ? 'bg-soft text-textMain rounded-tl-md'
            : 'bg-brand text-white rounded-tr-md',
          isOptimistic && 'opacity-60'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        <div
          className={cn(
            'flex items-center gap-2 mt-1.5',
            isInbound ? 'justify-start' : 'justify-end'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isInbound ? 'text-textFaint' : 'text-white/60'
            )}
          >
            {formatTime(message.sent_at)}
          </span>

          {message.sentiment && (
            <Badge
              variant={sentimentVariant(message.sentiment)}
              className="text-[9px] px-1.5 py-0"
            >
              {message.sentiment}
            </Badge>
          )}

          {isOptimistic && (
            <span className="text-[9px] text-white/50">sending…</span>
          )}
        </div>
      </div>
    </div>
  );
}
