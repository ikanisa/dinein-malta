/**
 * Tool: research.search_web
 * 
 * Performs a web search with enforced geo-fencing keywords.
 */

import { RESEARCH_FENCES } from "../../policies/research_fences.ts";
import { validateToolInput } from "../../policies/validators.ts";
import { dineinClient, ClientContext } from "../../clients/dinein_api.ts";

export const researchSearchTool = {
    "research.search_web": async (input: { query: string; geoId: string }, context: ClientContext) => {
        await validateToolInput("research.search_web", input);

        // 1. Resolve Geo Target
        const target = RESEARCH_FENCES.geo_targets.find(t => t.id === input.geoId);
        if (!target) {
            throw new Error(`Invalid geoId: ${input.geoId}`);
        }

        // 2. Inject Keywords (Query Augmentation)
        const augmentedQuery = `${input.query} AND (${target.keywords.join(" OR ")})`;

        // 3. Call Backend Search Tool (which handles the actual SERP API)
        return await dineinClient.executeTool("research.search_web", {
            ...input,
            query: augmentedQuery,
            allowedDomains: RESEARCH_FENCES.allowlisted_domains
        }, context);
    }
};
