
type Tab = 'home' | 'discover' | 'reservations' | 'profile';

export function BottomNav({ activeTab, onTabChange }: { activeTab: Tab, onTabChange: (t: Tab) => void }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center max-w-md mx-auto">
                <NavButton
                    active={activeTab === 'home'}
                    onClick={() => onTabChange('home')}
                    icon={<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                    label="Home"
                    ariaLabel="Home"
                />
                <NavButton
                    active={activeTab === 'discover'}
                    onClick={() => onTabChange('discover')}
                    icon={<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                    label="Discover"
                    ariaLabel="Discover venues"
                />
                <NavButton
                    active={activeTab === 'reservations'}
                    onClick={() => onTabChange('reservations')}
                    icon={<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                    label="Reservations"
                    ariaLabel="Your reservations"
                />
                <NavButton
                    active={activeTab === 'profile'}
                    onClick={() => onTabChange('profile')}
                    icon={<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                    label="Profile"
                    ariaLabel="Your profile"
                />
            </div>
        </nav>
    );
}

function NavButton({ active, onClick, icon, label, ariaLabel }: any) {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            className={`flex flex-col items-center space-y-1 transition-colors ${active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {icon}
            </svg>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
