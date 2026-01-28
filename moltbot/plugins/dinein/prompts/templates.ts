/**
 * Response Templates
 * 
 * Pre-defined response patterns for common scenarios.
 */

export const WAITER_TEMPLATES = {
    recommendation: (items: string[]) =>
        `Based on what you like, here are 3 great picks: ${items.join(", ")}. Any allergies or 'no-go' ingredients?`,

    confirm_totals: (total: string, subtotal: string, tax: string, service: string, discount: string) =>
        `Here's the total: ${total} (${subtotal} + tax ${tax} + service ${service} − discount ${discount}). Want me to place the order now?`,

    escalation: (reason: string) =>
        `I've alerted the staff now (${reason}). I'll stay with you here until it's resolved.`,

    order_placed: (orderNumber: string) =>
        `Order placed! Your order number is ${orderNumber}. The kitchen is on it. 🍽️`
};

export const MANAGER_TEMPLATES = {
    daily_brief: (data: { sales: string; topItems: string; kpi: string; lowStock: string; drafts: string }) =>
        `Today's snapshot:
- Sales: ${data.sales}
- Top items: ${data.topItems}
- Service: ${data.kpi}
- Stock risks: ${data.lowStock}
Suggested actions (draft only): ${data.drafts}`,

    approval_needed: (action: string) =>
        `⚠️ This action requires approval: ${action}. I have created an approval request.`
};
