

# Add WhatsApp Support Link to Auth Page

## What
Add a "Need assistance? Contact support" row at the bottom of the auth card (below terms, above footer), with a WhatsApp icon that opens the platform's WhatsApp number — matching the attached image's style. The number comes from the existing `platform_settings` table (`whatsapp_number` key), already controlled in Admin → WhatsApp tab.

## Changes

### File: `src/pages/Auth.tsx`
1. Import the WhatsApp SVG icon (reuse the inline SVG pattern from `WhatsAppChatModal`)
2. Add a `useEffect` to fetch `whatsapp_number` from `platform_settings` (same pattern as `WhatsAppChatModal`)
3. After the terms paragraph (line ~396), add a compact row:
   - Left: "Need assistance?" in muted text
   - Right: "Contact support" link + WhatsApp icon (green)
   - Clicking opens `https://wa.me/{number}` in new tab
   - Hidden if no number is configured

### File: `src/i18n/locales/en.json`
- Add `auth.needAssistance`: "Need assistance?"
- Add `auth.contactSupport`: "Contact support"

### File: `src/i18n/locales/ar.json`
- Add `auth.needAssistance`: "هل تحتاج مساعدة؟"
- Add `auth.contactSupport`: "تواصل مع الدعم"

No admin changes needed — the WhatsApp number is already managed in Admin → WhatsApp settings tab.

