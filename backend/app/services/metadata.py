"""
Metadata intelligence service for cricket card system.

Provides:
  - classify_query(): LLM-powered detection of player / team / match queries with robust regex fallback
  - extract_metadata(): LLM-powered structured JSON extraction from reply text and general knowledge
"""

import re
import json
import logging
from typing import Optional

from app.services.groq_client import groq_service

logger = logging.getLogger("cricket-gpt-api")

# ---------------------------------------------------------------------------
# Well-known cricket entities (used as fallback signals, not exhaustive)
# ---------------------------------------------------------------------------

KNOWN_TEAMS = {
    "india", "australia", "england", "pakistan", "south africa",
    "new zealand", "sri lanka", "west indies", "bangladesh", "afghanistan",
    "zimbabwe", "ireland", "netherlands", "scotland", "nepal",
    # IPL / franchise teams
    "csk", "chennai super kings", "mi", "mumbai indians",
    "rcb", "royal challengers bengaluru", "royal challengers bangalore",
    "kkr", "kolkata knight riders", "dc", "delhi capitals",
    "srh", "sunrisers hyderabad", "pbks", "punjab kings",
    "rr", "rajasthan royals", "gt", "gujarat titans", "lsg", "lucknow super giants",
}

# ---------------------------------------------------------------------------
# Match analysis patterns
# ---------------------------------------------------------------------------

_VS_PATTERN = re.compile(
    r"\b(?:analyze|analyse|compare|comparison|preview|prediction|head\s*to\s*head|h2h)\b.{0,50}\bvs?\b",
    re.IGNORECASE,
)
_SIMPLE_VS_PATTERN = re.compile(
    r"\b(\w[\w\s]{1,25})\s+vs\.?\s+(\w[\w\s]{1,25})\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# LLM prompts for classification and extraction
# ---------------------------------------------------------------------------

_CLASSIFY_PROMPT = """Analyze the user's chat message about cricket and classify it.
Determine if the query is asking about:
1. A specific cricket player (current, retired, male, female, IPL, international, legends). E.g. stats, profile, career, record, batting, bowling, biography of a player.
2. A cricket team (squad, roster, coach, captain, team info).
3. A match analysis or team comparison (e.g. India vs Australia, CSK vs MI).

CRITICAL RULES:
- If the query mentions or is about a cricketer in any way, type MUST be "player".
- Do NOT include any code block formatting, markdown, or text other than the JSON itself.

Respond with a JSON object containing EXACTLY:
{
  "type": "player" / "team" / "match" / null,
  "player_name": "Full name of the cricketer if type is player, else null"
}
"""

_PLAYER_EXTRACTION_PROMPT = """Extract player information from the cricket text below and your general knowledge about the cricketer into a JSON object with EXACTLY these fields:
{
  "name": "Full player name",
  "country": "ISO 2-letter country code (IN, AU, PK, EN, SA, NZ, WI, SL, BD, AF)",
  "role": "Batsman / Bowler / All-rounder / Wicketkeeper-Batsman",
  "battingStyle": "Right-hand bat / Left-hand bat",
  "bowlingStyle": "Right-arm fast / Left-arm spin / etc. or null if not applicable",
  "highlights": ["key career achievement 1", "key career achievement 2", "key career achievement 3"],
  "careerSummary": "One concise sentence summarising their career and legacy"
}
Important rules:
- Return ONLY valid JSON. No markdown fences, no explanation text.
- Do NOT include any numerical statistics (matches, runs, wickets, averages). These will not be shown.
- Use the provided text and your general knowledge of the cricketer to accurately fill in all details.
- Keep highlights factual and qualitative (records broken, awards, milestones in words).
- If any details are completely unavailable or unknown, set them to null or an empty list. Do not make up fake details or stats.
- If some information is unavailable, return partial metadata. Do not fail."""

_TEAM_EXTRACTION_PROMPT = """Extract team information from the text below into a JSON object with EXACTLY these fields:
{
  "name": "Team Name",
  "captain": "Current Captain",
  "coach": "Current Head Coach",
  "ranking": "ICC ranking string (e.g. '#1 in Tests, #2 in ODIs')",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "recentForm": "Brief recent form summary",
  "summary": "One-sentence team overview"
}
Return ONLY valid JSON. No markdown, no explanation. Use realistic data from the text."""

_MATCH_EXTRACTION_PROMPT = """Extract match analysis from the text below into a JSON object with EXACTLY these fields:
{
  "headToHead": "Head-to-head record summary",
  "winProbability": <int 0-100>,
  "recentForm": "Recent form of both sides",
  "keyPlayers": ["player1", "player2", "player3", "player4"],
  "prediction": "One-sentence prediction",
  "insights": "Brief analytical insight"
}
Return ONLY valid JSON. No markdown, no explanation. Use realistic data from the text."""

_PROMPTS = {
    "player": _PLAYER_EXTRACTION_PROMPT,
    "team": _TEAM_EXTRACTION_PROMPT,
    "match": _MATCH_EXTRACTION_PROMPT,
}


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _clean_json_response(raw_text: str) -> str:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _extract_fallback_player_name(q: str) -> str:
    potential_name = q
    # Remove common query framing words/phrases
    remove_words = [
        "stats", "profile", "career", "record", "records", "batting", "bowling", 
        "info", "about", "of", "biography", "bio", "legend", "cricketer", 
        "player", "average", "avg", "centuries", "wickets", "runs", "what is", 
        "who is", "who was", "details", "tell me about"
    ]
    for word in remove_words:
        potential_name = re.sub(rf"\b{word}\b", "", potential_name, flags=re.IGNORECASE)
    
    # Strip non-alphanumeric trailing/leading characters
    potential_name = re.sub(r"[^\w\s]", "", potential_name)
    potential_name = re.sub(r"\s+", " ", potential_name).strip()
    
    if not potential_name:
        potential_name = "Unknown Cricketer"
    else:
        # Capitalize nicely
        potential_name = " ".join([w.capitalize() for w in potential_name.split()])
        
    return potential_name


def normalize_player_metadata(metadata: dict, default_name: str) -> dict:
    """
    Ensure the returned player metadata is complete and holds the required fields.
    Does not fail if information is missing; instead returns partial metadata with safe fallbacks.
    """
    name = metadata.get("name") or metadata.get("player_name") or metadata.get("playerName") or default_name
    # Capitalize the first letter of each name part to look neat
    if name:
        name = " ".join([w.capitalize() for w in name.strip().split()])
    else:
        name = "Unknown Cricketer"

    country = metadata.get("country") or metadata.get("country_code") or metadata.get("countryCode") or "IN"
    # Ensure it's 2 letters upper case
    country_str = str(country).strip().upper()
    if len(country_str) > 2:
        # Try to map some common country names to codes if the LLM returned a full name
        country_lower = country_str.lower()
        mapping = {
            "india": "IN", "australia": "AU", "england": "EN", "pakistan": "PK",
            "south africa": "SA", "new zealand": "NZ", "west indies": "WI",
            "sri lanka": "SL", "bangladesh": "BD", "afghanistan": "AF"
        }
        country_str = mapping.get(country_lower, country_str[:2])
    elif not country_str:
        country_str = "IN"

    role = metadata.get("role") or metadata.get("player_role") or "Cricketer"
    
    # Batting style
    batting = (metadata.get("battingStyle") or 
               metadata.get("batting style") or 
               metadata.get("batting_style") or 
               metadata.get("batting") or 
               "Right-hand bat")
               
    # Bowling style
    bowling = (metadata.get("bowlingStyle") or 
               metadata.get("bowling style") or 
               metadata.get("bowling_style") or 
               metadata.get("bowling") or 
               "Right-arm medium")
               
    # Highlights (must be a list)
    highlights = metadata.get("highlights") or metadata.get("achievements") or []
    if isinstance(highlights, str):
        highlights = [highlights]
    elif not isinstance(highlights, list):
        highlights = []
    # Ensure highlights has 1-3 items, if empty add a general achievement
    if not highlights:
        highlights = ["Represented country/franchise at the high level"]

    # Career summary
    summary = (metadata.get("careerSummary") or 
               metadata.get("career summary") or 
               metadata.get("career_summary") or 
               metadata.get("summary") or 
               f"Professional cricket player representing {country_str}.")

    return {
        "name": name,
        "country": country_str,
        "role": role,
        "battingStyle": batting,
        "bowlingStyle": bowling,
        "highlights": highlights,
        "careerSummary": summary
    }


def classify_query(message: str) -> tuple[Optional[str], Optional[str]]:
    """
    Classify a user message into one of: 'player', 'team', 'match', or None.
    Uses LLM to dynamically recognize player queries and extract player names.
    Returns: (metadata_type, player_name)
    """
    q = message.strip()

    # 1. Quick check for vs / match queries (very common regex signal)
    if _VS_PATTERN.search(q) or _SIMPLE_VS_PATTERN.search(q):
        logger.info(f"Query classified as match analysis via regex: {q}")
        return "match", None

    # 2. Query LLM for dynamic classification
    messages = [
        {"role": "system", "content": _CLASSIFY_PROMPT},
        {"role": "user", "content": f"Query: {q}"}
    ]

    try:
        raw = groq_service.get_chat_completion(messages)
        cleaned = _clean_json_response(raw)
        result = json.loads(cleaned)

        qtype = result.get("type")
        player_name = result.get("player_name")

        if qtype == "player":
            if not player_name or player_name.lower() in ("null", "none"):
                player_name = _extract_fallback_player_name(q)
            logger.info(f"Detected player name: {player_name}")
            return "player", player_name
        elif qtype in ("team", "match"):
            logger.info(f"Query classified as {qtype} via LLM")
            return qtype, None

    except Exception as e:
        logger.warning(f"LLM classification failed: {e}. Falling back to rule-based detection.")

    # 3. Fallback behavior: If a query appears to be about a cricketer, always render a player card
    q_lower = q.lower()
    is_team_related = any(term in q_lower for term in ["team", "squad", "roster", "playing xi", "playing 11"])
    is_player_related = any(term in q_lower for term in [
        "stats", "profile", "career", "record", "records", "batting", "bowling",
        "average", "avg", "centuries", "wickets", "runs", "biography", "bio", "legend", "cricketer"
    ])

    if is_player_related and not is_team_related:
        potential_name = _extract_fallback_player_name(q)
        logger.info(f"Fallback player query detected via keywords: {q}")
        logger.info(f"Detected player name (fallback): {potential_name}")
        return "player", potential_name

    if is_team_related:
        return "team", None

    return None, None


def extract_metadata(reply: str, metadata_type: str, original_query: str, player_name: Optional[str] = None) -> Optional[dict]:
    """
    Make a focused LLM call to extract structured metadata from the reply text and general knowledge.
    Returns a dict matching the frontend card interface, or None on failure (except player metadata, which never fails).
    """
    system_prompt = _PROMPTS.get(metadata_type)
    if not system_prompt:
        logger.error(f"No prompt found for metadata type: {metadata_type}")
        return None

    user_content = f"Original query: {original_query}\n\nText to extract from:\n{reply}"
    if metadata_type == "player" and player_name:
        user_content = f"Target Cricketer: {player_name}\n" + user_content

    extraction_messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": user_content,
        },
    ]

    try:
        raw = groq_service.get_chat_completion(extraction_messages)
        cleaned = _clean_json_response(raw)
        metadata = json.loads(cleaned)

        if metadata_type == "player":
            metadata = normalize_player_metadata(metadata, player_name or "Unknown Player")
            logger.info(f"Metadata generation success for player: {metadata['name']}")
        else:
            logger.info(f"Successfully extracted {metadata_type} metadata with {len(metadata)} fields")

        return metadata

    except Exception as e:
        if metadata_type == "player":
            logger.error(f"Metadata generation failure for player '{player_name or 'Unknown'}'. Error: {e}. Falling back to default player metadata.")
            return normalize_player_metadata({}, player_name or "Unknown Player")
        else:
            logger.error(f"Metadata generation failure for query '{original_query}': {e}")
            return None

