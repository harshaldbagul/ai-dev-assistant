import { Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ToolCallIndicatorProps {
  toolCall: string | null;
}

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  if (!toolCall) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Terminal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
        {toolCall}
      </Badge>
    </div>
  );
}
