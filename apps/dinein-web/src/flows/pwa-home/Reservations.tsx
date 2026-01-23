import { useState } from 'react';
import { supabase } from '@/shared/services/supabase';

export function Reservations() {
    const [step, setStep] = useState<'list' | 'new'>('list');
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        partySize: 2,
        contactName: '',
        contactPhone: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);

        // Determine user ID (anon or real)
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            // Ideally trigger auth or handle guest reservation if allowed
            // For now, we assume user is logged in or we fail gracefully
            alert("Please sign in to make a reservation"); // Placeholder logic
            setSubmitting(false);
            return;
        }

        // Insert reservation
        const { error } = await supabase.from('reservations').insert({
            client_auth_user_id: userId,
            datetime: `${formData.date}T${formData.time}:00`,
            party_size: formData.partySize,
            contact_name: formData.contactName,
            contact_phone: formData.contactPhone,
            special_requests: formData.notes,
            status: 'pending'
            // vendor_id would typically come from context or selection
            // For this demo, we might need to select a vendor first or pass it in props
        });

        setSubmitting(false);
        if (!error) {
            setStep('list');
            // Reload list
        } else {
            console.error("Reservation error", error);
        }
    };

    if (step === 'new') {
        return (
            <div className="p-6 pb-24 animate-in slide-in-from-right">
                <button onClick={() => setStep('list')} className="mb-4 text-sm text-gray-500 flex items-center gap-1">
                    ← Back to reservations
                </button>
                <h1 className="text-2xl font-bold mb-6">New Reservation</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input required type="date" className="w-full p-3 border rounded-xl bg-gray-50"
                                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input required type="time" className="w-full p-3 border rounded-xl bg-gray-50"
                                value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>
                    </div>

                    {/* Party Size */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Guests</label>
                        <div className="flex gap-2">
                            {[2, 3, 4, 5, 6].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, partySize: n })}
                                    className={`flex-1 py-3 rounded-xl border font-bold ${formData.partySize === n ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input required type="text" placeholder="John Doe" className="w-full p-3 border rounded-xl bg-gray-50"
                            value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input required type="tel" placeholder="+356 9999 9999" className="w-full p-3 border rounded-xl bg-gray-50"
                            value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                    </div>

                    <button disabled={submitting} type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-transform">
                        {submitting ? 'Confirming...' : 'Confirm Reservation'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="p-6 pb-24 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Reservations</h1>
                <button onClick={() => setStep('new')} className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                    + New
                </button>
            </div>

            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                </div>
                <p>No upcoming reservations</p>
            </div>
        </div>
    );
}
