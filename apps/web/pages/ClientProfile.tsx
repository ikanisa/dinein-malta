import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { getMyProfile, updateMyProfile, getAllVenues } from '../services/databaseService';
import { User, Venue } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ClientProfile = () => {
   const [user, setUser] = useState<User | null>(null);
   const [favorites, setFavorites] = useState<Venue[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const navigate = useNavigate();
   const { theme, toggleTheme } = useTheme();

   useEffect(() => {
      const loadProfile = async () => {
         try {
            const u = await getMyProfile();
            setUser(u);
            const venues = await getAllVenues();
            setFavorites(venues.filter(v => u.favorites.includes(v.id)));
         } finally {
            setIsLoading(false);
         }
      };
      loadProfile();
   }, []);

   const toggleNotify = async () => {
      if (user) {
         const updated = await updateMyProfile({ notificationsEnabled: !user.notificationsEnabled });
         setUser(updated);
      }
   };

   const updateName = async (name: string) => {
      if (user) {
         // Optimistic update for UI smoothness, but wait for DB confirm
         setUser({ ...user, name });
         // Debouncing would be better here in prod, but keeping simple for now
         // updateMyProfile({ name }); 
      }
   };

   const saveName = async () => {
      if (user) {
         await updateMyProfile({ name: user.name });
      }
   };

   // Show skeleton during loading
   if (isLoading || !user) {
      return <ProfileSkeleton />;
   }

   return (
      <div className="p-6 pb-24 space-y-6 animate-fade-in">
         <header className="mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted">Manage your dining preferences.</p>
         </header>

         <GlassCard className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center text-2xl font-bold text-white">
               {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1">
               <label className="text-xs text-muted block">Display Name</label>
               <input
                  type="text"
                  value={user.name}
                  onChange={e => updateName(e.target.value)}
                  onBlur={saveName}
                  className="bg-transparent border-b border-border w-full focus:outline-none focus:border-secondary-500 py-1 font-bold text-foreground"
               />
            </div>
         </GlassCard>

         <section>
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <GlassCard className="space-y-4">
               <div className="flex justify-between items-center">
                  <span>🔔 Push Notifications</span>
                  <button
                     onClick={toggleNotify}
                     className={`w-12 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.notificationsEnabled ? 'translate-x-6' : ''}`} />
                  </button>
               </div>
               <div className="flex justify-between items-center border-t border-border pt-4">
                  <span>{theme === 'dark' ? '🌑 Dark Mode' : '☀️ Light Mode'}</span>
                  <button
                     onClick={toggleTheme}
                     className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-secondary-500' : 'bg-gray-400'}`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
                  </button>
               </div>
            </GlassCard>
         </section>

         <section>
            <h2 className="text-lg font-bold mb-4">Your Favorites</h2>
            <div className="space-y-3">
               {favorites.length === 0 && <p className="text-muted text-sm">No favorites yet.</p>}
               {favorites.map(fav => (
                  <GlassCard key={fav.id} onClick={() => navigate(`/menu/${fav.id}`)} className="flex justify-between items-center py-3">
                     <span className="font-bold">{fav.name}</span>
                     <span className="text-muted">→</span>
                  </GlassCard>
               ))}
            </div>
         </section>

         <section>
            <h2 className="text-lg font-bold mb-4">History</h2>
            <GlassCard onClick={() => alert('Order history is stored locally in your session.')} className="cursor-pointer">
               <div className="flex items-center gap-3">
                  <span className="text-2xl">🕒</span>
                  <div>
                     <div className="font-bold">Order History</div>
                     <div className="text-xs text-muted">View recent transactions</div>
                  </div>
               </div>
            </GlassCard>
         </section>
      </div>
   );
};

export default ClientProfile;
