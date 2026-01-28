/**
 * Tool: research.open_url
 * 
 * Fetches content from a URL but ONLY if it is allowlisted.
 */

import { RESEARCH_FENCES } from "../../policies/research_fences.ts";
import { validateToolInput } from "../../policies/validators.ts";
import { dineinClient, ClientContext } from "../../clients/dinein_api.ts";

export const researchOpenUrlTool = {
    "research.open_url": async (input: { url: string }, context: ClientContext) => {
        await validateToolInput("research.open_url", input);

        // 1. Enforce Domain Allowlist
        if (!RESEARCH_FENCES.isDomainAllowed(input.url)) {
            throw new Error(`Domain not allowlisted: ${input.url}`);
        }

        // 2. Call Backend Fetch
        return await dineinClient.executeTool("research.open_url", input, context);
    }
};
