# 05_screen_factory_prompt.md - Screen Factory

A deterministic way to generate any missing screen without inventing new scope.

## Input Fields
- **App**: `customer` | `venue` | `admin`
- **Screen Name**:
- **Route**:
- **Purpose**:
- **Primary CTA**:
- **Components**: (from `@dinein/ui`)
- **Data**: (Entities/Fields)

## Output Contract
You must produce a design spec (NOT code yet) containing:

1.  **Screen Summary**: 1 paragraph.
2.  **Component Tree**: Indented list of components.
3.  **State Machine**: Valid states: `idle`, `loading`, `error`, `success`, `empty`.
4.  **Data Contract**: exact fields needed.
5.  **Tap Count Impact**: Statement verifying it fits the budget.

## Rules
- Use only `@dinein/ui` components.
- Do NOT add new routes without strict need.
- Do NOT add external dependencies.
