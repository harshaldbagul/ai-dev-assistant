import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useChatContext } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Layout() {
  const { resetChat, displayMessages, selectedModel, setModel } = useChatContext();
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col h-screen bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}>
      <Header
        onNewChat={resetChat}
        hasMessages={displayMessages.length > 0}
        selectedModel={selectedModel}
        onModelChange={setModel}
      />
      <Outlet />
    </div>
  );
}
