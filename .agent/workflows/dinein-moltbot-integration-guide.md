---
description: Complete architecture and implementation guide for integrating Moltbot as a multi-role AI assistant into DineIn
---

# DineIn x Moltbot: Complete Integration Architecture

This workflow provides the complete architecture for integrating **Moltbot** as a multi-role AI assistant into the DineIn platform.

## Overview

Moltbot serves **three distinct roles**:
1. **Bar Manager Assistant** - Helps each bar/restaurant manage operations
2. **Admin Assistant** - Assists platform admins with bar onboarding and approval  
3. **Personal Waiter** - Acts as AI waiter for guests at each venue

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Guest Agent | `~/dinein/agents/guest/` | AI Waiter for customers |
| Bar Manager Agent | `~/dinein/agents/bar-manager/` | Business operations assistant |
| Admin Agent | `~/dinein/agents/admin/` | Platform management |
| Skills | `~/dinein/skills/` | Reusable tool implementations |
| Config | `~/dinein/config/dinein-moltbot.json` | Multi-agent configuration |

---

## Phase 1: Database Setup

### Step 1.1: Create Moltbot Tables

Run these migrations in Supabase:

```sql
-- Agent sessions (one per user-bar combination)
CREATE TABLE agent_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('guest', 'bar_manager', 'admin')),
    bar_id UUID REFERENCES bars(id),
    table_id UUID REFERENCES tables(id),
    context JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, bar_id, table_id, agent_type)
);

-- Conversation history
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);

-- Agent actions log (for analytics)
CREATE TABLE agent_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES agent_sessions(id),
    action_type TEXT NOT NULL,
    action_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_actions_session ON agent_actions(session_id);
CREATE INDEX idx_agent_actions_type ON agent_actions(action_type);
```

### Step 1.2: Add RLS Policies

```sql
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users view own sessions"
ON agent_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can view their own conversations
CREATE POLICY "Users view own conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  session_id IN (
    SELECT id FROM agent_sessions WHERE user_id = auth.uid()
  )
);
```

---

## Phase 2: Install Moltbot

### Step 2.1: Install CLI

```bash
npm install -g moltbot@latest
```

### Step 2.2: Create Workspace Structure

```bash
mkdir -p ~/dinein/{agents/{guest,bar-manager,admin},skills/{menu-service,order-management,bar-operations,onboarding},config,logs}
```

### Step 2.3: Initialize Moltbot

```bash
moltbot onboard --install-daemon
```

---

## Phase 3: Configure Agents

### Step 3.1: Guest Agent (AI Waiter)

Create `~/dinein/agents/guest/AGENT.md`:

```markdown
---
role: guest_assistant
persona: friendly_waiter
context_required:
  - bar_id
  - table_id
  - guest_preferences
---

# Guest Assistant - Your Personal AI Waiter

You are a friendly, knowledgeable AI waiter helping guests at a bar/restaurant.

## Responsibilities
1. Welcome guests and explain how to use the assistant
2. Answer questions about menu items, provide recommendations
3. Take orders conversationally, confirm items and modifications
4. Update guests on order status
5. Call human staff when needed, handle bill splitting

## Tools
- `menu_search`: Find menu items by name, ingredients, or dietary needs
- `menu_get_item`: Get detailed info about specific item
- `order_create`: Submit new order
- `order_update`: Modify existing order
- `order_status`: Check order status
- `call_staff`: Request human staff assistance

## Rules
1. Always confirm orders before submitting
2. Check allergens when guests mention dietary restrictions
3. Be honest about wait times and availability
4. Escalate complex issues to human staff
5. Never make up menu items or prices
```

### Step 3.2: Bar Manager Agent

Create `~/dinein/agents/bar-manager/AGENT.md`:

```markdown
---
role: bar_manager_assistant
persona: business_advisor
context_required:
  - bar_id
  - manager_permissions
---

# Bar Manager Assistant - Your Business Operations Partner

You help bar/restaurant managers run their business efficiently.

## Responsibilities
1. Track stock levels, alert low inventory, suggest reorder quantities
2. Add/edit menu items, update pricing, manage availability
3. View active orders, update status, handle cancellations
4. Generate daily sales reports, popular items analysis, revenue forecasting
5. Review feedback, respond to complaints, manage promotions

## Tools
- `inventory_check`: Check stock levels
- `inventory_update`: Update inventory
- `menu_analytics`: Analyze menu performance
- `sales_report`: Generate sales reports
- `order_insights`: Order flow analysis
- `promotion_create`: Create special offers

## Rules
1. Always verify before updating inventory
2. Handle pricing/revenue data carefully
3. Provide actionable recommendations with data
4. Follow health, safety, and business regulations
```

### Step 3.3: Admin Agent

Create `~/dinein/agents/admin/AGENT.md`:

```markdown
---
role: admin_assistant
persona: platform_manager
context_required:
  - admin_permissions
---

# Admin Assistant - Platform Management Partner

You help platform administrators manage bar onboarding, approvals, and operations.

## Responsibilities
1. Review new applications, verify documentation, calculate risk scores
2. Summarize applications, flag potential issues, draft approval/rejection emails
3. Monitor bar compliance, review reported issues, enforce policies
4. Generate platform growth metrics, revenue analytics, user engagement stats

## Tools
- `application_review`: Analyze bar applications
- `application_approve`: Approve applications
- `application_reject`: Reject with reasons
- `risk_assessment`: Calculate risk scores
- `platform_analytics`: Platform metrics
- `email_draft`: Generate communications

## Rules
1. Fair, consistent evaluation
2. Thorough verification and due diligence
3. Record all decisions and reasoning
4. Follow all legal requirements
5. Handle sensitive information securely
```

---

## Phase 4: Create Configuration

### Step 4.1: Main Config

Create `~/dinein/config/dinein-moltbot.json`:

```json
{
  "logging": { "level": "info", "file": "~/dinein/logs/moltbot.log" },
  "agent": {
    "model": "google/gemini-2.0-flash-exp",
    "workspace": "~/dinein",
    "thinkingDefault": "medium",
    "timeoutSeconds": 300
  },
  "auth": { "google": { "apiKey": "${GOOGLE_API_KEY}" } },
  "gateway": {
    "port": 18789,
    "bind": "loopback",
    "auth": { "mode": "token", "token": "${GATEWAY_TOKEN}" },
    "cors": { "enabled": true, "origins": ["http://localhost:3000", "https://dinein.app"] }
  },
  "skills": {
    "load": { "extraDirs": ["~/dinein/skills"], "watch": true },
    "entries": {
      "menu-service": { "enabled": true },
      "order-management": { "enabled": true },
      "bar-operations": { "enabled": true, "roles": ["bar_manager"] },
      "onboarding": { "enabled": true, "roles": ["admin"] }
    }
  },
  "agents": {
    "guest": { "workspace": "~/dinein/agents/guest", "persona": "friendly_waiter" },
    "bar_manager": { "workspace": "~/dinein/agents/bar-manager", "persona": "business_advisor" },
    "admin": { "workspace": "~/dinein/agents/admin", "persona": "platform_manager" }
  }
}
```

### Step 4.2: Environment Variables

Create `~/dinein/.env`:

```bash
GOOGLE_API_KEY=your_gemini_api_key
GATEWAY_TOKEN=your_strong_random_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

---

## Phase 5: Implement Skills

### Step 5.1: Menu Service Skill

See full implementation in the reference document. Key tools:
- `menu_search`: Search menu items by name, ingredients, dietary restrictions
- `menu_get_item`: Get detailed info about specific menu item
- `menu_get_categories`: Get all menu categories for a bar

### Step 5.2: Order Management Skill

Key tools:
- `order_create`: Create new order with items
- `order_status`: Get order status
- `order_update_status`: Update order status (staff only)

---

## Phase 6: Flutter Integration

### Key Components:
1. `MoltbotClient` - WebSocket client for real-time chat
2. `GuestChatScreen` - Chat UI for guests
3. `MenuScreen` - Menu browsing with AI assistance

### Dependencies:
```yaml
dependencies:
  supabase_flutter: ^2.0.0
  web_socket_channel: ^2.4.0
  flutter_chat_ui: ^1.6.0
```

---

## Phase 7: PWA Integration

### Bar Manager PWA Components:
1. `MoltbotService.js` - WebSocket service class
2. `BarAssistantChat.jsx` - Chat component for bar managers
3. `BarDashboard.jsx` - Main dashboard with assistant toggle

---

## Verification Checklist

- [ ] Supabase tables created (`agent_sessions`, `conversations`, `agent_actions`)
- [ ] RLS policies applied
- [ ] Moltbot installed and daemon running
- [ ] Agent workspaces created with AGENT.md files
- [ ] Config file created with correct env vars
- [ ] Skills implemented and tested
- [ ] Flutter MoltbotClient integrated
- [ ] PWA MoltbotService integrated
- [ ] WebSocket connections working
- [ ] All three agent personas responding correctly

---

## Troubleshooting

### Common Issues:
1. **WebSocket not connecting**: Check CORS origins in config
2. **Agent not responding**: Verify GOOGLE_API_KEY is valid
3. **Tools not working**: Check SUPABASE_SERVICE_KEY permissions
4. **Session not persisting**: Ensure RLS policies are correct

---

## Reference

Full implementation details, code samples, and deployment architecture are in:
`/Users/jeanbosco/Downloads/dinein-moltbot-integration-guide.md`
