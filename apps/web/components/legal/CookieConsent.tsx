"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent")
        if (!consent) setIsVisible(true)
    }, [])

    const accept = () => {
        localStorage.setItem("cookie-consent", "true")
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 w-full p-4 bg-background border-t shadow-lg z-50 flex justify-between items-center">
            <p className="text-sm">We use cookies. <Link href="/legal/privacy" className="underline">Learn more</Link>.</p>
            <button onClick={accept} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
                Accept
            </button>
        </div>
    )
}
