# 03_refactor_prompt.md - Refactor Protocol

Use this prompt when restructuring code without changing behavior.

## 1) Goal
- **Objective**: Reduce technical debt, improve performance, or organize code.
- **Measurement**: Lines of code removed? Bundle size reduced? Readability?

## 2) Constraints
- **No Behavior Change**: The user experience must remain identical.
- **Atomic Commits**: Small, safe changes.

## 3) Plan
- **Strategy**: Move X to Y, Rename A to B.
- **Safety**: How to ensure no breakage? (Tests, Types)

## 4) Task List
- [ ] Snapshot current behavior
- [ ] Execute refactor
- [ ] Verify parity
