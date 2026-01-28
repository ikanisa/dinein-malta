import { dineinClient, ClientContext } from "../clients/dinein_api.ts";
import { ServiceCallStaffInput, ServiceRequestBillInput } from "../schemas/interfaces.ts";
import { validateToolInput } from "../policies/validators.ts";

export const serviceTools = {
    "service.call_staff": async (input: ServiceCallStaffInput, context: ClientContext) => {
        await validateToolInput("service.call_staff", input);
        return await dineinClient.executeTool("service.call_staff", input, context);
    },

    "service.request_bill": async (input: ServiceRequestBillInput, context: ClientContext) => {
        await validateToolInput("service.request_bill", input);
        return await dineinClient.executeTool("service.request_bill", input, context);
    }
};
