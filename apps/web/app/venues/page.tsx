import { createClient } from "@/lib/supabase/server"
import { VenueGrid } from "@/components/venue/VenueGrid"

export default async function VenuesPage() {
    const supabase = await createClient()
    const { data: venues } = await supabase
        .from("venues")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })

    return (
        <div className="container py-8 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Discover Venues</h1>
                <p className="text-muted-foreground">Find the best places tailored to your taste.</p>
            </div>

            <VenueGrid venues={venues || []} />
        </div>
    )
}
