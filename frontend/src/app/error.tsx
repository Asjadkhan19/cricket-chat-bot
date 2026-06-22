'use client';

import { useEffect } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled UI Exception:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center relative overflow-hidden">
      {/* Stadium glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] h-[60vw] w-[80vw] rounded-full bg-accent/5 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-md w-full p-8 rounded-2xl bg-surface border border-border shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black mb-3 tracking-tight text-white">
          Innings Disrupted!
        </h2>
        
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          An unexpected error occurred while rendering the page. The batsman had to pull out of the crease.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-extrabold text-sm transition-colors duration-200 shadow-md shadow-accent/15"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Innings
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-border text-white font-bold text-sm transition-all duration-200"
          >
            <Home className="w-4 h-4 text-gray-400" />
            Return to Pavilion
          </button>
        </div>
      </div>
    </div>
  );
}
