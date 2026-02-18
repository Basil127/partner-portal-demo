import enum
import os
from pathlib import Path
from tempfile import gettempdir

from pydantic_settings import BaseSettings, SettingsConfigDict
from yarl import URL

TEMP_DIR = Path(gettempdir())


class LogLevel(enum.StrEnum):
    """Possible log levels."""

    NOTSET = "NOTSET"
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    FATAL = "FATAL"


class Settings(BaseSettings):
    """
    Application settings.

    These parameters can be configured
    with environment variables.
    """

    host: str = os.getenv("OPERACLONE2_HOST", "127.0.0.1")
    port: int = int(os.getenv("OPERACLONE2_PORT", 8000))
    # quantity of workers for uvicorn
    workers_count: int = int(os.getenv("OPERACLONE2_WORKERS_COUNT", 1))
    # Enable uvicorn reloading
    reload: bool = bool(os.getenv("OPERACLONE2_RELOAD", True))

    # Current environment
    environment: str = os.getenv("OPERACLONE2_ENVIRONMENT", "dev")

    log_level: LogLevel = LogLevel(os.getenv("OPERACLONE2_LOG_LEVEL", "DEBUG"))
    # Variables for the database
    db_host: str = os.getenv("OPERACLONE2_DB_HOST", "localhost")
    db_port: int = int(os.getenv("OPERACLONE2_DB_PORT", 5432))
    db_user: str = os.getenv("OPERACLONE2_DB_USER", "OperaClone2")
    db_pass: str = os.getenv("OPERACLONE2_DB_PASS", "OperaClone2")  # noqa: S105
    db_base: str = os.getenv("OPERACLONE2_DB_BASE", "OperaClone2")
    db_echo: bool = bool(os.getenv("OPERACLONE2_DB_ECHO", False))

    # CORS
    cors_origins: str = "*"

    @property
    def db_url(self) -> URL:
        """
        Assemble database URL from settings.

        :return: database URL.
        """
        return URL.build(
            scheme="postgresql+asyncpg",
            host=self.db_host,
            port=self.db_port,
            user=self.db_user,
            password=self.db_pass,
            path=f"/{self.db_base}",
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="OPERACLONE2_",
        env_file_encoding="utf-8",
    )


settings = Settings()
