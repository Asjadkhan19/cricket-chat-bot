from groq import Groq
import json
import os
from ddgs import DDGS
import requests
from bs4 import BeautifulSoup
from datetime import datetime

client = Groq(api_key=" YOUR_GROQ_API_KEY ")
MEMORY_FILE = "chat_memory.json"


def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    return [{
        "role": "system",
        "content": (
            "You are a highly knowledgeable cricket assistant. "
            "Always provide the latest stats, scores, and facts. "
            "Be concise, confident, and data-driven."
        )
    }]


def save_memory(convo):
    with open(MEMORY_FILE, "w") as f:
        json.dump(convo, f)


def fetch_page_content(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join([p.text for p in paragraphs[:5]])

        return text.strip()
    except:
        return ""



def search_web(query):
    results = []

    with DDGS() as ddgs:
        search_results = ddgs.text(
            query + " latest cricket news stats",
            max_results=5
        )

        for r in search_results:
            url = r.get("href", "")
            snippet = r.get("body", "")

            content = fetch_page_content(url)

            if content:
                results.append(content)
            else:
                results.append(snippet)

    return " ".join(results[:3])


convo = load_memory()
print("🏏 Asjad's Cricket Chat Bot\nType 'exit' to quit, 'clear' to reset.\n")

while True:
    user_input = input("You: ")
    
    if user_input.lower() == "exit":
        save_memory(convo)
        print("Memory saved. Bye!")
        break
    
    if user_input.lower() == "clear":
        convo = [{
        "role": "system",
        "content": (
            "You are a highly knowledgeable cricket assistant. "
            "Always provide the latest stats, scores, and facts. "
            "Be concise, confident, and data-driven."
        )
    }]
        save_memory(convo)
        print("Memory cleared!")
        continue
    
    print("Searching web...")
    web_context = search_web(user_input)
    def is_live_score_query(q):
        keywords = ["live", "current score", "score now", "ongoing match", "live score"]
        return any(k in q.lower() for k in keywords)
    current_time = datetime.now().strftime("%B %d, %Y")
    enriched_input = f"""
    User question: {user_input}

    Latest Web Data (as of {current_time}):
    {web_context}

CRITICAL RULES:

1. ONLY answer what is asked.
   - Do NOT add extra information.

2. DO NOT include:
   - current match scores
   - live updates
   - ongoing match details
UNLESS the question explicitly asks for them (e.g., "current score", "live match").

3. If the question is a simple factual query:
   → respond in ONE LINE ONLY.

4. If the question is broader:
   → give a short structured answer.

5. After answering, suggest 2–3 relevant follow-up questions.

FORMAT:
Answer: <your answer>

Do you want to know :
- <related question 1>
- <related question 2>
- <related question 3>
"""
    convo.append({"role": "user", "content": enriched_input})
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=convo,
        temperature=0.7
    )
    
    reply = response.choices[0].message.content
    convo.append({"role": "assistant", "content": reply})
    print(f"\n🏏 Asjad:\n{reply}\n")