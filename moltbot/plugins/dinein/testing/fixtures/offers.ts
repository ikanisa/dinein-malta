/**
 * Offers Fixtures
 */

export const DEMO_OFFERS = [
    {
        offerId: "o_sky_happyhour",
        venueId: "v_kgl_rooftop_01",
        tenantId: "t_dinein_demo",
        title: "Happy Hour",
        summary: "20% off cocktails 18:00–20:00",
        badge: "happy_hour",
        rule: {
            type: "percent_off" as const,
            value: 20,
            includesCategories: ["cat_cocktails"],
            excludesItems: [],
            window: {
                startsAt: "2026-01-01T00:00:00Z",
                endsAt: "2026-12-31T23:59:59Z"
            },
            timeWindowLocal: { start: "18:00", end: "20:00" },
            daysOfWeek: [1, 2, 3, 4, 5] // Mon-Fri
        },
        caps: {
            maxDiscountAmount: null,
            maxUsesPerGuest: null,
            maxTotalUses: null
        },
        allowStackingWithOthers: false,
        status: "active" as const
    }
];

export function getActiveOffersByVenueId(venueId: string) {
    return DEMO_OFFERS.filter(o => o.venueId === venueId && o.status === "active");
}
