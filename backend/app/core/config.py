import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "FlowTime Pomodoro API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "dev_secret_key_change_in_production_123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    # Render sets DATABASE_URL automatically for managed DBs.
    # Default: SQLite (local & dev). Override via env var for production.
    DATABASE_URL: str = "sqlite:///./flowtime.db"

    # Comma-separated or JSON list — overridden via env var on Render/Netlify.
    # In production set this to your exact Netlify URL, e.g.:
    #   CORS_ORIGINS=["https://my-app.netlify.app"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://localhost:3000",
        "*",  # Remove in production and replace with your Netlify URL
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
