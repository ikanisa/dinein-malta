/**
 * Tool: proposals.propose_actions
 * 
 * Generates a structured proposal bundle. Safe, no side effects.
 */

import { validateToolInput } from "../../policies/validators.ts";
import { dineinClient, ClientContext } from "../../clients/dinein_api.ts";

export interface ProposalAction {
    type: "menu_update" | "promo_create" | "strategy_change";
    payload: any;
    reason: string;
}

export const researchProposalsTool = {
    "proposals.propose_actions": async (input: {
        digestId: string;
        actions: ProposalAction[];
        scope: "venue" | "platform"
    }, context: ClientContext) => {

        await validateToolInput("proposals.propose_actions", input);

        // This tool just formats and validates the proposal structure.
        // It does NOT execute them. It saves them as a "Proposal Bundle" object in the DB.

        return await dineinClient.executeTool("proposals.save_draft_bundle", {
            ...input,
            requiresApproval: true,
            status: "draft"
        }, context);
    }
};
