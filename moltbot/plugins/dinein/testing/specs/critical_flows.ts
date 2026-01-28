/**
 * Critical Flow Test Specs
 * 
 * E2E test definitions for core user journeys.
 */

export interface TestSpec {
    id: string;
    description: string;
    steps: string[];
    assertions: string[];
    fixtures?: string[];
}

export const CRITICAL_FLOWS: TestSpec[] = [
    {
        id: "T1_HOME_RENDER",
        description: "Home UIPlan renders with nearby venues and offers",
        steps: [
            "Call /ai/ui-plan screen=home with location near Kigali",
            "Validate UIPlan schema",
            "Render sections; ensure venues appear"
        ],
        assertions: [
            "No unknown intents in actions",
            "Each venue item has actionRef -> openVenue",
            "Cache.ttlSeconds within bounds (30-300)"
        ],
        fixtures: ["venues", "offers"]
    },
    {
        id: "T2_VENUE_MENU_BROWSE",
        description: "Open venue -> categories -> items",
        steps: [
            "openVenue action -> /ai/ui-plan screen=venue venueId=v_kgl_rooftop_01",
            "openMenu -> /ai/ui-plan screen=menu venueId",
            "openItem -> /ai/ui-plan screen=item itemId=i_sky_pina"
        ],
        assertions: [
            "menu.get returns categories",
            "item screen includes price and allergens",
            "No invented fields; IDs exist in fixtures"
        ],
        fixtures: ["venues", "menus"]
    },
    {
        id: "T3_START_VISIT_ADD_CART_QUOTE",
        description: "Start visit, add item, quote totals",
        steps: [
            "startVisit -> /api/visit/start",
            "addToCart -> /api/cart/add-item (mojito qty=2)",
            "pricing.quote -> /api/pricing/quote",
            "ui-plan checkout"
        ],
        assertions: [
            "visitId stored and reused",
            "cart lines reflect qty and totals",
            "quote totals are consistent and non-negative"
        ],
        fixtures: ["venues", "menus", "guests"]
    },
    {
        id: "T4_CONFIRM_AND_SUBMIT_IDEMPOTENT",
        description: "Confirm order and prevent double submit",
        steps: [
            "Generate clientConfirmationId",
            "order.submit -> success",
            "order.submit same confirmationId again"
        ],
        assertions: [
            "First returns orderId status=submitted",
            "Second returns CONFLICT with same orderId",
            "Audit logs exist for both"
        ],
        fixtures: ["venues", "menus", "guests"]
    },
    {
        id: "T5_ALLERGY_WARNING",
        description: "Allergy triggers warning/block",
        steps: [
            "Use guest g_anon_allergy_02 (milk allergy)",
            "openItem i_sky_pina (contains milk)",
            "Attempt addToCart"
        ],
        assertions: [
            "dietary.check returns warn or block",
            "UI surfaces warning",
            "If block: addToCart prevented"
        ],
        fixtures: ["guests", "menus"]
    },
    {
        id: "T6_WAITER_CHAT_FLOW",
        description: "Waiter recommends -> adds -> quotes -> asks confirm -> submits",
        steps: [
            "POST /ai/waiter: 'I want something sweet and light'",
            "Select recommended item actionRef",
            "Waiter shows totals and asks to confirm",
            "User: 'Yes place the order'"
        ],
        assertions: [
            "Waiter does NOT call order.submit before explicit confirmation",
            "Totals come from pricing.quote",
            "order.submit only after user says yes"
        ],
        fixtures: ["venues", "menus", "guests"]
    },
    {
        id: "T7_SERVICE_CALLS",
        description: "Call staff and request bill",
        steps: [
            "callStaff reason=water",
            "requestBill"
        ],
        assertions: [
            "service_call created status=queued",
            "Venue channel receives event",
            "Guest sees acknowledgment"
        ],
        fixtures: ["venues", "guests"]
    }
];
