import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../components/navigation/BottomNav';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { AppShell } from '../components/layout/AppShell';

export function ClientLayout() {
    const location = useLocation();

    // Determine title based on route (simple version)
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'DineIn';
            case '/explore': return 'Explore';
            case '/orders': return 'Your Orders';
            case '/profile': return 'Profile';
            default: return 'DineIn';
        }
    };

    return (
        <AppShell
            title={getPageTitle()}
            showBottomNav={true}
            bottomNav={<BottomNav />}
        >
            {/* Temporary Theme Toggle Placement - Should eventually be in AppShell/Header */}
            <div className="fixed top-safe-top right-4 z-[60] mt-2">
                <ThemeToggle />
            </div>

            <Outlet />
        </AppShell>
    );
}
