import { createClient } from "@/lib/supabase/server"
import { VenueDetails } from "@/components/venue/VenueDetails"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params

    const supabase = await createClient()
    const { data: venue } = await supabase
        .from("vendors")
        .select("name, description")
        .eq("slug", slug)
        .single()

    if (!venue) {
        return { title: "Venue Not Found" }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const venueData = venue as any

    return {
        title: `${venueData.name} | DineOrDash`,
        description: venueData.description,
    }
}

export default async function VenuePage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: venue, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("slug", slug)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const venueData = venue as any

    if (error || !venueData) {
        notFound()
    }

    // Cast venue features/cuisine_types if needed or rely on robust types
    return (
        <div className="container py-8 px-4 md:px-6">
            <VenueDetails venue={venueData} />
        </div>
    )
}
