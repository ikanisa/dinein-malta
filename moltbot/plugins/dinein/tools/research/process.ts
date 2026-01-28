/**
 * Tool: research.process.*
 * 
 * Pure text processing tools (Extract, Classify, Score).
 */

import { validateToolInput } from "../../policies/validators.ts";
import { dineinClient, ClientContext } from "../../clients/dinein_api.ts";

export const researchProcessTools = {
    "research.extract": async (input: { content: string }, context: ClientContext) => {
        await validateToolInput("research.extract", input);
        // Backend handles summarization/extraction via LLM
        return await dineinClient.executeTool("research.extract", input, context);
    },

    "research.classify": async (input: { text: string }, context: ClientContext) => {
        await validateToolInput("research.classify", input);
        return await dineinClient.executeTool("research.classify", input, context);
    },

    "research.score_source": async (input: { url: string; metadata: any }, context: ClientContext) => {
        // Simple logic or backend call
        return await dineinClient.executeTool("research.score_source", input, context);
    }
};
