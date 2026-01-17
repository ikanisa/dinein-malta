
import React from 'react';
import { Spinner } from './Loading';

interface AIEnhanceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    label?: string;
    icon?: string;
}

export const AIEnhanceButton: React.FC<AIEnhanceButtonProps> = ({
    loading,
    label = 'AI Enhance',
    icon = '✨',
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            disabled={loading || disabled}
            className={`
        relative overflow-hidden group
        px-3 py-1.5 rounded-lg text-xs font-bold
        bg-gradient-to-r from-purple-500/20 to-blue-500/20
        border border-purple-500/30 hover:border-purple-500/50
        text-purple-400 hover:text-purple-300
        transition-all active:scale-95
        flex items-center gap-1.5
        ${className}
      `}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {loading ? (
                <Spinner className="w-3 h-3 text-purple-400" />
            ) : (
                <span className="text-sm">{icon}</span>
            )}
            <span className="relative z-10">{loading ? 'Enhancing...' : label}</span>
        </button>
    );
};
