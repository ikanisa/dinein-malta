import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Spinner } from '../components/Loading';
import { BarSearchStep } from '../components/bar/BarSearchStep';
import { BarDetailsStep } from '../components/bar/BarDetailsStep';
import { MenuUploadStep } from '../components/bar/MenuUploadStep';
import { MenuReviewStep } from '../components/bar/MenuReviewStep';
import {
    createBar,
    bulkCreateMenuItems,
    linkUserToVendor,
    enrichBarProfile,
} from '../services/barService';
import { Venue, MenuItem } from '../types';
import toast from 'react-hot-toast';

type OnboardingStep = 'search' | 'details' | 'upload' | 'review' | 'complete';

interface BarData {
    name: string;
    momoCode: string;
    whatsapp: string;
    country: string;
    address: string;
}

const BarOnboarding: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<OnboardingStep>('search');
    const [_selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [barData, setBarData] = useState<BarData | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [_createdVenueId, setCreatedVenueId] = useState<string | null>(null);

    // Step 1: Search or select existing bar
    const handleSelectVenue = (venue: Venue) => {
        setSelectedVenue(venue);
        setBarData({
            name: venue.name,
            momoCode: '',
            whatsapp: venue.whatsappNumber || '',
            country: 'MT',
            address: venue.address || '',
        });
        setStep('details');
    };

    const handleAddNew = () => {
        setSelectedVenue(null);
        setStep('details');
    };

    // Step 2: Bar details form
    const handleDetailsSubmit = (data: BarData) => {
        setBarData(data);
        setStep('upload');
    };

    // Step 3: Menu upload
    const handleMenuExtracted = (items: MenuItem[]) => {
        setMenuItems(items);
        setStep('review');
    };

    const handleSkipMenu = () => {
        setMenuItems([]);
        handleFinalSubmit([]);
    };

    // Step 4: Menu review
    const handleMenuConfirmed = (items: MenuItem[]) => {
        setMenuItems(items);
        handleFinalSubmit(items);
    };

    // Final submission
    const handleFinalSubmit = async (finalMenuItems: MenuItem[]) => {
        if (!barData) return;

        setIsSubmitting(true);
        setStep('complete');

        try {
            // 1. Create the bar
            const venue = await createBar({
                name: barData.name,
                momoCode: barData.momoCode,
                whatsapp: barData.whatsapp,
                country: barData.country,
                address: barData.address,
            });

            setCreatedVenueId(venue.id);

            // 2. Link current user to vendor as owner
            await linkUserToVendor(venue.id);

            // 3. Create menu items if any
            if (finalMenuItems.length > 0) {
                await bulkCreateMenuItems(venue.id, finalMenuItems);
            }

            // 4. Enrich profile with AI (async, don't wait)
            enrichBarProfile(barData.name, barData.address).catch(console.error);

            setIsSubmitting(false);
            toast.success('Your bar has been registered!');
        } catch (error) {
            console.error('Onboarding failed:', error);
            toast.error('Failed to complete registration. Please try again.');
            setIsSubmitting(false);
            setStep('review');
        }
    };

    const handleGoToDashboard = () => {
        navigate('/manager/live');
    };

    // Progress indicator
    const getProgress = () => {
        switch (step) {
            case 'search':
                return 1;
            case 'details':
                return 2;
            case 'upload':
                return 3;
            case 'review':
                return 4;
            case 'complete':
                return 5;
            default:
                return 1;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-8 pt-safe-top">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-glass border-b border-glassBorder backdrop-blur-xl">
                <div className="px-6 pt-12 pb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (step === 'search') {
                                    navigate(-1);
                                } else if (step === 'details') {
                                    setStep('search');
                                } else if (step === 'upload') {
                                    setStep('details');
                                } else if (step === 'review') {
                                    setStep('upload');
                                }
                            }}
                            className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-foreground active:scale-95 transition-transform"
                            aria-label="Go back"
                        >
                            ←
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-foreground">Join as a Bar</h1>
                            <p className="text-xs text-muted">Step {getProgress()} of 5</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-1 bg-surface-highlight rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                            style={{ width: `${(getProgress() / 5) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-6">
                {step === 'search' && (
                    <BarSearchStep onSelect={handleSelectVenue} onAddNew={handleAddNew} />
                )}

                {step === 'details' && (
                    <BarDetailsStep
                        initialData={barData || undefined}
                        onSubmit={handleDetailsSubmit}
                        onBack={() => setStep('search')}
                    />
                )}

                {step === 'upload' && (
                    <MenuUploadStep
                        onComplete={handleMenuExtracted}
                        onBack={() => setStep('details')}
                        onSkip={handleSkipMenu}
                    />
                )}

                {step === 'review' && (
                    <MenuReviewStep
                        items={menuItems}
                        onComplete={handleMenuConfirmed}
                        onBack={() => setStep('upload')}
                    />
                )}

                {step === 'complete' && (
                    <div className="space-y-6">
                        {isSubmitting ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Spinner className="w-8 h-8" />
                                <p className="mt-4 text-foreground font-medium">Setting up your bar...</p>
                                <p className="text-sm text-muted">This may take a moment</p>
                            </div>
                        ) : (
                            <>
                                {/* Success State */}
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">
                                        You&apos;re All Set!
                                    </h2>
                                    <p className="text-muted">
                                        Your bar has been registered successfully
                                    </p>
                                </div>

                                <GlassCard className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl">
                                            🍺
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{barData?.name}</h3>
                                            <p className="text-sm text-muted">{barData?.address}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted">Menu items</span>
                                            <span className="text-foreground font-medium">{menuItems.length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted">WhatsApp</span>
                                            <span className="text-foreground font-medium">{barData?.whatsapp}</span>
                                        </div>
                                        {barData?.momoCode && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted">MOMO Code</span>
                                                <span className="text-foreground font-medium">{barData.momoCode}</span>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>

                                {/* What's Next */}
                                <GlassCard>
                                    <h3 className="font-bold text-foreground mb-3">What&apos;s Next?</h3>
                                    <ul className="space-y-2 text-sm text-muted">
                                        <li className="flex items-start gap-2">
                                            <span>✅</span>
                                            <span>Your bar is now visible to customers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span>📱</span>
                                            <span>Customers can scan QR codes to order</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span>🔔</span>
                                            <span>You&apos;ll receive orders in your dashboard</span>
                                        </li>
                                    </ul>
                                </GlassCard>

                                {/* CTA */}
                                <button
                                    onClick={handleGoToDashboard}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                                >
                                    Go to Dashboard →
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarOnboarding;
