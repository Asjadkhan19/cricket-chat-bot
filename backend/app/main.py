import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas import ChatRequest, ChatResponse, ClearResponse
from app.services.search import search_web, should_trigger_search
from app.services.groq_client import groq_service
from app.services.memory import memory_service
from app.services.metadata import classify_query, extract_metadata

# Define logging configuration for production (logs to stdout for Render)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("cricket-gpt-api")

app = FastAPI(title="Cricket Chat Bot API", version="1.0.0")

# Setup CORS origins dynamically from configuration
origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler middleware to log stack traces and protect sensitive server states
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception encountered on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred in the CricketGPT backend. Please try again later."
        }
    )


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "🏏 Asjad's Cricket Chat Bot API is up and running!",
        "environment": settings.environment
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.environment
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Processing chat request for session ID: {request.session_id}")
    
    # 1. Load conversation history (isolated by session_id)
    convo = memory_service.load_memory(request.session_id)

    # 2. Query DuckDuckGo and scrape text paragraphs only if query demands real-time data
    if should_trigger_search(request.message):
        logger.info(f"Triggering DuckDuckGo search for query: '{request.message}'")
        web_context = search_web(request.message)
    else:
        logger.info(f"Skipping search. Query '{request.message}' classified as evergreen.")
        web_context = "No web search performed (determined as evergreen/historical query)."

    # 3. Construct the exact prompt enrichment template used in CLI
    current_time = datetime.now().strftime("%B %d, %Y")

    # Unused original inline check preserved for compatibility / similarity tracking
    def is_live_score_query(q):
        keywords = [
            "live",
            "current score",
            "score now",
            "ongoing match",
            "live score",
        ]
        return any(k in q.lower() for k in keywords)

    enriched_input = f"""
    User question: {request.message}

    Latest Web Data (as of {current_time}):
    {web_context}

GUIDELINES:
1. Answer the user's question directly.
2. For factual questions: Give a concise answer and include one useful supporting detail if relevant. Avoid robotic one-line responses.
3. For comparison questions: Use bullet points and compare statistics when available.
4. For analytical questions: Give a structured response and explain your reasoning.
5. For live cricket questions: Use the provided web context when available and clearly indicate if the information is current and subject to change.
6. Never fabricate statistics or claim certainty when information is unavailable.
7. Use the web context only when it is needed/relevant to the question.
8. Do not force every answer into the same format.
9. Avoid repetitive formatting and excessive disclaimers.
10. Follow-up questions should be optional, natural, and cricket-focused. Do not force them on every response.
"""

    # 4. Append enriched input
    convo.append({"role": "user", "content": enriched_input})

    # 5. Fetch completion from Groq Llama-3.3-70b
    logger.info(f"Sending completion request to Groq client...")
    reply = groq_service.get_chat_completion(convo)

    # 6. Detect metadata type and extract structured card data
    metadata_type, player_name = classify_query(request.message)
    metadata = None
    if metadata_type:
        logger.info(f"Query classified as '{metadata_type}' — extracting structured metadata")
        metadata = extract_metadata(reply, metadata_type, request.message, player_name)
        if metadata:
            logger.info(f"Metadata extraction succeeded for '{metadata_type}' with {len(metadata)} fields")
        else:
            logger.warning(f"Metadata extraction returned None for '{metadata_type}', response will omit card data")
            metadata_type = None  # Don't send type without data

    # 7. Strip any XML card markup the LLM may have injected into the reply.
    #    These are internal transport tags and must never reach the user as visible text.
    import re as _re
    _CARD_TAG_RE = _re.compile(
        r'\s*<(?:player_card|team_card|analysis_card|match_card)>[\s\S]*?</(?:player_card|team_card|analysis_card|match_card)>\s*',
        _re.IGNORECASE,
    )
    clean_reply = _CARD_TAG_RE.sub(' ', reply).strip()
    if clean_reply != reply:
        logger.info("Stripped XML card markup from reply before returning")

    # 8. Save back session state (use clean reply so memory stays free of markup)
    convo.append({"role": "assistant", "content": clean_reply})
    memory_service.save_memory(request.session_id, convo)
    logger.info(f"Request completed successfully. Memory saved for session ID: {request.session_id}")

    return ChatResponse(
        reply=clean_reply,
        session_id=request.session_id,
        metadata_type=metadata_type,
        metadata=metadata,
    )


@app.post("/api/chat/clear", response_model=ClearResponse)
async def clear_chat(request: ChatRequest):
    logger.info(f"Clearing memory state for session ID: {request.session_id}")
    memory_service.clear_memory(request.session_id)
    return ClearResponse(message="Memory cleared!", session_id=request.session_id)
