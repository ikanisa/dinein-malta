import { dineinClient, ClientContext } from "../clients/dinein_api.ts";
import { VenuesListNearbyInput, VenuesGetInput } from "../schemas/interfaces.ts";
import { validateToolInput } from "../policies/validators.ts";

export const venueTools = {
    "venues.list_nearby": async (input: VenuesListNearbyInput, context: ClientContext) => {
        await validateToolInput("venues.list_nearby", input);
        return await dineinClient.executeTool("venues.list_nearby", input, context);
    },

    "venues.get": async (input: VenuesGetInput, context: ClientContext) => {
        await validateToolInput("venues.get", input);
        return await dineinClient.executeTool("venues.get", input, context);
    },

    "venues.search": async (input: any, context: ClientContext) => {
        await validateToolInput("venues.search", input);
        return await dineinClient.executeTool("venues.search", input, context);
    }
};
