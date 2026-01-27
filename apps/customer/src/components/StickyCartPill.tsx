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
        <div className="fixed bottom-[5.5rem] left-0 right-0 z-50 flex justify-center px-4 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
            <Link to={`/v/${venue.slug}/cart`} className="w-full max-w-md pointer-events-auto">
                <Button
                    variant="default"
                    size="lg"
                    className="w-full justify-between shadow-glass-lg py-6 rounded-2xl border-t border-white/20 ring-1 ring-black/5"
                    data-testid="cart:pill"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-xs font-bold backdrop-blur-sm">
                            {itemCount}
                        </div>
                        <span className="font-bold text-base tracking-tight">View Cart</span>
                    </div>
                    <div className="font-bold font-mono tracking-tighter text-lg opacity-90">
                        {currency} {total.toLocaleString()}
                    </div>
                </Button>
            </Link>
        </div>
    )
}
