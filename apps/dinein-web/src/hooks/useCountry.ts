export function useCountry(): [string, (code: string) => void] {
    const stored = localStorage.getItem('dinein_country_code') || 'RW';
    const setCountry = (code: string) => {
        localStorage.setItem('dinein_country_code', code);
        window.dispatchEvent(new Event('country-change'));
    };
    return [stored, setCountry];
}
