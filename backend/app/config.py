"""
Application configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # OpenAI Configuration
    openai_api_key: str
    
    # Application Configuration
    app_name: str = "Voice Assistant POC"
    app_version: str = "1.0.0"
    environment: str = "development"
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # OpenAI Models
    whisper_model: str = "whisper-1"
    gpt_model: str = "gpt-4o-mini"
    tts_model: str = "tts-1"
    tts_voice: str = "alloy"
    
    # Database Configuration
    database_url: str = "postgresql+psycopg://sm_admin:sm2025**@localhost/smarthdb"
    
    # JWT Configuration
    secret_key: str = "tu_clave_secreta_super_segura_cambiar_en_produccion"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200  # 30 días
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False


# Global settings instance
settings = Settings()