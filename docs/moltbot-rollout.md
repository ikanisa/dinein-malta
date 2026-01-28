# Moltbot Phased Rollout Playbook (WF-11)

This document describes the phased rollout strategy for Moltbot agent capabilities.

---

## Rollout Phases

### Phase 1: Shadow Mode (Week 1)

**Goal**: Validate agent behavior without user impact.

| Setting | Value |
|---------|-------|
| Traffic | 0% (logging only) |
| Actions | Logged but not executed |
| Alerts | Enabled for anomalies |

**Tasks**:
1. Deploy agent-chat with `SHADOW_MODE=true`
2. Process requests in parallel with existing system
3. Compare agent responses vs. current behavior
4. Monitor token usage and latency
5. Review audit logs for unexpected patterns

**Exit Criteria**:
- [ ] Zero critical errors in 48h
- [ ] P95 latency < 2s
- [ ] No security policy violations
- [ ] Cost projections acceptable

---

### Phase 2: Canary (Week 2)

**Goal**: Test with small real traffic.

| Setting | Value |
|---------|-------|
| Traffic | 1-5% of requests |
| Selection | Random user sampling |
| Rollback | Automatic on error threshold |

**Tasks**:
1. Enable canary routing (1% → 2% → 5%)
2. A/B test: canary users vs. control
3. Monitor key metrics:
   - Order completion rate
   - Cart abandonment
   - Staff response time
   - User satisfaction signals
4. Collect user feedback (implicit signals only)

**Exit Criteria**:
- [ ] No degradation vs. control group
- [ ] Error rate < 1%
- [ ] User engagement metrics stable
- [ ] Support ticket volume unchanged

---

### Phase 3: Progressive Rollout (Weeks 3-4)

**Goal**: Scale to full traffic with safety gates.

| Day | Traffic | Gate |
|-----|---------|------|
| 1-2 | 10% | Manual approval |
| 3-5 | 25% | Error rate < 2% |
| 6-8 | 50% | P50 latency stable |
| 9-10 | 75% | No rollback in 48h |
| 11+ | 100% | Full production |

**Tasks**:
1. Increase traffic incrementally
2. Hold at each tier for minimum 24h
3. Monitor LLM cost projections
4. Watch for edge cases and unusual patterns
5. Document any adjustments to prompts or tools

**Exit Criteria**:
- [ ] 100% traffic stable for 72h
- [ ] Error rate < 0.5%
- [ ] Cost within budget
- [ ] No critical issues

---

## Rollback Triggers

Immediate rollback if ANY of the following occur:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Error rate | > 5% for 5min | Auto-rollback to 0% |
| P95 latency | > 5s for 10min | Reduce traffic 50% |
| Security violation | Any | Immediate full rollback |
| Cost spike | > 3x projected | Pause and investigate |
| User complaints | > 10 in 1h | Manual review |

### Rollback Procedure

1. Set `MOLTBOT_ENABLED=false` in environment
2. Clear rate limiter state
3. Notify on-call team
4. Preserve logs for investigation
5. Document incident timeline

---

## Feature Flags

```env
# Master switch
MOLTBOT_ENABLED=true

# Shadow mode (log only, don't execute)
MOLTBOT_SHADOW_MODE=false

# Traffic percentage (0-100)
MOLTBOT_TRAFFIC_PERCENT=100

# Agent type enablement
MOLTBOT_GUEST_ENABLED=true
MOLTBOT_BAR_MANAGER_ENABLED=true
MOLTBOT_ADMIN_ENABLED=true
MOLTBOT_UI_ORCHESTRATOR_ENABLED=true
MOLTBOT_RESEARCH_ENABLED=false  # Starts disabled

# Safety limits
MOLTBOT_MAX_TOKENS_PER_REQUEST=4000
MOLTBOT_MAX_TOOL_CALLS_PER_REQUEST=10
MOLTBOT_RATE_LIMIT_PER_MINUTE=30
```

---

## Success Metrics (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Availability | 99.5% | agent-chat uptime |
| Latency P50 | < 1s | Request duration |
| Latency P95 | < 3s | Request duration |
| Error rate | < 1% | 4xx + 5xx responses |
| Policy violations | 0 | Forbidden tool calls |
| Cost per 1k requests | < $X | Token usage |

---

## Monitoring Checklist

- [ ] AI Analytics dashboard accessible
- [ ] AI Monitoring real-time stream working
- [ ] Audit export function deployed
- [ ] Alerts configured for thresholds
- [ ] On-call runbook updated
- [ ] Cost alerts in billing

---

## Post-Rollout

After successful 100% rollout:

1. Remove shadow mode code paths
2. Update documentation
3. Train support team
4. Conduct retrospective
5. Plan next agent enhancements
