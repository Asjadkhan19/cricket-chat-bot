// src/components/AnalysisCard.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

export interface AnalysisInfo {
  headToHead?: string;
  winProbability?: number; // 0-100 percentage
  recentForm?: string;
  keyPlayers?: string[];
  prediction?: string;
  insights?: string;
}

export default function AnalysisCard({ info }: { info: AnalysisInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 p-4 rounded-2xl border border-accent/30 bg-surface/50 shadow-lg backdrop-blur-sm"
    >
      <h2 className="text-xl font-bold text-accent mb-2">Match Analysis</h2>
      <div className="space-y-2 text-sm text-gray-300">
        {info.headToHead && (
          <p><span className="font-medium text-gray-200">Head‑to‑Head:</span> {info.headToHead}</p>
        )}
        {info.winProbability !== undefined && (
          <div>
            <p>
              <span className="font-medium text-gray-200">Win Probability:</span> {info.winProbability}%
            </p>
            <div className="w-full bg-gray-700 rounded h-2 mt-1">
              <div
                className="bg-accent h-2 rounded"
                style={{ width: `${info.winProbability}%` }}
              />
            </div>
          </div>
        )}
        {info.recentForm && (
          <p><span className="font-medium text-gray-200">Recent Form:</span> {info.recentForm}</p>
        )}
        {info.keyPlayers && info.keyPlayers.length > 0 && (
          <p><span className="font-medium text-gray-200">Key Players:</span> {info.keyPlayers.join(", ")}</p>
        )}
        {info.prediction && (
          <p className="mt-2 text-gray-400"><span className="font-medium text-gray-200">AI Prediction:</span> {info.prediction}</p>
        )}
        {info.insights && (
          <p className="mt-2 text-gray-400">{info.insights}</p>
        )}
      </div>
    </motion.div>
  );
}
