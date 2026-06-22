import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = "YOUR_GROQ_API_KEY"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = 8000
    environment: str = "production"
    allowed_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=[
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
            os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("groq_api_key")
    @classmethod
    def validate_groq_key(cls, v: str) -> str:
        val = v.strip() if v else ""
        if not val or val == "YOUR_GROQ_API_KEY":
            raise ValueError(
                "CRITICAL CONFIG ERROR: GROQ_API_KEY is not configured or contains placeholder. "
                "Provide a valid Groq API key in your environment variables or .env file."
            )
        return val


settings = Settings()
