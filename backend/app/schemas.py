from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., description="The user message to send to the bot")
    session_id: str = Field(
        "default", description="The conversation session identifier"
    )


class MessageModel(BaseModel):
    role: str
    content: str


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    metadata_type: Optional[str] = Field(
        None, description="Card type: 'player', 'team', or 'match'"
    )
    metadata: Optional[dict] = Field(
        None, description="Structured data for the card component"
    )


class ClearResponse(BaseModel):
    message: str
    session_id: str
