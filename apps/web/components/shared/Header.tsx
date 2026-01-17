import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
                <Link className="flex items-center gap-2 font-bold text-xl" href="/">
                    DineOrDash
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/venues">
                        Venues
                    </Link>
                    <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/about">
                        About
                    </Link>
                    <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/dashboard">
                        Dashboard
                    </Link>
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
