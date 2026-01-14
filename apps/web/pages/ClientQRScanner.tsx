import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';

/**
 * QR Scanner Page
 * Allows clients to scan a QR code at a bar to access the venue's menu directly.
 * QR codes should encode URLs like: dinein.app/menu/{venueId}
 */
const ClientQRScanner = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scanning, setScanning] = useState(false);

    // Start camera on mount
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                    setScanning(true);
                }
            } catch (err) {
                console.error('Camera access denied:', err);
                setError('Camera access denied. You can enter the venue code manually below.');
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Scan QR codes from video stream
    useEffect(() => {
        if (!scanning || !videoRef.current) return;

        let animationId: number;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scan = async () => {
            if (!videoRef.current || !ctx || videoRef.current.readyState !== 4) {
                animationId = requestAnimationFrame(scan);
                return;
            }

            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            try {
                // Use BarcodeDetector API if available (modern browsers)
                if ('BarcodeDetector' in window) {
                    const barcodeDetector = new (window as any).BarcodeDetector({
                        formats: ['qr_code']
                    });
                    const barcodes = await barcodeDetector.detect(canvas);

                    if (barcodes.length > 0) {
                        const rawValue = barcodes[0].rawValue;
                        handleQRCode(rawValue);
                        return;
                    }
                }
            } catch (err) {
                // BarcodeDetector not supported or failed, continue scanning
            }

            animationId = requestAnimationFrame(scan);
        };

        scan();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [scanning]);

    const handleQRCode = (rawValue: string) => {
        setScanning(false);

        // Parse the QR code URL to extract venue ID
        // Expected formats:
        // - https://dinein.app/menu/{venueId}
        // - /menu/{venueId}
        // - {venueId} (direct ID)

        let venueId = rawValue;

        // Try to extract from URL
        const menuMatch = rawValue.match(/\/menu\/([a-zA-Z0-9-]+)/);
        if (menuMatch) {
            venueId = menuMatch[1];
        } else if (rawValue.startsWith('http')) {
            // Try to get last path segment
            const url = new URL(rawValue);
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                venueId = pathParts[pathParts.length - 1];
            }
        }

        // Navigate to the venue menu
        navigate(`/menu/${venueId}`);
    };

    const handleManualSubmit = () => {
        if (manualInput.trim()) {
            handleQRCode(manualInput.trim());
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col pt-safe-top">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pt-4 pb-3 bg-glass border-b border-glassBorder backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-foreground active:scale-95 transition-transform"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Scan QR Code</h1>
                        <p className="text-xs text-muted">Point at a bar's QR code to view their menu</p>
                    </div>
                </div>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {cameraActive ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl" />
                                {scanning && (
                                    <div className="absolute inset-x-0 top-0 h-1 bg-primary-500 animate-scan-line" />
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <span className="text-6xl mb-4 block">📷</span>
                            <p className="text-muted">
                                {error || 'Starting camera...'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Entry */}
            <div className="px-4 py-6 pb-safe-bottom bg-surface border-t border-border">
                <GlassCard className="bg-surface-highlight">
                    <p className="text-sm text-muted mb-3">Or enter venue code manually:</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Enter venue ID or URL"
                            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-primary-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                        />
                        <button
                            onClick={handleManualSubmit}
                            className="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl active:scale-95 transition-transform"
                        >
                            Go
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* Scan line animation style */}
            <style>{`
        @keyframes scan-line {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(256px); opacity: 0.5; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default ClientQRScanner;
