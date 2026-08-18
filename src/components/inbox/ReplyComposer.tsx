'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReplyComposerProps {
  onSend: (content: string) => void;
  isSending?: boolean;
  disabled?: boolean;
}

export function ReplyComposer({ onSend, isSending, disabled }: ReplyComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || isSending) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="border-t border-border p-4 bg-surface">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply… (Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm',
              'placeholder:text-textFaint',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!value.trim() || isSending || disabled}
          size="icon"
          className="shrink-0 h-10 w-10 rounded-full"
        >
          {isSending ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send size={16} />
          )}
        </Button>
      </div>
    </div>
  );
}
