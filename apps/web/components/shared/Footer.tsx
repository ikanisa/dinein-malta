export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6">
            <div className="container flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row md:px-6">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                    © {new Date().getFullYear()} DineIn Inc. All rights reserved.
                </p>
                <nav className="flex gap-4 text-sm text-muted-foreground">
                    <a href="#" className="hover:underline">Terms</a>
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Contact</a>
                </nav>
            </div>
        </footer>
    )
}
