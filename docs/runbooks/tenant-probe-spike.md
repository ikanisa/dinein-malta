# Tenant Probe Spike Runbook

> **Severity**: Critical (Security)  
> **On-Call Response Time**: < 5 minutes  
> **Escalation**: Mandatory security team involvement

---

## Overview

This runbook covers scenarios where the AI agent attempts to access data across tenant boundaries, indicating either a security vulnerability, prompt injection attack, or configuration error.

## Detection Signals

| Signal | Source | Threshold |
|--------|--------|-----------|
| Tenant mismatch count | `kpi_snapshots.tenant_mismatch_count` | > 0 |
| Cross-venue queries | Agent action logs | Different venue_id in request vs session |
| Approval bypass attempts | `kpi_snapshots.approval_bypass_attempts` | > 0 |
| Suspicious tool calls | `agent_actions` | Tools called for non-owned venues |

## Alert Query

```sql
-- Immediate: Any tenant mismatches
SELECT 
    venue_id,
    snapshot_at,
    tenant_mismatch_count,
    approval_bypass_attempts
FROM kpi_snapshots
WHERE tenant_mismatch_count > 0 
   OR approval_bypass_attempts > 0
ORDER BY snapshot_at DESC
LIMIT 20;
```

## Severity Classification

| Level | Indicators | Response |
|-------|------------|----------|
| **SEV-1** | Successful cross-tenant data access | Immediate shutdown + incident |
| **SEV-2** | Attempted access, blocked by RLS | Kill switch + investigation |
| **SEV-3** | Single occurrence, likely prompt glitch | Log + monitor |

## Immediate Actions

### 1. Activate Kill Switch (< 1 min)

**This is mandatory for any SEV-1 or SEV-2:**

```sql
UPDATE kill_switches 
SET is_active = true, 
    activated_at = NOW(), 
    reason = 'SECURITY: Tenant probe detected - [INCIDENT_ID]'
WHERE id = 'disable_all_ai';
```

### 2. Preserve Evidence (< 5 min)

**Do NOT delete or modify any data. Create snapshots:**

```sql
-- Snapshot suspicious agent actions
CREATE TABLE IF NOT EXISTS incident_evidence_<INCIDENT_ID> AS
SELECT * FROM agent_actions
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Snapshot affected sessions
CREATE TABLE IF NOT EXISTS incident_sessions_<INCIDENT_ID> AS
SELECT * FROM channel_sessions
WHERE updated_at > NOW() - INTERVAL '24 hours';
```

### 3. Identify Attack Vector

```sql
-- Find sessions with cross-tenant access attempts
SELECT 
    a.session_key,
    a.action_type,
    a.tool_name,
    a.venue_id as action_venue,
    s.venue_id as session_venue,
    a.input_hash,
    a.created_at
FROM agent_actions a
LEFT JOIN channel_sessions s ON a.session_key = s.session_key
WHERE a.venue_id != s.venue_id
   OR a.venue_id IS NULL
ORDER BY a.created_at DESC;
```

### 4. Notify Security Team

- [ ] Create security incident ticket
- [ ] Page security on-call
- [ ] Do NOT discuss details in public channels

## Investigation Checklist

### A. Prompt Injection Check

Look for suspicious patterns in user messages:

```sql
-- Find sessions with potential injection patterns
SELECT 
    session_key,
    message_content,
    created_at
FROM agent_messages
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND (
    message_content ILIKE '%ignore previous%'
    OR message_content ILIKE '%forget your instructions%'
    OR message_content ILIKE '%you are now%'
    OR message_content ILIKE '%system prompt%'
    OR message_content ILIKE '%<script%'
    OR message_content ILIKE '%${%'
  );
```

### B. Tool Misconfiguration Check

Verify tenant isolation in tool implementations:

| Tool | Isolation Check |
|------|-----------------|
| `menu.get` | Uses `venue_id` from session context? |
| `orders.list` | Filters by session's venue? |
| `cart.add` | Validates item belongs to session venue? |

### C. RLS Policy Verification

```sql
-- Verify RLS is enabled on sensitive tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables
WHERE tablename IN ('orders', 'menu_items', 'venues', 'users')
  AND schemaname = 'public';
```

### D. Session Integrity Check

```sql
-- Check for session tampering
SELECT 
    session_key,
    venue_id,
    user_id,
    created_at,
    updated_at
FROM channel_sessions
WHERE venue_id IS NULL
   OR user_id IS NULL
   OR created_at > updated_at;
```

## Remediation

### Block Malicious Sessions

```sql
-- Block identified malicious sessions
INSERT INTO blocked_sessions (session_key, reason, blocked_at, blocked_by)
VALUES 
    ('<session_key>', 'SECURITY: Cross-tenant probe', NOW(), 'incident_response');
```

### Patch Vulnerability

If code fix required:
1. Create hotfix branch
2. Implement fix with security review
3. Deploy to staging and verify
4. Deploy to production

### Add Detection Rules

If new attack pattern discovered, add to detection rules:

```typescript
// In security/detection_rules.ts
export const INJECTION_PATTERNS = [
    // ... existing patterns
    /new_pattern_discovered/i,
];
```

## Recovery Procedure

### 1. Security Sign-Off

**Do NOT re-enable until security team confirms:**
- [ ] Root cause identified
- [ ] Vulnerability patched
- [ ] No data breach occurred
- [ ] Additional monitoring in place

### 2. Gradual Re-Enable

```sql
-- Start with single trusted venue
UPDATE rollout_modes 
SET mode = 'shadow_ui', updated_at = NOW()
WHERE venue_id = '<trusted_venue>';

UPDATE kill_switches 
SET is_active = false
WHERE id = 'disable_all_ai';
```

### 3. Enhanced Monitoring Period

For 48 hours after recovery:
- Run tenant probe detection query every 15 min
- Alert on any new occurrences
- Keep security team notified

## Post-Incident Requirements

### Mandatory Actions

- [ ] Complete security incident report
- [ ] Determine if data breach occurred
- [ ] If breach: Follow data breach notification procedure
- [ ] Update threat model
- [ ] Add regression tests for attack vector
- [ ] Review and update RLS policies

### Optional Improvements

- [ ] Add real-time tenant mismatch alerting
- [ ] Implement WAF rules for known injection patterns
- [ ] Add anomaly detection for cross-venue access patterns

---

## Escalation Matrix

| Condition | Escalation |
|-----------|------------|
| Any tenant mismatch | On-call + Security Lead |
| Confirmed data access | + CTO + Legal |
| Customer data exposed | + DPO + Executive team |

## Contacts

| Role | Contact | When |
|------|---------|------|
| On-Call Engineer | PagerDuty | First responder |
| Security Lead | @security-lead | All tenant probes |
| CTO | @cto | Confirmed breaches |
| Legal/DPO | @legal | Data exposure |
