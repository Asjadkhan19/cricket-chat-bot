"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Menu, X, Home } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { useChat } from "@/hooks/useChat";

interface ChatPageProps {
  onGoHome: () => void;
  initialPrompt?: string;
  initialTab?: string;
}

export default function ChatPage({ onGoHome, initialPrompt, initialTab }: ChatPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const {
    sessions,
    activeSession,
    activeSessionId,
    isLoading,
    initialized,
    selectSession,
    startNewChat,
    clearActiveChat,
    deleteSession,
    clearAllSessions,
    sendMessage,
  } = useChat();

  const [hasSentInitial, setHasSentInitial] = useState(false);

  // Handle prefilled prompt when coming from landing page
  useEffect(() => {
    if (!initialized || !activeSessionId || hasSentInitial || !initialPrompt) return;

    const sendInitial = async () => {
      setHasSentInitial(true);
      // If current crease already has conversations, spawn a new crease to keep it clean
      if (activeSession && activeSession.messages.length > 0) {
        startNewChat();
        setHasSentInitial(false); // Reset to send in the newly initialized crease
        return;
      }
      sendMessage(initialPrompt);
    };

    sendInitial();
  }, [initialized, activeSessionId, activeSession, initialPrompt, hasSentInitial, startNewChat, sendMessage]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage]
  );

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={selectSession}
            onNewChat={startNewChat}
            onClearActiveChat={clearActiveChat}
            onDeleteSession={deleteSession}
            onClearAllSessions={clearAllSessions}
            onQuickQuery={(query) => {
              setChatInput(query);
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Crease area */}
      <div className="flex flex-col flex-1 overflow-hidden h-full relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-hover hover:border-accent/30 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-4.5 h-4.5" />
              ) : (
                <Menu className="w-4.5 h-4.5" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏏</span>
              <span className="text-white font-extrabold text-sm tracking-wider">
                Cricket<span className="text-accent">GPT</span>
              </span>
            </div>
          </div>

          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent hover:border-border hover:bg-surface/50 text-gray-400 hover:text-white text-sm transition-all duration-200"
            aria-label="Go to home"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Pavilion</span>
          </button>
        </header>

        {/* Chat area wrapper */}
        <div className="flex-1 overflow-hidden h-full">
          <ChatWindow
            messages={activeSession?.messages || []}
            isLoading={isLoading}
            onSendMessage={handleSend}
            initialTab={initialTab}
            input={chatInput}
            setInput={setChatInput}
          />
        </div>
      </div>
    </div>
  );
}
