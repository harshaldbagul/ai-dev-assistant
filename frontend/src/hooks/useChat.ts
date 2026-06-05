import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message, GeminiMessage, ErrorCode } from '@/types';
import { streamChat } from '@/services/api';
import { getErrorMessage } from '@/utils/errorMessages';
import { DEFAULT_MODEL, type GeminiModelId } from '@/constants/models';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeToolCall, setActiveToolCall] = useState<string | null>(null);
  const [selectedModel, setModel] = useState<GeminiModelId>(DEFAULT_MODEL);

  const abortRef = useRef<AbortController | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  // Accumulates streaming text for the current assistant turn
  const streamingContentRef = useRef('');

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (isStreaming || !text.trim()) return;

      const userMessage: Message = { id: generateId(), role: 'user', content: text };
      const assistantId = generateId();
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setDisplayMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsStreaming(true);
      setActiveToolCall(null);
      streamingContentRef.current = '';

      // Snapshot history at call time — will be updated after done
      const historySnapshot = geminiHistory;

      const controller = streamChat(text, historySnapshot, {
        onToolCall: (tool) => {
          setActiveToolCall(`Calling ${tool}...`);
        },
        onText: (content) => {
          setActiveToolCall(null);
          streamingContentRef.current += content;
          const current = streamingContentRef.current;
          setDisplayMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m)),
          );
        },
        onError: (code: ErrorCode) => {
          streamingMessageIdRef.current = null;
          setDisplayMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: getErrorMessage(code), isStreaming: false, isError: true }
                : m,
            ),
          );
          setIsStreaming(false);
          setActiveToolCall(null);
        },
        onDone: () => {
          streamingMessageIdRef.current = null;
          const finalContent = streamingContentRef.current;

          setDisplayMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
          );

          // Sync gemini history: append user turn + assistant turn
          setGeminiHistory((prev) => [
            ...prev,
            { role: 'user', parts: [{ text }] },
            { role: 'model', parts: [{ text: finalContent }] },
          ]);

          setIsStreaming(false);
          setActiveToolCall(null);
        },
      }, selectedModel);

      abortRef.current = controller;
      streamingMessageIdRef.current = assistantId;
    },
    [isStreaming, geminiHistory, selectedModel],
  );

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    streamingContentRef.current = '';
    setDisplayMessages([]);
    setGeminiHistory([]);
    setIsStreaming(false);
    setActiveToolCall(null);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const stoppedId = streamingMessageIdRef.current;
    streamingMessageIdRef.current = null;
    if (stoppedId) {
      if (streamingContentRef.current) {
        setDisplayMessages((prev) =>
          prev.map((m) => (m.id === stoppedId ? { ...m, isStreaming: false } : m)),
        );
      } else {
        setDisplayMessages((prev) => prev.filter((m) => m.id !== stoppedId));
      }
    }
    streamingContentRef.current = '';
    setIsStreaming(false);
    setActiveToolCall(null);
  }, []);

  return { displayMessages, isStreaming, activeToolCall, sendMessage, resetChat, stopStreaming, selectedModel, setModel };
}

export type UseChatReturn = ReturnType<typeof useChat>;
