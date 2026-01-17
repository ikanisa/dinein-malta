# Sound Notifications for Vendor Dashboard

## Overview

The vendor dashboard plays a sound notification when new orders arrive to alert staff in busy environments. This directory contains the sound files used for these notifications.

## Required Sound File

### `new-order.mp3`

**Location**: `/apps/web/public/sounds/new-order.mp3`

**Requirements**:
- Format: MP3 (widely supported)
- Duration: 1-2 seconds (short and attention-grabbing)
- File size: < 50KB (for fast loading)
- Sample rate: 44.1kHz recommended
- Bitrate: 128kbps or lower

**Characteristics**:
- Pleasant but attention-grabbing
- Works well in noisy environments (bars/restaurants)
- Not jarring or annoying when repeated
- Professional/neutral tone

## Current Status

⚠️ **Placeholder file exists** - Replace with actual audio file before production deployment.

## Obtaining a Sound File

### Option 1: Free Sound Libraries

1. **Freesound.org**
   - Search: "notification", "alert", "bell", "chime"
   - Filter: CC0 license (free for commercial use)
   - Recommended: Short notification sounds (1-2 seconds)

2. **Zapsplat**
   - Free with attribution
   - Many notification sounds available

3. **Pixabay**
   - Free sounds, no attribution required
   - Good selection of notification tones

### Option 2: Generate Custom Sound

Using audio software (Audacity, GarageBand, etc.):
- Create a pleasant chime or bell tone
- Keep it short (1-2 seconds)
- Use a fade-out to avoid abrupt endings
- Export as MP3 at 128kbps

### Option 3: Text-to-Speech (Simple)

For a quick solution, use a simple tone generator:
- Online tone generators can create notification beeps
- Export as MP3

## Installation

1. Download or create your sound file
2. Name it `new-order.mp3`
3. Replace the placeholder file at:
   ```
   apps/web/public/sounds/new-order.mp3
   ```
4. Test in the vendor dashboard:
   - Place a test order
   - Verify sound plays when order arrives
   - Check volume is appropriate

## Testing

1. **Browser Compatibility**
   - Test in Chrome, Firefox, Safari, Edge
   - Some browsers require user interaction before allowing audio

2. **Autoplay Policy**
   - Modern browsers block autoplay
   - Sound will play after first user interaction
   - Fallback: Vibration API (mobile devices)

3. **Volume Testing**
   - Test in actual bar/restaurant environment
   - Ensure sound is audible but not disruptive
   - Adjust volume in code if needed (see `useOrderQueue.ts`)

## Code Configuration

The sound is played in `apps/web/hooks/vendor/useOrderQueue.ts`:

```typescript
const playNotificationSound = () => {
  const soundAlertsEnabled = localStorage.getItem('vendor_sound_alerts') !== 'false';
  
  if (!soundAlertsEnabled) return;
  
  const audio = new Audio('/sounds/new-order.mp3');
  audio.volume = 0.7; // Adjust if needed (0.0 - 1.0)
  audio.play().catch(/* fallback to vibration */);
};
```

## User Preferences

Vendors can enable/disable sound alerts in Settings:
- `/vendor/settings` → Notifications → Sound Alerts toggle
- Preference stored in `localStorage`
- Default: Enabled

## Accessibility

- Sound is optional and can be disabled
- Fallback to vibration on mobile devices
- Visual notification (toast) always shown
- Push notifications available as alternative

## Alternative Formats

If MP3 doesn't work well, consider:
- **OGG**: Better compression, good browser support
- **WAV**: Uncompressed, larger file size
- **WebM Audio**: Modern format, good compression

Update file extension and path in code if using alternative format.
