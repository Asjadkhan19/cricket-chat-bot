"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export interface PlayerInfo {
  name: string;
  country: string; // ISO Alpha-2 code
  role: string;
  imageUrl?: string;
  flagUrl?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  careerSummary?: string;
  highlights?: string[];
  stats?: {
    matches?: number;
    runs?: number;
    wickets?: number;
    avg?: number;
  };
}

const greenAccent = "#2ebd59";

/** Derive up to 2 initials from a full name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Inline SVG initials avatar — never broken, no external requests */
function InitialsAvatar({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-full flex-shrink-0"
      aria-label={`${name} avatar`}
    >
      <circle cx="32" cy="32" r="32" fill="#111827" />
      <circle cx="32" cy="32" r="31" fill="none" stroke={greenAccent} strokeWidth="1" strokeOpacity="0.4" />
      {/* Subtle cricket ball seam arcs */}
      <path d="M 14 32 Q 32 18 50 32" stroke={greenAccent} strokeWidth="0.7" fill="none" strokeOpacity="0.18" />
      <path d="M 14 32 Q 32 46 50 32" stroke={greenAccent} strokeWidth="0.7" fill="none" strokeOpacity="0.18" />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill={greenAccent}
        letterSpacing="1"
      >
        {initials}
      </text>
    </svg>
  );
}

const PlayerCard: React.FC<{ info: PlayerInfo }> = memo(({ info }) => {
  const flagSrc =
    info.flagUrl ?? `https://flagcdn.com/w40/${info.country.toLowerCase()}.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: `0 0 14px ${greenAccent}33` }}
      transition={{ duration: 0.3 }}
      className="mb-4 p-5 rounded-2xl border border-accent/30 bg-surface/60 shadow-lg backdrop-blur-sm overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-4 mb-4">
        <InitialsAvatar name={info.name} />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-accent flex flex-wrap items-center gap-2 leading-tight">
            {info.name}
            <span className="px-2 py-0.5 text-xs font-medium bg-accent/15 text-accent rounded-md whitespace-nowrap">
              {info.role}
            </span>
          </h2>
          <div className="flex items-center text-sm text-gray-300 mt-1.5 gap-1.5">
            <Image
              src={flagSrc}
              alt={info.country}
              width={20}
              height={12}
              className="w-5 h-4 object-cover rounded-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="uppercase tracking-wide text-xs text-gray-400">
              {info.country}
            </span>
          </div>
        </div>
      </div>

      {/* Batting / Bowling style */}
      {(info.battingStyle || info.bowlingStyle) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-300 mb-3 border-t border-white/5 pt-3">
          {info.battingStyle && (
            <div>
              <span className="font-semibold text-gray-200">Batting </span>
              <span className="text-gray-400">{info.battingStyle}</span>
            </div>
          )}
          {info.bowlingStyle && (
            <div>
              <span className="font-semibold text-gray-200">Bowling </span>
              <span className="text-gray-400">{info.bowlingStyle}</span>
            </div>
          )}
        </div>
      )}

      {/* Career highlights */}
      {info.highlights && info.highlights.length > 0 && (
        <ul className="space-y-1.5 text-sm text-gray-400 mb-3">
          {info.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-accent flex-shrink-0 mt-0.5 text-xs">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Career summary */}
      {info.careerSummary && (
        <p className="text-sm text-gray-400 border-t border-white/5 pt-3 italic leading-relaxed">
          {info.careerSummary}
        </p>
      )}
    </motion.div>
  );
});

PlayerCard.displayName = "PlayerCard";

export default PlayerCard;
