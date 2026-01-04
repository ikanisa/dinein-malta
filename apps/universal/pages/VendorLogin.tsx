import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';

const VendorLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative flex flex-col px-6 overflow-hidden transition-colors duration-500">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        {/* The gradient fades from the background color (opaque) to transparent, blending the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
        
        {/* Subtle animated glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 flex-1 flex flex-col justify-end pb-12 w-full max-w-md mx-auto animate-slide-up">
            
            {/* Brand Header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-highlight border border-border backdrop-blur-md mb-4 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Vendor Portal</span>
                </div>
                <h1 className="text-5xl font-bold text-foreground tracking-tighter mb-3 leading-[1.1]">
                    Run your <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">venue smarter.</span>
                </h1>
                <p className="text-muted text-lg max-w-xs font-medium leading-relaxed">
                    Automated menu management and live orders for the best spots.
                </p>
            </div>

            {/* Action Card */}
            <GlassCard className="p-2 bg-glass border-glassBorder backdrop-blur-xl shadow-2xl">
                <div className="p-4 space-y-4">
                     {/* Login Button */}
                    <button 
                        onClick={() => navigate('/vendor-dashboard/orders')}
                        className="w-full py-4 bg-surface-highlight hover:bg-black/5 dark:hover:bg-white/10 border border-border text-foreground font-bold rounded-xl transition-all active:scale-[0.98] flex justify-between items-center px-6 group"
                    >
                        <span>Access Dashboard</span>
                        <span className="text-muted group-hover:text-foreground transition-colors">→</span>
                    </button>

                    {/* Register Button - Primary */}
                    <button 
                        onClick={() => navigate('/vendor-onboarding')}
                        className="w-full py-4 bg-foreground text-background font-bold rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                    >
                        Register New Venue
                    </button>
                </div>

                {/* Features Mini-Grid */}
                <div className="grid grid-cols-3 gap-2 mt-2 px-2 pb-2">
                    <FeatureItem icon="🔔" label="Live Orders" />
                    <FeatureItem icon="✨" label="Smart Menu" />
                    <FeatureItem icon="🏁" label="Tables" />
                </div>
            </GlassCard>

            <button onClick={() => navigate('/')} className="mt-8 text-center text-muted text-xs font-medium hover:text-foreground transition-colors">
                Not a vendor? Open Customer App
            </button>
        </div>
    </div>
  );
};

const FeatureItem = ({ icon, label }: { icon: string, label: string }) => (
    <div className="bg-surface-highlight rounded-lg p-3 flex flex-col items-center justify-center text-center gap-1 border border-border hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <span className="text-xl filter drop-shadow-md">{icon}</span>
        <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{label}</span>
    </div>
);

export default VendorLogin;