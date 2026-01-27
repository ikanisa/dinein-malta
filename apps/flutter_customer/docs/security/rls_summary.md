# RLS Tightening Strategy

**Principle**: "No Direct Write" for Customers.

The Customer App operates anonymously. Direct `INSERT` grants on public tables are too risky. We move to a "Service Gateway" model.

## 1. Table Policies

### `orders` Table
*   **Direct Client INSERT**: `REVOKE` (Was: *Permissive/Anon*).
*   **Direct Client UPDATE**: `REVOKE`.
*   **Direct Client SELECT**:
    *   Policy: `auth.uid() = user_id` (If using fake anon auth) OR `session_id = current_setting('app.current_session')`.
    *   *Better*: Only allow reading specific Order ID if you possess the UUID returned at creation.

### `service_requests` Table
*   **Direct Client INSERT**: `REVOKE`.
*   **Edge Function Access**: `GRANT ALL` to `service_role`.

## 2. Transition Plan
1.  **Deploy Edge Functions**: `order_create` and `ring_bell`.
2.  **Update Client**: Switch Flutter app to call `Supabase.functions.invoke(...)` instead of `supabase.from(...).insert(...)`.
    *   Order creation: `order_create`
    *   Order status read: `order_status` (by order UUID)
3.  **Lockdown**: Run migration to revoke insert permissions from `anon` / `authenticated` roles on these tables.

## 3. Benefits
*   **Validation**: Edge function enforces business logic (price check, venue status) *before* DB touch.
*   **Rate Limiting**: Applied at Edge, saving DB connections.
*   **Audit**: Every write is logged in Edge logs.
