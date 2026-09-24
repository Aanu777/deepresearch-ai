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

    # ========================================================
    # VISION — OPENROUTER
    # ========================================================

    OPENROUTER_VISION_MODEL: str = (
        "openrouter/free"
    )

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