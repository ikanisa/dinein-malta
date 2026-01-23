import { useState, useEffect } from 'react';
import { supabase } from '@/shared/services/supabase';

export function VenueDiscovery() {
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Determine location and fetch venues
        if ('geolocation' in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchVenues(latitude, longitude);
                },
                (err) => {
                    console.error("Location error:", err);
                    setError("Could not get location. Showing default venues.");
                    fetchVenues(35.9375, 14.3754); // Default to Malta center
                }
            );
        } else {
            setError("Geolocation not supported");
            fetchVenues(35.9375, 14.3754);
        }
    }, []);

    async function fetchVenues(lat: number, lng: number) {
        try {
            // Get user country preference
            let countryFilter = localStorage.getItem('dinein_country_code');

            // If logged in, prioritize profile
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('country_code')
                    .eq('auth_user_id', session.user.id)
                    .single();
                if (profile?.country_code) {
                    countryFilter = profile.country_code;
                }
            }

            // Use the RPC function we created in Phase 2/6
            const { data, error } = await supabase.rpc('search_nearby_venues', {
                lat,
                long: lng,
                radius_meters: 5000,
                filter_country_code: countryFilter || undefined
            });

            if (error) throw error;
            setVenues(data || []);
        } catch (err: any) {
            console.error("Supabase error:", err);
            setError("Failed to load venues");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 animate-in fade-in duration-500 pb-24">
            <h1 className="text-2xl font-bold mb-4">Discover Nearby</h1>

            {error && (
                <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : venues.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p>No venues found nearby.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {venues.map(venue => (
                        <div key={venue.id} className="bg-white border p-4 rounded-2xl shadow-sm flex gap-4 active:scale-98 transition-transform">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl bg-cover bg-center" style={{ backgroundImage: venue.photos_json ? `url(${venue.photos_json[0]})` : undefined }}>
                                {!venue.photos_json && <span className="text-gray-300 text-xs flex items-center justify-center h-full">No Img</span>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{venue.name}</h3>
                                <p className="text-xs text-gray-500 mb-2 truncate">{venue.address}</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Open</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded-full">{venue.cuisine || 'Mediterranean'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
