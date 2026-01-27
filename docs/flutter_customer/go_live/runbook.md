# Flutter Customer App Go-Live Runbook

**Version**: 1.0.0
**Last Updated**: 2026-01-25
**Scope**: Android & iOS Customer App (DineIn)

---

## 🚀 Overview
This runbook serves as the single source of truth for releasing the DineIn Flutter Customer App to production. It covers the end-to-end process from code freeze to post-launch monitoring.

## 📚 Runbook Assets

### 1. Verification & Gates
*   **[Release Gates](./release_gates.md)**: Hard blockers. If any of these fail, we DO NOT launch.
*   **[Staging Checks](./staging_checks.md)**: Verification steps to run on the Staging build before cutting Prod.
*   **[Production Checks](./production_checks.md)**: Verification steps to run immediately after Prod deployment.

### 2. Operations & Reliability
*   **[Monitoring Dashboard](./monitoring.md)**: Key metrics to watch during the first 72 hours.
*   **[Incident Response](./incidents.md)**: Triage guide for common failures (Deep links, Orders, Payment Hand-off).
*   **[Rollback Procedures](./rollback.md)**: Emergency reversal steps for App Store, Play Store, and Backend.

### 3. Support
*   **[Support Playbook](./support_playbook.md)**: Guide for non-technical staff to troubleshoot Customer and Venue reports.

---

## ⏳ Release Timeline

### Phase 1: Preparation (T-1 Week)
- [ ] Code Freeze.
- [ ] Run **[Staging Checks](./staging_checks.md)**.
- [ ] Verify **[Release Gates](./release_gates.md)** (Pass/Fail).
- [ ] Prepare Store Assets (Screenshots, Copy).

### Phase 2: Submission (T-3 Days)
- [ ] Build & Sign Release Candidate (RC).
- [ ] Upload to Google Play Console (Internal Testing -> Open Testing).
- [ ] Upload to App Store Connect (TestFlight).
- [ ] Verify Deep Links on RC builds.

### Phase 3: Go-Live (T-0)
- [ ] Promote Android Open Testing to Production.
- [ ] Release iOS Version manually.
- [ ] Run **[Production Checks](./production_checks.md)** immediately upon availability.
- [ ] Enable Production Edge Function Rate Limits.

### Phase 4: Hypercare (T+72 Hours)
- [ ] Monitor **[Crash Rates](./monitoring.md)**.
- [ ] Monitor **[Order Success](./monitoring.md)**.
- [ ] Watch for "Link broken" reports.

---

## 🛑 Emergency Stop
If **Crime Severity 1 (S1)** issues occur (e.g., massive spam, total order failure, wrong billing info):
1.  **Stop the Rollout** (Pause Phased Release).
2.  **Consult [Rollback Procedures](./rollback.md)**.
3.  **Notify Stakeholders**.
