# Example validator inputs

Run each JSON object through `scripts/validate_decision.py` on stdin.

## Recalled and ready to persist

```json
{
  "fatal_id": "40259",
  "fatal_link": "https://fatal.bytedance.net/incident/view/40259",
  "title": "Creator Biz Overload",
  "fatal_level": "Notice",
  "occur_time": 1752000000000,
  "human_confirmed": true,
  "recall_status": "recalled",
  "related_ticket_ids": ["tk-123"]
}
```

Expected decision: `persist`.

## Waiting for a human

```json
{
  "fatal_id": "40260",
  "fatal_link": "https://fatal.bytedance.net/incident/view/40260",
  "title": "Gateway Timeout",
  "fatal_level": "S1",
  "occur_time": 1752000000000,
  "human_confirmed": false
}
```

Expected decision: `pending`, state `card_pending`.

## Recalled but missing the Radar association

```json
{
  "fatal_id": "40261",
  "fatal_link": "https://fatal.bytedance.net/incident/view/40261",
  "title": "Search Availability",
  "fatal_level": "Notice",
  "occur_time": 1752000000000,
  "human_confirmed": true,
  "recall_status": "recalled",
  "related_ticket_ids": []
}
```

Expected decision: `pending`, next action `request_related_ticket_ids`.

## Idempotent hit

Add `"already_exists": true` to a valid candidate. Expected decision: `skip`; never call the create adapter again.

