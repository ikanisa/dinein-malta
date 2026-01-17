import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from 'next/image'
import { Sparkles } from "lucide-react"

export interface MenuItemData {
    id: string
    name: string
    description?: string | null
    price?: number | null
    currency?: string | null
    image_url?: string | null
    category?: string | null // Added missing field
    dietary_tags?: string[] | null
    is_available?: boolean | null
}

export interface MenuItemAITags {
    dietary?: string[];
    flavor?: string;
}

interface MenuItemProps {
    item: MenuItemData
    aiTags?: MenuItemAITags
}

export function MenuItem({ item, aiTags }: MenuItemProps) {
    return (
        <Card className={`overflow-hidden h-full flex flex-col ${!item.is_available ? 'opacity-60' : ''}`}>
            {item.image_url && (
                <div className="w-full">
                    <AspectRatio ratio={4 / 3}>
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </AspectRatio>
                </div>
            )}
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <span className="font-semibold whitespace-nowrap">
                        {item.price ? `${new Intl.NumberFormat('en-RW', { style: 'currency', currency: item.currency || 'RWF' }).format(item.price)}` : 'Price on request'}
                    </span>
                </div>
                {item.description && (
                    <CardDescription className="line-clamp-2">
                        {item.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="p-4 pt-0 mt-auto space-y-2">
                {/* Default Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                    {item.dietary_tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* AI Tags */}
                {aiTags && (
                    <div className="flex flex-wrap gap-1 border-t pt-2">
                        {aiTags.flavor && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {aiTags.flavor}
                            </Badge>
                        )}
                        {aiTags.dietary?.map(tag => (
                            // Avoid duplicates if already in default tags
                            !item.dietary_tags?.includes(tag) && (
                                <Badge key={`ai-${tag}`} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {tag}
                                </Badge>
                            )
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
