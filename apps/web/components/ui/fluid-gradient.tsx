"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FluidGradientProps extends React.HTMLAttributes<HTMLDivElement> {
    seed: string;
    variant?: "soft" | "vibrant" | "dark";
}

function stringToColor(str: string, saturation: number, lightness: number) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}

export function FluidGradient({ seed, variant = "soft", className, ...props }: FluidGradientProps) {
    const gradient = useMemo(() => {
        const s = variant === "vibrant" ? 80 : 60;
        const l = variant === "dark" ? 20 : variant === "vibrant" ? 60 : 85;

        const c1 = stringToColor(seed, s, l);
        const c2 = stringToColor(seed + "2", s, l - 5);
        const c3 = stringToColor(seed + "3", s + 10, l + 5);

        return `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
    }, [seed, variant]);

    return (
        <div
            className={cn("w-full h-full relative overflow-hidden", className)}
            style={{ background: gradient }}
            {...props}
        >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50" />
        </div>
    );
}
