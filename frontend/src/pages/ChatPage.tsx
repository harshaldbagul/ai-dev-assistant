import { useChatContext } from '@/contexts/ChatContext';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { ToolCallIndicator } from '@/components/chat/ToolCallIndicator';

export function ChatPage() {
  const { displayMessages, isStreaming, activeToolCall, sendMessage, stopStreaming } = useChatContext();

  return (
    <>
      <ChatWindow
        messages={displayMessages}
        isStreaming={isStreaming}
        onExampleClick={sendMessage}
      />
      <ToolCallIndicator toolCall={activeToolCall} />
      <ChatInput onSubmit={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
    </>
  );
}
