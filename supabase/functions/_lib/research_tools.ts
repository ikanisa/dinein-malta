/**
 * Research Intel Agent Tools
 * 
 * Implements geo-fenced, safe browsing and research capabilities for Moltbot.
 * Enforces strict domain allowlists and read-only operations.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ClaudeTool, ToolResult } from "./agent_tools.ts";

// =============================================================================
// DOMAIN ALLOWLIST & GEO-FENCING (per WF-NEXT-02 spec)
// =============================================================================

/**
 * Domain allowlists for research agent browsing.
 * Deny-by-default: any domain not listed is blocked.
 */

// Global reputable domains (accessible for all geos)
const GLOBAL_REPUTABLE_DOMAINS = [
    "eventbrite.com",
    "meetup.com",
    "timeout.com",
    "visitrwanda.com",
    "visitmalta.com",
    "tripadvisor.com",
    "facebook.com",
    "instagram.com",
    "theculturetrip.com",
    "foodandwine.com",
    "worlds50best.com",
    "michelin.com",
    "restaurantbusinessonline.com",
    "nrn.com",
    "google.com",
    "wikipedia.org",
];

// Rwanda-specific local sources
const RWANDA_LOCAL_DOMAINS = [
    "kcc.gov.rw",
    "rdb.rw",
    "rura.rw",
    "rra.gov.rw",
    "newtimes.co.rw",
    "ktpress.rw",
    "igihe.com",
    "taarifa.rw",
];

// Malta-specific local sources
const MALTA_LOCAL_DOMAINS = [
    "mta.com.mt",
    "visitmalta.com",
    "timesofmalta.com",
    "maltatoday.com.mt",
    "independent.com.mt",
    "lovinmalta.com",
];

// Combined allowlist
const ALLOWED_DOMAINS = [
    ...GLOBAL_REPUTABLE_DOMAINS,
    ...RWANDA_LOCAL_DOMAINS,
    ...MALTA_LOCAL_DOMAINS,
];

// Geo-specific domains (preferred for context)
const GEO_DOMAINS: Record<string, string[]> = {
    RW: RWANDA_LOCAL_DOMAINS,
    MT: MALTA_LOCAL_DOMAINS,
};

// Blocked content types (never fetch these)
const BLOCKED_CONTENT_TYPES = [
    "application/zip",
    "application/octet-stream",
    "application/x-msdownload",
    "application/x-executable",
    "application/vnd.ms-excel",
    "application/x-rar-compressed",
];

// Research mode constraints
const RESEARCH_CONSTRAINTS = {
    timeWindow: {
        default: 30,     // days for trends
        events: 180,     // days for upcoming events
    },
    minSourceScore: 0.55,
    maxUrlsPerSession: 20,
};

// Mock mode toggle - set RESEARCH_MOCK_MODE=false in env for real API calls
const USE_MOCK_MODE = Deno.env.get("RESEARCH_MOCK_MODE") !== "false";



// =============================================================================
// CLAUDE TOOL DEFINITIONS
// =============================================================================

export const RESEARCH_TOOLS: ClaudeTool[] = [
    {
        name: "research.search_web",
        description: "Search the web for industry trends, events, or competitor info. RESTRICTED to allowed domains and geo-fenced to RW/MT.",
        input_schema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query string"
                },
                geo: {
                    type: "string",
                    enum: ["RW", "MT"],
                    description: "Geographic context (Rwanda or Malta)"
                }
            },
            required: ["query", "geo"]
        }
    },
    {
        name: "research.open_url",
        description: "Open a specific URL to read its content. URL must be in the allowlist.",
        input_schema: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "Full URL to open"
                }
            },
            required: ["url"]
        }
    },
    {
        name: "research.extract",
        description: "Extract structured data (events, trends) from a URL's content.",
        input_schema: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "Source URL"
                },
                extract_type: {
                    type: "string",
                    enum: ["event", "trend", "competitor_menu", "general"],
                    description: "Type of data to extract"
                }
            },
            required: ["url", "extract_type"]
        }
    },
    {
        name: "research.classify",
        description: "Classify a text snippet or URL content into predefined categories.",
        input_schema: {
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "Text content to classify"
                },
                categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of possible categories"
                }
            },
            required: ["content", "categories"]
        }
    },
    {
        name: "research.score_source",
        description: "Score the reliability and relevance of a source.",
        input_schema: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "Source URL"
                },
                content_preview: {
                    type: "string",
                    description: "First 500 chars of content"
                }
            },
            required: ["url"]
        }
    },
    {
        name: "research.geo_filter",
        description: "Verify if a location or source is relevant to the target geography.",
        input_schema: {
            type: "object",
            properties: {
                location_name: {
                    type: "string",
                    description: "Name of city, district, or venue"
                },
                target_geo: {
                    type: "string",
                    enum: ["RW", "MT"],
                    description: "Target country code"
                }
            },
            required: ["location_name", "target_geo"]
        }
    },
    {
        name: "research.cite",
        description: "Generate a formatted citation for a finding.",
        input_schema: {
            type: "object",
            properties: {
                title: { type: "string" },
                url: { type: "string" },
                author: { type: "string" },
                date: { type: "string" }
            },
            required: ["title", "url"]
        }
    },
    {
        name: "research.dedupe",
        description: "Deduplicate a list of research items by URL or content similarity.",
        input_schema: {
            type: "object",
            properties: {
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            url: { type: "string" },
                            title: { type: "string" },
                            content: { type: "string" }
                        }
                    },
                    description: "List of research items to deduplicate"
                }
            },
            required: ["items"]
        }
    },
    {
        name: "research.summarize",
        description: "Summarize research findings into a concise digest.",
        input_schema: {
            type: "object",
            properties: {
                findings: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of finding strings to summarize"
                },
                max_length: {
                    type: "number",
                    description: "Maximum summary length in characters (default 500)"
                }
            },
            required: ["findings"]
        }
    },
    {
        name: "research_to_ops.propose_actions",
        description: "Draft a proposal for operational changes based on research findings. DOES NOT EXECUTE ACTION. Saves to approval queue.",
        input_schema: {
            type: "object",
            properties: {
                proposal_type: {
                    type: "string",
                    enum: ["new_menu_item", "promo_campaign", "price_adjustment", "event_tie_in"],
                    description: "Type of proposal"
                },
                venue_id: {
                    type: "string",
                    description: "Target venue UUID (optional for platform-wide proposals)"
                },
                title: { type: "string" },
                description: { type: "string" },
                rationale: { type: "string" },
                source_urls: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: ["proposal_type", "title", "description", "rationale"]
        }
    }
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function executeResearchTool(
    toolName: string,
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    try {
        switch (toolName) {
            case "research.search_web":
                return await searchWeb(input);
            case "research.open_url":
                return await openUrl(input);
            case "research.extract":
                return await extractContent(input);
            case "research.classify":
                return await classifyContent(input);
            case "research.score_source":
                return await scoreSource(input);
            case "research.geo_filter":
                return await geoFilter(input);
            case "research.cite":
                return await generateCitation(input);
            case "research.dedupe":
                return await dedupeItems(input);
            case "research.summarize":
                return await summarizeFindings(input);
            case "research_to_ops.propose_actions":
                return await proposeAction(input, supabase);
            default:
                return { success: false, error: `Unknown tool: ${toolName}` };
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Tool execution failed" };
    }
}

// =============================================================================
// IMPLEMENTATIONS
// =============================================================================

function isAllowedDomain(url: string, geo?: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        // Check global allowlist
        const isAllowed = ALLOWED_DOMAINS.some(domain => hostname.includes(domain));
        if (!isAllowed) return false;

        // Optional Geo check
        if (geo && GEO_DOMAINS[geo as keyof typeof GEO_DOMAINS]) {
            // If geo specified, warn if domain is typically for another geo? 
            // For now, strict allowlist is enough.
        }
        return true;
    } catch {
        return false;
    }
}

async function searchWeb(input: Record<string, unknown>): Promise<ToolResult> {
    const { query, geo } = input as { query: string; geo: string };

    // Mock mode for development/testing
    if (USE_MOCK_MODE) {
        const mockResults = [
            {
                title: `Latest Food Trends in ${geo === 'RW' ? 'Kigali' : 'Malta'}`,
                url: `https://${geo === 'RW' ? 'visitrwanda.com' : 'visitmalta.com'}/dining-trends`,
                snippet: `Current trends show a rise in fusion cuisine and sustainable sourcing in ${geo}...`
            },
            {
                title: `Events this weekend in ${geo}`,
                url: `https://${geo === 'RW' ? 'ktpress.rw' : 'timesofmalta.com'}/events`,
                snippet: "Music festivals and food markets are scheduled for this weekend..."
            }
        ];
        return {
            success: true,
            data: {
                results: mockResults,
                disclaimer: "Results simulated (MOCK_MODE=true). Set RESEARCH_MOCK_MODE=false for real search."
            }
        };
    }

    // Real mode: would call SERP API here
    // For now, return error indicating real mode not yet configured
    return {
        success: false,
        error: "Real search mode not configured. Set SERP_API_KEY environment variable."
    };
}

async function openUrl(input: Record<string, unknown>): Promise<ToolResult> {
    const { url } = input as { url: string };

    if (!isAllowedDomain(url)) {
        return {
            success: false,
            error: `URL blocked by Allowlist Policy. Domain not trusted: ${url}`
        };
    }

    // In a real edge function, we might fetch(url) here.
    // For safety in this demo, we return a simulated extraction.
    return {
        success: true,
        data: {
            url,
            status: 200,
            content: `[Simulated content for ${url}]\nFound distinct trends: 1. Locally sourced coffee usage doubling. 2. Vegan options requested by 30% of tourists.`,
            metadata: { title: "Page Title", last_modified: new Date().toISOString() }
        }
    };
}

async function extractContent(input: Record<string, unknown>): Promise<ToolResult> {
    const { url, extract_type } = input as { url: string; extract_type: string };

    if (!isAllowedDomain(url)) {
        return { success: false, error: "URL blocked by Allowlist Policy." };
    }

    // Heuristic extraction simulation
    return {
        success: true,
        data: {
            type: extract_type,
            source: url,
            extracted_data: {
                summary: "Extracted intel summary...",
                entities: ["Entity 1", "Entity 2"],
                relevance_score: 0.9
            }
        }
    };
}

async function classifyContent(input: Record<string, unknown>): Promise<ToolResult> {
    const { content, categories } = input as { content: string; categories: string[] };

    // Simple mock classification - would use an LLM call in reality
    return {
        success: true,
        data: {
            classification: categories[0] || "unknown",
            confidence: 0.85
        }
    };
}

async function scoreSource(input: Record<string, unknown>): Promise<ToolResult> {
    const { url } = input as { url: string };

    const isTrusted = isAllowedDomain(url);

    return {
        success: true,
        data: {
            score: isTrusted ? 0.9 : 0.1,
            flags: isTrusted ? [] : ["domain_not_allowlisted"]
        }
    };
}

async function geoFilter(input: Record<string, unknown>): Promise<ToolResult> {
    const { location_name, target_geo } = input as { location_name: string; target_geo: string };
    // Mock logic
    const isRelevant = true;
    return {
        success: true,
        data: { is_relevant: isRelevant, match_confidence: 0.8 }
    };
}

async function generateCitation(input: Record<string, unknown>): Promise<ToolResult> {
    const { title, url, author, date } = input as { title: string; url: string; author: string; date: string };
    return {
        success: true,
        data: {
            citation: `"${title}", ${author || 'Unknown'}, accessed at ${url} on ${new Date().toISOString()}`
        }
    };
}

async function dedupeItems(input: Record<string, unknown>): Promise<ToolResult> {
    const { items } = input as { items: Array<{ url?: string; title?: string; content?: string }> };

    if (!items || items.length === 0) {
        return { success: true, data: { deduped: [], removed_count: 0 } };
    }

    // Simple URL-based deduplication
    const seen = new Set<string>();
    const deduped = items.filter(item => {
        const key = item.url || item.title || JSON.stringify(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return {
        success: true,
        data: {
            deduped,
            removed_count: items.length - deduped.length
        }
    };
}

async function summarizeFindings(input: Record<string, unknown>): Promise<ToolResult> {
    const { findings, max_length = 500 } = input as { findings: string[]; max_length?: number };

    if (!findings || findings.length === 0) {
        return { success: true, data: { summary: "No findings to summarize." } };
    }

    // Simple concatenation with truncation - in production would use LLM
    const combined = findings.join(" • ");
    const summary = combined.length > max_length
        ? combined.substring(0, max_length - 3) + "..."
        : combined;

    return {
        success: true,
        data: {
            summary,
            finding_count: findings.length,
            truncated: combined.length > max_length
        }
    };
}

async function proposeAction(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { proposal_type, venue_id, title, description, rationale, source_urls } = input as {
        proposal_type: string;
        venue_id?: string;
        title: string;
        description: string;
        rationale: string;
        source_urls?: string[];
    };

    // Persist to approval_requests table
    const { data, error } = await supabase
        .from("approval_requests")
        .insert({
            request_type: "research_proposal",
            entity_type: proposal_type,
            entity_id: crypto.randomUUID(), // Placeholder entity ID
            venue_id: venue_id || null,
            notes: JSON.stringify({
                title,
                description,
                rationale,
                source_urls: source_urls || [],
                generated_by: "research_intel_agent"
            }),
            priority: "normal",
            status: "pending"
        })
        .select("id")
        .single();

    if (error) {
        return {
            success: false,
            error: `Failed to save proposal: ${error.message}`
        };
    }

    return {
        success: true,
        data: {
            proposal_id: data.id,
            status: "pending_approval",
            message: "Proposal saved to approval queue. Ops manager must review before implementation.",
            details: { title, proposal_type, venue_id }
        }
    };
}
