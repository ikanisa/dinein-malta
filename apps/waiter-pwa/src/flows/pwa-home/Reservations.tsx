import { useState } from 'react';
import { Calendar, Users, ChevronLeft, Phone, Plus, Check, Clock, X } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

interface Reservation {
    id: string;
    date: string;
    time: string;
    partySize: number;
    venue: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

const DEMO_RESERVATIONS: Reservation[] = [
    { id: '1', date: '2026-01-25', time: '19:00', partySize: 4, venue: 'La Petite Maison', status: 'confirmed' },
    { id: '2', date: '2026-01-28', time: '20:30', partySize: 2, venue: 'The Harbour Club', status: 'pending' },
];

export function Reservations() {
    const [step, setStep] = useState<'list' | 'new'>('list');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        partySize: 2,
        contactName: '',
        contactPhone: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            alert("Please sign in to make a reservation");
            setSubmitting(false);
            return;
        }

        const { error } = await supabase.from('reservations').insert({
            client_auth_user_id: userId,
            datetime: `${formData.date}T${formData.time}:00`,
            party_size: formData.partySize,
            contact_name: formData.contactName,
            contact_phone: formData.contactPhone,
            special_requests: formData.notes,
            status: 'pending'
        });

        setSubmitting(false);
        if (!error) {
            setStep('list');
        }
    };

    if (step === 'new') {
        return (
            <div className="min-h-screen bg-slate-50/50 pb-28 animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-glass-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => setStep('list')}
                            className="bg-white/20 backdrop-blur-md p-3 rounded-xl active:scale-95 transition-transform"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">New Booking</h1>
                            <p className="text-indigo-100 text-sm">Reserve your table</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 -mt-4">
                    {/* Date & Time */}
                    <GlassCard className="p-5 shadow-glass space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                            </div>
                            When?
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Time</label>
                                <input
                                    required
                                    type="time"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Party Size */}
                    <GlassCard className="p-5 shadow-glass space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Users className="w-4 h-4 text-indigo-500" />
                            </div>
                            Party Size
                        </h3>
                        <div className="flex gap-2">
                            {[2, 3, 4, 5, 6, '7+'].map((n, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, partySize: typeof n === 'number' ? n : 7 })}
                                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${(typeof n === 'number' ? n : 7) === formData.partySize
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Contact Info */}
                    <GlassCard className="p-5 shadow-glass space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-indigo-500" />
                            </div>
                            Contact Details
                        </h3>
                        <div className="space-y-3">
                            <input
                                required
                                type="text"
                                placeholder="Your Name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={formData.contactName}
                                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                            />
                            <input
                                required
                                type="tel"
                                placeholder="+356 9999 9999"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={formData.contactPhone}
                                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                            />
                            <textarea
                                placeholder="Special requests (optional)"
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </GlassCard>

                    {/* Submit */}
                    <Button
                        disabled={submitting}
                        loading={submitting}
                        type="submit"
                        block
                        size="lg"
                    >
                        {!submitting && <Check className="w-5 h-5 mr-2" />}
                        Confirm Booking
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-28 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-glass-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bookings</h1>
                        <p className="text-indigo-100 text-sm">Your reservations</p>
                    </div>
                    <Button
                        onClick={() => setStep('new')}
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-0"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        New
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 -mt-4 relative z-10">
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-glass">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'past'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Past
                    </button>
                </div>
            </div>

            {/* Reservations List */}
            {DEMO_RESERVATIONS.length > 0 ? (
                <div className="p-6 space-y-4">
                    {DEMO_RESERVATIONS.map((reservation) => (
                        <GlassCard key={reservation.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900">{reservation.venue}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${reservation.status === 'confirmed'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : reservation.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    <span>{new Date(reservation.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    <span>{reservation.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-indigo-400" />
                                    <span>{reservation.partySize} guests</span>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-5 animate-pulse-soft">
                        <Calendar className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No upcoming bookings</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs">
                        Reserve a table at your favorite restaurant and it will appear here
                    </p>
                    <Button
                        onClick={() => setStep('new')}
                        color="primary"
                    >
                        Make a Reservation
                    </Button>
                </div>
            )}
        </div>
    );
}
