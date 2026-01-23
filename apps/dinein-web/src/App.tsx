import { Suspense, lazy } from 'react'

// Lazy load the flows
const QREntryFlow = lazy(() => import('./flows/qr-entry'))
const PWAHomeFlow = lazy(() => import('./flows/pwa-home'))

function App() {
    // Simple router based on URL
    const isQREntry = window.location.pathname.startsWith('/m/');

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            {isQREntry ? <QREntryFlow /> : <PWAHomeFlow />}
        </Suspense>
    )
}

export default App
