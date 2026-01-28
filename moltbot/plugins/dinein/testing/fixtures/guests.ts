/**
 * Guest Fixtures
 */

export const DEMO_GUESTS = [
    {
        guestId: "g_anon_01",
        locale: "en",
        allergies: [],
        preferences: {
            cuisines: ["grill_bbq"],
            budgetBand: "$$",
            spiceLevel: "medium"
        },
        recentlyViewed: [],
        recentlyOrdered: []
    },
    {
        guestId: "g_anon_allergy_02",
        locale: "en",
        allergies: ["milk"],
        preferences: {
            cuisines: ["african_fusion"],
            budgetBand: "$$",
            spiceLevel: "medium"
        },
        recentlyViewed: ["v_kgl_rooftop_01"],
        recentlyOrdered: []
    }
];

export function getGuestById(id: string) {
    return DEMO_GUESTS.find(g => g.guestId === id);
}
