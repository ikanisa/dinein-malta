# Operational Runbooks

This directory contains runbooks for managing Moltbot AI incidents in the DineIn system.

## Runbook Index

| Runbook | Severity | Description |
|---------|----------|-------------|
| [AI Outage](./ai-outage.md) | Critical | Complete AI system failure or degradation |
| [Double Order Spike](./double-order-spike.md) | High | Duplicate orders or order volume anomalies |
| [Tenant Probe Spike](./tenant-probe-spike.md) | Critical (Security) | Cross-tenant access attempts |
| [Alert Configurations](./alert-configurations.md) | Reference | Alert definitions and monitoring setup |

## Quick Reference

### Emergency Kill Switches

| Switch ID | Effect | When to Use |
|-----------|--------|-------------|
| `disable_all_ai` | Stops all AI processing | AI outage, security incident |
| `disable_waiter` | Stops waiter agent only | Order issues, waiter bugs |
| `disable_ui_plan` | Stops UI personalization | UI rendering issues |
| `reduce_ai_rate_limits` | 50% rate reduction | Rate limit concerns |

### Rollout Mode Ladder

```
off → shadow_ui → assisted → full
      (read-only)  (human confirm)  (autonomous)
```

### Gate Requirements

| Transition | Required KPIs |
|------------|---------------|
| shadow_ui → assisted | tool_error_rate < 2%, zero security violations |
| assisted → full | 7+ days stable, order_success_rate > 98% |

## On-Call Checklist

When paged:

1. [ ] Check kill switch status: `/dashboard/ai/rollout` → Kill Switches tab
2. [ ] Check recent KPIs: `/dashboard/ai/rollout` → Overview tab
3. [ ] Check Supabase logs: Dashboard → Logs → Edge Functions
4. [ ] Identify affected venues
5. [ ] Follow appropriate runbook

## Contact Escalation

| Time | Action |
|------|--------|
| 0-5 min | On-call assesses + takes immediate action |
| 5-15 min | Notify engineering lead if critical |
| 15+ min | Escalate to CTO if unresolved critical |
| Security | Always notify security lead |
