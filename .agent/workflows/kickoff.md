---
description: Kick off any task in our AI-first Staff/Admin monorepo PWAs with a plan, task list, and verification gates
---

# Kickoff Workflow

Use this workflow to start any non-trivial task in the DineIn monorepo. Ensures proper planning, task breakdown, and verification.

## Prerequisites

- Understand the current project state (README, docs, recent changes)
- Check git status for uncommitted changes
- Review production-readiness.md for priority areas

## Steps

### 1. Gather Context

// turbo
```bash
cd /Users/jeanbosco/workspace/dinein && git status --short | head -20
```

Review:
- Recent conversation history for context
- Open files in editor for hints
- User's explicit request (if any)

### 2. Clarify Scope

If user hasn't specified a task, ask:
1. What feature/fix/improvement do you want to work on?
2. What's the priority level (P0 critical, P1 high, P2 medium, P3 low)?
3. Are there any constraints (time, scope, dependencies)?

### 3. Create Implementation Plan

Create `implementation_plan.md` in artifacts directory with:
- Goal description + background
- User review items (breaking changes, major decisions)
- Proposed changes grouped by component
- Verification plan (automated + manual)

### 4. Create Task List

Create `task.md` in artifacts directory:
- Break work into small, verifiable steps
- Use `[ ]` uncompleted, `[/]` in progress, `[x]` completed
- Group by phase (Planning → Execution → Verification)

### 5. Request User Approval

Use `notify_user` with:
- PathsToReview: [implementation_plan.md]
- BlockedOnUser: true (if plan needs approval)
- Brief summary of the approach

### 6. Execute with Task Boundaries

After approval:
- Call `task_boundary` with EXECUTION mode
- Update task.md as you complete items
- Keep implementation_plan.md current if scope changes

### 7. Verify and Document

- Run all verification steps from the plan
- Create `walkthrough.md` with:
  - Changes made
  - What was tested
  - Validation results
  - Screenshots/recordings for UI changes

## Common Task Types

| Task Type | Planning Depth | Verification |
|-----------|---------------|--------------|
| Bug fix | Minimal (reproduce → fix) | Regression test |
| New feature | Full plan + design | E2E + unit tests |
| Refactor | Impact analysis | Before/after behavior |
| Performance | Metrics baseline | Before/after benchmarks |
| Security | Threat model | Penetration testing |
| Deployment | Checklist + rollback | Smoke tests |

## Exit Criteria

✅ Implementation plan approved
✅ All task items completed
✅ Verification passed
✅ Walkthrough documented
✅ Git commit ready (or pushed)
