# Double Order Spike Runbook

> **Severity**: High  
> **On-Call Response Time**: < 15 minutes  
> **Rollback Authorization**: On-call engineer + venue manager confirmation

---

## Overview

This runbook covers scenarios where the AI waiter agent creates duplicate orders or there's an unusual spike in order volume that may indicate AI malfunction.

## Detection Signals

| Signal | Source | Threshold |
|--------|--------|-----------|
| Duplicate order IDs | `orders` table | Same guest + venue + items within 60s |
| Order volume spike | Monitoring | > 3x normal hourly rate per venue |
| Guest complaints | Support tickets | Multiple "charged twice" reports |
| Agent action anomalies | `agent_actions` | > 5 `order.submit` calls per session |

## Alert Query

```sql
-- Check for duplicate orders in last hour
SELECT 
    venue_id,
    user_id,
    COUNT(*) as order_count,
    array_agg(id) as order_ids
FROM orders
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY venue_id, user_id, 
         DATE_TRUNC('minute', created_at)
HAVING COUNT(*) > 1;
```

## Immediate Actions

### 1. Assess Scope (< 5 min)

```sql
-- Count affected venues
SELECT 
    venue_id,
    COUNT(*) as duplicate_orders,
    SUM(total_amount) as affected_revenue
FROM (
    SELECT venue_id, user_id, total_amount,
           ROW_NUMBER() OVER (
               PARTITION BY venue_id, user_id, 
               DATE_TRUNC('minute', created_at)
               ORDER BY created_at
           ) as rn
    FROM orders
    WHERE created_at > NOW() - INTERVAL '1 hour'
) sub
WHERE rn > 1
GROUP BY venue_id;
```

### 2. Disable AI Ordering (if widespread)

**Option A: Kill switch (all AI)**
```sql
UPDATE kill_switches 
SET is_active = true, 
    activated_at = NOW(), 
    reason = 'Double order spike - investigation'
WHERE id = 'disable_waiter';
```

**Option B: Per-venue rollback (if localized)**
```sql
UPDATE rollout_modes 
SET mode = 'shadow_ui', updated_at = NOW()
WHERE venue_id IN ('<affected_venue_ids>');
```

### 3. Notify Affected Venues

- [ ] Identify affected venue owners
- [ ] Send notification: "We've detected a potential duplicate order issue. Please verify recent orders."
- [ ] Provide list of potentially duplicate order IDs

## Investigation Checklist

### Check Agent Session Logs

```sql
-- Find sessions with multiple order.submit actions
SELECT 
    session_key,
    venue_id,
    COUNT(*) FILTER (WHERE action_type = 'order.submit') as submit_count,
    array_agg(action_type ORDER BY created_at) as action_sequence
FROM agent_actions
WHERE created_at > NOW() - INTERVAL '2 hours'
GROUP BY session_key, venue_id
HAVING COUNT(*) FILTER (WHERE action_type = 'order.submit') > 1;
```

### Check for Tool Errors

```sql
-- Look for order-related errors
SELECT 
    created_at,
    session_key,
    action_type,
    success,
    error_message
FROM agent_actions
WHERE action_type LIKE 'order%'
  AND created_at > NOW() - INTERVAL '2 hours'
  AND success = false
ORDER BY created_at DESC;
```

### Possible Root Causes

| Cause | Indicators | Fix |
|-------|------------|-----|
| **Retry storm** | Multiple `order.submit` in same session with short intervals | Add idempotency key enforcement |
| **UI double-tap** | Client-side duplicate requests | Add debouncing in UI |
| **Confirmation loop** | Agent kept trying after success | Review agent prompt/logic |
| **Timeout handling** | Order succeeded but returned error | Improve timeout handling |

## Remediation

### Mark Duplicate Orders

```sql
-- Mark duplicates for review (don't delete)
UPDATE orders
SET status = 'flagged_duplicate',
    metadata = metadata || '{"flagged_reason": "double_order_spike", "flagged_at": "<TIMESTAMP>"}'::jsonb
WHERE id IN (<duplicate_order_ids>);
```

### Refund Process

1. Export affected orders with customer contact info
2. Venue manager reviews and confirms duplicates
3. Process refunds through venue's payment system (external)
4. Update order status to `refunded`

```sql
UPDATE orders
SET status = 'refunded',
    metadata = metadata || '{"refund_reason": "duplicate_order", "refunded_at": "<TIMESTAMP>"}'::jsonb
WHERE id = '<order_id>';
```

## Recovery Procedure

### 1. Deploy Fix

If code change required, deploy fix to staging first and test.

### 2. Gradual Re-Enable

```sql
-- Re-enable for one venue
UPDATE rollout_modes 
SET mode = 'assisted', updated_at = NOW()
WHERE venue_id = '<pilot_venue>';

-- Monitor for 30 minutes
SELECT * FROM orders 
WHERE venue_id = '<pilot_venue>' 
  AND created_at > NOW() - INTERVAL '30 minutes';
```

### 3. Full Rollback Recovery

If issue is resolved:
```sql
-- Deactivate kill switch
UPDATE kill_switches 
SET is_active = false, activated_at = NULL, reason = NULL
WHERE id = 'disable_waiter';

-- Restore venue modes
UPDATE rollout_modes 
SET mode = <previous_mode>, updated_at = NOW()
WHERE venue_id IN ('<affected_venues>');
```

## Prevention Measures

- [ ] Add idempotency keys to order.submit tool
- [ ] Add rate limiting per session (max 2 orders/minute)
- [ ] Add confirmation dialog before submitting order
- [ ] Improve client-side debouncing

## Post-Incident

- [ ] Calculate total duplicate orders and affected revenue
- [ ] Document root cause
- [ ] Complete refunds within 48 hours
- [ ] Notify affected customers of resolution
- [ ] Update monitoring/alerts

---

## Contacts

| Role | Contact |
|------|---------|
| On-Call Engineer | PagerDuty rotation |
| Venue Support | @venue-support |
| Finance (refunds) | @finance-team |
