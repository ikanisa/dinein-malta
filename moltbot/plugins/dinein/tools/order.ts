import { dineinClient, ClientContext } from "../clients/dinein_api.ts";
import { OrderSubmitInput, OrderStatusInput } from "../schemas/interfaces.ts";
import { validateToolInput } from "../policies/validators.ts";

export const orderTools = {
    "order.submit": async (input: OrderSubmitInput, context: ClientContext) => {
        await validateToolInput("order.submit", input);
        return await dineinClient.executeTool("order.submit", input, context);
    },

    "order.status": async (input: OrderStatusInput, context: ClientContext) => {
        await validateToolInput("order.status", input);
        return await dineinClient.executeTool("order.status", input, context);
    }
};
