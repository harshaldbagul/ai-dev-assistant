import { GitBranch, Sun, Moon, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { MESSAGES } from '@/messages';
import { GEMINI_MODELS, type GeminiModelId } from '@/constants/models';

interface HeaderProps {
  onNewChat: () => void;
  hasMessages: boolean;
  selectedModel: GeminiModelId;
  onModelChange: (model: GeminiModelId) => void;
}

export function Header({ onNewChat, hasMessages, selectedModel, onModelChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-5">
        {/* Left: brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GitBranch className="h-4 w-4" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold leading-tight text-foreground">{MESSAGES.header.brandName}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">{MESSAGES.header.subtitle}</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as GeminiModelId)}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Select Gemini model"
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <SquarePen className="h-3.5 w-3.5" />
              {MESSAGES.header.newChat}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={MESSAGES.header.toggleTheme}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
