import { useState } from 'react';
import { BottomNav } from '../../shared/components/BottomNav';
import { VenueDiscovery } from './VenueDiscovery';
import { Reservations } from './Reservations';
import { Favorites } from './Favorites';

type Tab = 'home' | 'discover' | 'reservations' | 'profile';

export default function PWAHomeFlow() {
    const [activeTab, setActiveTab] = useState<Tab>('home');

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden">
                {activeTab === 'home' && <HomeScreen onChangeTab={setActiveTab} />}
                {activeTab === 'discover' && <VenueDiscovery />}
                {activeTab === 'reservations' && <Reservations />}
                {activeTab === 'profile' && <Favorites />}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}

function HomeScreen({ onChangeTab }: { onChangeTab: (t: Tab) => void }) {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good Evening!</h1>
                    <p className="text-gray-500">Ready to dine in?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                    JB
                </div>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onChangeTab('discover')}
                    className="bg-green-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer text-left w-full mx-0"
                    aria-label="Find a Table - Discover nearby venues"
                >
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 className="font-bold">Find a Table</h3>
                    <p className="text-green-100 text-sm">Discover nearby</p>
                </button>
                <button
                    onClick={() => onChangeTab('reservations')}
                    className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform cursor-pointer text-left w-full mx-0"
                    aria-label="Reservations - View upcoming bookings"
                >
                    <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Reservations</h3>
                    <p className="text-gray-500 text-sm">View upcoming</p>
                </button>
            </div>

            {/* Recent Activity Mock */}
            <section>
                <h2 className="font-bold text-lg mb-4">Recent</h2>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-white border border-gray-100 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div>
                            <h4 className="font-bold">Ta' Kris</h4>
                            <p className="text-xs text-gray-500">Yesterday • €42.50</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
