import { type KeyboardEvent, useRef, useState } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MESSAGES } from '@/messages';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSubmit, onStop, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSubmit(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={MESSAGES.chatInput.placeholder}
          disabled={isStreaming}
          className="flex-1"
          autoFocus
        />
        {isStreaming ? (
          <Button onClick={onStop} size="icon" variant="destructive" aria-label="Stop generating">
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!value.trim()}
            size="icon"
            aria-label={MESSAGES.chatInput.sendAriaLabel}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
