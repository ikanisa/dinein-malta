/**
 * Research Fences
 * 
 * Defines strict constraints for the Research Agent:
 * - Geo-targets (Kigali, Malta)
 * - Domain Allowlists
 * - Time limits
 */

export const RESEARCH_FENCES = {
    geo_targets: [
        {
            id: "RW-KGL",
            label: "Kigali, Rwanda",
            keywords: ["Kigali", "Remera", "Kacyiru", "Nyarutarama", "Kimihurura", "Kiyovu", "Gikondo"],
            latlng: { lat: -1.9441, lng: 30.0619 },
            radius_km: 40
        },
        {
            id: "MT-MLT",
            label: "Malta",
            keywords: ["Malta", "Valletta", "Sliema", "St Julian's", "Gżira", "Mdina", "Mellieħa"],
            latlng: { lat: 35.9375, lng: 14.3754 },
            radius_km: 40
        }
    ],

    allowlisted_domains: [
        // Global Events
        "eventbrite.com", "meetup.com", "facebook.com/events",
        // Tourism
        "visitrwanda.com", "visitmalta.com", "mta.com.mt",
        // Industry
        "restaurantbusinessonline.com", "nrn.com", "foodandwine.com", "timeout.com",
        "theculturetrip.com", "worlds50best.com", "michelin.com",
        // Local News (Rwanda)
        "newtimes.co.rw", "ktpress.rw", "kcc.gov.rw", "rdb.rw", "rura.rw", "rra.gov.rw",
        // Local News (Malta)
        "timesofmalta.com"
    ],

    isDomainAllowed: (url: string): boolean => {
        try {
            const hostname = new URL(url).hostname;
            // Check if hostname ends with any allowed domain
            return RESEARCH_FENCES.allowlisted_domains.some(domain =>
                hostname === domain || hostname.endsWith("." + domain)
            );
        } catch (e) {
            return false;
        }
    }
};
