import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6 py-16', className)}>
      <div className="w-14 h-14 rounded-full bg-soft flex items-center justify-center mb-5">
        <Icon size={26} className="text-textMuted" />
      </div>
      <h2 className="text-lg font-semibold text-textMain mb-1">{title}</h2>
      <p className="text-sm text-textMuted max-w-md">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
