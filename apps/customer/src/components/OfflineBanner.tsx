/**
 * OfflineBanner - Displays when app is offline
 */

import { useSession } from '../context/SessionContext';
import './OfflineBanner.css';

export function OfflineBanner() {
    const { isOffline } = useSession();

    if (!isOffline) return null;

    return (
        <div className="offline-banner" role="alert">
            <span className="offline-icon">📶</span>
            <span className="offline-text">You're offline — some features are unavailable</span>
        </div>
    );
}

export default OfflineBanner;
