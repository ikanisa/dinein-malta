export default function PrivacyPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
            <p>We respect your privacy and process data in accordance with GDPR.</p>
        </div>
    )
}
