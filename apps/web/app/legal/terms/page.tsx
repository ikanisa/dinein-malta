export default function TermsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
            <p>By using DineIn Malta, you agree to these terms.</p>
        </div>
    )
}
