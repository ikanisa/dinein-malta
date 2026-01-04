import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { findVenuesForClaiming, enrichVenueProfile, generateVenueThumbnail, searchPlacesByName, generateSmartDescription } from '../services/geminiService';
import { createVenue } from '../services/databaseService';
import { Venue } from '../types';
import { Spinner } from '../components/Loading';

const VendorOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Claiming Flow Data
  const [nearbyVenues, setNearbyVenues] = useState<any[]>([]);
  const [selectedPlaceOriginal, setSelectedPlaceOriginal] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Manual Search State
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Robust Form Data (Editable)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    website: '',
    instagramUrl: '',
    facebookUrl: '',
    openingHours: '',
    revolutHandle: '',
    whatsappNumber: '',
    tags: [] as string[],
    currency: '€'
  });
  
  // 1. Scan Location & Fetch Live from Gemini/Maps
  const handleScanLocation = async () => {
      setLoading(true);
      setLoadingMsg('Scanning your area for venues...');
      
      const { locationService } = await import('../services/locationService');
      const { location, status } = await locationService.requestPermission();

      if (!location || status !== 'granted') {
          alert(status === 'denied'
              ? "Location permission is required to verify you are at the venue."
              : "Failed to get location. Please try again.");
          setLoading(false);
          return;
      }

      setUserLocation({ lat: location.lat, lng: location.lng });
      try {
          const places = await findVenuesForClaiming(location.lat, location.lng);
          setNearbyVenues(places);
          setStep(2);
      } catch (e) {
          alert("Failed to find venues. Please try again.");
      }
      setLoading(false);
  };

  const handleManualSearch = async () => {
      if (!searchQuery) return;
      setLoading(true);
      setLoadingMsg(`Searching for "${searchQuery}"...`);
      const results = await searchPlacesByName(searchQuery, userLocation?.lat, userLocation?.lng);
      setNearbyVenues(results);
      setLoading(false);
  };

  // 2. Select a Venue to Claim & Enrich
  const handleSelectVenue = async (place: any) => {
      setSelectedPlaceOriginal(place);
      setLoading(true);
      setLoadingMsg(`Gathering details for "${place.name}"...`);
      
      // AI Agent: Fetch extra details (Phone, Website, Socials) to pre-fill
      const enriched = await enrichVenueProfile(place.name, place.address);
      
      // Populate Form
      setFormData({
          name: place.name || '',
          address: place.address || '',
          description: enriched.description || place.summary || '',
          phone: enriched.phone || place.phoneNumber || '',
          website: enriched.website || '',
          instagramUrl: enriched.instagramUrl || '',
          facebookUrl: enriched.facebookUrl || '',
          openingHours: enriched.hours || '',
          revolutHandle: '', // Manual input required
          whatsappNumber: enriched.phone || '', // Default to business phone
          tags: enriched.tags || [],
          currency: enriched.currencySymbol || '€'
      });
      
      setLoading(false);
      setStep(3);
  };

  // Helper to regen description
  const handleRegenerateDescription = async () => {
      setLoading(true);
      setLoadingMsg("Writing a new bio...");
      const newDesc = await generateSmartDescription(formData.name, "Venue Vibe");
      setFormData(prev => ({...prev, description: newDesc || prev.description}));
      setLoading(false);
  };

  const toggleTag = (tag: string) => {
      if (formData.tags.includes(tag)) {
          setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
      } else {
          setFormData({...formData, tags: [...formData.tags, tag]});
      }
  };

  // 3. Finalize & Create
  const handleClaimConfirm = async () => {
      setLoading(true);
      setLoadingMsg('Creating your digital HQ...');
      
      // AI Agent: Generate cover art if none
      let coverImage = null;
      try {
          coverImage = await generateVenueThumbnail(formData.name, selectedPlaceOriginal.visualVibe || 'modern bar interior');
      } catch(e) {}

      // Transform to vendor claim format (matches backend schema)
      const vendorClaimData = {
          google_place_id: selectedPlaceOriginal.googlePlaceId || selectedPlaceOriginal.google_place_id || '',
          name: formData.name,
          address: formData.address,
          lat: selectedPlaceOriginal.lat || undefined,
          lng: selectedPlaceOriginal.lng || undefined,
          hours_json: formData.openingHours ? { text: formData.openingHours } : undefined,
          photos_json: coverImage ? [{ url: coverImage }] : selectedPlaceOriginal.photo_hint ? [{ url: selectedPlaceOriginal.photo_hint }] : undefined,
          website: formData.website,
          phone: formData.phone,
          revolut_link: formData.revolutHandle,
          whatsapp: formData.whatsappNumber,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') // Generate slug from name
      };

      await createVenue(vendorClaimData as any);
      setLoading(false);
      navigate('/vendor-dashboard');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

       {/* Header */}
       <div className="px-6 pt-safe-top pb-4 flex items-center gap-4 z-10 bg-glass backdrop-blur-md sticky top-0 border-b border-glassBorder">
           {step > 1 && <button onClick={() => setStep(s => s-1)} className="text-muted hover:text-foreground">← Back</button>}
           <div className="flex-1 text-center font-bold text-lg text-foreground">Claim Business</div>
           <div className="w-10"></div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto px-6 pb-safe-bottom z-10 pt-4">
           
           {/* STEP 1: LOCATE */}
           {step === 1 && (
               <div className="flex flex-col h-full justify-center text-center space-y-8 animate-fade-in">
                   <div className="w-24 h-24 bg-surface-highlight rounded-full flex items-center justify-center mx-auto border border-border animate-pulse">
                       <span className="text-4xl">📍</span>
                   </div>
                   <div>
                       <h2 className="text-2xl font-bold mb-2 text-foreground">Are you at your venue?</h2>
                       <p className="text-muted">We need your location to find nearby businesses that you can claim.</p>
                   </div>
                   <button 
                       onClick={handleScanLocation}
                       disabled={loading}
                       className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 active:scale-95 transition-transform flex items-center justify-center gap-2"
                   >
                       {loading ? <Spinner /> : 'Scan Location'}
                   </button>
                   <p className="text-xs text-muted">Universal support enabled.</p>
               </div>
           )}

           {/* STEP 2: SELECT */}
           {step === 2 && (
               <div className="space-y-4 animate-slide-up pb-10">
                   <h2 className="text-xl font-bold mb-4 text-foreground">Select your venue</h2>
                   {loading && (
                        <div className="flex flex-col items-center py-10">
                            <Spinner className="w-8 h-8 mb-2 border-foreground" />
                            <p className="text-sm text-muted">{loadingMsg}</p>
                        </div>
                   )}
                   
                   {!loading && (
                        <>
                            {/* Manual Search Toggle */}
                            <div className="flex gap-2 mb-4">
                                <input 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Can't find it? Search by name..."
                                    className="flex-1 bg-surface-highlight border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-blue-500"
                                    onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                                />
                                <button 
                                    onClick={handleManualSearch}
                                    className="bg-surface-highlight border border-border text-foreground px-3 py-2 rounded-lg text-sm font-bold"
                                >
                                    Search
                                </button>
                            </div>

                            {nearbyVenues.map((place, idx) => (
                                <GlassCard key={idx} onClick={() => handleSelectVenue(place)} className="cursor-pointer hover:bg-surface-highlight/50 active:scale-95 transition bg-surface border-border">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-lg text-foreground">{place.name}</div>
                                            <div className="text-xs text-muted">{place.address}</div>
                                        </div>
                                        <div className="bg-surface-highlight px-2 py-1 rounded text-xs font-bold text-blue-500">
                                            Claim
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                            {nearbyVenues.length === 0 && (
                                <div className="text-center text-muted mt-10">
                                    No venues found.
                                </div>
                            )}
                        </>
                   )}
               </div>
           )}

           {/* STEP 3: REVIEW & EDIT */}
           {step === 3 && (
               <div className="space-y-6 animate-slide-up pb-24">
                   <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 p-4 rounded-xl border border-border mb-4">
                       <p className="text-sm text-foreground">
                           <span className="text-xl mr-2">✨</span>
                           <b>We've</b> drafted your profile. Please review details before going live.
                       </p>
                   </div>

                   {/* Section 1: Core Identity */}
                   <section className="space-y-4">
                       <h3 className="font-bold text-muted uppercase text-xs tracking-wider">Business Identity</h3>
                       <div>
                           <label className="text-xs text-muted block mb-1">Venue Name</label>
                           <input 
                               value={formData.name}
                               onChange={e => setFormData({...formData, name: e.target.value})}
                               className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground font-bold"
                           />
                       </div>
                       <div>
                           <label className="text-xs text-muted block mb-1">Address</label>
                           <input 
                               value={formData.address}
                               onChange={e => setFormData({...formData, address: e.target.value})}
                               className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground"
                           />
                       </div>
                       <div>
                           <div className="flex justify-between items-center mb-1">
                                <label className="text-xs text-muted block">Smart Description</label>
                                <button 
                                    onClick={handleRegenerateDescription} 
                                    disabled={loading}
                                    className="text-[10px] text-blue-500 hover:text-foreground"
                                >
                                    {loading ? 'Thinking...' : '⚡ Rewrite'}
                                </button>
                           </div>
                           <textarea 
                               value={formData.description}
                               onChange={e => setFormData({...formData, description: e.target.value})}
                               className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground h-24 resize-none text-sm leading-relaxed"
                           />
                       </div>
                   </section>

                   {/* Section 2: Online Presence */}
                   <section className="space-y-4">
                       <h3 className="font-bold text-muted uppercase text-xs tracking-wider">Online Presence</h3>
                       <div>
                           <label className="text-xs text-muted block mb-1">Website</label>
                           <input 
                               value={formData.website}
                               onChange={e => setFormData({...formData, website: e.target.value})}
                               className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground text-sm"
                               placeholder="https://"
                           />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                           <div>
                               <label className="text-xs text-muted block mb-1">Instagram</label>
                               <input 
                                   value={formData.instagramUrl}
                                   onChange={e => setFormData({...formData, instagramUrl: e.target.value})}
                                   className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground text-sm"
                                   placeholder="URL"
                               />
                           </div>
                           <div>
                               <label className="text-xs text-muted block mb-1">Facebook</label>
                               <input 
                                   value={formData.facebookUrl}
                                   onChange={e => setFormData({...formData, facebookUrl: e.target.value})}
                                   className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground text-sm"
                                   placeholder="URL"
                               />
                           </div>
                       </div>
                       <div>
                           <label className="text-xs text-muted block mb-1">Opening Hours (Summary)</label>
                           <input 
                               value={formData.openingHours}
                               onChange={e => setFormData({...formData, openingHours: e.target.value})}
                               className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground text-sm"
                           />
                       </div>
                   </section>

                   {/* Section 3: Amenities (Tags) */}
                   <section className="space-y-4">
                       <h3 className="font-bold text-muted uppercase text-xs tracking-wider">Amenities (Detected)</h3>
                       <div className="flex flex-wrap gap-2">
                           {formData.tags.map(tag => (
                               <button 
                                   key={tag}
                                   onClick={() => toggleTag(tag)}
                                   className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-bold border border-blue-500/30 flex items-center gap-1 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-colors"
                               >
                                   {tag} <span>×</span>
                               </button>
                           ))}
                           {formData.tags.length === 0 && <span className="text-xs text-muted">No amenities detected automatically. Add them later in dashboard.</span>}
                       </div>
                   </section>

                   {/* Section 4: App Specifics */}
                   <section className="space-y-4">
                       <h3 className="font-bold text-blue-500 uppercase text-xs tracking-wider">App Operations</h3>
                       
                       <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                           <label className="text-xs text-muted font-bold mb-1 block">Revolut Handle (Required)</label>
                           <div className="relative">
                                <span className="absolute left-3 top-3 text-blue-500 font-bold">@</span>
                                <input 
                                    type="text" 
                                    value={formData.revolutHandle}
                                    onChange={e => setFormData({...formData, revolutHandle: e.target.value})}
                                    placeholder="yourhandle" 
                                    className="w-full bg-surface-highlight border border-border p-3 pl-8 rounded-lg text-foreground font-mono focus:border-blue-500 outline-none"
                                />
                           </div>
                           <p className="text-[10px] text-muted mt-1">For receiving instant QR payments.</p>
                       </div>
                       
                       <div>
                           <label className="text-xs text-muted font-bold mb-1 block">WhatsApp Number</label>
                           <input 
                               type="text" 
                               value={formData.whatsappNumber}
                               onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                               placeholder="+..." 
                               className="w-full bg-surface-highlight border border-border p-3 rounded-lg text-foreground focus:border-green-500 outline-none"
                           />
                       </div>
                   </section>

                   <button 
                       onClick={handleClaimConfirm}
                       disabled={loading}
                       className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform mt-4 flex justify-center gap-2 items-center"
                   >
                       {loading ? <Spinner /> : 'Confirm & Launch Venue'}
                   </button>
               </div>
           )}
       </div>
    </div>
  );
};

export default VendorOnboarding;