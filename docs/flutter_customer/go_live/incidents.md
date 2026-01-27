# Incident Response

**Severity Levels**:
*   **S1 (Critical)**: Orders cannot be placed, App Crashing on Launch, Payment Handoff Broken. **Action**: Immediate Rollback/Hotfix.
*   **S2 (Major)**: Non-critical feature broken (Bell, History), Deep Links failing (fallback to Web works). **Action**: Hotfix within 24h.
*   **S3 (Minor)**: UI glitches, Typos, Minor animation jank. **Action**: Fix in next scheduled release.

---

## Common Scenarios & Triage

### Scenario A: Deep Links Opening Browser (Not App)
*   **Symptom**: Users verify they have the app, but scanning QR opens Chrome/Safari.
*   **Root Cause**: `assetlinks.json` (Android) or `AASA` (iOS) mismatch, signature rotation, or CDN caching.
*   **Diagnosis**:
    *   Check `https://dinein.app/.well-known/assetlinks.json`.
    *   Verify the SHA-256 matches the *actual* key used to sign the current Release.
    *   **Note**: Android 12+ requires `autoVerify=true` AND successful server handshake.
*   **Fix**: Update the JSON file on hosting. No App update needed usually (unless Intent Filter is wrong).

### Scenario B: "Place Order" Fails for Everyone
*   **Symptom**: Order Success Rate drops to 0%. Users see "Something went wrong".
*   **Root Cause**:
    *   Edge Function crashed / deployed with bug.
    *   Database RLS misconfiguration.
    *   Rate limiting bucket full (Redis down?).
*   **Diagnosis**:
    *   Check Supabase Edge Function Logs.
    *   Check Postgres Logs for RLS blocks.
*   **Fix**:
    *   Revert Edge Function to previous CLI version.
    *   OR Hotfix RLS policy.

### Scenario C: "Too Many Requests" (False Positive)
*   **Symptom**: Legitimate users blocked from ordering.
*   **Root Cause**: IP sharing (Public Wifi at venue) triggering IP-based rate limits.
*   **Diagnosis**: High 429 rate from same IP CIDR.
*   **Fix**: Temporarily increase limits or disable IP-check in Edge Function (fallback to `session_id` only).

### Scenario D: Spam Attack
*   **Symptom**: Thousands of fake orders appearing.
*   **Root Cause**: Protection bypass.
*   **Fix**:
    *   Enable "Under Attack" mode (e.g., lower rate limits).
    *   Block specific User Agents/IPs in Cloudflare/Supabase.
