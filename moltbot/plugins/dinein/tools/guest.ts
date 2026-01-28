import { dineinClient, ClientContext } from "../clients/dinein_api.ts";
import { GuestGetProfileInput, GuestUpdatePreferencesInput } from "../schemas/interfaces.ts";
import { validateToolInput } from "../policies/validators.ts";

export const guestTools = {
    "guest.get_profile": async (input: GuestGetProfileInput, context: ClientContext) => {
        await validateToolInput("guest.get_profile", input);
        return await dineinClient.executeTool("guest.get_profile", input, context);
    },

    "guest.update_preferences": async (input: GuestUpdatePreferencesInput, context: ClientContext) => {
        await validateToolInput("guest.update_preferences", input);
        return await dineinClient.executeTool("guest.update_preferences", input, context);
    },

    "guest.get_history": async (input: any, context: ClientContext) => {
        await validateToolInput("guest.get_history", input);
        return await dineinClient.executeTool("guest.get_history", input, context);
    }
};
