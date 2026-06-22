// src/components/TeamCard.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export interface TeamInfo {
  name: string;
  captain?: string;
  coach?: string;
  ranking?: string;
  logoUrl?: string; // team logo placeholder
  strengths?: string[]; // quick strengths bullets
  recentForm?: string; // brief form summary
  summary?: string;
}

export default function TeamCard({ info }: { info: TeamInfo }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="mb-4 p-4 rounded-2xl border border-accent/30 bg-surface/50 shadow-lg backdrop-blur-sm hover:border-accent/60 transition-colors"
    >
      {/* Header with logo and name */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
          {info.logoUrl ? (
            <Image
              src={info.logoUrl}
              alt={info.name}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-gray-500 text-2xl">🏏</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-accent">{info.name}</h2>
      </div>

      {/* Core details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-2">
        {info.captain && <div><span className="font-medium text-gray-200">Captain:</span> {info.captain}</div>}
        {info.coach && <div><span className="font-medium text-gray-200">Coach:</span> {info.coach}</div>}
        {info.ranking && <div><span className="font-medium text-gray-200">ICC Ranking:</span> {info.ranking}</div>}
      </div>

      {/* Strengths */}
      {info.strengths && info.strengths.length > 0 && (
        <ul className="list-disc list-inside text-sm text-gray-400 mb-2">
          {info.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      {/* Recent form */}
      {info.recentForm && (
        <p className="text-sm text-gray-400 mb-2"><span className="font-medium text-gray-200">Recent Form:</span> {info.recentForm}</p>
      )}

      {/* Summary */}
      {info.summary && (
        <p className="text-sm text-gray-400">{info.summary}</p>
      )}
    </motion.div>
  );
}
