# 01_feature_prompt.md - Feature Implementation

Use this prompt when implementing a new feature.

## 1) Scope Lock
- **Feature Name**: [Name]
- **Exclusions**: No invalid scope (delivery, maps, payments).
- **Constraints**: 4-tap budget? Strict PWA states?

## 2) Feature Plan
- **UI Spec**: Define screens and states (Loading, Empty, Error, Success).
- **Files**: List new and modified files.
- **Dependencies**: Use existing packages/ui and packages/core.
- **Rollback**: How to revert if it fails?

## 3) Task List
- [ ] Implement UI (Mock data)
- [ ] Implement Logic/State
- [ ] Integrate with DB (if applicable)
- [ ] Verify States (Loading/Error)
- [ ] Verify Tap Budget

## 4) Verification
- **Screenshots**: Required for UI changes.
- **Tap Count Audit**: Proof it takes <= 4 taps.
