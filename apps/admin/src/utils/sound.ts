// Simple "Ding" sound for order notifications
// Source: Synthesized simple sine wave chime
// Let's use a browser Oscillator instead for zero-asset dependency
export const playNotificationSound = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- webkitAudioContext vendor prefix
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Bell-like sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1); // Drop to A2

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

        osc.start();
        osc.stop(ctx.currentTime + 1);

    } catch (e) {
        console.error('Failed to play notification sound', e);
    }
};
