

# Fix Logo Visibility on Offline Page

## Problem
The logo icon in `public/offline.html` has poor contrast against the dark navy background — it's barely visible in the screenshot.

## Solution
Add a CSS filter to the logo icon to make it bright/white, ensuring it stands out against the dark background. Since this is a static HTML file (no React), we can't swap the image — but we can use CSS `filter: brightness(0) invert(1)` to make it white, or add a subtle light glow/drop-shadow behind it.

**Approach:** Add `filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)) brightness(1.3)` to `.logo-icon` to brighten it and add a soft white glow. If the icon has dark parts, use `filter: brightness(0) invert(1)` to make it fully white.

### File: `public/offline.html` (line 31)
- Update `.logo-icon` CSS to add `filter: brightness(0) invert(1) drop-shadow(0 0 6px rgba(255,255,255,0.3))` — this forces the icon white and adds a subtle glow for visibility.

