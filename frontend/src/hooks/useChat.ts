"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { clearChatMemory, sendChatMessage } from "@/lib/api";
import { ChatSession, Message } from "@/types/chat";

const LOCAL_STORAGE_KEY = "cricket_gpt_sessions";
const ACTIVE_SESSION_KEY = "cricket_gpt_active_session_id";
const CHAT_STORE_EVENT = "cricket-gpt-chat-store";
const EMPTY_SESSIONS: ChatSession[] = [];

let cachedSessionsValue: ChatSession[] | null = null;
let cachedSessionsStorage: string | null = null;

function generateId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `sess_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

function createSession(): ChatSession {
  return {
    id: generateId(),
    title: "New Discussion",
    messages: [],
    createdAt: new Date().toISOString(),
  };
}

function isChatSession(value: unknown): value is ChatSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const session = value as Partial<ChatSession>;
  return (
    typeof session.id === "string" &&
    typeof session.title === "string" &&
    Array.isArray(session.messages) &&
    typeof session.createdAt === "string"
  );
}

function emitStoreChange(): void {
  window.dispatchEvent(new Event(CHAT_STORE_EVENT));
}

function readSessions(): ChatSession[] {
  if (typeof window === "undefined") {
    return EMPTY_SESSIONS;
  }

  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedSessionsValue && stored === cachedSessionsStorage) {
      return cachedSessionsValue;
    }

    const parsed: unknown = stored ? JSON.parse(stored) : null;

    if (Array.isArray(parsed)) {
      const sessions = parsed.filter(isChatSession);
      if (sessions.length > 0) {
        cachedSessionsStorage = stored;
        cachedSessionsValue = sessions;
        return sessions;
      }
    }
  } catch (error) {
    console.error("Failed to parse stored sessions", error);
  }

  const initialSession = createSession();
  const initialSessions = [initialSession];
  const serializedSessions = JSON.stringify(initialSessions);

  cachedSessionsStorage = serializedSessions;
  cachedSessionsValue = initialSessions;

  window.localStorage.setItem(LOCAL_STORAGE_KEY, serializedSessions);
  window.localStorage.setItem(ACTIVE_SESSION_KEY, initialSession.id);
  return initialSessions;
}

function readActiveSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sessions = readSessions();
  const stored = window.localStorage.getItem(ACTIVE_SESSION_KEY);

  if (stored && sessions.some((session) => session.id === stored)) {
    return stored;
  }

  const nextActiveId = sessions[0]?.id ?? null;
  if (nextActiveId) {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, nextActiveId);
  }
  return nextActiveId;
}

function subscribeToChatStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_KEY || event.key === ACTIVE_SESSION_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(CHAT_STORE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);
  queueMicrotask(onStoreChange);

  return () => {
    window.removeEventListener(CHAT_STORE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function getServerSessionsSnapshot(): ChatSession[] {
  return EMPTY_SESSIONS;
}

function getServerActiveSessionSnapshot(): string | null {
  return null;
}

function saveSessions(updatedSessions: ChatSession[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const serializedSessions = JSON.stringify(updatedSessions);
  cachedSessionsStorage = serializedSessions;
  cachedSessionsValue = updatedSessions;

  window.localStorage.setItem(LOCAL_STORAGE_KEY, serializedSessions);
  emitStoreChange();
}

function saveActiveSessionId(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_SESSION_KEY, id);
  emitStoreChange();
}

function getSessionTitle(content: string, session: ChatSession): string {
  if (session.title !== "New Discussion" || session.messages.length > 0) {
    return session.title;
  }

  return content.length > 28 ? `${content.slice(0, 25)}...` : content;
}

export function useChat() {
  const sessions = useSyncExternalStore(
    subscribeToChatStore,
    readSessions,
    getServerSessionsSnapshot
  );
  const activeSessionId = useSyncExternalStore(
    subscribeToChatStore,
    readActiveSessionId,
    getServerActiveSessionSnapshot
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialized = sessions.length > 0 && activeSessionId !== null;
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const selectSession = useCallback((id: string) => {
    saveActiveSessionId(id);
    setError(null);
  }, []);

  const startNewChat = useCallback(() => {
    const newSession = createSession();
    saveSessions([newSession, ...sessions]);
    saveActiveSessionId(newSession.id);
  }, [sessions]);

  const clearActiveChat = useCallback(async () => {
    if (!activeSessionId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await clearChatMemory(activeSessionId);
      saveSessions(
        sessions.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [], title: "New Discussion" }
            : session
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error clearing history";
      setError(`Failed to clear chat memory: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, sessions]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!activeSessionId || !trimmed || isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const userMessage: Message = { role: "user", content: trimmed };
      let updatedSessions = sessions.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              title: getSessionTitle(trimmed, session),
            }
          : session
      );

      saveSessions(updatedSessions);

      try {
        const response = await sendChatMessage(trimmed, activeSessionId);
        const assistantMessage: Message = {
          role: "assistant",
          content: response.reply,
          ...(response.metadata_type && response.metadata
            ? { metadata_type: response.metadata_type, metadata: response.metadata }
            : {}),
        };

        updatedSessions = updatedSessions.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        );
        saveSessions(updatedSessions);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(`Failed to get reply: ${message}`);

        const errorMessage: Message = {
          role: "assistant",
          content:
            "Error: Could not reach the CricketGPT brain. Please make sure the backend server is running and try again.",
        };

        saveSessions(
          updatedSessions.map((session) =>
            session.id === activeSessionId
              ? { ...session, messages: [...session.messages, errorMessage] }
              : session
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, isLoading, sessions]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await clearChatMemory(id).catch((err: unknown) => {
        console.warn("Failed to clear memory on backend for deleted session", err);
      });

      const updatedSessions = sessions.filter((session) => session.id !== id);
      let nextActiveId = activeSessionId;

      if (id === activeSessionId) {
        if (updatedSessions.length > 0) {
          nextActiveId = updatedSessions[0].id;
        } else {
          const initialSession = createSession();
          updatedSessions.push(initialSession);
          nextActiveId = initialSession.id;
        }
      }

      saveSessions(updatedSessions);
      if (nextActiveId) {
        saveActiveSessionId(nextActiveId);
      }
    },
    [activeSessionId, sessions]
  );

  const clearAllSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all(sessions.map((session) => clearChatMemory(session.id).catch(() => {})));
    } catch (err) {
      console.warn("Failed to clear backend memories", err);
    } finally {
      const initialSession = createSession();
      saveSessions([initialSession]);
      saveActiveSessionId(initialSession.id);
      setIsLoading(false);
    }
  }, [sessions]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    isLoading,
    error,
    initialized,
    selectSession,
    startNewChat,
    clearActiveChat,
    deleteSession,
    clearAllSessions,
    sendMessage,
  };
}
