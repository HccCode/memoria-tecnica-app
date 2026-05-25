from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # Pydantic automatically makes these uppercase when looking in the .env file
    # ================= SEGURIDAD Y JWT =================
SECRET_KEY = settings.secret_key  # Replaced hardcoded string
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480
    
    # Tells Pydantic to read from the .env file
    model_config = SettingsConfigDict(env_file=".env")

    # Helper property to convert the comma-separated string into a Python list
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

# Instantiate the settings so we can use them globally
settings = Settings()