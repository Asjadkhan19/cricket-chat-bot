import { ChatResponse } from '@/types/chat';

const getApiUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }

  throw new Error('NEXT_PUBLIC_API_URL is required in production.');
};

export async function sendChatMessage(message: string, sessionId: string): Promise<ChatResponse> {
  const response = await fetch(`${getApiUrl()}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  const data: ChatResponse = await response.json();
  return data;
}

export async function clearChatMemory(sessionId: string): Promise<void> {
  const response = await fetch(`${getApiUrl()}/api/chat/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'clear', // required by ChatRequest schema on backend even if unused for clearing
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to clear chat memory: ${response.statusText}`);
  }
}
