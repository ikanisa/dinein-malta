import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 border-r bg-muted/40 hidden md:block">
                <div className="flex h-14 items-center border-b px-6 font-semibold">
                    Admin Panel
                </div>
                <nav className="p-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/dashboard">Overview</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/dashboard/venues">Venues</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/dashboard/menu-items">Menu Items</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/settings">Settings</Link>
                    </Button>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
