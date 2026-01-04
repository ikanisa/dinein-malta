'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { findVenuesForClaiming, searchPlacesByName, enrichVenueProfile, generateVenueThumbnail } from '../../../lib/gemini';
import { createVenue } from '../../../lib/database';

export default function VendorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [nearbyVenues, setNearbyVenues] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    website: '',
    openingHours: '',
    revolutHandle: '',
    whatsappNumber: '',
    tags: [] as string[],
  });

  const handleScanLocation = async () => {
    setLoading(true);
    setLoadingMsg('Scanning your area for venues...');

    try {
      if (!navigator.geolocation) {
        alert('Location services not available');
        setLoading(false);
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const places = await findVenuesForClaiming(position.coords.latitude, position.coords.longitude);
      setNearbyVenues(places);
      setStep(2);
    } catch (error: any) {
      if (error.code === 1) {
        alert('Location permission is required to verify you are at the venue.');
      } else {
        alert('Failed to get location. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setLoadingMsg(`Searching for "${searchQuery}"...`);

    try {
      const results = await searchPlacesByName(searchQuery);
      setNearbyVenues(results);
    } catch (error) {
      alert('Failed to search venues');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVenue = async (place: any) => {
    setSelectedPlace(place);
    setLoading(true);
    setLoadingMsg(`Gathering details for "${place.name}"...`);

    try {
      const enriched = await enrichVenueProfile(place.name, place.address || '');
      setFormData({
        name: place.name || '',
        address: place.address || '',
        description: enriched.description || place.summary || '',
        phone: enriched.phone || place.phoneNumber || '',
        website: enriched.website || '',
        openingHours: enriched.hours || '',
        revolutHandle: '',
        whatsappNumber: enriched.phone || '',
        tags: enriched.tags || [],
      });
      setStep(3);
    } catch (error) {
      alert('Failed to enrich venue details');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimConfirm = async () => {
    setLoading(true);
    setLoadingMsg('Creating your digital HQ...');

    try {
      let coverImage = null;
      try {
        coverImage = await generateVenueThumbnail(formData.name, 'modern bar interior');
      } catch (e) {
        console.warn('Image generation failed', e);
      }

      await createVenue({
        google_place_id: selectedPlace.googlePlaceId || selectedPlace.google_place_id || '',
        name: formData.name,
        address: formData.address,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        hours_json: formData.openingHours ? { text: formData.openingHours } : undefined,
        photos_json: coverImage ? [{ url: coverImage }] : selectedPlace.photo_hint ? [{ url: selectedPlace.photo_hint }] : undefined,
        website: formData.website,
        phone: formData.phone,
        revolut_link: formData.revolutHandle,
        whatsapp: formData.whatsappNumber,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      });

      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to claim venue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">{loadingMsg || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">Register Your Venue</h1>
          <p className="text-gray-400">Claim your restaurant or bar on DineIn</p>
        </header>

        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={handleScanLocation}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
            >
              📍 Scan Location & Find Venue
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Or search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleManualSearch}
                className="absolute right-2 top-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Select Your Venue</h2>
            {nearbyVenues.map((venue, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectVenue(venue)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors"
              >
                <h3 className="text-lg font-bold text-white">{venue.name}</h3>
                <p className="text-sm text-gray-400">{venue.address}</p>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Review & Confirm</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Venue Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Revolut Handle</label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={formData.revolutHandle}
                  onChange={(e) => setFormData({ ...formData, revolutHandle: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleClaimConfirm}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                >
                  Claim Venue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
