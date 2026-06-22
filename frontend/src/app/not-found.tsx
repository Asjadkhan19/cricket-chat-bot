'use client';

import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center relative overflow-hidden">
      {/* Stadium glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] h-[60vw] w-[80vw] rounded-full bg-accent/5 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-md w-full p-8 rounded-2xl bg-surface border border-border shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent mb-6 shadow-lg shadow-accent/5">
          <Compass className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black mb-3 tracking-tight text-white">
          Out of Crease! (404)
        </h2>
        
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The crease you are looking for does not exist. You might have been stumped by a bad link.
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-extrabold text-sm transition-colors duration-200 shadow-md shadow-accent/15"
        >
          <Home className="w-4 h-4" />
          Back to Pavilion
        </button>
      </div>
    </div>
  );
}
