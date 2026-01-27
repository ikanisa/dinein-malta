/**
 * Admin Bottom Navigation
 * 
 * Uses the shared BottomNav from @dinein/ui with callback mode.
 * Admin portal uses 2-tab navigation (Dashboard + Settings)
 */
import { Home, Settings } from 'lucide-react';
import { BottomNav as SharedBottomNav, type NavTab } from '@dinein/ui';

export type TabId = 'home' | 'settings';

interface AdminBottomNavProps {
    activeTab?: TabId;
    onTabChange?: (t: TabId) => void;
}

const tabs: NavTab[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab = 'home', onTabChange }: AdminBottomNavProps) {
    return (
        <SharedBottomNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => onTabChange?.(id as TabId)}
            useRouter={false}
            glass={true}
        />
    );
}
