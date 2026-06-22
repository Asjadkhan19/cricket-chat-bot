import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import patch

# Setup python path to include backend directory
sys.path.append(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "app")
)
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.app.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Asjad's Cricket Chat Bot API" in data["message"]
    assert "environment" in data


@patch("backend.app.main.search_web")
@patch("backend.app.main.groq_service.get_chat_completion")
def test_chat_endpoint(mock_groq, mock_search):
    # Setup mocks
    mock_search.return_value = "Mocked web search content"
    mock_groq.return_value = "Answer: Test Answer\n\nDo you want to know:\n- Q1\n- Q2\n- Q3"

    payload = {"message": "what is the live score of India vs Pakistan?", "session_id": "test_session"}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["session_id"] == "test_session"
    assert "Test Answer" in data["reply"]


@patch("backend.app.main.search_web")
@patch("backend.app.main.groq_service.get_chat_completion")
def test_chat_endpoint_with_player_metadata(mock_groq, mock_search):
    mock_search.return_value = ""
    # The endpoint will make 3 completions:
    # 1. Query classification -> returns classification JSON
    # 2. Main chat completion -> returns the reply
    # 3. Metadata extraction completion -> returns valid JSON string
    mock_groq.side_effect = [
        '{"type": "player", "player_name": "Virat Kohli"}',
        "Virat Kohli is a legendary Indian batsman who has scored many centuries.",
        '{"name": "Virat Kohli", "country": "IN", "role": "Batsman", "battingStyle": "Right-hand bat", "bowlingStyle": null, "stats": {"matches": 500, "runs": 26000, "wickets": 4, "avg": 53.5}, "highlights": ["Most double tons as captain", "2011 WC Winner"], "careerSummary": "One of the greatest modern batsmen."}'
    ]

    payload = {"message": "Virat Kohli stats", "session_id": "test_session"}
    response = client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["session_id"] == "test_session"
    assert data["metadata_type"] == "player"
    assert data["metadata"]["name"] == "Virat Kohli"


def test_clear_chat_endpoint():
    payload = {"message": "", "session_id": "test_session"}
    response = client.post("/api/chat/clear", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Memory cleared!"
    assert data["session_id"] == "test_session"


def test_should_trigger_search_classification():
    from backend.app.services.search import should_trigger_search

    # Real-time queries (should trigger search)
    assert should_trigger_search("what is the live score of India vs Pakistan?") is True
    assert should_trigger_search("Who won yesterday's IPL match?") is True
    assert should_trigger_search("latest news about Dhoni") is True
    assert should_trigger_search("Current ICC rankings") is True
    assert should_trigger_search("England squad for next series") is True

    # Evergreen / Historical queries (should not trigger search)
    assert should_trigger_search("What are the rules of LBW?") is False
    assert should_trigger_search("Who won the 1983 World Cup?") is False
    assert should_trigger_search("Explain the concept of run rate.") is False
    assert should_trigger_search("Biography of Don Bradman") is False


@patch("backend.app.services.metadata.groq_service.get_chat_completion")
def test_classify_query_card_types(mock_groq):
    from backend.app.services.metadata import classify_query

    def mock_classify_side_effect(messages):
        user_msg = messages[-1]["content"]
        if any(name in user_msg for name in ["Virat Kohli", "Rohit Sharma", "Jasprit Bumrah"]):
            return '{"type": "player", "player_name": "Some Cricketer"}'
        elif any(team in user_msg.lower() for team in ["india", "australia"]):
            return '{"type": "team", "player_name": null}'
        elif "vs" in user_msg.lower() or "compare" in user_msg.lower() or "analyze" in user_msg.lower():
            return '{"type": "match", "player_name": null}'
        return '{"type": null, "player_name": null}'

    mock_groq.side_effect = mock_classify_side_effect

    # Player queries
    assert classify_query("Virat Kohli stats") == ("player", "Some Cricketer")
    assert classify_query("Rohit Sharma profile") == ("player", "Some Cricketer")
    assert classify_query("Jasprit Bumrah career") == ("player", "Some Cricketer")

    # Team queries
    assert classify_query("India cricket team") == ("team", None)
    assert classify_query("Australia squad") == ("team", None)

    # Match analysis queries
    assert classify_query("Analyze India vs Australia") == ("match", None)
    assert classify_query("Compare CSK vs MI") == ("match", None)
    assert classify_query("CSK vs MI") == ("match", None)

    # Non-matching queries
    assert classify_query("What is an LBW?") == (None, None)
    assert classify_query("How to hold a cricket bat") == (None, None)


