from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):

    APP_NAME: str = "DeepResearch AI"

    VERSION: str = "1.0.0"

    TAVILY_API_KEY: str

    OPENROUTER_API_KEY: str

    OPENROUTER_MODEL: str = (
        "meta-llama/llama-3.3-70b-instruct"
    )

    SUPABASE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()