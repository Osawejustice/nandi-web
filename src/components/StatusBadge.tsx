import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-brandSoft text-brand border-transparent',
  pending: 'bg-accentSoft text-accent border-transparent',
  resolved: 'bg-liveSoft text-live border-transparent',
  closed: 'bg-soft text-textMuted border-transparent',
  draft: 'bg-soft text-textMuted border-transparent',
  queued: 'bg-accentSoft text-accent border-transparent',
  sending: 'bg-brandSoft text-brand border-transparent',
  completed: 'bg-liveSoft text-live border-transparent',
  failed: 'bg-red-100 text-red-800 border-transparent',
  cancelled: 'bg-soft text-textMuted border-transparent',
  online: 'bg-liveSoft text-live border-transparent',
  busy: 'bg-accentSoft text-accent border-transparent',
  offline: 'bg-soft text-textMuted border-transparent',
};

export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <Badge
      variant="outline"
      className={cn('capitalize', STATUS_STYLES[status] || 'bg-soft text-textMuted', className)}
    >
      {status}
    </Badge>
  );
}

export function SentimentBadge({ label }: { label?: string | null }) {
  if (!label) return null;
  const styles =
    label === 'positive'
      ? 'bg-liveSoft text-live'
      : label === 'negative'
        ? 'bg-red-100 text-red-800'
        : 'bg-soft text-textMuted';
  return <Badge className={cn('capitalize border-transparent', styles)}>{label}</Badge>;
}

export function ChannelBadge({ channel }: { channel?: string | null }) {
  if (!channel) return null;
  const styles =
    channel === 'whatsapp'
      ? 'bg-channelWhatsAppSoft text-channelWhatsApp'
      : 'bg-channelSMSSoft text-channelSMS';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles
      )}
    >
      {channel === 'whatsapp' ? 'WA' : channel}
    </span>
  );
}
