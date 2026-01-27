# Security Monitoring & Alerting

**Goal**: Detect abuse spikes before they impact service quality.

## 1. Key Metrics (Dashboard)

| Metric | Threshold (Alert) | Meaning |
| :--- | :--- | :--- |
| `function_error_429` | > 50 / min | High rate of blocked spam attempts. |
| `orders_created_per_venue` | > 2x avg | Possible order flood attack on a venue. |
| `bell_rings_per_venue` | > 20 / hour | Harassment attempt. |

## 2. Audit Logs (Table: `security_audit_log`)
Every Edge Function execution logs to this table (async, fire-and-forget).

| Column | Description |
| :--- | :--- |
| `event_type` | `create_order`, `ring_bell` |
| `session_hash` | `sha256(session_id)` (Anonymized tracking) |
| `venue_id` | Target venue |
| `status` | `SUCCESS`, `BLOCKED`, `INVALID_PAYLOAD` |
| `ip_address` | Client IP (from headers) |

## 3. Incident Response Playbook
**Trigger**: Alert `High Order Spam` on Venue X.
1.  **Analyze**: Check `security_audit_log` for Venue X.
2.  **Identify**: Find recurring IP or Session Hash.
3.  **WAF Block**: Add IP to Cloudflare Blocklist.
4.  **Purge**: Delete fake orders from DB to clear Kitchen Display.
