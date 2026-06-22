import React from 'react';

export function PitchGraphics() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
      {/* Blueprint grid pattern */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'radial-gradient(#222222 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <svg 
        className="absolute w-full h-full text-zinc-800"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {/* Subtle Pitch Outer Boundary (Perspective lines) */}
        <path 
          d="M 200,900 L 400,100 L 600,100 L 800,900 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          strokeDasharray="5,5"
        />

        {/* Popping Crease (Batting crease) at bottom */}
        <line 
          x1="100" 
          y1="800" 
          x2="900" 
          y2="800" 
          stroke="var(--color-primary, #d3f00a)" 
          strokeWidth="1" 
          opacity="0.3"
        />
        <line 
          x1="100" 
          y1="800" 
          x2="900" 
          y2="800" 
          stroke="currentColor" 
          strokeWidth="0.5"
        />

        {/* Bowling Crease (Wickets line) */}
        <line 
          x1="250" 
          y1="830" 
          x2="750" 
          y2="830" 
          stroke="currentColor" 
          strokeWidth="0.5"
        />

        {/* Return Crease (vertical bounds for bowler) */}
        <line 
          x1="250" 
          y1="800" 
          x2="250" 
          y2="850" 
          stroke="currentColor" 
          strokeWidth="0.5"
        />
        <line 
          x1="750" 
          y1="800" 
          x2="750" 
          y2="850" 
          stroke="currentColor" 
          strokeWidth="0.5"
        />

        {/* Wickets representation (3 dots/lines) */}
        <circle cx="485" cy="830" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="500" cy="830" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="515" cy="830" r="2" fill="currentColor" opacity="0.5" />

        {/* Popping Crease at top (opposing side) */}
        <line 
          x1="300" 
          y1="200" 
          x2="700" 
          y2="200" 
          stroke="currentColor" 
          strokeWidth="0.5"
        />
        <line 
          x1="350" 
          y1="170" 
          x2="650" 
          y2="170" 
          stroke="currentColor" 
          strokeWidth="0.5"
        />
        {/* Opposing Wickets */}
        <circle cx="490" cy="170" r="1.5" fill="currentColor" opacity="0.5" />
        <circle cx="500" cy="170" r="1.5" fill="currentColor" opacity="0.5" />
        <circle cx="510" cy="170" r="1.5" fill="currentColor" opacity="0.5" />

        {/* Technical crosshairs & details */}
        <path d="M 500,500 L 500,480 M 500,500 L 500,520 M 500,500 L 480,500 M 500,500 L 520,500" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="500" cy="500" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
      </svg>
    </div>
  );
}
