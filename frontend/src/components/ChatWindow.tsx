"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CornerDownLeft,
  Activity,
  Award,
  BarChart3,
  Clock,
  Compass,
  Search,
  Filter,
  Shield,
  Globe,
  Sliders,
  Tv,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";
import { Message } from "@/types/chat";
import { validateCricketData } from "@/lib/dataValidation";

// Import structured JSON datasets
import playersData from "@/data/players.json";
import teamsData from "@/data/teams.json";

interface PlayerItem {
  id: string;
  name: string;
  country: string;
  gender: string;
}

interface TeamItem {
  id: string;
  name: string;
  type: string;
  category?: string;
}

const PLAYERS = playersData as PlayerItem[];
const TEAMS = teamsData as TeamItem[];

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  initialTab?: string;
  input: string;
  setInput: (val: string) => void;
}

interface TemplateOption {
  title: string;
  description: string;
  prompt: string;
}

// 8 High Quality Starter Prompts
const STARTER_PROMPTS = [
  {
    icon: Award,
    title: "Kohli ICC Knockouts",
    description: "How did Virat Kohli perform in ICC knockouts?",
    prompt: "How did Virat Kohli perform in ICC knockouts? Break down his matches, averages, and key innings."
  },
  {
    icon: BarChart3,
    title: "Bumrah vs Starc",
    description: "Compare Bumrah and Starc across formats.",
    prompt: "Compare Jasprit Bumrah and Mitchell Starc across Test, ODI, and T20 formats. Analyze their strike rates, averages, and impact."
  },
  {
    icon: Shield,
    title: "IPL Death Bowling",
    description: "Which IPL team has the strongest death bowling unit?",
    prompt: "Which IPL team has the strongest death bowling unit this season? Provide stats on economy rates and wicket counts in overs 16-20."
  },
  {
    icon: Compass,
    title: "2011 WC Final Analysis",
    description: "Analyze India's 2011 World Cup final victory.",
    prompt: "Provide a detailed tactical analysis of India's 2011 World Cup final against Sri Lanka, including key partnerships and bowling changes."
  },
  {
    icon: Clock,
    title: "Best ODI Innings",
    description: "Best ODI innings of the last decade.",
    prompt: "What are the best ODI batting innings of the last decade? Detail the match situations, opposition, and chase pressures."
  },
  {
    icon: Activity,
    title: "Dhoni vs Gilchrist",
    description: "Compare Dhoni and Gilchrist as finishers.",
    prompt: "Compare MS Dhoni and Adam Gilchrist as wicketkeeper-batsmen finishers. Analyze their strike rates, records in winning runs chases, and match impact."
  },
  {
    icon: Globe,
    title: "Spin Bowlers' Venues",
    description: "Which venues favor spin bowlers?",
    prompt: "Which international cricket venues favor spin bowlers the most? Detail the average pitch wear, turn degrees, and historical spinner averages."
  },
  {
    icon: Sparkles,
    title: "Greatest T20 WC Shows",
    description: "Greatest T20 World Cup performances.",
    prompt: "Detail the greatest individual performances (batting and bowling) in T20 World Cup history, including pressure scenarios and stakes."
  }
];

const MATCH_ANALYSIS_OPTIONS: TemplateOption[] = [
  {
    title: "Live Match Read",
    description: "Assess match state, momentum, and pressure phases.",
    prompt: "Analyze the current match situation between [Team A] and [Team B]. Include required run rate, wickets in hand, momentum shifts, and key tactical decisions.",
  },
  {
    title: "Head-to-Head",
    description: "Compare two teams across recent and historical meetings.",
    prompt: "Create a head-to-head cricket analysis for [Team A] vs [Team B], covering recent form, historical record, venue factors, and likely matchups.",
  },
  {
    title: "Pitch Report",
    description: "Break down conditions, par score, and bowling help.",
    prompt: "Analyze the pitch and conditions at [Venue]. Estimate par score, pace vs spin assistance, dew impact, and toss strategy.",
  },
  {
    title: "Playing XI Strategy",
    description: "Evaluate team balance, roles, and tactical swaps.",
    prompt: "Review the likely playing XI strategy for [Team Name]. Cover batting depth, bowling phases, all-rounder balance, and matchup-based selections.",
  },
  {
    title: "Post-Match Review",
    description: "Explain turning points and decisive performances.",
    prompt: "Provide a post-match analysis for [Team A] vs [Team B]. Identify turning points, player impact, tactical wins, and where the match was decided.",
  },
];

// Extract available countries from database dynamically
const AVAILABLE_COUNTRIES = ["All", ...Array.from(new Set(PLAYERS.map(p => p.country))).sort()];

// 50 Specialized Cricket Tools
const CRICKET_TOOLS = [
  { name: "Win Probability Analysis", category: "Match Projections", template: "Calculate the win probability projection for a match where [Team A] requires [Runs] runs in [Overs] overs with [Wickets] wickets in hand against [Team B]." },
  { name: "Player Form Analysis", category: "Performance", template: "Perform a form trajectory analysis for [Player Name] over their last 10 games, plotting runs, average, strike rate, and dismissal patterns." },
  { name: "Head-to-Head Comparison", category: "Matchups", template: "Provide a comparative head-to-head stats dashboard between batsman [Player A] and bowler [Player B] in [Format] format." },
  { name: "Venue Analysis", category: "Grounds", template: "Analyze the historical pitch patterns, average 1st innings score, weather influence, and spin vs pace success ratio at [Venue Name]." },
  { name: "Toss Impact Analysis", category: "Grounds", template: "Show toss analytics for [Venue/Tournament], evaluating win rates for teams choosing to bat first vs bowl first under lights." },
  { name: "Bowling Matchups", category: "Matchups", template: "Identify the best bowling matchups for [Team Name] to deploy against [Opponent Player] during the middle overs phase." },
  { name: "Batting Matchups", category: "Matchups", template: "Highlight the matchup weaknesses of [Player Name] when facing left-arm orthodox vs off-spin bowling variations." },
  { name: "Partnership Analysis", category: "Performance", template: "Analyze the historical batting partnership chemistry and strike-rotation rate between [Player A] and [Player B]." },
  { name: "Fantasy Team Suggestions", category: "Calculators", template: "Generate optimal fantasy cricket team combinations and captaincy picks for the upcoming match [Team A] vs [Team B] at [Venue]." },
  { name: "Team Strength Analysis", category: "Performance", template: "Perform a comprehensive SWOT analysis of [Team Name]'s current playing XI across batting depth, bowling variations, and fielding." },
  { name: "Captaincy Analysis", category: "Tactics", template: "Review the field placements, bowling changes, and captaincy decision metrics of [Captain Name] under high-pressure scenarios." },
  { name: "Death Overs Performance Analysis", category: "Performance", template: "Evaluate the death overs (overs 16-20) strike rates of [Batsman Name] compared to the economy rates of [Bowler Name]." },
  { name: "Powerplay Scoring Rate Analyzer", category: "Performance", template: "Compare the powerplay run-scoring acceleration and wicket-loss patterns of [Team A] vs [Team B] in T20s." },
  { name: "Spin vs Pace Batting Stats", category: "Performance", template: "Show the average, strike rate, and control percentage of [Batsman Name] against spin bowling vs pace bowling." },
  { name: "Left-Arm Pace Vulnerability Check", category: "Matchups", template: "Analyze the historical dismissals of [Batsman Name] against left-arm fast bowlers in the first 15 balls of their innings." },
  { name: "Run Chase Success Rate Predictor", category: "Match Projections", template: "Estimate the success rate of [Team Name] when chasing a target of [Target Runs] at [Venue] under second-innings dew conditions." },
  { name: "Pitch Wear & Spin Factor Estimate", category: "Grounds", template: "Predict the degree of pitch deterioration and spin assistance on Days 4 & 5 at [Test Ground Name]." },
  { name: "Super Over Performance Analyzer", category: "Performance", template: "Review historical Super Over batting records, bowler selections, and success rates for [Team/Player Name]." },
  { name: "Wicket-Taking Efficiency by Phase", category: "Performance", template: "Analyze the bowling strike rate and wicket contribution of [Bowler Name] during the powerplay, middle overs, and death overs." },
  { name: "Dot Ball Pressure Index", category: "Performance", template: "Calculate the Dot Ball Pressure Index for the bowling unit of [Team Name] during their last 5 ODI matches." },
  { name: "Boundary Hitting Frequency", category: "Performance", template: "Determine the average balls-per-boundary ratio of [Batsman Name] compared to other top-order batsmen in the death overs." },
  { name: "Strike Rotation Rate Checker", category: "Performance", template: "Measure the percentage of singles and doubles run by [Player Name] during middle overs to check pressure relief ability." },
  { name: "DRS Success Rate Analyzer", category: "Tactics", template: "Analyze the success rate of Decision Review System (DRS) referrals made by [Captain Name] / [Team Name] historically." },
  { name: "Home vs Away Record Comparison", category: "Performance", template: "Show the contrast in batting average, bowling average, and win rates for [Team/Player Name] in home conditions vs away tours." },
  { name: "Impact Player Rule Strategy Analysis", category: "Tactics", template: "Evaluate the tactical utility and team balance changes of using the Impact Player rule for [IPL Team Name]." },
  { name: "Net Run Rate (NRR) Calculator", category: "Calculators", template: "Calculate the exact victory margin (runs or overs remaining) needed for [Team A] to surpass [Team B]'s net run rate." },
  { name: "Rain-Affected Target DLS Calculator", category: "Calculators", template: "Determine the revised DLS target score for [Team B] chasing [Target Runs] if the match is reduced to [Overs] overs." },
  { name: "Bowler Economy Under Pressure", category: "Performance", template: "Analyze the economy rate and boundary concession frequency of [Bowler Name] when defending fewer than 10 runs in the final over." },
  { name: "Batsman vs Specific Bowling Angles", category: "Matchups", template: "Evaluate the comfort and dismissal risk of [Batsman Name] against around-the-wicket vs over-the-wicket bowling lines." },
  { name: "Fielding Impact & Runs Saved", category: "Performance", template: "Show the runs saved, catches taken (including drop percentage), and run-out contributions of [Fielder Name] in recent series." },
  { name: "Wicketkeeper Dismissals & Catching", category: "Performance", template: "Analyze the glovework, stumping speed, and drop rate of wicketkeeper [Player Name] against spin vs pace." },
  { name: "Century Conversion Rate Analysis", category: "Performance", template: "Calculate the 50-to-100 conversion rate of [Batsman Name] compared to the historical big-three average." },
  { name: "Tournament Pressure Stats", category: "Performance", template: "Compare the batting/bowling statistics of [Player Name] in round-robin league matches vs knockout semi-finals/finals." },
  { name: "IPL Auction Value vs Performance", category: "Calculators", template: "Calculate the cost-per-run or cost-per-wicket index for [Player Name] based on their recent IPL auction price." },
  { name: "Historical Chase Triggers", category: "Match Projections", template: "Find the average over-by-over run acceleration triggers during successful 300+ run chases at [Venue Name]." },
  { name: "Tailender Batting Contribution", category: "Performance", template: "Measure the runs contributed and balls faced by batsmen 8-11 of [Team Name] during crucial match-saving partnerships." },
  { name: "Six Hitting Ability in Middle Overs", category: "Performance", template: "Compare the frequency and distance of sixes hit by [Player Name] against spin in overs 7-15." },
  { name: "Injury Comeback Form Tracker", category: "Performance", template: "Compare the velocity, control, and wicket frequency of [Bowler Name] before vs after their recent injury layoff." },
  { name: "Bowling Partnership Pressure", category: "Matchups", template: "Analyze how the tight economy of [Bowler A] at one end creates wicket-taking opportunities for [Bowler B] at the other." },
  { name: "Debutant Performance Predictor", category: "Match Projections", template: "Estimate the projected performance metrics of [New Player Name] in international cricket based on their first-class/domestic records." },
  { name: "Ball-by-Ball Match Simulation", category: "Match Projections", template: "Run a simulated ball-by-ball projection of [Team A] batting against the bowling attack of [Team B] at [Venue]." },
  { name: "Bowling Spell-by-Spell Effectiveness", category: "Performance", template: "Evaluate the velocity drops and economy levels of [Fast Bowler Name] between their 1st, 2nd, and 3rd bowling spells." },
  { name: "Matchup against Mystery Spin", category: "Matchups", template: "Analyze the strike rate and dismissal count of [Batsman Name] against mystery spinners and carrom-ball variations." },
  { name: "Boundary Rope Dimensions Impact", category: "Grounds", template: "Assess how short boundaries (e.g., 60m square boundaries) at [Venue] impact the bowling lengths of [Team Name]." },
  { name: "Dew Factor Impact on Bowling", category: "Grounds", template: "Analyze the drop in spin-bowler effectiveness (control, turn degrees) during the second innings under heavy dew at [Venue]." },
  { name: "Run Out & Stumping Vulnerability", category: "Performance", template: "Count the number of times [Player Name] is dismissed due to backing up too far or general running-between-wickets errors." },
  { name: "Under-the-Lights Swing Movement", category: "Grounds", template: "Determine the average degrees of swing movement obtained by fast bowlers with the new pink ball under lights at [Venue]." },
  { name: "Test Match Declaration Timing", category: "Tactics", template: "Evaluate the tactical efficiency of [Captain Name]'s declaration timing in the last Test match against [Opponent]." },
  { name: "Captaincy Decision Review", category: "Tactics", template: "Analyze the wicket impact of bowling changes made by [Captain Name] during the middle overs of the last match." },
  { name: "Multi-Format Performance Index", category: "Performance", template: "Calculate the overall multi-format consistency and rating score of [Player Name] across Tests, ODIs, and T20Is." }
];

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  initialTab = "prompts",
  input,
  setInput,
}: ChatWindowProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Player filters state
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [genderFilter, setGenderFilter] = useState<"All" | "Men" | "Women">("All");
  const [playerSortOrder, setPlayerSortOrder] = useState<"asc" | "desc">("asc");
  const [playerVisibleCount, setPlayerVisibleCount] = useState(120);
  
  // Team filters state
  const [teamSearch, setTeamSearch] = useState("");
  const [teamTypeFilter, setTeamTypeFilter] = useState<"International" | "Franchise">("International");
  const [teamLeagueFilter, setTeamLeagueFilter] = useState("All");
  
  // Cricket tools search state
  const [toolSearch, setToolSearch] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  // Run data validation on mount
  useEffect(() => {
    validateCricketData(PLAYERS, TEAMS);
  }, []);



  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  // Auto focus textarea when input changes from outside (e.g. sidebar or template)
  useEffect(() => {
    if (input && textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [input]);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      onSendMessage(trimmed);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    [input, isLoading, onSendMessage, setInput]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // UX Rule: Fill the input and focus only. NEVER auto-submit.
  const handleSelectTemplate = useCallback((promptText: string) => {
    setInput(promptText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Scroll to the bottom of the input container so they see the text is populated
        textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, [setInput]);

  // Filtered lists
  const filteredPlayers = PLAYERS.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(playerSearch.toLowerCase());
    const matchesCountry = selectedCountry === "All" || player.country === selectedCountry;
    const matchesGender = genderFilter === "All" || player.gender === genderFilter;
    return matchesSearch && matchesCountry && matchesGender;
  }).sort((a, b) => {
    if (playerSortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const franchiseLeagues = [
    "All", "IPL", "BBL", "WBBL", "PSL", "The Hundred", "SA20", "MLC", "ILT20", "BPL", "CPL", "LPL"
  ];

  const filteredTeams = TEAMS.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(teamSearch.toLowerCase());
    const matchesType = team.type === teamTypeFilter;
    const matchesLeague = teamTypeFilter === "International" || 
                          teamLeagueFilter === "All" || 
                          team.category === teamLeagueFilter;
    return matchesSearch && matchesType && matchesLeague;
  });

  const filteredTools = CRICKET_TOOLS.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(toolSearch.toLowerCase()) || 
                          tool.category.toLowerCase().includes(toolSearch.toLowerCase());
    return matchesSearch;
  });

  const dashboardTabs = [
    { id: "prompts", label: "Starter Prompts", icon: Sparkles },
    { id: "players", label: "Player Explorer", icon: Award },
    { id: "teams", label: "Team Directory", icon: Shield },
    { id: "matches", label: "Match Analysis", icon: Activity },
    { id: "tools", label: "Cricket Tools", icon: Sliders }
  ];

  return (
    <div className="flex flex-col h-full bg-[#050a06] relative overflow-hidden">
      {/* Stadium grass strip line overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #155828, #155828 40px, #0f441e 40px, #0f441e 80px)`,
        }}
      />

      {/* Messages Scroll View */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 space-y-4 relative scroll-smooth z-10"
      >
        <AnimatePresence mode="popLayout">
          {isEmpty ? (
            /* Immersive Analytics & Knowledge Dashboard */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center min-h-[500px] max-w-5xl mx-auto px-1 pt-6 pb-12"
            >
              {/* Radar beacon logo */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center text-2xl mb-4 shadow-xl shadow-accent/5 relative overflow-hidden"
                >
                  <span className="relative z-10">🏏</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 to-transparent blur-md" />
                </motion.div>
                
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider text-center">
                  Cricket<span className="text-accent">GPT</span> Intelligence Core
                </h2>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest mt-1">
                  AI Knowledge Hub & analytics database connected
                </p>
              </div>

              {/* Top Horizontal Dashboard Tabs */}
              <div className="w-full flex border-b border-white/5 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
                {dashboardTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "border-accent text-white bg-accent/5"
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-zinc-600"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div className="w-full min-h-[350px]">
                
                {/* Panel 1: Starter Prompts */}
                {activeTab === "prompts" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {STARTER_PROMPTS.map((prompt) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={prompt.title}
                          onClick={() => handleSelectTemplate(prompt.prompt)}
                          className="p-5 rounded-2xl border border-white/5 bg-[#111622]/30 hover:bg-[#122517]/30 hover:border-accent/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group h-full"
                        >
                          <div>
                            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-white/5 flex items-center justify-center mb-4 text-accent group-hover:border-accent/25">
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-300 group-hover:text-white mb-2 leading-snug">
                              {prompt.title}
                            </h4>
                            <p className="text-zinc-500 text-xs font-medium leading-relaxed group-hover:text-zinc-400">
                              {prompt.description}
                            </p>
                          </div>
                          <div className="mt-4 text-[9px] uppercase tracking-widest font-black text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            Use Template
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Panel 2: Player Explorer Directory */}
                {activeTab === "players" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3 bg-[#111622]/20 p-4 rounded-2xl border border-white/5">
                      {/* Search Bar */}
                      <div className="flex-1 min-w-[200px] relative flex items-center">
                        <Search className="absolute left-3 w-4 h-4 text-zinc-600" />
                        <input
                          type="text"
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          placeholder="Search player name..."
                          className="w-full bg-[#111622]/40 border border-white/5 rounded-xl py-2 px-10 text-xs text-white focus:outline-none focus:border-accent/30 font-medium"
                        />
                      </div>
                      
                      {/* Country Dropdown Filter */}
                      <div className="relative flex items-center">
                        <Filter className="absolute left-3 w-3.5 h-3.5 text-zinc-600" />
                        <select
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="bg-[#111622]/40 border border-white/5 rounded-xl py-2 pl-9 pr-8 text-xs text-zinc-300 font-bold focus:outline-none focus:border-accent/30 appearance-none cursor-pointer"
                        >
                          {AVAILABLE_COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c === "All" ? "All Countries" : c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Gender Selector */}
                      <div className="flex rounded-xl bg-[#111622]/40 border border-white/5 p-1">
                        {(["All", "Men", "Women"] as const).map((gender) => (
                          <button
                            key={gender}
                            onClick={() => setGenderFilter(gender)}
                            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                              genderFilter === gender
                                ? "bg-accent text-black"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>

                      {/* Alphabetical Sort Order Toggle */}
                      <button
                        onClick={() => setPlayerSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111622]/40 hover:bg-surface border border-white/5 hover:border-accent/20 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title={`Sorting: ${playerSortOrder === "asc" ? "A to Z" : "Z to A"}`}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
                        <span className="uppercase text-[9px] tracking-wider">{playerSortOrder === "asc" ? "A-Z" : "Z-A"}</span>
                      </button>
                    </div>

                    {/* Directory Results - COMPACT CHIPS */}
                    {filteredPlayers.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1 py-1">
                          {filteredPlayers.slice(0, playerVisibleCount).map((player) => (
                            <button
                              key={player.id}
                              onClick={() => handleSelectTemplate(`Analyze the cricket profile, career records, stats, highlights, and role of the cricketer: ${player.name} (${player.country}).`)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#111622]/40 hover:bg-accent/15 border border-white/5 hover:border-accent/30 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <span className="text-[10px]">🏏</span>
                              <span>{player.name}</span>
                              <span className="text-[9px] text-zinc-500 font-bold uppercase">({player.country})</span>
                              <span className="text-[8px] px-1 py-0.2 rounded bg-zinc-800/80 text-zinc-400 group-hover:text-white font-semibold">
                                {player.gender[0]}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Lazy Load Button */}
                        {filteredPlayers.length > playerVisibleCount && (
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={() => setPlayerVisibleCount(prev => prev + 100)}
                              className="px-6 py-2 rounded-xl border border-white/5 hover:border-accent/30 bg-[#111622]/40 hover:bg-accent/10 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
                            >
                              Show More Players ({filteredPlayers.length - playerVisibleCount} remaining)
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-white/5 rounded-2xl bg-[#111622]/10">
                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">No players found matching current directory filter</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Panel 3: Team Directory */}
                {activeTab === "teams" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row gap-3 bg-[#111622]/20 p-4 rounded-2xl border border-white/5">
                      {/* Search Bar */}
                      <div className="flex-1 relative flex items-center">
                        <Search className="absolute left-3 w-4 h-4 text-zinc-600" />
                        <input
                          type="text"
                          value={teamSearch}
                          onChange={(e) => setTeamSearch(e.target.value)}
                          placeholder="Search team name..."
                          className="w-full bg-[#111622]/40 border border-white/5 rounded-xl py-2 px-10 text-xs text-white focus:outline-none focus:border-accent/30 font-medium"
                        />
                      </div>

                      {/* Franchise League Category Selector (only active if Franchise selected) */}
                      {teamTypeFilter === "Franchise" && (
                        <div className="relative flex items-center">
                          <Filter className="absolute left-3 w-3.5 h-3.5 text-zinc-600" />
                          <select
                            value={teamLeagueFilter}
                            onChange={(e) => setTeamLeagueFilter(e.target.value)}
                            className="bg-[#111622]/40 border border-white/5 rounded-xl py-2 pl-9 pr-8 text-xs text-zinc-300 font-bold focus:outline-none focus:border-accent/30 appearance-none cursor-pointer"
                          >
                            {franchiseLeagues.map((l) => (
                              <option key={l} value={l}>{l === "All" ? "All Leagues" : l}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Team Category selector */}
                      <div className="flex rounded-xl bg-[#111622]/40 border border-white/5 p-1">
                        {(["International", "Franchise"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setTeamTypeFilter(type);
                              setTeamLeagueFilter("All");
                            }}
                            className={`px-4 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                              teamTypeFilter === type
                                ? "bg-accent text-black"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Team directory results - COMPACT TEAM CHIPS IN GRID */}
                    {filteredTeams.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[320px] overflow-y-auto pr-1 py-1">
                        {filteredTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleSelectTemplate(`Provide a comprehensive team strength, records, key performers, and strategy analysis report for ${team.name} (${team.type}).`)}
                            className="p-3 rounded-xl border border-white/5 bg-[#111622]/40 hover:bg-[#122517]/40 hover:border-accent/20 text-left transition-all duration-200 cursor-pointer flex items-center gap-2 group"
                          >
                            <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform">🛡️</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-zinc-200 group-hover:text-white truncate">
                                {team.name}
                              </span>
                              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">
                                {team.category || "ICC Team"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-white/5 rounded-2xl bg-[#111622]/10">
                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">No teams found matching directory query</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Panel 4: Match Analysis */}
                {activeTab === "matches" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                  >
                    {MATCH_ANALYSIS_OPTIONS.map((opt) => (
                      <button
                        key={opt.title}
                        onClick={() => handleSelectTemplate(opt.prompt)}
                        className="p-5 rounded-2xl border border-white/5 bg-[#111622]/30 hover:bg-[#122517]/30 hover:border-accent/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group h-full"
                      >
                        <div>
                          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-white/5 flex items-center justify-center mb-4 text-accent group-hover:border-accent/25">
                            <Tv className="w-4 h-4" />
                          </div>
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-300 group-hover:text-white mb-2 leading-snug">
                            {opt.title}
                          </h4>
                          <p className="text-zinc-500 text-xs font-medium leading-relaxed group-hover:text-zinc-400">
                            {opt.description}
                          </p>
                        </div>
                        <div className="mt-4 text-[9px] uppercase tracking-widest font-black text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          Load Template
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Panel 5: Cricket Tools */}
                {activeTab === "tools" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Search Field */}
                    <div className="flex bg-[#111622]/20 p-3 rounded-2xl border border-white/5">
                      <div className="flex-1 relative flex items-center">
                        <Search className="absolute left-3 w-4 h-4 text-zinc-600" />
                        <input
                          type="text"
                          value={toolSearch}
                          onChange={(e) => setToolSearch(e.target.value)}
                          placeholder="Search 50 analytical tools..."
                          className="w-full bg-[#111622]/40 border border-white/5 rounded-xl py-2 px-10 text-xs text-white focus:outline-none focus:border-accent/30 font-medium"
                        />
                      </div>
                    </div>

                    {/* Tools directory results */}
                    {filteredTools.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {filteredTools.map((tool) => (
                          <button
                            key={tool.name}
                            onClick={() => handleSelectTemplate(tool.template)}
                            className="p-3.5 rounded-xl border border-white/5 bg-[#111622]/30 hover:bg-[#122517]/30 hover:border-accent/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                          >
                            <span className="font-extrabold text-xs text-zinc-200 group-hover:text-white truncate">
                              {tool.name}
                            </span>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                                {tool.category}
                              </span>
                              <span className="text-[8px] text-accent opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest">
                                Run Tool
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-white/5 rounded-2xl bg-[#111622]/10">
                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">No analytical tools matching search query</p>
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </motion.div>
          ) : (
            /* Active message list */
            <motion.div key="messages" className="max-w-4xl mx-auto w-full">
              {messages.map((msg, idx) => (
                <MessageBubble key={`msg-${idx}`} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input panel Area */}
      <div className="border-t border-white/5 bg-[#050a06]/90 backdrop-blur-md p-4 flex-shrink-0 z-10">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="flex-1 relative glass-input rounded-xl transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Load analytical module template or query CricketGPT directly..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-transparent rounded-xl px-4 py-3.5 pr-14 text-sm text-white placeholder-zinc-600 focus:outline-none max-h-40 disabled:opacity-50 font-medium"
            />
            {/* Command return indicator */}
            <div className="absolute right-4 bottom-3.5 hidden sm:flex items-center gap-1 text-zinc-600 text-[9px] uppercase font-bold tracking-wider pointer-events-none">
              <span>Send</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-zinc-900 disabled:cursor-not-allowed text-black disabled:text-zinc-700 flex items-center justify-center transition-all duration-200 shadow-lg shadow-accent/10 disabled:shadow-none border border-accent/20 disabled:border-transparent"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4.5 h-4.5 stroke-[2.5px]" />
            )}
          </motion.button>
        </form>

        <p className="text-center text-[9px] text-zinc-600 uppercase tracking-widest font-black mt-2.5">
          CricketGPT Knowledge Engine · All modules fill only, manual verification recommended
        </p>
      </div>
    </div>
  );
}
