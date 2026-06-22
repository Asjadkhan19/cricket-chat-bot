"use client";

import { motion } from "framer-motion";
import { ChevronRight, ArrowDown, Award, Shield, Activity, Sliders } from "lucide-react";

interface LandingPageProps {
  onStartChat: (prefilledPrompt?: string, tab?: string) => void;
}

const customFeatures = [
  {
    icon: Award,
    title: "Player Insights",
    description: "Explore player records, career directories, stats filtering, and profiles across men & women cricketers.",
    tab: "players",
    accent: "from-green-600/20 to-green-600/5",
    iconColor: "text-green-400"
  },
  {
    icon: Shield,
    title: "Team Insights",
    description: "Compare international teams and franchise clubs (IPL, BBL, PSL, etc.) to discover strengths and dynamics.",
    tab: "teams",
    accent: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400"
  },
  {
    icon: Activity,
    title: "Match Analysis",
    description: "Analyze live and past matches, compare team innings, study matchups, and simulate match pressure phases.",
    tab: "matches",
    accent: "from-teal-500/20 to-teal-500/5",
    iconColor: "text-teal-400"
  },
  {
    icon: Sliders,
    title: "Cricket Tools",
    description: "Access over 50 specialized calculators, matchups matrices, DLS templates, and team selection helpers.",
    tab: "tools",
    accent: "from-lime-500/20 to-lime-500/5",
    iconColor: "text-lime-400"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 65, damping: 16 } },
};

export default function LandingPage({ onStartChat }: LandingPageProps) {
  const handleScrollToFeatures = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040905] relative overflow-hidden text-foreground">
      {/* Stadium Turf Grass Stripes Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #155828, #155828 80px, #0f441e 80px, #0f441e 160px)`,
        }}
      />
      
      {/* Fine turf blade noise overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle_at_center, #ffffff 1px, transparent 1px)`,
          backgroundSize: '8px 8px'
        }}
      />

      {/* Horizontal Clay Cricket Pitch in the Center */}
      <div className="absolute top-[42%] -translate-y-1/2 left-0 right-0 h-[380px] pointer-events-none select-none z-0">
        {/* Clay soil body */}
        <div 
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to right, rgba(139, 90, 43, 0) 0%, rgba(161, 122, 85, 0.15) 15%, rgba(181, 142, 105, 0.45) 50%, rgba(161, 122, 85, 0.15) 85%, rgba(139, 90, 43, 0) 100%)',
          }}
        />
        
        {/* Popping Crease Lines & Wickets representing horizontal pitch alignment */}
        <div className="absolute inset-0 flex justify-between items-center px-[12%] sm:px-[18%] opacity-35">
          {/* Batting Crease (Left) */}
          <div className="relative h-[200px] w-[2px] bg-white">
            {/* Wickets representation (3 stumps) */}
            <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
              <div className="w-1.5 h-6 bg-white/70 rounded-sm" />
              <div className="w-1.5 h-6 bg-white/70 rounded-sm" />
              <div className="w-1.5 h-6 bg-white/70 rounded-sm" />
            </div>
          </div>
          
          {/* Bowling Crease (Right) */}
          <div className="relative h-[200px] w-[2px] bg-white">
            {/* Wickets representation (3 stumps) */}
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
              <div className="w-1.5 h-6 bg-white/70 rounded-sm" />
              <div className="w-1.5 h-6 bg-white/70 rounded-sm" />
              <div className="w-1.5 h-6 bg-white/70 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Stadium floodlight edge glow effects */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-[#155828]/10 via-[#155828]/2 to-transparent pointer-events-none z-0" />
      <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-white/[0.03] blur-[100px] pointer-events-none z-0" />
      <div className="absolute -top-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-white/[0.03] blur-[100px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow px-4 pt-36 pb-16 text-center relative z-10">
        {/* Apple/F1 style live dynamic badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#111622]/80 border border-white/5 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-accent shadow-md backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />
          Cricket Intelligence Platform
        </motion.div>

        {/* Large Cinematic Title */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 60 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-6 uppercase"
        >
          <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Cricket
          </span>
          <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-accent via-accent-hover to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.2)] ml-0 sm:ml-4">
            Chatbot
          </span>
        </motion.h1>

        {/* Nike/Netflix style Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="max-w-2xl text-lg sm:text-xl md:text-2xl text-zinc-200 font-semibold tracking-wide leading-relaxed mb-4 px-4"
        >
          Ask anything about cricket. Players, records, live matches, statistics, history, teams, tournaments, and more...
        </motion.p>

        {/* Small supporting text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-xl text-xs sm:text-sm text-zinc-400 font-medium mb-12"
        >
          Dive into cricket&apos;s immense knowledge and clear every doubt you have about cricket.
        </motion.p>

        {/* Premium Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-28 w-full sm:w-auto px-6 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(34,197,94,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStartChat(undefined, "prompts")}
            className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-accent text-black font-extrabold text-sm tracking-wider uppercase transition-all duration-200 shadow-2xl shadow-accent/15 border border-accent/20 cursor-pointer"
          >
            Start Chatting
            <ChevronRight className="w-5 h-5 stroke-[2.5px]" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleScrollToFeatures}
            className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-[#111622]/40 hover:bg-[#111622]/60 border border-white/5 text-white font-bold text-sm tracking-wide uppercase transition-all duration-200 backdrop-blur-md cursor-pointer"
          >
            Explore Features
            <ArrowDown className="w-4 h-4 text-zinc-400 group-hover:translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>
      </section>

      {/* Features Cards Grid Section */}
      <section id="features" className="px-6 pb-32 relative z-10 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 uppercase tracking-widest">
              Intelligence Modules
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
              Unlock different dimensions of the cricket ecosystem. Choose a module to begin.
            </p>
          </motion.div>

          {/* Staggered features list of exactly 4 cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {customFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -6,
                    borderColor: "rgba(34,197,94,0.25)",
                    boxShadow: "0 15px 30px rgba(34,197,94,0.04)"
                  }}
                  onClick={() => onStartChat(undefined, f.tab)}
                  className="p-6 rounded-2xl border border-white/5 bg-[#111622]/30 hover:bg-[#111622]/55 transition-all duration-300 cursor-pointer relative group overflow-hidden flex flex-col justify-between"
                >
                  {/* Glowing background gradient block */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#111622]/80 border border-white/5 flex items-center justify-center mb-5 shadow-lg transition-colors group-hover:border-green-500/20">
                      <Icon className={`w-5.5 h-5.5 ${f.iconColor} group-hover:scale-110 transition-transform`} />
                    </div>
                    
                    <h3 className="text-white font-extrabold text-base mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
                      {f.title}
                    </h3>
                    
                    <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                      {f.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center text-[10px] uppercase font-bold text-accent tracking-widest gap-1 group-hover:gap-2 transition-all duration-300">
                    Open Module
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 relative z-10 bg-sidebar/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full cricket-ball-seam" />
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
              © 2026 CricketGPT · Premium Sports Technology
            </p>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            <a href="#" className="text-zinc-500 hover:text-accent transition-colors">
              System Core
            </a>
            <a
              href="https://github.com/Asjadkhan19/cricket-chat-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-accent transition-colors"
            >
              Specs DB
            </a>
            <a href="#" className="text-zinc-500 hover:text-accent transition-colors">
              Crease Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
