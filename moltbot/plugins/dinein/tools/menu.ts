import { dineinClient, ClientContext } from "../clients/dinein_api.ts";
import { MenuGetInput, MenuGetItemInput } from "../schemas/interfaces.ts";
import { validateToolInput } from "../policies/validators.ts";

export const menuTools = {
    "menu.get": async (input: MenuGetInput, context: ClientContext) => {
        await validateToolInput("menu.get", input);
        return await dineinClient.executeTool("menu.get", input, context);
    },

    "menu.get_item": async (input: MenuGetItemInput, context: ClientContext) => {
        await validateToolInput("menu.get_item", input);
        return await dineinClient.executeTool("menu.get_item", input, context);
    },

    "menu.search": async (input: any, context: ClientContext) => {
        await validateToolInput("menu.search", input);
        return await dineinClient.executeTool("menu.search", input, context);
    }
};
