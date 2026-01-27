# Monitoring (Hypercare: First 72h)

Dashboard metrics to watch closely during the initial rollout.

---

## 1. Top-Level Health (The Pulse)
*   **Crash Free Users**: Target > 99.8%.
*   **App Launches**: Trend should match marketing/QR scan volume.
*   **Deep Link Opens**: Should track close to QR Scans. Low ratio implies app not opening (AssetLinks issue).

## 2. Business Logic Success
*   **Order Creation Success Rate**:
    *   `(Successful Orders / Total Place Order Requests) * 100`
    *   **Alert if**: < 95% (sustained for 10 min).
*   **Bell Ring Success Rate**:
    *   `(Successful Rings / Total Ring Requests) * 100`
    *   **Alert if**: < 90%.

## 3. Abuse & Security
*   **Rate Limited IPs**:
    *   Count of 429 responses.
    *   **Normal**: < 1% of traffic.
    *   **Incident**: Spike > 10% (Potential DDoS or aggressive bot).
*   **Blocked Inserts**:
    *   Count of RLS policy violations (direct inserts).
    *   **Normal**: 0 (App never does this).
    *   **Incident**: Any spike >= 1 (Hacking attempt).

## 4. Performance (Latency)
*   **Edge Function Duration (`create_customer_order`)**:
    *   p95 target: < 800ms.
    *   If p95 > 2s: Investigate DB locks or cold starts.

## 5. Store Feedback
*   Monitor "Reviews" and "Crashes/ANRs" in Console daily.
*   Watch for keywords: "Broken", "Can't order", "Spinning".
