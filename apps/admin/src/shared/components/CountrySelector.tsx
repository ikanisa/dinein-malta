import { Globe } from 'lucide-react';
import { COUNTRIES } from '@/shared/constants/countries';

interface CountrySelectorProps {
    value: string;
    onChange: (code: string) => void;
    variant?: 'light' | 'dark';
}

export function CountrySelector({ value, onChange, variant = 'light' }: CountrySelectorProps) {
    const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl ${variant === 'dark'
            ? 'bg-white/10 backdrop-blur-lg border border-white/20'
            : 'bg-white shadow-lg border border-slate-100'
            }`}>
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div className="flex-1">
                <h3 className={`font-bold text-lg ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCountry.name}
                </h3>
                <p className={`text-sm ${variant === 'dark' ? 'text-white/80' : 'text-slate-500'}`}>
                    Currency: {selectedCountry.currency}
                </p>
            </div>
            <select
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    localStorage.setItem('dinein_country_code', e.target.value);
                }}
                className={`appearance-none bg-transparent font-semibold cursor-pointer outline-none ${variant === 'dark' ? 'text-white' : 'text-indigo-600'
                    }`}
            >
                {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code} className="text-slate-900">
                        {country.flag} {country.name}
                    </option>
                ))}
            </select>
            <Globe className={`w-5 h-5 ${variant === 'dark' ? 'text-white/60' : 'text-slate-400'}`} />
        </div>
    );
}
