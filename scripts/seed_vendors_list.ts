
import { createClient } from '@supabase/supabase-js';

// Hardcoded for reliable script execution
const supabaseUrl = 'https://elhlcdiosomutugpneoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNTc1MywiZXhwIjoyMDc0NDgxNzUzfQ.INeWgLyQetYUZGQYiVx7GCB7fREKypaOfy-XEMhYi6A';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const RAW_DATA = `MT	1926 La Plage
MT	67 Kapitali
MT	9 Ball Cafe
MT	Acqua
MT	Agliolio
MT	AKI
MT	Angela's Valletta
MT	Aqualuna
MT	Babel
MT	Barracuda Restaurant
MT	Barracuda Rooftop Lounge
MT	Bayside Restaurant
MT	Bayview Seafood House
MT	Beati Paoli Restaurant
MT	Bellavia Ristorante Italiano
MT	Big G's Snack Bar
MT	Black Gold Saloon
MT	Blu Beach Club
MT	Blu Beach Club
MT	Bognor Bar & Restaurant
MT	Brigantine lounge bar
MT	Burgers.Ink
MT	Bus Stop Lounge
MT	Cafe society
MT	Caviar & Bull
MT	City of London Bar
MT	Cork's
MT	Crafty cat
MT	CUBA Restaurant, Shoreline Mall, Kalkara
MT	Dolce Sicilia Paceville
MT	Don Royale
MT	Era Ora Steakhouse
MT	Felice Brasserie
MT	Focacceria Dal Pani
MT	Fresco's
MT	Gandhi Tandoori
MT	Giorgio's
MT	Giuseppi's Bar & Bistro
MT	Gnejna kiosk
MT	Gourmet Bar & Grill
MT	Gourmet Fish & Grill
MT	Gozitan Restaurant
MT	Great Dane Restaurant
MT	Hammett's Mestizo
MT	Hatter bars: crafty cat, hoppy hare, rabbit hole, the hatter
MT	Ħelu Manna Gluten Free Kafeterija Val
MT	Henry J. Bean's
MT	Hoppy hare
MT	Hot Shot Bar
MT	Hugo's Terrace & Rooftop
MT	Il Galeone
MT	Il-Gabbana
MT	Intercontinental Beach Bar
MT	Ivy House
MT	Jungle
MT	Jungle Joy Bar - Restaurant
MT	Kaiseki
MT	King’s Gate Gastropub
MT	kings pub
MT	l-Fortizza
MT	L' Ostricaio Paceville, St. Julians
MT	L'Aroma - Meltingpot
MT	La bitters
MT	La Buona Trattoria del Nonno
MT	LA LUZ
MT	La Pira Maltese Kitchen
MT	La Sfoglia
MT	Lady Di
MT	Le Bistro
MT	Little Argentina
MT	LOA
MT	Lou’s Bistro
MT	Lubelli
MT	Malta Chocolate Factory
MT	Mamma Mia Restaurant
MT	Marina Terrace
MT	Mason's Cafe
MT	Maxima Bar & Restaurant
MT	MedAsia Fusion Lounge
MT	MedAsia Playa
MT	Mina's
MT	Mojitos Beach Terrace
MT	Munchies franchise
MT	Munchies Mellieha Bay
MT	MUŻA Restaurant
MT	NAAR Restobar
MT	Nine Lives
MT	NOM NOM Paceville
MT	Ocean Basket
MT	Opa! Mediterranean Fusion
MT	Open Waters
MT	Osteria Tropea
MT	Ostrica
MT	Paparazzi restaurants
MT	Paradise Exiles
MT	Paranga
MT	Paul's Bistro
MT	Paul's Bistro
MT	Peppermint
MT	Peppi's Restaurant
MT	Piadina Caffe
MT	Piatto Nero Mediterranean Restaurant
MT	Piccolo Padre
MT	Port 21 Restaurant
MT	Punto Bar & Dine
MT	Rabbit hole
MT	Salia Restaurant - Mellieha
MT	San Giovanni Valletta
MT	Sandy Waters
MT	Seaside Kiosk
MT	Sharma Ethnic Cuisines
MT	Shaukiwan
MT	simenta restaurant
MT	Singita restaurant
MT	Singita Restaurant
MT	Soul Food
MT	StrEat
MT	Suki Asian Snacks
MT	Ta' Kolina
MT	Tanti Cafe Grill
MT	Tavio's Pepe Nero
MT	Thalassalejn Boċċi Club
MT	The Black Pearl
MT	The Black Sheep drink and dine
MT	The Brew Grill & Brewery
MT	The Bridge
MT	The Capitol City Bar
MT	The Chapels Gastrobrewpub
MT	The Compass Lounge
MT	The Crafty Cat Pub
MT	The Dragon Chinese restaurant
MT	The Dubliner
MT	THE EVEREST /NEPALESE & INDIAN RE
MT	The Exiles Beach Club
MT	The Game & Ale Pub ( by Crust )
MT	The hatter
MT	The Londoner Pub Sliema
MT	The Long Hall Irish Pub
MT	The Ordnance Pub & Restaurant
MT	The Road Devil Sea Front
MT	The Sea Cloud I Cocktail & Wine Bar
MT	The Watson's Pub & Diner
MT	Tico Tico
MT	Tiffany Lounge Restaurant
MT	Tiffany's Bistro
MT	Tigne Beach Club
MT	Tortuga
MT	Trattoria da Nennella
MT	Trattoria del Mare - Malta Restaurant
MT	U Bistrot
MT	Vecchia Napoli @ Salini Resort, Naxxar
MT	Vecchia Napoli Mellieha
MT	Vecchia Napoli Qawra
MT	Ventuno Restaurant
MT	Venus Restaurant Bugibba
MT	Victoria bar
MT	Victoria Gastropub
MT	Vinnies
MT	White Bridge
MT	White tower lido
MT	White Wine And Food
MT	Wild Honey Beer House & Bistro
MT	Wok to Walk
MT	Woodhut Pub & Diner
MT	Xemxija Pitstop
MT	Zizka
MT	Zion Reggae Bar
RW	AFTER PARTY BAR & GRILL
RW	Agence Pub
RW	ALEX COME AGAIN BAR KICUKIRO BRANCH
RW	Amahumbezi Pub
RW	Antonov Bar
RW	Astro Bar & Restaurant
RW	B Flex Bar
RW	Bahamas Pub
RW	Bar Dolce
RW	Bar Filao
RW	Bar Nyenyeri
RW	Billy's Bistro & Bar
RW	Blackstone Lounge Kigali
RW	Bodega and Brew Kacyiru
RW	Burrows Bar & Restaurant
RW	Cafe Restaurant Olympiade
RW	Carpe Diem Bistro
RW	CARRINGTON Resto-Bar
RW	Chez Guiness Bar
RW	Chez John Restaurant
RW	Chez Kiruhura
RW	Cincinnati Bar & Grill
RW	CKYC Lounge
RW	Click Bar
RW	Cocobean
RW	Come Again Bar & Resto Giporoso
RW	Come Again, Kicukiro
RW	Continental restaurant
RW	Copenhagen Lounge
RW	CRYSTAL LOUNGE - Rooftop Restaurant & Bar
RW	Déjà Vu
RW	East 24 Bar & Grill
RW	Emerald Cafe and Restaurant, Remera
RW	Four Points by Sheraton Kigali
RW	Gorillas Golf Hotel
RW	Grand Legacy Hotel
RW	Great Wall Chinese Restaurant
RW	Green Corner
RW	H2O Lounge
RW	Happy Park
RW	HAVANA BAR AND RESTO
RW	Heroes Lounge
RW	Hôtel Chez Lando
RW	Hôtel des Mille Collines
RW	Hotel Villa Portofino Kigali
RW	HQ LOUNGE
RW	Inzozi Africa House B&B
RW	Jollof Kigali
RW	Juru Garden Bar
RW	Kari-Beau Restaurant
RW	Kigali Diplomat Hotel
RW	Kigali Marriott Hotel
RW	Kigali Serena Hotel
RW	Kigali Sport Bar
RW	Kiruhura Disque Orange
RW	La Sanitas
RW	Lemigo Hotel
RW	Maestro Kitchen
RW	Maison Noire Bar & Restaurant
RW	Maracana Rwanda
RW	Meze Fresh
RW	Missed Call Pub
RW	Nobleza Hotel
RW	Onomo Hotel
RW	Oyster Bar & Grill
RW	Paddock Bar
RW	Park Inn by Radisson Kigali
RW	Pili Pili
RW	Plus 250
RW	Quelque Part Resto Bar
RW	RELAX BAR & GRILL
RW	Repub Lounge
RW	Resto-Bar Chez John Maradona
RW	Riders Lounge Kigali
RW	Rio de Gikondo Sport Bar & Accomodation
RW	Roasters CHOMAZONE Restaurant
RW	Rosty Club
RW	Sky Lounge
RW	Suka Bar & Café
RW	Sundowner
RW	Ten to Two Bar Resto
RW	The B Lounge
RW	THE BELLO RESTAURANT 
RW	The Green Lounge Bar & Restaurant
RW	The Grid Kigali
RW	The Manor Hotel
RW	The SkySports Lounge
RW	Torino Bar & Restaurant
RW	Tropical Bar-Restaurant-Rounge
RW	Ubumwe Grande Hotel
RW	Uncles Restaurant
RW	Urban by CityBlue, Kigali`;

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
};

async function seedVendors() {
    console.log('🌱 Starting Robust Vendor Seeding...');

    // 1. Parse Data
    const lines = RAW_DATA.split('\n');
    const vendors = new Map<string, any>(); // Use Map to deduplicate by slug

    let skippedCount = 0;

    for (const line of lines) {
        if (!line.trim()) continue;

        // Split by tab first, fallback to space if tab logic fails or specific format
        // The data seems to be "CC\tName"
        const parts = line.split('\t');
        let country = parts[0]?.trim();
        let name = parts[1]?.trim();

        if (!name) {
            // Fallback for lines that might be space separated?
            // User data looks tab separated "MT	1926 La Plage"
            console.warn('Skipping invalid line:', line);
            continue;
        }

        const slug = slugify(name);

        // Handle deduplication (case-insensitive name check effectively via slug)
        if (vendors.has(slug)) {
            skippedCount++;
            continue;
        }

        const currency = country === 'RW' ? 'RWF' : 'EUR';
        const address = country === 'RW' ? 'Kigali, Rwanda' : 'Valletta, Malta'; // Default address based on country

        vendors.set(slug, {
            name,
            slug,
            google_place_id: `manual-${slug}`, // Required constraint!
            country: country, // Actual column!
            address,
            // description: `Experience the best at ${name}.`, // Missing
            // currency: currency, // Missing, inferred from country
            status: 'active',
            revolut_link: 'dineintemp' // revolut_link not revolutHandle
            // tags: ['Bar', 'Restaurant'] // Tags column does not exist
        });
    }

    console.log(`Parsed ${vendors.size} unique vendors. Duplicates skipped: ${skippedCount}`);

    // 2. Batch Insert/Upsert
    const vendorArray = Array.from(vendors.values());

    // Process in chunks of 50 to match Supabase limits
    const chunkSize = 50;
    for (let i = 0; i < vendorArray.length; i += chunkSize) {
        const chunk = vendorArray.slice(i, i + chunkSize);

        const { error } = await supabase
            .from('vendors')
            .upsert(chunk, { onConflict: 'slug', ignoreDuplicates: false });

        if (error) {
            console.error(`Error Upserting Batch ${i / chunkSize + 1}:`, error);
        } else {
            console.log(`✅ Upserted batch ${i / chunkSize + 1} (${chunk.length} vendors)`);
        }
    }

    console.log('🎉 Vendor Seeding Complete!');
}

seedVendors().catch(console.error);
