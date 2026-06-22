"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "@/components/LandingPage";
import ChatPage from "@/components/ChatPage";
import CinematicTransition from "@/components/CinematicTransition";

type View = "landing" | "chat";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [initialTab, setInitialTab] = useState<string>("prompts");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleStartChat = (prompt?: string, tab?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    } else {
      setInitialPrompt("");
    }
    setInitialTab(tab || "prompts");
    setIsTransitioning(true);
  };

  const handleGoHome = () => {
    setView("landing");
    setInitialPrompt("");
    setInitialTab("prompts");
    setIsTransitioning(false);
  };

  useEffect(() => {
    if (!isTransitioning) return;

    // Trigger full screen transition for 2.2 seconds before launching the chatbot
    const timer = setTimeout(() => {
      setView("chat");
      setIsTransitioning(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [isTransitioning]);

  return (
    <div className="h-full bg-background min-h-screen relative">
      {/* Space Wormhole Cinematic Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="cinematic-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50"
          >
            <CinematicTransition />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4 }}
            className="h-full min-h-screen"
          >
            <LandingPage onStartChat={handleStartChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full min-h-screen"
          >
            <ChatPage onGoHome={handleGoHome} initialPrompt={initialPrompt} initialTab={initialTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
