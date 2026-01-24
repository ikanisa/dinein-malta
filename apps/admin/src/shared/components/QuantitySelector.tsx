import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    min?: number;
    max?: number;
}

export function QuantitySelector({
    value,
    onIncrement,
    onDecrement,
    min = 1,
    max = 99
}: QuantitySelectorProps) {
    return (
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            <button
                onClick={onDecrement}
                disabled={value <= min}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-transform"
                aria-label="Decrease quantity"
            >
                <Minus className="w-4 h-4 text-slate-600" />
            </button>
            <span className="w-8 text-center font-bold text-slate-900">{value}</span>
            <button
                onClick={onIncrement}
                disabled={value >= max}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-transform"
                aria-label="Increase quantity"
            >
                <Plus className="w-4 h-4 text-slate-600" />
            </button>
        </div>
    );
}
