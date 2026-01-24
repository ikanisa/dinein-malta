# DineIn Architecture

This document describes the system architecture of the DineIn monorepo.

---

## System Overview

```mermaid
graph TB
    subgraph "Cloudflare Pages"
        Customer["Customer PWA<br/>apps/customer"]
        Venue["Venue Portal<br/>apps/venue"]
        Admin["Admin Portal<br/>apps/admin"]
    end

    subgraph "Shared Packages"
        Core["@dinein/core<br/>Types, Constants"]
        DB["@dinein/db<br/>Query Helpers"]
        UI["@dinein/ui<br/>Components"]
    end

    subgraph "Supabase"
        Postgres[(PostgreSQL<br/>+ RLS)]
        Auth[Auth Service]
        Edge[Edge Functions]
        Realtime[Realtime]
    end

    Customer --> Core
    Customer --> DB
    Customer --> UI
    Venue --> Core
    Venue --> DB
    Venue --> UI
    Admin --> Core
    Admin --> DB
    Admin --> UI

    DB --> Postgres
    DB --> Auth
    DB --> Edge
    Customer --> Realtime
    Venue --> Realtime
```

---

## Monorepo Structure

```mermaid
graph LR
    subgraph "apps/"
        A1[customer] --> P1
        A2[venue] --> P1
        A3[admin] --> P1
    end

    subgraph "packages/"
        P1[core]
        P2[db]
        P3[ui]
        P4[commons]
    end

    P3 --> P1
    P2 --> P1
```

### Package Responsibilities

| Package | Purpose | Exports |
|---------|---------|---------|
| `@dinein/core` | Domain types, constants, utils | `OrderStatus`, `PaymentMethod`, `Country`, formatters |
| `@dinein/db` | Supabase query helpers | `getVenueBySlug`, `getMenuItems`, `placeOrder` |
| `@dinein/ui` | React component library | `Button`, `Card`, `Badge`, `BottomSheet` |
| `@dinein/commons` | Shared utilities | Common helpers |

---

## Application Architecture

### Customer App (apps/customer)

```mermaid
flowchart LR
    QR[QR Code Scan] --> Entry["/v/{slug}"]
    Entry --> Menu[Menu Screen]
    Menu --> Cart[Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Order[Order Status]

    subgraph "Navigation"
        Home[Home Tab]
        Settings[Settings Tab]
    end
```

**Key Features:**
- QR deep link entry (`/v/{venueSlug}`)
- Menu browsing with categories
- Cart management (Zustand)
- Order placement
- Order status tracking (Realtime)

### Venue Portal (apps/venue)

```mermaid
flowchart LR
    Login[Login] --> Dashboard
    Claim[Claim Venue] --> Dashboard

    subgraph Dashboard
        Orders[Order Management]
        MenuMgmt[Menu Management]
        VenueSettings[Venue Settings]
    end
```

**Key Features:**
- Venue owner authentication
- Venue claim flow
- Order status updates (Placed → Received → Served)
- Menu CRUD operations
- Real-time order notifications

### Admin Portal (apps/admin)

```mermaid
flowchart LR
    Login[Login] --> Dashboard

    subgraph Dashboard
        Claims[Venue Claims]
        Venues[Venue List]
        Users[User Management]
        Audit[Audit Logs]
    end
```

**Key Features:**
- Admin-only authentication
- Approve/reject venue claims
- View all venues
- User management
- System audit logs

---

## Data Flow

### Customer Order Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant App as Customer PWA
    participant SB as Supabase
    participant V as Venue Portal

    C->>App: Scan QR / Open /v/{slug}
    App->>SB: getVenueBySlug()
    SB-->>App: Venue + Menu
    C->>App: Add items to cart
    C->>App: Place order
    App->>SB: INSERT orders + order_items
    SB-->>App: Order confirmation
    SB->>V: Realtime: new order
    V->>SB: UPDATE order status
    SB->>App: Realtime: status update
    App-->>C: Order ready!
```

### Order Status Flow

```mermaid
stateDiagram-v2
    [*] --> Placed: Customer places order
    Placed --> Received: Venue acknowledges
    Received --> Served: Venue serves order
    Served --> [*]
    
    Placed --> Cancelled: Customer/Venue cancels
    Received --> Cancelled: Venue cancels
    Cancelled --> [*]
```

**Allowed Statuses:** `Placed` | `Received` | `Served` | `Cancelled`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, Radix UI, Framer Motion |
| **State** | Zustand (cart), React Context (auth) |
| **Backend** | Supabase (Postgres, Auth, Edge Functions) |
| **Realtime** | Supabase Realtime |
| **Deployment** | Cloudflare Pages |
| **PWA** | vite-plugin-pwa, Workbox |
| **Testing** | Playwright (E2E), Vitest (unit) |

---

## Database Schema

```mermaid
erDiagram
    vendors {
        uuid id PK
        string name
        string slug UK
        string country
        boolean claimed
        timestamp created_at
    }

    menu_categories {
        uuid id PK
        uuid vendor_id FK
        string name
        int sort_order
    }

    menu_items {
        uuid id PK
        uuid category_id FK
        string name
        int price
        boolean available
    }

    orders {
        uuid id PK
        uuid vendor_id FK
        string status
        string payment_method
        int total
        timestamp created_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid item_id FK
        int quantity
        int price
    }

    profiles {
        uuid id PK
        string email
        string role
    }

    vendors ||--o{ menu_categories : has
    menu_categories ||--o{ menu_items : contains
    vendors ||--o{ orders : receives
    orders ||--o{ order_items : contains
    menu_items ||--o{ order_items : referenced
```

---

## Security Model

### Row Level Security (RLS)

| Table | Public Read | Auth Write | Admin Only |
|-------|-------------|------------|------------|
| `vendors` | ✅ (active) | Owner only | ✅ |
| `menu_categories` | ✅ | Owner only | ✅ |
| `menu_items` | ✅ (available) | Owner only | ✅ |
| `orders` | Own only | Own only | ✅ |
| `profiles` | ❌ | Own only | ✅ |
| `audit_logs` | ❌ | ❌ | ✅ |

### RBAC Enforcement

```
┌─────────────────────────────────────────────────┐
│                    UI Layer                     │
│  Route guards, conditional rendering            │
├─────────────────────────────────────────────────┤
│                 Context Layer                   │
│  useOwner, useAdmin hooks                       │
├─────────────────────────────────────────────────┤
│                   API Layer                     │
│  Edge Functions with auth checks                │
├─────────────────────────────────────────────────┤
│                  Database Layer                 │
│  RLS policies on every table                    │
└─────────────────────────────────────────────────┘
```

---

## Country Mode

| Country | Currency | Payment Method | Handoff Type |
|---------|----------|----------------|--------------|
| **Rwanda (RW)** | RWF | MoMo | USSD code (no API) |
| **Malta (MT)** | EUR | Revolut | External link (no API) |

**How it works:**
1. Customer scans QR → opens `/v/{venueSlug}`
2. App loads venue → reads `venue.country`
3. Sets `activeCountry` in app state
4. Checkout shows appropriate payment option
5. Payment is a handoff (opens external app/link)

> [!IMPORTANT]
> DineIn does NOT integrate with payment APIs. Payments are handled externally.
