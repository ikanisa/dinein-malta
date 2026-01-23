import { createClient } from "@/lib/supabase/server"
import { MenuGrid } from "@/components/menu/MenuGrid"
import { notFound } from "next/navigation"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function VenueMenuPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Get venue first
    const { data: venue } = await supabase
        .from("vendors")
        .select("id, name, slug")
        .eq("slug", slug)
        .single()

    if (!venue) {
        notFound()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedVenue = venue as any

    // Get menu items
    const { data: items } = await supabase
        .from("menu_items")
        .select("*")
        .eq("vendor_id", typedVenue.id)
        .eq("is_available", true)
        .order("category")

    return (
        <div className="container py-8 px-4 md:px-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" asChild>
                    <Link href={`/venues/${typedVenue.slug}`}>← Back to Venue</Link>
                </Button>
                <h1 className="text-3xl font-bold">Menu at {typedVenue.name}</h1>
            </div>

            <MenuGrid
                items={items || []}
            />
        </div>
    )
}
