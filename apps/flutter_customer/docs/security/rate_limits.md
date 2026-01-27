# Rate Limiting & Abuse Prevention Policy

**Implementation**: Edge Functions / Redis (or KV Store).
**Key**: `rate:limit:{type}:{session_id}:{venue_id}`

## 1. Create Order Limits (`type:order`)
*   **Window**: 5 minutes
*   **Max Request**: 3
*   **Violation Response**: `429 Too Many Requests`
    *   *Message*: "Please wait a few minutes before placing another order."
*   **Daily Cap**: 10 orders / 24h (Soft limit, flagged for review).

## 2. Ring Bell Limits (`type:bell`)
*   **Window**: 1 minute
*   **Max Request**: 2
*   **Cooldown**: 20 seconds between successful rings.
*   **Violation Response**: `429 Too Many Requests`
    *   *Message*: "Waiter has been notified. Please wait a moment."

## 3. Ban Policy
*   **Trigger**: > 20 failed rate limit hits in 10 minutes.
*   **Action**: Block `session_id` at Edge layer for 24 hours.
*   **Response**: `403 Forbidden`.

## 4. Implementation Logic (Pseudo-code)
```typescript
const key = `ratelimit:order:${sessionId}:${venueId}`;
const current = await redis.incr(key);
if (current === 1) {
  await redis.expire(key, 300); // 5 mins
}
if (current > 3) {
  throw new Error("Rate limit exceeded");
}
```
