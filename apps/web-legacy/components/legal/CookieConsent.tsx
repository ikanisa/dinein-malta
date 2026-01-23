"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem("cookie-consent")
        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const acceptCookies = () => {
        localStorage.setItem("cookie-consent", "true")
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 shadow-lg animate-in slide-in-from-bottom">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    <p>
                        We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.
                        <Link href="/legal/privacy" className="underline ml-1 hover:text-foreground">
                            Learn more
                        </Link>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={acceptCookies} size="sm">
                        Accept All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsVisible(false)}
                    >
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    )
}
