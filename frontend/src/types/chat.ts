// src/types/chat.ts
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  // optional intelligence metadata from backend
  metadata_type?: 'player' | 'team' | 'match';
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
  // optional structured intelligence from backend
  metadata_type?: 'player' | 'team' | 'match';
  metadata?: Record<string, unknown>;
}
