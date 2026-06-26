from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Settings:
    base_url: str
    database_path: Path
    request_timeout_seconds: float
    support_email: str
    support_password: str
    default_category_name: str


def load_settings() -> Settings:
    database_path = Path(
        os.getenv("SECURITY_DATABASE_PATH", PROJECT_ROOT / "data" / "helpdesk.sqlite")
    )

    return Settings(
        base_url=os.getenv("SECURITY_API_BASE_URL", "http://localhost:3000").rstrip("/"),
        database_path=database_path,
        request_timeout_seconds=float(os.getenv("SECURITY_REQUEST_TIMEOUT", "5")),
        support_email=os.getenv("SECURITY_SUPPORT_EMAIL", "support@example.com"),
        support_password=os.getenv("SECURITY_SUPPORT_PASSWORD", "SupportPassword123!"),
        default_category_name=os.getenv("SECURITY_CATEGORY_NAME", "Hardware"),
    )