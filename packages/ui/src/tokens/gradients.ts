export const GRADIENTS = {
    candlelight: {
        primary: 'linear-gradient(135deg, #FF7A1A 0%, #D7B45A 55%, #FF7A1A 100%)',
        cardEdge: 'linear-gradient(180deg, rgba(255,122,26,0.25), rgba(215,180,90,0.10))',
        subtle: 'linear-gradient(180deg, rgba(255,122,26,0.10), rgba(0,0,0,0.0))',
    },
    bistro: {
        primary: 'linear-gradient(135deg, #FF6A00 0%, #C9A44A 60%, #FF6A00 100%)',
        subtle: 'linear-gradient(180deg, rgba(255,106,0,0.10), rgba(255,255,255,0.0))',
        // Fallbacks for missing keys in bistro to match types if strictly typed, or just optional
        cardEdge: 'none',
    }
} as const;
