import { X, QrCode, Camera } from 'lucide-react';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan?: (venueSlug: string, tableCode: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
    if (!isOpen) return null;

    const handleTestScan = () => {
        // Demo: Navigate to a test venue
        onScan?.('la-petite-maison', 'T001');
        onClose();
    };

    return (
        <div className="qr-scanner-overlay animate-fade-in">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
                <button
                    onClick={onClose}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-lg active:scale-95 transition-transform"
                >
                    <X className="w-7 h-7 text-white" />
                </button>
            </div>

            {/* Scanner Frame */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="qr-scanner-frame">
                    {/* Scan animation line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-scan" />

                    {/* Corner frames */}
                    <div className="qr-scanner-corner qr-scanner-corner--tl" />
                    <div className="qr-scanner-corner qr-scanner-corner--tr" />
                    <div className="qr-scanner-corner qr-scanner-corner--bl" />
                    <div className="qr-scanner-corner qr-scanner-corner--br" />

                    {/* Camera icon placeholder */}
                    <Camera className="absolute inset-0 m-auto w-20 h-20 text-white/40" />
                </div>
            </div>

            {/* Instructions */}
            <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <QrCode className="w-5 h-5 text-white/70" />
                    <p className="text-white/90 text-lg">Point at venue QR code</p>
                </div>

                {/* Demo button */}
                <button
                    onClick={handleTestScan}
                    className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold shadow-2xl active:scale-95 transition-transform"
                >
                    Test Scan
                </button>

                <p className="text-white/50 text-sm mt-4">
                    Scan a table QR code to start ordering
                </p>
            </div>
        </div>
    );
}
