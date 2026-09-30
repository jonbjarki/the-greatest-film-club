from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    TMDB_BASE_URL: str
    SECRET_KEY: str
    API_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
    )

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL

        # Tell SQLAlchemy to use asyncpg
        if url.startswith("postgresql://"):
            url = url.replace(
                "postgresql://",
                "postgresql+asyncpg://",
                1,
            )

        parts = urlsplit(url)

        # Remove parameters asyncpg doesn't accept
        query = dict(parse_qsl(parts.query))
        query.pop("sslmode", None)
        query.pop("channel_binding", None)

        return urlunsplit(
            (
                parts.scheme,
                parts.netloc,
                parts.path,
                urlencode(query),
                parts.fragment,
            )
        )


Config = Settings()