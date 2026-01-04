import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';

const DeveloperSwitchboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center space-y-8 animate-fade-in bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Developer View</h1>
        <p className="text-muted">Switch between personas</p>
      </div>

      <div className="grid gap-6 w-full max-w-sm">
        {/* Client App */}
        <button 
          onClick={() => navigate('/')} 
          className="group relative overflow-hidden rounded-2xl p-1 transition-transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity" />
          <GlassCard className="relative bg-surface hover:bg-surface-highlight h-32 flex flex-col items-center justify-center border-blue-500/30">
            <span className="text-4xl mb-2">📱</span>
            <span className="font-bold text-xl text-blue-500">Client App</span>
            <span className="text-xs text-muted">Order, Browse, Pay</span>
          </GlassCard>
        </button>

        {/* Vendor App */}
        <button 
          onClick={() => navigate('/vendor-login')} 
          className="group relative overflow-hidden rounded-2xl p-1 transition-transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity" />
          <GlassCard className="relative bg-surface hover:bg-surface-highlight h-32 flex flex-col items-center justify-center border-pink-500/30">
            <span className="text-4xl mb-2">🏪</span>
            <span className="font-bold text-xl text-pink-500">Vendor Portal</span>
            <span className="text-xs text-muted">Manage Menu, Orders, QRs</span>
          </GlassCard>
        </button>

        {/* Admin App */}
        <button 
          onClick={() => navigate('/admin-login')} 
          className="group relative overflow-hidden rounded-2xl p-1 transition-transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-10 group-hover:opacity-20 transition-opacity" />
          <GlassCard className="relative bg-surface hover:bg-surface-highlight h-32 flex flex-col items-center justify-center border-red-500/30">
            <span className="text-4xl mb-2">🛡️</span>
            <span className="font-bold text-xl text-red-500">Admin Portal</span>
            <span className="text-xs text-muted">System Management</span>
          </GlassCard>
        </button>
      </div>

      <div className="w-full max-w-sm">
        <h3 className="text-sm font-bold text-muted mb-2 uppercase tracking-wider">Quick Simulations</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/v/demo-venue/t/T12-DEMO')}
            className="p-3 bg-surface-highlight rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors border border-border"
          >
            🚀 Scan Table 12
            <div className="text-[10px] text-muted">Liquid Glass Bar</div>
          </button>
           <button 
            onClick={() => navigate('/vendor-onboarding')}
            className="p-3 bg-surface-highlight rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors border border-border"
          >
            ✨ New Vendor Flow
            <div className="text-[10px] text-muted">Auto Onboarding</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSwitchboard;