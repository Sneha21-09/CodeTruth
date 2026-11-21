from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "CodeTruth"
    environment: str = "development"  # development | production | test
    debug: bool = False

    database_url: str = "sqlite:///./codetruth.db"

    secret_key: str = "dev-only-change-me-in-production-0123456789abcdef"
    access_token_minutes: int = 60 * 8
    reset_token_minutes: int = 30

    cors_origins: str = "http://localhost:3000"

    upload_dir: str = "./uploads"
    max_upload_mb: int = 10
    max_image_mb: int = 8

    # LLM (OpenRouter-compatible). Empty key => LLM disabled, deterministic engine only.
    llm_base_url: str = "https://openrouter.ai/api/v1"
    llm_api_key: str = ""
    llm_fast_model: str = "openai/gpt-4o-mini"
    llm_deep_model: str = "anthropic/claude-3.5-sonnet"
    llm_timeout_seconds: int = 45
    # Estimated pricing, USD per 1M tokens (input, output). Used only for ESTIMATES.
    llm_est_price_in_per_m: float = 0.5
    llm_est_price_out_per_m: float = 1.5

    # Local development mode: allows password reset token to be returned in API response
    # because no email provider is configured. Never enabled in production.
    dev_expose_reset_token: bool = True

    # Public site
    public_site_url: str = "http://localhost:3000"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def llm_enabled(self) -> bool:
        return bool(self.llm_api_key)

    @property
    def upload_path(self) -> Path:
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.is_production and s.secret_key.startswith("dev-only"):
        raise RuntimeError("SECRET_KEY must be set to a strong random value in production")
    return s
