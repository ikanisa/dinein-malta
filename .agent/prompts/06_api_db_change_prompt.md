# 06_api_db_change_prompt.md - Data Layer Protocol

Use this prompt when modifying Supabase schema or Edge Functions.

## 1) Safety First
- **Backwards Compatibility**: Can existing apps still run?
- **RLS**: Row Level Security MUST be defined for every new table.

## 2) Plan
- **Schema Changes**: DDL statements.
- **Policies**: RLS Policy definitions.
- **Migration**: Step-by-step apply.
- **Seed Data**: How to populate it?

## 3) Task List
- [ ] Write Migration (SQL)
- [ ] Apply Migration
- [ ] Update Types (`packages/db`)
- [ ] Verify RLS (Negative Test)
