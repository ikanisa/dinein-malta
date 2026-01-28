import { dineinClient, ClientContext } from "../clients/dinein_api.ts";
import { CartAddItemInput, CartGetInput } from "../schemas/interfaces.ts";
import { validateToolInput } from "../policies/validators.ts";

export const cartTools = {
    "cart.get": async (input: CartGetInput, context: ClientContext) => {
        await validateToolInput("cart.get", input);
        return await dineinClient.executeTool("cart.get", input, context);
    },

    "cart.add_item": async (input: CartAddItemInput, context: ClientContext) => {
        await validateToolInput("cart.add_item", input);
        return await dineinClient.executeTool("cart.add_item", input, context);
    },

    "cart.update_item": async (input: any, context: ClientContext) => {
        await validateToolInput("cart.update_item", input);
        return await dineinClient.executeTool("cart.update_item", input, context);
    },

    "cart.remove_item": async (input: any, context: ClientContext) => {
        await validateToolInput("cart.remove_item", input);
        return await dineinClient.executeTool("cart.remove_item", input, context);
    }
};
