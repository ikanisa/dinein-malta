/**
 * Venue Fixtures
 */

export const DEMO_VENUES = [
    {
        venueId: "v_kgl_rooftop_01",
        tenantId: "t_dinein_demo",
        name: "Skyline Rooftop Kigali",
        slug: "skyline-rooftop-kigali",
        address: "Kigali, Kimihurura",
        latlng: { lat: -1.951, lng: 30.092 },
        timezone: "Africa/Kigali",
        country: "RW",
        priceBand: "$$",
        venueType: "bar",
        cuisines: ["african_fusion"],
        features: { liveMusic: true, outdoorSeating: true, wifi: true },
        tags: ["rooftop", "live_band", "outdoor_seating", "cocktail_bar"],
        hoursWeekly: [
            { day: 0, open: "12:00", close: "00:00" }, // Sun
            { day: 1, open: "16:00", close: "00:00" }, // Mon
            { day: 2, open: "16:00", close: "00:00" }, // Tue
            { day: 3, open: "16:00", close: "00:00" }, // Wed
            { day: 4, open: "16:00", close: "02:00" }, // Thu
            { day: 5, open: "16:00", close: "02:00" }, // Fri
            { day: 6, open: "12:00", close: "02:00" }  // Sat
        ],
        assets: {
            heroImageUrl: "https://example-cdn/skyline/hero.jpg",
            gallery: [
                "https://example-cdn/skyline/1.jpg",
                "https://example-cdn/skyline/2.jpg"
            ]
        },
        rating: 4.5,
        isActive: true
    },
    {
        venueId: "v_kgl_grill_02",
        tenantId: "t_dinein_demo",
        name: "Nyama Corner Grill",
        slug: "nyama-corner-grill",
        address: "Kigali, Remera",
        latlng: { lat: -1.953, lng: 30.109 },
        timezone: "Africa/Kigali",
        country: "RW",
        priceBand: "$",
        venueType: "restaurant",
        cuisines: ["grill_bbq", "rwandan"],
        features: { liveMusic: false, outdoorSeating: true, wifi: false },
        tags: ["outdoor_seating"],
        hoursWeekly: [
            { day: 0, open: "12:00", close: "22:00" },
            { day: 1, open: "11:00", close: "23:00" },
            { day: 2, open: "11:00", close: "23:00" },
            { day: 3, open: "11:00", close: "23:00" },
            { day: 4, open: "11:00", close: "23:00" },
            { day: 5, open: "11:00", close: "00:00" },
            { day: 6, open: "11:00", close: "00:00" }
        ],
        assets: {
            heroImageUrl: "https://example-cdn/nyama/hero.jpg",
            gallery: []
        },
        rating: 4.2,
        isActive: true
    }
];

export function getVenueById(id: string) {
    return DEMO_VENUES.find(v => v.venueId === id);
}
