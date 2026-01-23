import { createClient } from "@/lib/supabase/server"
import { VenueGrid } from "@/components/venue/VenueGrid"

export const metadata = {
  title: "DineIn - Discover Best Bars & Restaurants",
  description: "Find the best venues in your country.",
}

// Mock country selection for now since we don't have a country column yet
// This ensures the logic is in place for when the schema is updated.
const DEFAULT_COUNTRY = "Rwanda";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }> // Next.js 15+ searchParams is async
}) {
  const { country = DEFAULT_COUNTRY } = await searchParams; // Await the params

  const supabase = await createClient()

  // Future: .eq('country', country)
  const { data: venues } = await supabase
    .from("vendors")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8 bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-950/20">
        <div className="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Discover {country}'s Finest
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Explore to-rated bars and restaurants. Curated experiences, just for you.
            </p>
            {/* Placeholder for Country Selector */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-not-allowed opacity-80" title="Country selection coming soon">
                Region: {country} ▾
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="container mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Trending Venues</h2>
          <span className="text-sm text-muted-foreground">{venues?.length || 0} results</span>
        </div>

        <VenueGrid venues={venues || []} />
      </div>
    </main>
  );
}
