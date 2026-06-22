import React from 'react';

interface StadiumGlowProps {
  className?: string;
}

export function StadiumGlow({ className = '' }: StadiumGlowProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Top Left Floodlight Glow */}
      <div 
        className="absolute -top-[10%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-primary/15 blur-[120px] transition-opacity duration-1000"
        style={{ contentVisibility: 'auto' }}
      />
      
      {/* Top Right Floodlight Glow */}
      <div 
        className="absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] rounded-full bg-primary-dark/10 blur-[150px]"
        style={{ contentVisibility: 'auto' }}
      />

      {/* Center Deep Glow */}
      <div 
        className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[50vw] w-[80vw] rounded-full bg-dark-accent/30 blur-[130px] opacity-70"
        style={{ contentVisibility: 'auto' }}
      />

      {/* Bottom Glow */}
      <div 
        className="absolute -bottom-[20%] left-[10%] h-[60vw] w-[80vw] rounded-full bg-primary/5 blur-[160px]"
        style={{ contentVisibility: 'auto' }}
      />
    </div>
  );
}
