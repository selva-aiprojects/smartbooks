from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    database_url: str = "postgresql://postgres:postgres@localhost:5432/smartbooks"
    
    # JWT settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Application settings
    app_name: str = "SmartBooks"
    debug: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
