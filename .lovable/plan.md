

# Auto-Update PWA Setup

## What This Does
When you update the app, users who have it installed on their home screen (or open in a browser) will automatically get the latest version — either silently in the background or with a brief "Update available" prompt. No action needed from users.

## How It Works
A **service worker** runs in the background on users' devices. When you publish a new version, the service worker detects the change and either:
- Silently updates and applies on next visit, OR
- Shows a subtle toast saying "New version available" and auto-reloads

We'll use the **silent auto-reload** approach so users always get the latest without any interaction.

## Technical Plan

### 1. Install `vite-plugin-pwa` dependency
Adds service worker generation and manifest support to the build.

### 2. Configure `vite.config.ts`
- Add `VitePWA` plugin with:
  - `registerType: 'autoUpdate'` — silently updates in background
  - Web app manifest (name, icons, theme color, display: standalone)
  - `navigateFallbackDenylist: [/^\/~oauth/]` — protect auth flows
  - Workbox config with sensible precache limits

### 3. Create `public/manifest.webmanifest`
- App name: R8ESTATE
- Icons: existing `pwa-192x192.png` and `pwa-512x512.png`
- Theme/background colors matching the app
- `display: standalone`, `start_url: /`

### 4. Update `index.html`
- Add `<link rel="manifest">` tag
- Add `<meta name="apple-mobile-web-app-capable">` and related iOS tags

### 5. Add update detection in `src/main.tsx`
- Register the service worker with auto-update
- On `controllerchange` event, reload the page so users instantly see new content
- This means: deploy → user opens app → gets new version automatically

### Files to change
1. `package.json` — add `vite-plugin-pwa` dependency
2. `vite.config.ts` — configure PWA plugin
3. `index.html` — add manifest link + PWA meta tags
4. `src/main.tsx` — add service worker registration with auto-reload on update

