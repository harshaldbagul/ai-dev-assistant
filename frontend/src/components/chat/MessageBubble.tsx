import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-0.5 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-0.5 text-sm">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1">{children}</h3>,
  pre: ({ children }) => (
    <pre className="bg-muted/60 rounded-md p-3 my-2 overflow-x-auto text-xs font-mono">
      {children}
    </pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="bg-muted/60 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-muted-foreground/30 pl-3 my-2 italic text-muted-foreground text-sm">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border/50 px-3 py-1.5 bg-muted/50 text-left font-semibold text-xs">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border/50 px-3 py-1.5 text-xs">{children}</td>
  ),
  hr: () => <hr className="border-border/50 my-3" />,
};

interface MessageBubbleProps {
  message: Message;
}

function AssistantSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-2">
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback className="bg-secondary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Card className="max-w-[75%]">
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-3 px-4 py-2">
        <div className="max-w-[75%] rounded-2xl bg-blue-600 px-4 py-2.5 text-white text-sm leading-relaxed">
          {message.content}
        </div>
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="bg-blue-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // Show skeleton while waiting for first token
  if (message.isStreaming && message.content === '') {
    return <AssistantSkeleton />;
  }

  return (
    <div className="flex gap-3 px-4 py-2">
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback
          className={cn('bg-secondary', message.isError && 'bg-destructive/10')}
        >
          {message.isError ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <Card
        className={cn(
          'max-w-[75%]',
          message.isError && 'border-destructive/40 bg-destructive/5',
        )}
      >
        <CardContent className="p-3">
          {message.isError ? (
            <p className="text-sm text-destructive">{message.content}</p>
          ) : (
            <div className="max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
