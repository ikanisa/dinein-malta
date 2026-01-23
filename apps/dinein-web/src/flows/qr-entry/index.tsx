import { QRMenuView } from './QRMenuView';

export default function QREntryFlow() {
    // Simple routing for /m/:venue/:table
    const path = window.location.pathname;
    const match = path.match(/\/m\/([^/]+)\/([^/]+)/);

    if (!match) {
        return (
            <div className="p-8 text-center text-gray-500 font-sans">
                <h1 className="text-xl font-bold mb-2">Invalid Code</h1>
                <p>Please scan a valid table QR code.</p>
            </div>
        );
    }

    const [, venueSlug, tableCode] = match;

    return <QRMenuView venueSlug={venueSlug} tableCode={tableCode} />;
}
