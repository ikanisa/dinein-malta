export default function PrivacyPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

            <section>
                <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                <p>
                    We collect information you provide directly to us, such as when you create an account, place an order, or communicate with us. This may include your name, email address, phone number, and payment information.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
                <p>
                    We use your information to facilitate orders, improve our services, communicate with you, and comply with legal obligations.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
                <p>
                    We share your order details with the restaurant vendors to fulfill your request. We do not sell your personal data to third parties.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">4. Your Rights</h2>
                <p>
                    Under GDPR, you have the right to access, correct, or delete your personal data. You may contact us to exercise these rights.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
                <p>
                    We use cookies to enhance your experience and analyze usage patterns. You can manage your cookie preferences through our cookie settings.
                </p>
            </section>
        </div>
    )
}
