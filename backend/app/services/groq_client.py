import os
from groq import Groq
from app.config import settings


class GroqService:

    def __init__(self):
        # Prefer the loaded settings key, fallback to environmental lookup if placeholder remains
        api_key = settings.groq_api_key
        if api_key == "YOUR_GROQ_API_KEY" or not api_key:
            api_key = os.getenv("GROQ_API_KEY", api_key)

        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"

    def get_chat_completion(self, messages: list) -> str:
        response = self.client.chat.completions.create(
            model=self.model, messages=messages, temperature=0.7
        )
        return response.choices[0].message.content


groq_service = GroqService()
