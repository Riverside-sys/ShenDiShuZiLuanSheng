# Workflow and adapter specification

## State machine

| State | Entry condition | Allowed next states |
| --- | --- | --- |
| `discovered` | Bits returns a normalized Fatal candidate | `card_pending`, `skipped`, `rejected` |
| `card_pending` | Review card sent; no human decision yet | `human_confirmed`, `retry` |
| `human_confirmed` | Callback carries an explicit decision | `validated`, `card_pending`, `rejected` |
| `validated` | Deterministic validator returns `persist` | `persisted`, `skipped`, `retry` |
| `persisted` | RB returns `created=true` | terminal |
| `skipped` | Existing `fatalId` or explicit non-entry rule | terminal |
| `rejected` | Malformed or contradictory input | terminal until corrected |
| `retry` | A transient adapter failure occurs | previous non-terminal state |

Persist state transitions with `fatalId`, card message ID, callback ID, retry count, last error, and timestamps. Use compare-and-set or another concurrency guard when callbacks can arrive more than once.

## Card contract

Show read-only fields from Bits:

- Fatal ID and link
- title
- Fatal level
- occurrence time

Collect human-controlled fields:

- `recallStatus`: `recalled` or `unrecalled`
- `relatedTicketIds`: required only when recalled
- explicit confirmation action and operator identity

Do not let editable card fields replace the Bits identity fields.

## Persistence adapter

Map the validated output to:

```http
POST /api/web/online-issue/fatal/create
Content-Type: application/json
```

Interpret the response:

- `created=true`: transition to `persisted` and record the returned Web record ID.
- `created=false`: transition to `skipped`; this is a successful idempotent hit.
- HTTP 400: transition to `rejected`; surface field errors on the card.
- HTTP 404: transition to `rejected` unless the contract explicitly defines a retryable lookup race.
- HTTP 429 or 5xx: transition to `retry` with bounded exponential backoff and jitter.

Never report `persisted` before receiving and validating the adapter response.

## Retry and idempotency

- Use `fatalId` as the business idempotency key.
- Deduplicate card callbacks by callback/event ID.
- Retry only transport failures, rate limits, and server failures.
- Do not retry validation failures until human input changes.
- Cap attempts and send a visible failure notification when exhausted.
- Prefer a database unique constraint on `fatal_id`; application-level query-before-create is not sufficient under concurrency.

## Observability

Emit structured events for discovery, card send, callback receive, validation, persistence attempt, idempotent hit, retry, and terminal failure. Include correlation IDs but exclude tokens and raw private card payloads.

