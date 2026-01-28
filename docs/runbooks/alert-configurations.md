# Alert Configurations for AI Rollout

This document defines alert thresholds and notification channels for monitoring the Moltbot AI rollout.

---

## Alert Definitions

### Critical Alerts (Immediate Response)

| Alert ID | Name | Condition | Runbook |
|----------|------|-----------|---------|
| `AI_001` | Kill Switch Active | `kill_switches.is_active = true` | [ai-outage.md](./ai-outage.md) |
| `AI_002` | Tenant Probe Detected | `kpi_snapshots.tenant_mismatch_count > 0` | [tenant-probe-spike.md](./tenant-probe-spike.md) |
| `AI_003` | Approval Bypass | `kpi_snapshots.approval_bypass_attempts > 0` | [tenant-probe-spike.md](./tenant-probe-spike.md) |
| `AI_004` | Agent Function Down | Edge function 5xx rate > 10% for 5 min | [ai-outage.md](./ai-outage.md) |

### High Alerts (15-minute Response)

| Alert ID | Name | Condition | Runbook |
|----------|------|-----------|---------|
| `AI_101` | Tool Error Rate High | `kpi_snapshots.tool_error_rate > 0.05` | [ai-outage.md](./ai-outage.md) |
| `AI_102` | Double Order Detected | 2+ orders same user/venue within 60s | [double-order-spike.md](./double-order-spike.md) |
| `AI_103` | Latency Degradation | `kpi_snapshots.agent_latency_p95_ms > 3000` | [ai-outage.md](./ai-outage.md) |
| `AI_104` | UIPlan Invalid Rate High | `kpi_snapshots.uiplan_valid_rate < 0.95` | [ai-outage.md](./ai-outage.md) |

### Warning Alerts (30-minute Response)

| Alert ID | Name | Condition | Runbook |
|----------|------|-----------|---------|
| `AI_201` | Tool Error Rate Elevated | `kpi_snapshots.tool_error_rate > 0.02` | Monitor |
| `AI_202` | Latency Elevated | `kpi_snapshots.agent_latency_p95_ms > 2000` | Monitor |
| `AI_203` | Automatic Fallback Triggered | Venue mode auto-reverted | Review |

---

## SQL Alert Queries

### Check for Critical Alerts

```sql
-- Run every 1 minute
SELECT 
    'AI_001' as alert_id,
    id as entity_id,
    reason as details
FROM kill_switches
WHERE is_active = true

UNION ALL

SELECT 
    'AI_002' as alert_id,
    venue_id as entity_id,
    'Tenant mismatch count: ' || tenant_mismatch_count as details
FROM kpi_snapshots
WHERE snapshot_at > NOW() - INTERVAL '5 minutes'
  AND tenant_mismatch_count > 0

UNION ALL

SELECT 
    'AI_003' as alert_id,
    venue_id as entity_id,
    'Approval bypass attempts: ' || approval_bypass_attempts as details
FROM kpi_snapshots
WHERE snapshot_at > NOW() - INTERVAL '5 minutes'
  AND approval_bypass_attempts > 0;
```

### Check for High Alerts

```sql
-- Run every 5 minutes
SELECT 
    'AI_101' as alert_id,
    venue_id as entity_id,
    'Tool error rate: ' || ROUND(tool_error_rate * 100, 1) || '%' as details
FROM kpi_snapshots
WHERE snapshot_at > NOW() - INTERVAL '15 minutes'
  AND tool_error_rate > 0.05

UNION ALL

SELECT 
    'AI_102' as alert_id,
    venue_id as entity_id,
    'Duplicate orders: ' || COUNT(*) as details
FROM (
    SELECT venue_id, user_id, 
           DATE_TRUNC('minute', created_at) as order_minute
    FROM orders
    WHERE created_at > NOW() - INTERVAL '15 minutes'
    GROUP BY venue_id, user_id, DATE_TRUNC('minute', created_at)
    HAVING COUNT(*) > 1
) dups
GROUP BY venue_id

UNION ALL

SELECT 
    'AI_103' as alert_id,
    venue_id as entity_id,
    'Latency p95: ' || agent_latency_p95_ms || 'ms' as details
FROM kpi_snapshots
WHERE snapshot_at > NOW() - INTERVAL '15 minutes'
  AND agent_latency_p95_ms > 3000

UNION ALL

SELECT 
    'AI_104' as alert_id,
    venue_id as entity_id,
    'UIPlan valid rate: ' || ROUND(uiplan_valid_rate * 100, 1) || '%' as details
FROM kpi_snapshots
WHERE snapshot_at > NOW() - INTERVAL '15 minutes'
  AND uiplan_valid_rate < 0.95;
```

---

## Notification Channels

### PagerDuty Integration

```yaml
# Example PagerDuty configuration
service_key: "${PAGERDUTY_SERVICE_KEY}"
routing:
  - severity: critical
    urgency: high
    notify: on-call
  - severity: high
    urgency: high
    notify: on-call
  - severity: warning
    urgency: low
    notify: slack
```

### Slack Webhooks

```yaml
# Example Slack configuration
channels:
  critical: "#incidents"
  high: "#alerts-ai"
  warning: "#monitoring"
webhook_url: "${SLACK_WEBHOOK_URL}"
```

---

## Supabase pg_cron Setup

To run alert checks automatically:

```sql
-- Enable pg_cron extension (one-time)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule critical alert check every minute
SELECT cron.schedule(
    'critical-alerts-check',
    '* * * * *',  -- Every minute
    $$
    INSERT INTO alert_events (alert_id, entity_id, details, created_at)
    SELECT alert_id, entity_id, details, NOW()
    FROM (
        SELECT 'AI_001' as alert_id, id as entity_id, reason as details
        FROM kill_switches WHERE is_active = true
        UNION ALL
        SELECT 'AI_002', venue_id, 'Tenant mismatch' 
        FROM kpi_snapshots 
        WHERE snapshot_at > NOW() - INTERVAL '1 minute' AND tenant_mismatch_count > 0
    ) alerts;
    $$
);

-- Schedule high alert check every 5 minutes
SELECT cron.schedule(
    'high-alerts-check',
    '*/5 * * * *',  -- Every 5 minutes
    $$
    INSERT INTO alert_events (alert_id, entity_id, details, created_at)
    SELECT alert_id, entity_id, details, NOW()
    FROM (
        SELECT 'AI_101', venue_id, 'Tool error rate high'
        FROM kpi_snapshots 
        WHERE snapshot_at > NOW() - INTERVAL '5 minutes' AND tool_error_rate > 0.05
    ) alerts;
    $$
);
```

---

## Alert Event Table Schema

```sql
CREATE TABLE IF NOT EXISTS alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_events_created ON alert_events(created_at DESC);
CREATE INDEX idx_alert_events_unresolved ON alert_events(alert_id) 
    WHERE resolved_at IS NULL;
```

---

## Dashboard Monitoring

The Admin PWA Rollout Dashboard (`/dashboard/ai/rollout`) provides:

1. **overview tab**: Real-time KPI snapshots with status indicators
2. **Kill Switches tab**: Active kill switches with reasons
3. **Venue Modes tab**: Current rollout state per venue

For detailed monitoring, use Supabase Dashboard → Logs → Edge Functions.
