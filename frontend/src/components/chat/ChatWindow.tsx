import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Search, Scale, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Message } from '@/types';
import { MESSAGES } from '@/messages';

const [p1, p2, p3] = MESSAGES.chatWindow.examplePrompts;
const EXAMPLE_PROMPTS: { label: string; Icon: LucideIcon }[] = [
  { label: p1, Icon: Search },
  { label: p2, Icon: Scale },
  { label: p3, Icon: Star },
];

interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  onExampleClick: (prompt: string) => void;
}

export function ChatWindow({ messages, isStreaming, onExampleClick }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    if (distanceFromBottom < 200) {
      bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'instant' : 'smooth' });
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <GitBranch className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-foreground">{MESSAGES.chatWindow.heading}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {MESSAGES.chatWindow.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
          {EXAMPLE_PROMPTS.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => onExampleClick(label)}
              disabled={isStreaming}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
      <div className="py-4 space-y-1 max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
