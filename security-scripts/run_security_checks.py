from __future__ import annotations

import sys

import requests

from config import load_settings
from http_client import ApiClient
from security_checks import build_security_checks


def main() -> int:
    settings = load_settings()
    client = ApiClient(settings)

    try:
        checks = build_security_checks(settings, client)
    except requests.RequestException as error:
        print(f"[FAIL] setup — API request failed: {error}")
        return 1
    except Exception as error:
        print(f"[FAIL] setup — {error}")
        return 1

    results = []

    for check in checks:
        result = check()
        results.append(result)

        status = "PASS" if result.passed else "FAIL"
        suffix = "" if result.passed else f" — {result.message}"
        print(f"[{status}] {result.name}{suffix}")

    passed_count = sum(1 for result in results if result.passed)
    failed_count = len(results) - passed_count

    print()
    print(f"Security checks completed: {passed_count} passed, {failed_count} failed")

    return 0 if failed_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())