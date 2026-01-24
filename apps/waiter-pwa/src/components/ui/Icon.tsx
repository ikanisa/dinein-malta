import React from 'react';
import {
    Search, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Bot, QrCode, MapPin, Globe,
    Loader2, Check, CheckCircle, ChevronLeft, ChevronRight, Info, Home, User, Settings,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName =
    | "search" | "plus" | "minus" | "trash-2" | "shopping-bag" | "arrow-left" | "bot"
    | "qr-code" | "map-pin" | "globe" | "loader-2" | "check" | "check-circle"
    | "chevron-left" | "chevron-right" | "info" | "home" | "user" | "settings"
    | string; // Allow string for flexibility

const iconMap: Record<string, LucideIcon> = {
    "search": Search,
    "plus": Plus,
    "minus": Minus,
    "trash-2": Trash2,
    "shopping-bag": ShoppingBag,
    "arrow-left": ArrowLeft,
    "bot": Bot,
    "qr-code": QrCode,
    "map-pin": MapPin,
    "globe": Globe,
    "loader-2": Loader2,
    "check": Check,
    "check-circle": CheckCircle,
    "chevron-left": ChevronLeft,
    "chevron-right": ChevronRight,
    "info": Info,
    "home": Home,
    "user": User,
    "settings": Settings,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: number | string;
}

export const Icon = ({ name, className, size = 24, ...props }: IconProps) => {
    const IconComponent = iconMap[name] || iconMap[name.replace(' ', '-')] || Bot; // Fallback to Bot

    return (
        <IconComponent
            className={cn("shrink-0", className)}
            size={typeof size === 'string' ? undefined : size}
            {...props}
        />
    );
};
