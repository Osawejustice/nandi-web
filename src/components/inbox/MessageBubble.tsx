import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, formatTime } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

function statusLabel(status?: string) {
  if (!status) return null;
  if (status === 'failed') return 'Failed';
  if (status === 'pending') return 'Sending';
  if (status === 'sent' || status === 'delivered' || status === 'received') return status;
  return status;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const isOptimistic = message.id.startsWith('temp-');
  const failed = message.status === 'failed';

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%]',
        isInbound ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback
          className={cn('text-xs', isInbound ? 'bg-soft text-textMuted' : 'bg-brand text-white')}
        >
          {isInbound ? 'C' : 'Me'}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isInbound ? 'bg-surface border border-border text-textMain rounded-tl-md' : 'bg-brand text-white rounded-tr-md',
          isOptimistic && 'opacity-70',
          failed && 'bg-red-600'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <div
          className={cn(
            'flex items-center gap-2 mt-1.5 flex-wrap',
            isInbound ? 'justify-start' : 'justify-end'
          )}
        >
          <span className={cn('text-[10px]', isInbound ? 'text-textFaint' : 'text-white/70')}>
            {formatTime(message.created_at)}
          </span>
          {message.sentiment_label ? (
            <span className={cn('text-[10px] capitalize', isInbound ? 'text-textMuted' : 'text-white/70')}>
              {message.sentiment_label}
            </span>
          ) : null}
          {!isInbound ? (
            <span className="text-[10px] text-white/60 capitalize">
              {isOptimistic ? 'sending…' : statusLabel(message.status)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
