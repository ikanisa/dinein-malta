import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MenuChatWidget } from "@/components/chat/MenuChatWidget"

interface LayoutProps {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}

export default async function VenueLayout({ children, params }: LayoutProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch venue and menu items for context
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

    const { data: menuData } = await supabase
        .from("menu_items")
        .select("name, description, price, currency, category, dietary_tags")
        .eq("vendor_id", typedVenue.id)
        .eq("is_available", true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (menuData || []) as any[]

    // Serialize menu context for AI
    const menuContext = items
        ? items.map(i =>
            `${i.name} (${i.category}): ${i.description || ''} - ${i.price} ${i.currency || 'RWF'} [${i.dietary_tags?.join(', ') || ''}]`
        ).join('\n')
        : "No menu items available.";

    return (
        <div className="relative min-h-screen">
            {children}
            {/* Chat Widget injected here */}
            <MenuChatWidget venueName={typedVenue.name} menuContext={menuContext} />
        </div>
    )
}
