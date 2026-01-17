import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Input, Button } from '../ui';

interface BarDetailsData {
    name: string;
    momoCode: string;
    whatsapp: string;
    country: string;
    address: string;
}

interface BarDetailsStepProps {
    initialData?: Partial<BarDetailsData>;
    onSubmit: (data: BarDetailsData) => void;
    onBack: () => void;
}

const COUNTRIES = [
    { code: 'MT', name: 'Malta' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
];

export const BarDetailsStep: React.FC<BarDetailsStepProps> = ({
    initialData,
    onSubmit,
    onBack,
}) => {
    const [formData, setFormData] = useState<BarDetailsData>({
        name: initialData?.name || '',
        momoCode: initialData?.momoCode || '',
        whatsapp: initialData?.whatsapp || '',
        country: initialData?.country || 'MT',
        address: initialData?.address || '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BarDetailsData, string>>>({});

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof BarDetailsData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Bar name is required';
        }

        if (!formData.whatsapp.trim()) {
            newErrors.whatsapp = 'WhatsApp number is required';
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
            newErrors.whatsapp = 'Enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (field: keyof BarDetailsData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Bar Details</h2>
                <p className="text-muted text-sm">
                    Tell us about your bar or restaurant
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bar Name */}
                <GlassCard noPadding>
                    <div className="p-4">
                        <Input
                            label="Bar / Restaurant Name *"
                            type="text"
                            value={formData.name}
                            onChange={handleChange('name')}
                            placeholder="e.g. The Irish Pub"
                            error={errors.name}
                            variant="filled"
                        />
                    </div>
                </GlassCard>

                {/* Country */}
                <GlassCard noPadding>
                    <div className="p-4">
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Country
                        </label>
                        <select
                            value={formData.country}
                            onChange={handleChange('country')}
                            className="w-full h-11 px-4 bg-surface-highlight border-transparent rounded-xl text-foreground focus:outline-none focus:bg-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                        >
                            {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </GlassCard>

                {/* Address */}
                <GlassCard noPadding>
                    <div className="p-4">
                        <Input
                            label="Address (Optional)"
                            type="text"
                            value={formData.address}
                            onChange={handleChange('address')}
                            placeholder="e.g. 123 Main Street, Valletta"
                            variant="filled"
                        />
                    </div>
                </GlassCard>

                {/* WhatsApp */}
                <GlassCard noPadding>
                    <div className="p-4">
                        <Input
                            label="WhatsApp Number *"
                            type="tel"
                            value={formData.whatsapp}
                            onChange={handleChange('whatsapp')}
                            placeholder="+356 1234 5678"
                            error={errors.whatsapp}
                            helperText="Customers will contact you via WhatsApp"
                            variant="filled"
                        />
                    </div>
                </GlassCard>

                {/* MOMO Code */}
                <GlassCard noPadding>
                    <div className="p-4">
                        <Input
                            label="MOMO Code (Optional)"
                            type="text"
                            value={formData.momoCode}
                            onChange={handleChange('momoCode')}
                            placeholder="e.g. *123*456#"
                            helperText="Mobile money payment code for your bar"
                            variant="filled"
                        />
                    </div>
                </GlassCard>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="flex-1"
                    >
                        ← Back
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                    >
                        Next →
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BarDetailsStep;

