import { Button } from '@dinein/ui'
import { Link } from 'react-router-dom'
import { useVenueContext } from '../context/VenueContext'

interface StickyCartPillProps {
    itemCount: number
    total: number
    currency: string
}

export function StickyCartPill({ itemCount, total, currency }: StickyCartPillProps) {
    const { venue } = useVenueContext()

    if (itemCount === 0 || !venue) return null

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <Link to={`/v/${venue.slug}/cart`} className="w-full max-w-md">
                <Button
                    variant="default"
                    size="lg"
                    className="w-full justify-between shadow-xl py-6 rounded-2xl"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                            {itemCount}
                        </div>
                        <span>View Cart</span>
                    </div>
                    <div className="font-bold">
                        {currency} {total.toLocaleString()}
                    </div>
                </Button>
            </Link>
        </div>
    )
}
