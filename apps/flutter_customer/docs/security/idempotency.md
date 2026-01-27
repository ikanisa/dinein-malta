# Idempotency & Replay Prevention

**Goal**: Prevent duplicate orders caused by network retries or malicious replay attacks.

## Protocol

1.  **Client Responsibility**:
    *   Generate a UUID v4 `idempotency_key` for every distinct "Place Order" intent.
    *   Send this key in the `create_order` payload: `{ ..., "idempotency_key": "uuid..." }`.
    *   If the request fails (network error), **retry strictly with the SAME key**.

2.  **Server Responsibility (Edge Function)**:
    *   Check if `idempotency_key` exists in `processed_requests` table (or KV) for this `session_id`.
    *   **Case A (Found)**: Return the *previously created* `order_id` immediately. Do NOT create a new order.
    *   **Case B (Not Found)**: Proceed to create order.
    *   **On Success**: Store `idempotency_key` + `order_id` with TTL (e.g., 24 hours).

## Schema
```sql
create table idempotency_log (
  key uuid primary key,
  session_id uuid not null,
  response_payload jsonb,
  created_at timestamptz default now()
);
```

## Error Handling
*   If a key is reused with *different* payload -> Return `409 Conflict`.
