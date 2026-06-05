import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ChatPage } from '@/pages/ChatPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ChatProvider } from '@/contexts/ChatContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ChatProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ChatProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
