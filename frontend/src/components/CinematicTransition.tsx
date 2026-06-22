"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATS_POOL = [
  { text: "100* Centuries", tx: "-300px", ty: "-200px", delay: "0.2s" },
  { text: "800+ Wickets", tx: "320px", ty: "-180px", delay: "0.5s" },
  { text: "99.94 Test Avg", tx: "-350px", ty: "150px", delay: "0.8s" },
  { text: "DLS System Synced", tx: "280px", ty: "220px", delay: "0.4s" },
  { text: "IPL 2026 Core", tx: "-100px", ty: "-320px", delay: "1.1s" },
  { text: "WTC Final Node", tx: "150px", ty: "-300px", delay: "0.1s" },
  { text: "Crease Dynamic", tx: "-250px", ty: "280px", delay: "1.4s" },
  { text: "Super Over Enabled", tx: "350px", ty: "50px", delay: "1.3s" }
];

const STREAKS = Array.from({ length: 16 }).map((_, i) => ({
  angle: `${i * 22.5}deg`,
  delay: `${(i % 4) * 0.25}s`
}));

const LOGS = [
  "CONNECTING TO STADIUM HOST NODE...",
  "INITIALIZING REAL-TIME WICKET STREAM...",
  "COMPUTING EVERGREEN PLAYER MAP...",
  "IGNITING DYNAMIC STATS GRAPH...",
  "READY FOR PLAY"
];

export default function CinematicTransition() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < LOGS.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#07090e] z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Deep Space Gradient Moving Map */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,240,10,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(194,30,46,0.05)_0%,transparent_50%)] pointer-events-none" />

      {/* Stadium spotlight glow halos in four corners */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-spotlight" />
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-spotlight" style={{ animationDelay: "1s" }} />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-spotlight" style={{ animationDelay: "2s" }} />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-spotlight" style={{ animationDelay: "1.5s" }} />

      {/* Futuristic concentric energy rings (Wormhole Depth) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full h-full">
        <div className="absolute left-1/2 top-1/2 w-64 h-64 border border-accent/10 rounded-full animate-tunnel" style={{ animationDelay: "0s" }} />
        <div className="absolute left-1/2 top-1/2 w-64 h-64 border border-accent/5 rounded-full animate-tunnel" style={{ animationDelay: "0.8s" }} />
        <div className="absolute left-1/2 top-1/2 w-64 h-64 border border-accent/15 rounded-full animate-tunnel" style={{ animationDelay: "1.6s" }} />
        <div className="absolute left-1/2 top-1/2 w-64 h-64 border border-zinc-700/20 rounded-full animate-tunnel" style={{ animationDelay: "2.4s" }} />
      </div>

      {/* Fast-moving sci-fi light streaks radiating outward */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full h-full">
        {STREAKS.map((s, idx) => (
          <div
            key={idx}
            className="absolute left-1/2 top-1/2 w-[2px] h-[150px] bg-gradient-to-t from-transparent via-accent/30 to-accent rounded-full origin-bottom animate-streak"
            style={{
              "--angle": s.angle,
              animationDelay: s.delay,
              transform: `rotate(${s.angle}) translate(-50%, -100%)`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Floating dynamic cricket statistics flying past camera */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full h-full">
        {STATS_POOL.map((s, idx) => (
          <div
            key={idx}
            className="absolute left-1/2 top-1/2 text-xs font-mono tracking-widest text-accent/80 font-bold whitespace-nowrap px-3 py-1 bg-[#111622]/45 backdrop-blur-sm border border-accent/20 rounded-lg shadow-lg animate-stat"
            style={{
              "--tx": s.tx,
              "--ty": s.ty,
              animationDelay: s.delay
            } as React.CSSProperties}
          >
            {s.text}
          </div>
        ))}
      </div>

      {/* Center status box */}
      <div className="relative z-10 text-center max-w-sm px-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="p-6 rounded-2xl glass-panel border border-accent/20 shadow-2xl relative overflow-hidden"
        >
          {/* Animated ball seam inside center radar */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,240,10,0.05)_0%,transparent_60%)] pointer-events-none" />
          
          {/* Neon rotating scan ring */}
          <div className="w-16 h-16 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-6 flex items-center justify-center">
            <span className="text-xl">🏏</span>
          </div>

          <h3 className="text-white font-extrabold text-sm uppercase tracking-widest mb-3">
            Entering Universe
          </h3>

          <div className="h-6 overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={logIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider"
              >
                {LOGS[logIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Dynamic Sports Progress bar indicator */}
          <div className="w-full bg-[#111622] rounded-full h-1 mt-4 overflow-hidden border border-zinc-800">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.1, ease: "easeInOut" }}
              className="bg-accent h-full shadow-[0_0_8px_var(--accent)]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
