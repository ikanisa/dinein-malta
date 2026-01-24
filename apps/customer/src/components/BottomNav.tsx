import { Link, useLocation } from 'react-router-dom'
import { Home, Settings } from 'lucide-react'
import { Button } from '@dinein/ui'

interface BottomNavProps {
    /** Optional venue slug for contextual navigation */
    venueSlug?: string
    className?: string
}

/**
 * Bottom navigation component with exactly 2 tabs: Home + Settings
 * Per STARTER RULES: Customer bottom nav = EXACTLY 2 items
 */
export function BottomNav({ venueSlug, className = '' }: BottomNavProps) {
    const location = useLocation()
    
    const isHome = location.pathname === '/' || location.pathname === '/home'
    const isSettings = location.pathname === '/settings' || location.pathname.endsWith('/settings')
    
    // Navigate to venue context if we're in a venue flow, otherwise root
    const homeHref = venueSlug ? `/v/${venueSlug}` : '/'
    const settingsHref = venueSlug ? `/v/${venueSlug}/settings` : '/settings'

    return (
        <nav 
            className={`fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 grid grid-cols-2 gap-2 safe-area-pb ${className}`}
            role="navigation"
            aria-label="Main navigation"
        >
            <Link to={homeHref} className="w-full">
                <Button 
                    variant="ghost" 
                    className={`w-full flex-col h-16 gap-1 rounded-xl ${isHome ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground'}`}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-xs">Home</span>
                </Button>
            </Link>
            <Link to={settingsHref} className="w-full">
                <Button 
                    variant="ghost" 
                    className={`w-full flex-col h-16 gap-1 rounded-xl ${isSettings ? 'bg-secondary/50 text-foreground' : 'text-muted-foreground'}`}
                >
                    <Settings className="h-6 w-6" />
                    <span className="text-xs">Settings</span>
                </Button>
            </Link>
        </nav>
    )
}
