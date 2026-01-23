export default function TermsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

            <section>
                <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the DineIn Malta platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
                <p>
                    DineIn Malta provides a platform for users to discover restaurants, view menus, and facilitate food ordering. We act as an intermediary between customers and restaurant vendors.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
                <p>
                    To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">4. Ordering and Payments</h2>
                <p>
                    All orders placed through the platform are subject to acceptance by the respective vendor. Prices and availability are subject to change without notice.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
                <p>
                    DineIn Malta shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </p>
            </section>
        </div>
    )
}
