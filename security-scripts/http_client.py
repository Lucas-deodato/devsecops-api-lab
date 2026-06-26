from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from config import Settings


@dataclass(frozen=True)
class ApiResponse:
    status_code: int
    headers: dict[str, str]
    body: dict[str, Any] | list[Any] | None
    raw_text: str


class ApiClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._session = requests.Session()

    def get(self, path: str, token: str | None = None) -> ApiResponse:
        return self._request("GET", path, token=token)

    def post(
        self,
        path: str,
        json: dict[str, Any] | None = None,
        token: str | None = None,
    ) -> ApiResponse:
        return self._request("POST", path, json=json, token=token)

    def patch(
        self,
        path: str,
        json: dict[str, Any] | None = None,
        token: str | None = None,
    ) -> ApiResponse:
        return self._request("PATCH", path, json=json, token=token)

    def _request(
        self,
        method: str,
        path: str,
        json: dict[str, Any] | None = None,
        token: str | None = None,
    ) -> ApiResponse:
        headers = {"Accept": "application/json"}

        if token:
            headers["Authorization"] = f"Bearer {token}"

        response = self._session.request(
            method=method,
            url=f"{self._settings.base_url}{path}",
            json=json,
            headers=headers,
            timeout=self._settings.request_timeout_seconds,
        )

        try:
            body = response.json()
        except ValueError:
            body = None

        return ApiResponse(
            status_code=response.status_code,
            headers=dict(response.headers),
            body=body,
            raw_text=response.text,
        )