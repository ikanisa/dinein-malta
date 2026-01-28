# Research Sandbox Workflows (Geo-fenced Browsing → Intel Digest → Proposals → Approval-Gated Actions)

**Purpose**: Implement a safe "Industry Intel" capability for DineIn that keeps the main production agents clean. Research Mode can browse only through allowlisted domains and geo/time constraints, produces structured digests with citations + confidence, and generates PROPOSALS ONLY.

## Core Principles
1.  **Hard separation**: Production agents do not browse.
2.  **No Mutation**: Research agent has zero mutation tools.
3.  **Untrusted Outputs**: All outputs are untrusted until validated; must include citations.
4.  **Approval Required**: Any downstream operational change requires approval.

## Research Fences & Constraints

### Geo-Targets
- **RW-KGL (Kigali)**: lat/lng (-1.9441, 30.0619), radius 40km. Keywords: "Kigali", "Kimihurura", etc.
- **MT-MLT (Malta)**: lat/lng (35.9375, 14.3754), radius 40km. Keywords: "Valletta", "St Julian's", etc.

### Domain Allowlist (Strict)
- **Global Events**: eventbrite.com, meetup.com, facebook.com/events
- **Tourism**: visitrwanda.com, visitmalta.com, mta.com.mt
- **Industry**: restaurantbusinessonline.com, nrn.com, michelin.com
- **Local News**: newtimes.co.rw, ktpress.rw, timesofmalta.com

### Source Scoring
- **Boosts**: Official domains (+0.2), Named author (+0.05), Recent (+0.1)
- **Penalties**: No author (-0.05), No date (-0.1), Aggregator (-0.1)
- **Discard**: Score < 0.55

## Workflows

### 1. Query Generation (RS-WF-01)
Constructs search queries injecting geo-keywords and time windows.

### 2. Search & Fetch (RS-WF-02)
Executes `research.search_web` and `research.open_url`. Enforces domain allowlist. Quarantine for PDFs.

### 3. Classify & Score (RS-WF-03)
Uses `research.classify` and `research.score_source` to filter out low-quality or irrelevant content.

### 4. Claims & Citations (RS-WF-04)
Extracts key claims and attaches strict citations (URL + snippet).

### 5. Digest Synthesis (RS-WF-05)
Produces a structured `IntelDigest` JSON with executive summary and categorized items.

### 6. Proposal Generation (RS-WF-06)
Converts digest insights into `ProposalBundle` (draft actions). Assigns risk level. Requires approval.

### 7. Delivery (RS-WF-07)
Routes digests/proposals to the correct human inbox (Venue Manager or Platform Admin).

### 8. Execution Bridge (RS-WF-08)
Human approves -> Production Agent executes. Research Agent *never* executes.

## Data Schemas

### Intel Digest
```json
{
  "digestId": "string",
  "generatedAt": "ISO8601",
  "geo": "RW-KGL",
  "topics": ["events", "competitors"],
  "items": [ ... ],
  "recommendations": [ ... ]
}
```

### Proposal Bundle
```json
{
  "proposalId": "string",
  "scope": "venue",
  "proposedActions": [],
  "evidence": "citations...",
  "riskLevel": "medium",
  "requiresApproval": true
}
```
