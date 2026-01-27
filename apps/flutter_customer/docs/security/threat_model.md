# Threat Model: Anonymous Order Abuse

**System**: DineIn Flutter Customer App (No Login)
**Asset**: Order Processing & Venue Operations
**Adversary**: Malicious users (spammers, griefers, bots) or Competitors.

## 1. Threats & Risks

| ID | Threat | Description | Impact | Likelihood |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | **Order Spam** | Attacker creates 100s of fake orders for a venue. | Kitchen flooded with tickets. Venue reputation damage. | High |
| **T2** | **Bell Harassment** | Attacker spams "Call Waiter" button. | Waiters distracted. Service disruption. | Medium |
| **T3** | **Menu Scraping** | Bot scrapes all venues and menus. | IP theft. High server load. | Low |
| **T4** | **Replay Attack** | Attacker intercepts a valid "Place Order" request and replays it. | Duplicate orders. Financial dispute potential. | Medium |
| **T5** | **Cost Spike** | Attacker triggers heavy Edge Functions repeatedly. | Increased bill for project owner. | Low |

## 2. Mitigations

| Threat | Mitigation Strategy | Policy Ref |
| :--- | :--- | :--- |
| **T1 (Orders)** | **Rate Limiting**: Max 3 orders / 5 mins per session. <br> **Payload Validation**: Strict bounds on qty/items. <br> **IP Throttling**: If session ID rotates, block by IP (Cloudflare). | `rate_limits.md` |
| **T2 (Bell)** | **Cooldown**: 20s between rings. <br> **Daily Cap**: Max 10 rings/hour. | `rate_limits.md` |
| **T3 (Scrape)** | **Read Throttling**: Cache menu reads aggressively. Cloudflare WAF integration (optional). | `monitoring.md` |
| **T4 (Replay)** | **Idempotency Key**: Client sends UUID `request_id`. Server rejects duplicates within TTL. | `idempotency.md` |
| **T5 (Cost)** | **Edge Function Gate**: No direct DB writes. Functions fail fast on rate limit. | `rls_summary.md` |

## 3. Residual Risk
*   **Distributed Botnet**: If attacker uses 1000s of IPs/Sessions, rate limits per session fail.
    *   *Acceptance*: Unlikely for a local dining app. Mitigation: Cloudflare Under Attack mode.
*   **Physical Griefing**: User physically at venue spamming with different phones.
    *   *Acceptance*: Venue staff can identify and eject the person.
