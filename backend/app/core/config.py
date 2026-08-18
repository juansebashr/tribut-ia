import os
from pydantic import BaseModel, Field


class Settings(BaseModel):
    PROJECT_NAME: str = "TributIA Colombia - Engine Fiscal"
    VERSION: str = "2.5.0"
    API_V1_STR: str = "/api/v1"
    
    # Configuración de Sesiones
    # Opciones: "memory", "redis"
    SESSION_STORE_BACKEND: str = Field(
        default_factory=lambda: os.getenv("SESSION_STORE_BACKEND", "redis" if os.getenv("REDIS_URL") else "memory")
    )
    REDIS_URL: str = Field(
        default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379/0")
    )
    # TTL de 1 día (86.400 segundos) con renovación deslizante
    REDIS_SESSION_TTL_SECONDS: int = Field(
        default_factory=lambda: int(os.getenv("REDIS_SESSION_TTL_SECONDS", "86400"))
    )


settings = Settings()
