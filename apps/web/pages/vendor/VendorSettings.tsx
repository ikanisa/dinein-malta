import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorDashboardData } from '../../hooks/useVendorDashboardData';
import { updateVenue } from '../../services/databaseService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/Loading';

const VendorSettings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { venue, setVenue, loading: venueLoading } = useVendorDashboardData({ tab: 'settings' });

  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailSummaryEnabled, setEmailSummaryEnabled] = useState(false);

  useEffect(() => {
    // Load notification preferences from localStorage
    const soundPref = localStorage.getItem('vendor_sound_alerts');
    const pushPref = localStorage.getItem('vendor_push_notifications');
    const emailPref = localStorage.getItem('vendor_email_summary');

    if (soundPref !== null) setSoundAlertsEnabled(soundPref === 'true');
    if (pushPref !== null) setPushNotificationsEnabled(pushPref === 'true');
    if (emailPref !== null) setEmailSummaryEnabled(emailPref === 'true');
  }, []);

  const handleSaveVenue = async () => {
    if (!venue) return;
    try {
      await updateVenue(venue);
      toast.success('Venue settings saved');
    } catch (error) {
      toast.error('Failed to save venue settings');
    }
  };

  const handleSoundAlertsToggle = (enabled: boolean) => {
    setSoundAlertsEnabled(enabled);
    localStorage.setItem('vendor_sound_alerts', enabled.toString());
    toast.success(`Sound alerts ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handlePushNotificationsToggle = async (enabled: boolean) => {
    setPushNotificationsEnabled(enabled);
    localStorage.setItem('vendor_push_notifications', enabled.toString());
    
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushNotificationsEnabled(false);
        toast.error('Notification permission denied');
        return;
      }
    }
    
    toast.success(`Push notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleEmailSummaryToggle = (enabled: boolean) => {
    setEmailSummaryEnabled(enabled);
    localStorage.setItem('vendor_email_summary', enabled.toString());
    toast.success(`Email summary ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/vendor/login');
  };

  if (venueLoading || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-safe-top pb-32 flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <button
              onClick={() => navigate('/vendor/live')}
              className="text-muted hover:text-foreground transition-colors mb-2"
            >
              ← Back to Live
            </button>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Venue Information */}
        <section className="bg-surface-highlight rounded-xl p-4 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Venue Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Name</label>
              <input
                type="text"
                value={venue.name}
                onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Address</label>
              <input
                type="text"
                value={venue.address}
                onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Phone</label>
              <input
                type="tel"
                value={venue.phone || ''}
                onChange={(e) => setVenue({ ...venue, phone: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground"
              />
            </div>
            <button
              onClick={handleSaveVenue}
              className="w-full p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors touch-target"
            >
              Save Venue Settings
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-surface-highlight rounded-xl p-4 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Sound Alerts</div>
                <div className="text-sm text-muted">Play sound when new orders arrive</div>
              </div>
              <button
                onClick={() => handleSoundAlertsToggle(!soundAlertsEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  soundAlertsEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
                aria-label={soundAlertsEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    soundAlertsEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Push Notifications</div>
                <div className="text-sm text-muted">Receive notifications even when app is closed</div>
              </div>
              <button
                onClick={() => handlePushNotificationsToggle(!pushNotificationsEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  pushNotificationsEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
                aria-label={pushNotificationsEnabled ? 'Disable push notifications' : 'Enable push notifications'}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    pushNotificationsEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Email Daily Summary</div>
                <div className="text-sm text-muted">Receive daily revenue and order summary</div>
              </div>
              <button
                onClick={() => handleEmailSummaryToggle(!emailSummaryEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  emailSummaryEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
                aria-label={emailSummaryEnabled ? 'Disable email summary' : 'Enable email summary'}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    emailSummaryEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Account & Security */}
        <section className="bg-surface-highlight rounded-xl p-4 border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Account & Security</h2>
          <div className="space-y-3">
            <button
              onClick={() => toast('Password change feature coming soon')}
              className="w-full p-3 bg-surface hover:bg-surface-highlight border border-border rounded-lg font-semibold text-foreground transition-colors touch-target text-left"
            >
              🔒 Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg font-semibold transition-colors touch-target"
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorSettings;
