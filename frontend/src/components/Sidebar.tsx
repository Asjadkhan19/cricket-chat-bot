"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, X, TrendingUp, User } from "lucide-react";
import { ChatSession } from "@/types/chat";

const TRENDING_TOPICS = [
  "IPL 2026 Standings",
  "ICC WTC Final Matchups",
  "Next Ind vs Pak Match",
  "Fastest ODI Centuries",
];

const FAVORITE_PLAYERS = [
  "Virat Kohli",
  "MS Dhoni",
  "Sachin Tendulkar",
  "Ellyse Perry",
  "Smriti Mandhana",
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onClearActiveChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  onQuickQuery?: (query: string) => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onClearActiveChat,
  onDeleteSession,
  onClearAllSessions,
  onQuickQuery,
}: SidebarProps) {
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messageCount = activeSession?.messages.length || 0;

  return (
    <>
      {/* Mobile background overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Layout */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative flex-shrink-0 bg-[#0b0d12]/95 border-r border-border h-full overflow-hidden z-50 md:z-auto"
      >
        <div className="flex flex-col h-full w-[280px] p-5">
          {/* Header & Title logo */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-black font-extrabold shadow-md shadow-accent/15">
                🏏
              </div>
              <span className="text-white font-extrabold text-base tracking-wider uppercase">
                Cricket<span className="text-accent">GPT</span>
              </span>
            </div>
            
            {/* Close sidebar button for mobile */}
            <button 
              onClick={onToggle}
              className="md:hidden p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-surface transition-colors border border-transparent hover:border-border"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Discussion Trigger Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-accent text-black hover:bg-accent-hover transition-colors duration-200 text-xs font-bold uppercase tracking-wider mb-5 shadow-lg shadow-accent/10 border border-accent/20"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            New Crease Discussion
          </motion.button>

          {/* Sections scroll area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-6">
            
            {/* 1. Recent Creases */}
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mb-2 px-1">
                Crease History
              </p>
              <div className="space-y-1">
                {sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className="group relative flex items-center w-full"
                    >
                      <motion.button
                        onClick={() => {
                          onSelectSession(session.id);
                          if (window.innerWidth < 768) {
                            onToggle();
                          }
                        }}
                        whileHover={{ x: 2 }}
                        className={`flex items-center gap-2.5 w-full pr-10 pl-3 py-2.5 rounded-xl text-left text-xs transition-all duration-200 border ${
                          isActive
                            ? "bg-surface/60 border-accent/25 text-white font-bold shadow-md shadow-accent/2"
                            : "text-zinc-400 hover:text-white hover:bg-surface/30 border-transparent"
                        }`}
                      >
                        <MessageSquare
                          className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                            isActive ? "text-accent" : "text-zinc-500"
                          }`}
                        />
                        <span className="truncate flex-1">{session.title}</span>
                      </motion.button>

                      {/* Delete Individual Conversation Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="absolute right-2.5 p-1 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Trending Topics */}
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mb-2 px-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                Trending Topics
              </p>
              <div className="space-y-1">
                {TRENDING_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      onQuickQuery?.(topic);
                      if (window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className="w-full text-left text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-surface/30 border border-transparent hover:border-border transition-all duration-150 truncate flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <span className="text-[10px] text-zinc-500">🔥</span>
                    <span>{topic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Favorite Players */}
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mb-2 px-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                Favorite Cricketers
              </p>
              <div className="space-y-1">
                {FAVORITE_PLAYERS.map((player) => (
                  <button
                    key={player}
                    onClick={() => {
                      onQuickQuery?.(
                        `Analyze the cricket profile, career records, stats, highlights, and role of the cricketer: ${player}.`
                      );
                      if (window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className="w-full text-left text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-surface/30 border border-transparent hover:border-border transition-all duration-150 truncate flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <span className="text-[10px] text-zinc-500">🏏</span>
                    <span>{player}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Pitch border divider */}
          <div className="pitch-divider my-4 opacity-30" />

          {/* Footer Actions */}
          <div className="space-y-2">
            {messageCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClearActiveChat}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs text-zinc-400 bg-surface/20 hover:bg-red-500/10 hover:text-red-400 border border-border/80 hover:border-red-500/20 transition-all duration-200 font-bold uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Active Crease
              </motion.button>
            )}

            {sessions.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClearAllSessions}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs text-zinc-500 bg-transparent hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all duration-200 font-bold uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Conversations
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Desktop collapse toggle button */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[280px] z-50 w-6 h-12 rounded-r-xl bg-[#0b0d12]/95 border border-l-0 border-border items-center justify-center text-zinc-500 hover:text-white hover:bg-surface/50 transition-all duration-200 shadow-md"
        style={{ left: isOpen ? "280px" : "0px", transition: "left 0.25s ease-in-out" }}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </>
  );
}
