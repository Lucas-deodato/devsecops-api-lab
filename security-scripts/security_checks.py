from __future__ import annotations

import sqlite3
import time
from dataclasses import dataclass
from typing import Any, Callable

from config import Settings
from http_client import ApiClient, ApiResponse


class SecurityCheckError(AssertionError):
    pass


@dataclass(frozen=True)
class CheckResult:
    name: str
    passed: bool
    message: str


SecurityCheck = Callable[[], CheckResult]


def pass_result(name: str) -> CheckResult:
    return CheckResult(name=name, passed=True, message="passed")


def fail_result(name: str, error: Exception) -> CheckResult:
    return CheckResult(name=name, passed=False, message=str(error))


def assert_status(response: ApiResponse, expected_status: int) -> None:
    if response.status_code != expected_status:
        raise SecurityCheckError(
            f"expected HTTP {expected_status}, got {response.status_code}: {response.raw_text}"
        )


def assert_error_code(response: ApiResponse, expected_code: str) -> None:
    body = response.body

    if not isinstance(body, dict):
        raise SecurityCheckError(f"expected JSON error body, got: {response.raw_text}")

    actual_code = body.get("error", {}).get("code")

    if actual_code != expected_code:
        raise SecurityCheckError(f"expected error code {expected_code}, got {actual_code}")


def unique_email(prefix: str) -> str:
    return f"{prefix}.{int(time.time() * 1000)}@example.com"


def get_default_category_id(settings: Settings) -> str:
    if not settings.database_path.exists():
        raise SecurityCheckError(f"database file not found: {settings.database_path}")

    with sqlite3.connect(settings.database_path) as connection:
        row = connection.execute(
            "SELECT id FROM categories WHERE name = ?",
            (settings.default_category_name,),
        ).fetchone()

    if not row:
        raise SecurityCheckError(
            f"category {settings.default_category_name!r} not found. Run npm run db:seed."
        )

    return str(row[0])


def register_employee(client: ApiClient, email: str) -> dict[str, Any]:
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Security Script Employee",
            "email": email,
            "password": "senha-super-segura",
        },
    )

    assert_status(response, 201)

    if not isinstance(response.body, dict) or "user" not in response.body:
        raise SecurityCheckError("register response did not include user")

    return response.body["user"]


def login(client: ApiClient, email: str, password: str) -> str:
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert_status(response, 200)

    if not isinstance(response.body, dict):
        raise SecurityCheckError("login response body is not JSON object")

    token = response.body.get("accessToken")

    if not isinstance(token, str) or len(token) < 20:
        raise SecurityCheckError("login response did not include a valid accessToken")

    return token


def create_ticket(client: ApiClient, token: str, category_id: str) -> dict[str, Any]:
    response = client.post(
        "/api/tickets",
        token=token,
        json={
            "title": "Security validation ticket",
            "description": "Ticket created by Python security validation scripts.",
            "priority": "HIGH",
            "categoryId": category_id,
        },
    )

    assert_status(response, 201)

    if not isinstance(response.body, dict) or "ticket" not in response.body:
        raise SecurityCheckError("create ticket response did not include ticket")

    return response.body["ticket"]


def check_security_headers(client: ApiClient) -> CheckResult:
    name = "security headers"

    try:
        response = client.get("/health")
        assert_status(response, 200)

        lowered_headers = {key.lower(): value for key, value in response.headers.items()}

        if "x-powered-by" in lowered_headers:
            raise SecurityCheckError("X-Powered-By header should not be exposed")

        if lowered_headers.get("x-content-type-options") != "nosniff":
            raise SecurityCheckError("X-Content-Type-Options header should be nosniff")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_auth_required(client: ApiClient) -> CheckResult:
    name = "auth required"

    try:
        me_response = client.get("/api/auth/me")
        assert_status(me_response, 401)
        assert_error_code(me_response, "UNAUTHORIZED")

        tickets_response = client.get("/api/tickets")
        assert_status(tickets_response, 401)
        assert_error_code(tickets_response, "UNAUTHORIZED")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_invalid_token_rejected(client: ApiClient) -> CheckResult:
    name = "invalid token rejected"

    try:
        response = client.get("/api/auth/me", token="invalid-token")
        assert_status(response, 401)
        assert_error_code(response, "UNAUTHORIZED")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_mass_assignment_rejected(
    client: ApiClient,
    settings: Settings,
    support_token: str,
) -> CheckResult:
    name = "mass assignment rejected"

    try:
        register_response = client.post(
            "/api/auth/register",
            json={
                "name": "Mass Assignment User",
                "email": unique_email("security.mass.assignment"),
                "password": "senha-super-segura",
                "role": "support",
            },
        )
        assert_status(register_response, 400)
        assert_error_code(register_response, "VALIDATION_ERROR")

        employee_email = unique_email("security.mass.ticket")
        register_employee(client, employee_email)
        employee_token = login(client, employee_email, "senha-super-segura")
        category_id = get_default_category_id(settings)

        ticket_response = client.post(
            "/api/tickets",
            token=employee_token,
            json={
                "title": "Mass assignment ticket",
                "description": "Attempt to set server-controlled ticket fields.",
                "priority": "HIGH",
                "categoryId": category_id,
                "creatorId": "00000000-0000-0000-0000-000000000000",
                "status": "RESOLVED",
                "assigneeId": "00000000-0000-0000-0000-000000000000",
            },
        )
        assert_status(ticket_response, 400)
        assert_error_code(ticket_response, "VALIDATION_ERROR")

        valid_ticket = create_ticket(client, employee_token, category_id)
        status_response = client.patch(
            f"/api/tickets/{valid_ticket['id']}/status",
            token=support_token,
            json={
                "status": "IN_PROGRESS",
                "resolvedAt": "2020-01-01T00:00:00.000Z",
                "assigneeId": "00000000-0000-0000-0000-000000000000",
            },
        )
        assert_status(status_response, 400)
        assert_error_code(status_response, "VALIDATION_ERROR")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_idor_blocked(client: ApiClient, settings: Settings) -> CheckResult:
    name = "idor blocked"

    try:
        category_id = get_default_category_id(settings)

        employee_a_email = unique_email("security.idor.a")
        employee_b_email = unique_email("security.idor.b")

        register_employee(client, employee_a_email)
        register_employee(client, employee_b_email)

        employee_a_token = login(client, employee_a_email, "senha-super-segura")
        employee_b_token = login(client, employee_b_email, "senha-super-segura")

        ticket = create_ticket(client, employee_a_token, category_id)

        response = client.get(f"/api/tickets/{ticket['id']}", token=employee_b_token)
        assert_status(response, 404)
        assert_error_code(response, "TICKET_NOT_FOUND")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_role_enforcement(
    client: ApiClient,
    settings: Settings,
) -> CheckResult:
    name = "role enforcement"

    try:
        category_id = get_default_category_id(settings)
        employee_email = unique_email("security.role.employee")

        register_employee(client, employee_email)
        employee_token = login(client, employee_email, "senha-super-segura")
        ticket = create_ticket(client, employee_token, category_id)

        status_response = client.patch(
            f"/api/tickets/{ticket['id']}/status",
            token=employee_token,
            json={"status": "IN_PROGRESS"},
        )
        assert_status(status_response, 403)
        assert_error_code(status_response, "FORBIDDEN")

        history_response = client.get(
            f"/api/tickets/{ticket['id']}/history",
            token=employee_token,
        )
        assert_status(history_response, 403)
        assert_error_code(history_response, "FORBIDDEN")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_workflow_abuse_rejected(
    client: ApiClient,
    settings: Settings,
    support_token: str,
) -> CheckResult:
    name = "invalid workflow transition rejected"

    try:
        category_id = get_default_category_id(settings)
        employee_email = unique_email("security.workflow.employee")

        register_employee(client, employee_email)
        employee_token = login(client, employee_email, "senha-super-segura")
        ticket = create_ticket(client, employee_token, category_id)

        in_progress_response = client.patch(
            f"/api/tickets/{ticket['id']}/status",
            token=support_token,
            json={"status": "IN_PROGRESS"},
        )
        assert_status(in_progress_response, 200)

        resolved_response = client.patch(
            f"/api/tickets/{ticket['id']}/status",
            token=support_token,
            json={"status": "RESOLVED"},
        )
        assert_status(resolved_response, 200)

        invalid_transition_response = client.patch(
            f"/api/tickets/{ticket['id']}/status",
            token=support_token,
            json={"status": "IN_PROGRESS"},
        )
        assert_status(invalid_transition_response, 409)
        assert_error_code(invalid_transition_response, "INVALID_STATUS_TRANSITION")

        return pass_result(name)
    except Exception as error:
        return fail_result(name, error)


def check_login_rate_limit(client: ApiClient) -> CheckResult:
    name = "login rate limit"

    try:
        last_response: ApiResponse | None = None

        for attempt in range(12):
            last_response = client.post(
                "/api/auth/login",
                json={
                    "email": f"rate.limit.{attempt}@example.com",
                    "password": "wrong-password",
                },
            )

            if last_response.status_code == 429:
                assert_error_code(last_response, "TOO_MANY_REQUESTS")
                return pass_result(name)

        status = last_response.status_code if last_response else "no response"
        raise SecurityCheckError(f"expected 429 TOO_MANY_REQUESTS, got {status}")
    except Exception as error:
        return fail_result(name, error)


def build_security_checks(settings: Settings, client: ApiClient) -> list[SecurityCheck]:
    support_token = login(client, settings.support_email, settings.support_password)

    return [
        lambda: check_security_headers(client),
        lambda: check_auth_required(client),
        lambda: check_invalid_token_rejected(client),
        lambda: check_mass_assignment_rejected(client, settings, support_token),
        lambda: check_idor_blocked(client, settings),
        lambda: check_role_enforcement(client, settings),
        lambda: check_workflow_abuse_rejected(client, settings, support_token),
        lambda: check_login_rate_limit(client),
    ]