import { X, Bell, CheckCircle, Gift, Store } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type?: 'order' | 'promo' | 'venue' | 'general';
    read?: boolean;
}

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications?: Notification[];
}

const DEMO_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Order Confirmed',
        message: 'Your order #1234 is being prepared',
        time: '5 min ago',
        type: 'order',
    },
    {
        id: '2',
        title: 'Special Offer',
        message: 'Get 20% off at La Petite Maison today!',
        time: '1 hour ago',
        type: 'promo',
    },
    {
        id: '3',
        title: 'New Venue',
        message: 'Mediterranean Breeze just joined DineIn',
        time: '2 hours ago',
        type: 'venue',
    },
];

const getNotificationIcon = (type?: string) => {
    switch (type) {
        case 'order':
            return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'promo':
            return <Gift className="w-5 h-5 text-amber-500" />;
        case 'venue':
            return <Store className="w-5 h-5 text-indigo-500" />;
        default:
            return <Bell className="w-5 h-5 text-slate-400" />;
    }
};

export function NotificationsPanel({
    isOpen,
    onClose,
    notifications = DEMO_NOTIFICATIONS
}: NotificationsPanelProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="notifications-overlay animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="notifications-panel animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                        {notifications.length > 0 && (
                            <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Notifications List */}
                <div className="p-5 space-y-3 pb-safe">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className="bg-slate-50 rounded-2xl p-4 flex gap-3 hover:bg-slate-100 transition-colors cursor-pointer active:scale-[0.99]"
                            >
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 mb-0.5">
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {notification.time}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
