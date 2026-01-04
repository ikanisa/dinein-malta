# Nano Banana Image Generation Implementation

## Overview

Updated the Gemini Edge Function to use **Nano Banana** (Google's Gemini image generation feature) instead of Imagen.

Reference: https://gemini.google/es/overview/image-generation/

## Nano Banana Models

### Nano Banana (Fast)
- **Model**: `gemini-2.0-flash-exp`
- **Use case**: Quick, informal content
- **Resolution**: 1K
- **Features**:
  - Character consistency
  - Photo combination
  - Local edits

### Nano Banana Pro (Advanced)
- **Model**: `gemini-2.0-flash-thinking-exp`
- **Use case**: Professional results with precise control
- **Resolution**: 2K
- **Features**:
  - Advanced text rendering (sharp, clear text)
  - Precise editing controls (lighting, camera angle, aspect ratio)
  - Improved world knowledge (better for infographics, diagrams)
  - Combining more photos

## Implementation

The `handleGenerateImage` function in `supabase/functions/gemini-features/index.ts` now:

1. Uses Gemini API endpoint for image generation
2. Automatically selects Pro model for 2K resolution requests
3. Uses Fast model for 1K resolution requests
4. Returns base64-encoded PNG data URI

## Usage

```typescript
// Fast model (1K resolution)
{
  "action": "generate-image",
  "payload": {
    "prompt": "Professional appetizing food photography of pizza",
    "size": "1K"
  }
}

// Pro model (2K resolution, advanced features)
{
  "action": "generate-image",
  "payload": {
    "prompt": "Professional appetizing food photography of pizza",
    "size": "2K",
    "model": "gemini-2.0-flash-thinking-exp"
  }
}
```

## Deployment

```bash
supabase functions deploy gemini-features --project-ref elhlcdiosomutugpneoc
```

## Notes

- Nano Banana is accessed through the Gemini API
- Imagen is a separate Google product (not used here)
- The API endpoint format may need adjustment based on actual Gemini API documentation
- Currently uses `generateContent` endpoint with image generation prompts

