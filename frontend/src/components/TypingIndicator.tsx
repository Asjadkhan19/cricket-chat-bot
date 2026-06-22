"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-start gap-3 px-4 py-3"
    >
      {/* Cricket ball inspired details */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold cricket-ball-seam text-white">
        🏏
      </div>

      {/* Dots with new accent color */}
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-border">
        <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
        <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
        <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
      </div>
    </motion.div>
  );
}
