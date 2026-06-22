import re
import requests
from bs4 import BeautifulSoup

try:
    from duckduckgo_search import DDGS
except ImportError:
    try:
        from ddgs import DDGS
    except ImportError:
        # Re-raise standard import error if neither package is resolved
        raise


def should_trigger_search(query: str) -> bool:
    """
    Refined query classifier to determine if a web search is needed.
    Only triggers search for queries requesting current/live information
    (live scores, current rankings, recent news, ongoing tournaments).
    Skips search for player biographies, rules, and historical facts.
    """
    q = query.lower().strip()

    # 1. Check for historical indicators (years 1800-2024)
    # If they specify a year in the past, it's historical.
    past_years = re.findall(r"\b(18\d{2}|19\d{2}|200\d|201\d|202[0-4])\b", q)
    if past_years:
        # Only override if they specifically ask for "news" or "ranking" alongside it
        if not any(k in q for k in ["news", "ranking", "rankings"]):
            return False

    # 2. Check for rules, biographies, and historical facts keywords
    bio_keywords = {
        "biography", "bio", "profile", "career", "born", "birthplace",
        "personal life", "family", "spouse", "education", "childhood",
        "background", "retired", "legend", "legendary", "died", "death"
    }
    
    rules_keywords = {
        "rule", "rules", "law", "laws", "umpire", "dismissal", "lbw",
        "out", "no ball", "wide", "leg bye", "bye", "dead ball", "free hit",
        "powerplay", "super over", "how to play", "fielding positions",
        "crease", "wicket-keeper", "overs", "ball weight", "pitch length",
        "dimensions", "stadium details"
    }

    history_keywords = {
        "history", "historical", "classic", "retrospective", "memorable",
        "past", "records of", "record holder", "highest score in test",
        "most wickets in", "all-time", "greatest of all time", "goat"
    }

    # Extract all words/phrases to match against rules
    words = set(re.findall(r"\b\w+\b", q))

    # Match exact multi-word phrases for rules, bio, and history
    multi_word_evergreen = [
        "meaning of", "explain the", "rules of", "how is a", "why is it",
        "who won the", "who was the", "world cup winner"
    ]

    has_evergreen_indicator = (
        words.intersection(bio_keywords) or 
        words.intersection(rules_keywords) or 
        words.intersection(history_keywords) or
        any(phrase in q for phrase in multi_word_evergreen)
    )

    # If the query contains evergreen indicators, skip web search,
    # unless it explicitly forces a live/current context with strong override keywords
    if has_evergreen_indicator:
        strong_live_overrides = ["live score", "current score", "today match", "live now"]
        if not any(override in q for override in strong_live_overrides):
            return False

    # 3. Check for current information indicators
    live_match_keywords = {
        "live", "score", "scores", "commentary", "batting", "bowling",
        "wickets", "runrate", "batsman", "bowler", "playing 11", 
        "playing xi", "playing eleven", "roster", "squad"
    }
    
    rankings_keywords = {
        "ranking", "rankings", "rank", "ranks", "rating", "ratings",
        "points table", "standings", "leaderboard"
    }

    news_keywords = {
        "news", "latest", "recent", "breaking", "update", "updates",
        "today", "yesterday", "tomorrow", "tonight", "scheduled", "fixtures",
        "fixture", "schedule", "ipl 2026", "ipl 26", "wtc 2026", "wtc 26"
    }

    # Intersect
    has_live = words.intersection(live_match_keywords) or any(phrase in q for phrase in ["current match", "ongoing match", "who is winning", "match today"])
    has_rankings = words.intersection(rankings_keywords) or "icc rank" in q
    has_news = words.intersection(news_keywords) or any(phrase in q for phrase in ["current series", "latest update", "recent news"])

    if has_live or has_rankings or has_news:
        return True

    return False


def fetch_page_content(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=5)
        response.encoding = response.apparent_encoding or "utf-8"
        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join([p.text for p in paragraphs[:5]])

        return text.strip()
    except Exception:
        return ""


def search_web(query: str) -> str:
    results = []
    try:
        with DDGS() as ddgs:
            search_results = ddgs.text(
                query + " latest cricket news stats", max_results=5
            )

            for r in search_results:
                url = r.get("href", "")
                snippet = r.get("body", "")

                content = fetch_page_content(url)

                if content:
                    results.append(content)
                else:
                    results.append(snippet)
    except Exception as e:
        print(f"Search API execution failed: {e}")
        return ""

    return " ".join(results[:3])
