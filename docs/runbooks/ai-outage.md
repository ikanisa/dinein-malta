# AI Outage Runbook

> **Severity**: Critical  
> **On-Call Response Time**: < 5 minutes  
> **Rollback Authorization**: Any on-call engineer

---

## Overview

This runbook covers scenarios where the Moltbot AI system becomes unavailable, degraded, or produces unsafe outputs requiring immediate intervention.

## Detection Signals

| Signal | Source | Threshold |
|--------|--------|-----------|
| Agent function errors | Supabase Logs | > 10% error rate over 5 min |
| Response latency | KPI Snapshots | p95 > 5000ms |
| UIPlan generation failures | `kpi_snapshots.uiplan_valid_rate` | < 95% |
| Kill switch activation | `kill_switches.is_active` | Any `true` |

## Immediate Actions

### 1. Activate Global Kill Switch (< 2 min)

**Via Admin Dashboard:**
1. Navigate to `/dashboard/ai/rollout`
2. Click "Kill Switches" tab
3. Activate `disable_all_ai`
4. Enter reason: `AI_OUTAGE_[DATE]_[YOUR_INITIALS]`

**Via Supabase (if dashboard unavailable):**
```sql
UPDATE kill_switches 
SET is_active = true, 
    activated_at = NOW(), 
    reason = 'AI_OUTAGE - Manual activation'
WHERE id = 'disable_all_ai';
```

### 2. Verify Fallback Active

Check that AI functions return fallback responses:

```bash
# Test agent-chat endpoint
curl -X POST https://<PROJECT>.supabase.co/functions/v1/agent-chat \
  -H "Authorization: Bearer <ANON_KEY>" \
  -d '{"message": "test", "venueId": "<VENUE_ID>"}' | jq .error
# Expected: "AI_DISABLED"

# Test ui-plan endpoint
curl -X POST https://<PROJECT>.supabase.co/functions/v1/ai-ui-plan \
  -H "Authorization: Bearer <ANON_KEY>" \
  -d '{"guestId": "test"}' | jq .fallback
# Expected: true
```

### 3. Notify Stakeholders

- [ ] Post in `#incidents` Slack channel
- [ ] Update status page (if applicable)
- [ ] Notify venue support if customer-facing impact

## Diagnosis Checklist

| Check | Command / Location |
|-------|-------------------|
| Supabase Edge Function logs | Dashboard → Logs → Edge Functions |
| Recent deployments | `git log --oneline -5` |
| Kill switch state | `SELECT * FROM kill_switches WHERE is_active = true;` |
| Feature flag state | `SELECT * FROM feature_flags;` |
| KPI snapshots | `SELECT * FROM kpi_snapshots ORDER BY snapshot_at DESC LIMIT 10;` |

## Root Cause Categories

### A. External Dependency Failure
- **Symptoms**: Timeout errors, connection refused
- **Check**: Moltbot gateway health, network connectivity
- **Fix**: Wait for recovery, consider circuit breaker

### B. Rate Limit Exceeded
- **Symptoms**: 429 responses, quota errors
- **Check**: API usage dashboard
- **Fix**: Activate `reduce_ai_rate_limits` kill switch, wait for reset

### C. Bad Deployment
- **Symptoms**: Errors started after specific deployment
- **Check**: `git log`, deployment timestamps
- **Fix**: Rollback to previous version

### D. Security Incident
- **Symptoms**: Tenant mismatch, approval bypass in KPIs
- **Check**: `SELECT * FROM kpi_snapshots WHERE tenant_mismatch_count > 0;`
- **Fix**: Keep kill switch active, escalate to security lead

## Recovery Procedure

### 1. Fix Root Cause
Document what was fixed in the incident ticket.

### 2. Gradual Re-Enable

Do NOT re-enable globally. Use progressive rollout:

```sql
-- Step 1: Pick 1 pilot venue
UPDATE rollout_modes SET mode = 'shadow_ui' 
WHERE venue_id = '<PILOT_VENUE>';

-- Step 2: Deactivate kill switch
UPDATE kill_switches 
SET is_active = false, activated_at = NULL, reason = NULL
WHERE id = 'disable_all_ai';
```

### 3. Monitor for 15 min

Check KPIs for pilot venue:
```sql
SELECT * FROM kpi_snapshots 
WHERE venue_id = '<PILOT_VENUE>' 
ORDER BY snapshot_at DESC LIMIT 5;
```

### 4. Expand Rollout

If stable, promote to `assisted` mode, then `full` mode following gate requirements.

## Post-Incident

- [ ] Create post-mortem document
- [ ] Update runbook with learnings
- [ ] Add missing alerts if detection was delayed
- [ ] Review and improve fallback behavior

---

## Contacts

| Role | Contact |
|------|---------|
| On-Call Engineer | PagerDuty rotation |
| Engineering Lead | @engineering-lead |
| Product Owner | @product-owner |
