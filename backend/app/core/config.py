from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):

    # ========================================================
    # APPLICATION
    # ========================================================

    APP_NAME: str = (
        "DeepResearch AI"
    )

    VERSION: str = (
        "1.0.0"
    )

    # ========================================================
    # WEB RESEARCH — TAVILY
    # ========================================================

    TAVILY_API_KEY: str

    # ========================================================
    # CHAT / LLM — OPENROUTER
    # ========================================================

    OPENROUTER_API_KEY: str

    OPENROUTER_MODEL: str = (
        "meta-llama/"
        "llama-3.3-70b-instruct"
    )

    OPENROUTER_MAX_TOKENS: int = 1024

    OPENROUTER_MAX_HISTORY_MESSAGES: int = 24

    OPENROUTER_FALLBACK_MODEL: str = (
        "openrouter/free"
    )

    # ========================================================
    # VISION — OPENROUTER
    # ========================================================

    OPENROUTER_VISION_MODEL: str = (
        "openrouter/free"
    )

    # ========================================================
    # APPLICATION-LAYER PAYLOAD ENCRYPTION
    # ========================================================

    PAYLOAD_PRIVATE_KEY_B64: str = ""

    PAYLOAD_ENCRYPTION_REQUIRED: bool = True

    # ========================================================
    # AUTHENTICATION — SUPABASE
    # ========================================================

    SUPABASE_URL: str

    # ========================================================
    # SPEECH TO TEXT — DEEPGRAM
    # ========================================================

    DEEPGRAM_API_KEY: str

    DEEPGRAM_STT_MODEL: str = (
        "nova-3"
    )

    # ========================================================
    # IMAGE GENERATION — POLLINATIONS
    # ========================================================

    POLLINATIONS_API_KEY: str

    POLLINATIONS_IMAGE_MODEL: str = (
        "flux"
    )

    # ========================================================
    # IMAGE EDITING — POLLINATIONS
    # ========================================================

    POLLINATIONS_IMAGE_EDIT_MODEL: str = (
        "kontext"
    )

    # ========================================================
    # CORS
    # ========================================================

    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "https://deepresearch-ai-nu.vercel.app,"
        "https://deepresearch-ai-ayan-a664.vercel.app,"
        "https://deepresearch-ai-git-main-ayan-a664.vercel.app"
    )

    CORS_ORIGIN_REGEX: str = (
        r"^https://deepresearch-[a-z0-9-]+-ayan-a664\.vercel\.app$"
    )

    # ========================================================
    # SETTINGS
    # ========================================================

    model_config = (
        SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore",
        )
    )


settings = Settings()