from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    TMDB_BASE_URL: str
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    API_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )

Config = Settings()