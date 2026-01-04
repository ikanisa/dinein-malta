PWA icon pack generated from the provided logo.

Copy into EACH Next.js app (apps/admin and apps/vendor, and later apps/client):

1) Create folders:
   public/icons/

2) Copy these files into app public:
   - favicon.ico
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png
   - manifest.webmanifest
   - sw.js (optional, only if you register it)
   - icons/*  (all pngs inside)

Then:
- Link manifest at /manifest.webmanifest
- Set Apple touch icon /apple-touch-icon.png
- Ensure PWA install criteria: served over https + valid manifest + service worker registered.
