#!/usr/bin/env python3
"""Validate a human-confirmed Fatal decision without external side effects."""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Any


INCIDENT_ID_RE = re.compile(r"/incident/view/([^/?#]+)", re.IGNORECASE)
VALID_RECALL_STATUSES = {"recalled", "unrecalled"}


def non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def normalize_ticket_ids(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return list(dict.fromkeys(item.strip() for item in value if non_empty_string(item)))


def validate(data: dict[str, Any]) -> dict[str, Any]:
    fatal_id = str(data.get("fatal_id", "")).strip()
    fatal_link = str(data.get("fatal_link", "")).strip()
    title = str(data.get("title", "")).strip()
    fatal_level = str(data.get("fatal_level", "")).strip()
    occur_time = data.get("occur_time")
    human_confirmed = data.get("human_confirmed") is True
    recall_status = str(data.get("recall_status", "")).strip()
    related_ticket_ids = normalize_ticket_ids(data.get("related_ticket_ids"))
    already_exists = data.get("already_exists") is True

    errors: list[dict[str, str]] = []
    for field, value in (
        ("fatal_id", fatal_id),
        ("fatal_link", fatal_link),
        ("title", title),
        ("fatal_level", fatal_level),
    ):
        if not value:
            errors.append({"field": field, "reason": "missing_required"})
    if not isinstance(occur_time, (int, float, str)) or isinstance(occur_time, bool) or str(occur_time).strip() == "":
        errors.append({"field": "occur_time", "reason": "missing_required"})

    match = INCIDENT_ID_RE.search(fatal_link) if fatal_link else None
    if fatal_link and (not match or match.group(1) != fatal_id):
        errors.append({"field": "fatal_link", "reason": "link_id_mismatch"})

    if errors:
        return {
            "fatalId": fatal_id or None,
            "decision": "reject",
            "state": "rejected",
            "errors": errors,
            "nextAction": "correct_invalid_fatal_fields",
        }

    if already_exists:
        return {
            "fatalId": fatal_id,
            "decision": "skip",
            "state": "skipped",
            "errors": [],
            "nextAction": "report_existing_record",
        }

    if not human_confirmed:
        return {
            "fatalId": fatal_id,
            "decision": "pending",
            "state": "card_pending",
            "errors": [{"field": "human_confirmed", "reason": "confirmation_required"}],
            "nextAction": "wait_for_human_confirmation",
        }

    if recall_status not in VALID_RECALL_STATUSES:
        return {
            "fatalId": fatal_id,
            "decision": "pending",
            "state": "human_confirmed",
            "errors": [{"field": "recall_status", "reason": "invalid_or_missing_decision"}],
            "nextAction": "request_recall_status",
        }

    if recall_status == "recalled" and not related_ticket_ids:
        return {
            "fatalId": fatal_id,
            "decision": "pending",
            "state": "human_confirmed",
            "errors": [{"field": "related_ticket_ids", "reason": "required_when_recalled"}],
            "nextAction": "request_related_ticket_ids",
        }

    payload: dict[str, Any] = {
        "fatalId": fatal_id,
        "fatalLink": fatal_link,
        "title": title,
        "fatalLevel": fatal_level,
        "occurTime": occur_time,
        "recallStatus": recall_status,
    }
    if related_ticket_ids:
        payload["relatedTicketIds"] = related_ticket_ids

    return {
        "fatalId": fatal_id,
        "decision": "persist",
        "state": "validated",
        "errors": [],
        "apiPayload": payload,
        "nextAction": "call_create_fatal_record",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    args = parser.parse_args()
    try:
        raw = json.load(sys.stdin)
        if not isinstance(raw, dict):
            raise ValueError("input must be a JSON object")
        result = validate(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        result = {
            "fatalId": None,
            "decision": "reject",
            "state": "rejected",
            "errors": [{"field": "$", "reason": str(exc)}],
            "nextAction": "provide_valid_json_object",
        }
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2 if args.pretty else None)
    sys.stdout.write("\n")
    return 0 if result["decision"] in {"persist", "pending", "skip"} else 2


if __name__ == "__main__":
    raise SystemExit(main())

