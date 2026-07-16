---
name: fatal-governance
description: Orchestrate human-in-the-loop Fatal incident governance across Bits, Lark review cards, and ReliableBackend. Use when an agent needs to process a newly discovered Fatal, prepare or interpret a review card, validate a human recall decision, prevent duplicate persistence, produce a safe web_incident_record write plan, or explain this Agent workflow in an interview. Never infer recall status without explicit human confirmation or claim a production write without a successful tool result.
---

# Fatal Governance

Treat Fatal governance as a stateful workflow, not a free-form chat. Let humans decide business facts; use deterministic code for validation and persistence gates.

## Enforce invariants

- Require explicit human confirmation before planning a write.
- Never infer `recallStatus` from title, severity, chat context, or model judgment.
- Require at least one non-empty Radar ticket ID when `recallStatus=recalled`.
- Match the incident ID parsed from `fatalLink` with `fatalId`.
- Use `fatalId` as the idempotency key. Never overwrite an existing record during create.
- Treat missing tools or ambiguous results as `pending`, not success.
- Keep credentials, tokens, and private card payloads out of responses and logs.

## Run the workflow

1. Normalize the Bits Fatal five-tuple: `fatalId`, `fatalLink`, `title`, `fatalLevel`, and `occurTime`.
2. Query the persistence adapter for `fatalId` when available. Return `skipped` with the existing record identity on an idempotent hit.
3. Send or prepare a Lark review card containing the five-tuple. Ask a human for `recallStatus` and, when recalled, `relatedTicketIds`.
4. Stop in `card_pending` until the card callback contains an explicit confirmation signal.
5. Convert the callback to the snake_case validator input described in [references/examples.md](references/examples.md).
6. Run `python3 scripts/validate_decision.py` with the JSON payload on stdin.
7. Follow the validator decision:
   - `persist`: call the Fatal create adapter once.
   - `pending`: request only the missing human input; do not write.
   - `reject`: explain the malformed or contradictory fields; do not write.
   - `skip`: report the idempotent hit; do not overwrite.
8. Record the terminal tool result and return a concise state summary with `fatalId`, workflow state, record ID if available, and next action.

## Use adapters safely

Use these logical adapters when the environment provides equivalent tools:

| Adapter | Responsibility |
| --- | --- |
| `fetch_fatals` | Fetch TTFE Fatal candidates from Bits and return structured five-tuples |
| `query_record_status` | Check whether `fatalId` already exists in `web_incident_record` |
| `send_review_card` | Send a Lark card and return a message/card identity |
| `read_card_decision` | Read the submitted human decision and callback identity |
| `create_fatal_record` | Call `POST /api/web/online-issue/fatal/create` and return `created` plus the record |
| `update_card_result` | Show persisted, skipped, pending, or failed status on the original card |

Do not fabricate an adapter when it is unavailable. Produce a dry-run plan and name the missing adapter instead.

## Validate deterministically

Run from this skill directory:

```bash
python3 scripts/validate_decision.py --pretty < decision.json
```

The script performs no network or database writes. It returns one of `persist`, `pending`, `reject`, or `skip` plus a normalized API payload when persistence is allowed.

## Return a stable result

Return this shape to downstream orchestration:

```json
{
  "fatalId": "40259",
  "state": "persisted",
  "decision": "persist",
  "recordId": 123,
  "created": true,
  "nextAction": "none"
}
```

Use `discovered`, `card_pending`, `human_confirmed`, `validated`, `persisted`, `skipped`, `rejected`, or `retry` for `state`.

## Load references as needed

- Read [references/workflow.md](references/workflow.md) when implementing adapters, retries, state storage, or observability.
- Read [references/examples.md](references/examples.md) when simulating card callbacks or testing the validator.
- Read [references/interview-guide.md](references/interview-guide.md) when explaining the design, trade-offs, or implementation boundary in an interview.

