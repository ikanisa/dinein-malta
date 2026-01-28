/**
 * Menu Fixtures
 */

export const DEMO_MENUS = {
    "v_kgl_rooftop_01": {
        venueId: "v_kgl_rooftop_01",
        menuVersion: "m1",
        publishedAt: "2026-01-15T10:00:00Z",
        categories: [
            {
                categoryId: "cat_cocktails",
                name: "Cocktails",
                sortOrder: 1,
                items: [
                    {
                        itemId: "i_sky_mojito",
                        name: "Sky Mojito",
                        description: "Mint, lime, rum, soda.",
                        price: 4500,
                        currency: "RWF",
                        tags: ["signature"],
                        allergens: [],
                        isAvailable: true,
                        addons: [
                            { addonId: "a_extra_rum", name: "Extra rum shot", price: 1500 }
                        ]
                    },
                    {
                        itemId: "i_sky_pina",
                        name: "Pineapple Twist",
                        description: "Pineapple, coconut, rum.",
                        price: 5000,
                        currency: "RWF",
                        tags: ["popular"],
                        allergens: ["milk"],
                        isAvailable: true,
                        addons: []
                    }
                ]
            },
            {
                categoryId: "cat_bites",
                name: "Bites",
                sortOrder: 2,
                items: [
                    {
                        itemId: "i_sky_wings",
                        name: "Spicy Wings",
                        description: "Crispy wings, house hot sauce.",
                        price: 6000,
                        currency: "RWF",
                        tags: ["popular", "spicy"],
                        allergens: ["soy", "wheat"],
                        isAvailable: true,
                        addons: [
                            { addonId: "a_extra_sauce", name: "Extra sauce", price: 500 }
                        ]
                    }
                ]
            }
        ]
    },

    "v_kgl_grill_02": {
        venueId: "v_kgl_grill_02",
        menuVersion: "m1",
        publishedAt: "2026-01-15T10:00:00Z",
        categories: [
            {
                categoryId: "cat_grills",
                name: "From the Grill",
                sortOrder: 1,
                items: [
                    {
                        itemId: "i_nyama_brochettes",
                        name: "Beef Brochettes",
                        description: "Grilled beef skewers with chips.",
                        price: 5500,
                        currency: "RWF",
                        tags: ["signature", "popular"],
                        allergens: [],
                        isAvailable: true,
                        addons: []
                    }
                ]
            }
        ]
    }
};

export function getMenuByVenueId(venueId: string) {
    return DEMO_MENUS[venueId as keyof typeof DEMO_MENUS];
}

export function getItemById(itemId: string) {
    for (const menu of Object.values(DEMO_MENUS)) {
        for (const cat of menu.categories) {
            const item = cat.items.find(i => i.itemId === itemId);
            if (item) return item;
        }
    }
    return null;
}
