/**
 * Edge Case Test Specs
 * 
 * Negative and boundary condition tests.
 */

import { TestSpec } from "./critical_flows.ts";

export const EDGE_CASES: TestSpec[] = [
    {
        id: "N1_UNKNOWN_INTENT",
        description: "UIPlan contains unknown intent -> server rejects",
        steps: [
            "Simulate UIPlan with intent='fakeIntent'",
            "Call ui.validate"
        ],
        assertions: [
            "Validation fails",
            "Response contains VALIDATION_ERROR"
        ]
    },
    {
        id: "N2_TENANT_MISMATCH",
        description: "Attempt access venueId from another tenant",
        steps: [
            "Use guest from tenant A",
            "Request venue from tenant B"
        ],
        assertions: [
            "TENANT_MISMATCH returned",
            "Incident logged"
        ]
    },
    {
        id: "N3_QUOTE_STALE",
        description: "Quote older than 60s -> submit fails",
        steps: [
            "Get pricing.quote",
            "Wait 65 seconds",
            "Attempt order.submit with stale quoteId"
        ],
        assertions: [
            "PRECONDITION_FAILED returned",
            "Must re-quote before submit"
        ]
    },
    {
        id: "N4_RATE_LIMIT",
        description: "Spam waiter messages",
        steps: [
            "Send 20 messages in 10 seconds to /ai/waiter"
        ],
        assertions: [
            "RATE_LIMITED returned after threshold",
            "Cooldown behavior applied"
        ]
    },
    {
        id: "N5_DEPENDENCY_DOWN",
        description: "Simulate DB down for offers",
        steps: [
            "Mock offers service to fail",
            "Request home UIPlan"
        ],
        assertions: [
            "Home loads successfully",
            "Offers section omitted or shows fallback",
            "No 500 error"
        ]
    },
    {
        id: "N6_EMPTY_CART_SUBMIT",
        description: "Attempt to submit empty cart",
        steps: [
            "Start visit",
            "Attempt order.submit with empty cart"
        ],
        assertions: [
            "VALIDATION_ERROR returned",
            "Message indicates cart is empty"
        ]
    },
    {
        id: "N7_INVALID_ITEM_ID",
        description: "Add non-existent item to cart",
        steps: [
            "Call cart.add-item with itemId='invalid_xyz'"
        ],
        assertions: [
            "NOT_FOUND returned",
            "Cart unchanged"
        ]
    }
];
