import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    MONGODB_URI: str = "mongodb+srv://publicUser:lfenK47pOfrv6KlA@mycluster.mt6afrt.mongodb.net/petrodyn?retryWrites=true&w=majority&appName=mycluster"
    MONGODB_DB_NAME: str = "petrodyn"
    DATA_INGESTION_URL: str = "http://localhost:3002"
    PIPELINE_INTERVAL_SECONDS: int = 5
    DEFAULT_WELL_ID: str = "BW-001"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
