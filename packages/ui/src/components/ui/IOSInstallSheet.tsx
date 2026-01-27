import { Share, Plus, X } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'

const IOS_A2HS_DISMISSED_KEY = 'dinein-ios-a2hs-dismissed'
const IOS_A2HS_COOLDOWN_DAYS = 7

interface IOSInstallSheetProps {
    isOpen: boolean
    onClose: () => void
    appName?: string
}

/**
 * iOS Safari A2HS fallback instructions.
 * Shows a bottom sheet with step-by-step instructions to add the app to home screen.
 * Respects a 7-day cooldown after dismissal.
 */
export function IOSInstallSheet({
    isOpen,
    onClose,
    appName = 'DineIn'
}: IOSInstallSheetProps) {
    const handleClose = () => {
        // Set cooldown on dismiss
        try {
            localStorage.setItem(IOS_A2HS_DISMISSED_KEY, Date.now().toString())
        } catch {
            // Ignore localStorage errors
        }
        onClose()
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={handleClose} title={`Add ${appName} to Home Screen`}>
            <div className="space-y-6 pb-4">
                {/* Introduction */}
                <p className="text-sm text-muted-foreground">
                    Install {appName} on your iPhone for the best experience with quick access from your home screen.
                </p>

                {/* Steps */}
                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Share className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">1. Tap the Share button</p>
                            <p className="text-sm text-muted-foreground">
                                At the bottom of Safari (or top on iPad)
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">2. Tap "Add to Home Screen"</p>
                            <p className="text-sm text-muted-foreground">
                                Scroll down in the share menu if needed
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-lg font-bold text-primary">✓</span>
                        </div>
                        <div>
                            <p className="font-medium">3. Tap "Add"</p>
                            <p className="text-sm text-muted-foreground">
                                {appName} will appear on your home screen
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dismiss button */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                >
                    <X className="mr-2 h-4 w-4" />
                    Maybe Later
                </Button>
            </div>
        </BottomSheet>
    )
}

/**
 * Check if iOS A2HS sheet is in cooldown period
 */
export function isIOSA2HSInCooldown(): boolean {
    try {
        const dismissed = localStorage.getItem(IOS_A2HS_DISMISSED_KEY)
        if (!dismissed) return false
        const dismissedAt = parseInt(dismissed, 10)
        const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
        return daysSince < IOS_A2HS_COOLDOWN_DAYS
    } catch {
        return false
    }
}
