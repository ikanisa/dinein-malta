export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold">DineIn Malta - Legal</h1>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 max-w-4xl prose dark:prose-invert">
                {children}
            </main>
            <footer className="border-t mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} DineIn Malta. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
