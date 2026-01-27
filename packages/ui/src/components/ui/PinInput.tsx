import * as React from 'react';
import { cn } from '../../lib/utils';

export interface PinInputProps {
    /** Number of digits (default: 4) */
    length?: number;
    /** Callback when all digits are entered */
    onComplete?: (pin: string) => void;
    /** Callback on value change */
    onChange?: (value: string) => void;
    /** Current value (controlled) */
    value?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Error state */
    error?: boolean;
    /** Auto-focus first input on mount */
    autoFocus?: boolean;
    /** Additional className */
    className?: string;
    /** Mask input (show dots instead of numbers) */
    mask?: boolean;
}

/**
 * PinInput
 * 4-digit (or configurable) PIN input for password-like entry.
 * Supports loading/disabled/error states.
 */
export function PinInput({
    length = 4,
    onComplete,
    onChange,
    value = '',
    disabled = false,
    loading = false,
    error = false,
    autoFocus = true,
    className,
    mask = false,
}: PinInputProps) {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // Split value into array of digits
    const digits = value.split('').slice(0, length);
    while (digits.length < length) {
        digits.push('');
    }

    const handleChange = (index: number, newValue: string) => {
        if (disabled || loading) return;

        // Only allow single digit
        const digit = newValue.slice(-1);
        if (digit && !/^\d$/.test(digit)) return;

        const newDigits = [...digits];
        newDigits[index] = digit;
        const newPin = newDigits.join('');

        onChange?.(newPin);

        // Move to next input if digit entered
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Call onComplete when all digits entered
        if (newPin.length === length && !newPin.includes('')) {
            onComplete?.(newPin);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled || loading) return;

        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (disabled || loading) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        if (pastedData) {
            onChange?.(pastedData);

            // Focus appropriate input
            const nextIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[nextIndex]?.focus();

            if (pastedData.length === length) {
                onComplete?.(pastedData);
            }
        }
    };

    return (
        <div
            className={cn('flex gap-3 justify-center', className)}
            role="group"
            aria-label="PIN input"
        >
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type={mask ? 'password' : 'text'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled || loading}
                    autoFocus={autoFocus && index === 0}
                    aria-label={`Digit ${index + 1}`}
                    className={cn(
                        'w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200',
                        'bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error
                            ? 'border-destructive focus:border-destructive'
                            : digit
                                ? 'border-primary'
                                : 'border-border focus:border-primary',
                        loading && 'animate-pulse'
                    )}
                />
            ))}
        </div>
    );
}
