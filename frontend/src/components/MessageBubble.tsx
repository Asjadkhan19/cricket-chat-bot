
"use client";

import { motion } from "framer-motion";
import PlayerCard from "./PlayerCard";
import TeamCard from "./TeamCard";
import AnalysisCard from "./AnalysisCard";
import { User, AlertTriangle } from "lucide-react";
import { Message } from "@/types/chat";
import React, { memo, useMemo } from "react";
import type { PlayerInfo } from "./PlayerCard";
import type { TeamInfo } from "./TeamCard";
import type { AnalysisInfo } from "./AnalysisCard";


interface MessageBubbleProps {
  message: Message;
}

type CardTag = "player_card" | "team_card" | "analysis_card";

type CardRenderer = {
  tag: CardTag;
  render: (data: Record<string, unknown>, key: string) => React.ReactNode;
};

function parseCardData(json: string): Record<string, unknown> | null {
  const parsed: unknown = JSON.parse(json);
  if (isPlainRecord(parsed)) {
    return parsed;
  }
  return null;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPlayerInfo(value: unknown): value is PlayerInfo {
  if (!isPlainRecord(value)) {
    return false;
  }

  const stats = value.stats;
  const hasValidStats =
    stats === undefined ||
    (typeof stats === "object" && stats !== null && !Array.isArray(stats));

  return (
    typeof value.name === "string" &&
    typeof value.country === "string" &&
    typeof value.role === "string" &&
    (value.imageUrl === undefined || typeof value.imageUrl === "string") &&
    (value.flagUrl === undefined || typeof value.flagUrl === "string") &&
    (value.battingStyle === undefined || typeof value.battingStyle === "string") &&
    (value.bowlingStyle === undefined || typeof value.bowlingStyle === "string") &&
    (value.careerSummary === undefined || typeof value.careerSummary === "string") &&
    (value.highlights === undefined || isStringArray(value.highlights)) &&
    hasValidStats
  );
}

function isTeamInfo(value: unknown): value is TeamInfo {
  if (!isPlainRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    (value.captain === undefined || typeof value.captain === "string") &&
    (value.coach === undefined || typeof value.coach === "string") &&
    (value.ranking === undefined || typeof value.ranking === "string") &&
    (value.logoUrl === undefined || typeof value.logoUrl === "string") &&
    (value.strengths === undefined || isStringArray(value.strengths)) &&
    (value.recentForm === undefined || typeof value.recentForm === "string") &&
    (value.summary === undefined || typeof value.summary === "string")
  );
}

function isAnalysisInfo(value: unknown): value is AnalysisInfo {
  if (!isPlainRecord(value)) {
    return false;
  }

  return (
    (value.headToHead === undefined || typeof value.headToHead === "string") &&
    (value.winProbability === undefined || typeof value.winProbability === "number") &&
    (value.recentForm === undefined || typeof value.recentForm === "string") &&
    (value.keyPlayers === undefined || isStringArray(value.keyPlayers)) &&
    (value.prediction === undefined || typeof value.prediction === "string") &&
    (value.insights === undefined || typeof value.insights === "string")
  );
}

function formatContent(content: string): React.ReactNode {
  // Simple markdown-like formatting for assistant messages
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const key = `line-${i}`;
    // Bullet points
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <li key={key} className="ml-4 list-disc text-gray-300">
          {formatInline(line.slice(2))}
        </li>
      );
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={key} className="ml-4 list-decimal text-gray-300">
          {formatInline(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
    }
    // Empty line = paragraph break
    if (line.trim() === "") {
      return <br key={key} />;
    }
    return (
      <p key={key} className="leading-relaxed text-gray-300">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-accent font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.content.startsWith("⚠️ Error");

  // Parse potential intelligence cards from assistant messages (memoized for performance)
  const { cardComponents, displayedContent } = useMemo(() => {
    const cards: React.ReactNode[] = [];
    let content = message.content;

    if (!isUser) {
      // ALWAYS strip XML card markup first — these are internal transport tags,
      // never user-visible text. Covers stale localStorage messages and any
      // tags the backend may have missed stripping.
      const CARD_TAG_RE = /\s*<(?:player_card|team_card|analysis_card|match_card)>[\s\S]*?<\/(?:player_card|team_card|analysis_card|match_card)>\s*/gi;
      content = content.replace(CARD_TAG_RE, ' ').trim();

      // PRIMARY PATH: Render cards from structured metadata (backend-driven)
      if (message.metadata_type && message.metadata) {
        switch (message.metadata_type) {
          case 'player':
            if (isPlayerInfo(message.metadata)) {
              cards.push(<PlayerCard key="meta-player" info={message.metadata} />);
            }
            break;
          case 'team':
            if (isTeamInfo(message.metadata)) {
              cards.push(<TeamCard key="meta-team" info={message.metadata} />);
            }
            break;
          case 'match':
            if (isAnalysisInfo(message.metadata)) {
              cards.push(<AnalysisCard key="meta-match" info={message.metadata} />);
            }
            break;
        }
        // Primary path produced a card — skip regex fallback to prevent duplicates
      } else {
        // FALLBACK PATH: Regex extraction from reply text (only runs when no metadata)
        // Handles edge cases where tags are malformed or partially present.
        const regexes: CardRenderer[] = [
          {
            tag: 'player_card',
            render: (data, key) => isPlayerInfo(data) ? <PlayerCard key={key} info={data} /> : null,
          },
          {
            tag: 'team_card',
            render: (data, key) => isTeamInfo(data) ? <TeamCard key={key} info={data} /> : null,
          },
          {
            tag: 'analysis_card',
            render: (data, key) => isAnalysisInfo(data) ? <AnalysisCard key={key} info={data} /> : null,
          },
        ];
        regexes.forEach(({ tag, render }) => {
          const pattern = new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, 'g');
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach((match, index) => {
              const jsonStr = match.replace(new RegExp(`^<${tag}>|<\\/${tag}>$`, 'g'), '').trim();
              try {
                const data = parseCardData(jsonStr);
                if (data) {
                  cards.push(render(data, `${tag}-${index}`));
                }
              } catch (e) {
                console.error(`Failed to parse ${tag} JSON`, e);
              }
            });
            content = content.replace(pattern, '');
          }
        });
      }
    }
    return { cardComponents: cards, displayedContent: content.trim() };
  }, [message.content, message.metadata_type, message.metadata, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3.5 px-4 py-4 w-full ${isUser ? "flex-row-reverse" : "flex-row"
        }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-md ${isUser
          ? "bg-zinc-700 to-zinc-900 border border-zinc-600 text-zinc-300"
          : "cricket-ball-seam text-white"
          }`}
      >
        {isUser ? <User className="w-4 h-4" /> : "🏏"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg relative ${isUser
          ? "bg-surface border border-zinc-800 text-white rounded-tr-none hover:border-zinc-700 transition-colors"
          : isError
            ? "bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none"
            : "bg-surface/50 border border-border text-gray-200 rounded-tl-none"
          }`}
      >
        {/* Glow effect for assistant bubbles */}
        {!isUser && !isError && (
          <div className="absolute inset-0 rounded-2xl bg-accent/2 opacity-20 pointer-events-none" />
        )}

        {/* Error icon */}
        {isError && (
          <div className="flex items-center gap-1.5 mb-2 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Connection Issue</span>
          </div>
        )}

        {/* Optional intelligence cards above content */}
        {cardComponents && cardComponents.length > 0 && (
          <div className="mb-2 space-y-2">
            {cardComponents.map((comp, idx) => (
              <div key={idx}>{comp}</div>
            ))}
          </div>
        )}
        {/* Content */}
        <div className="prose-cricket space-y-1">
          {isUser ? (
            <p className="text-zinc-100">{message.content}</p>
          ) : (
            formatContent(displayedContent)
          )}
        </div>
      </div>
    </motion.div>
  );
});
