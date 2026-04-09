

## Fix Contact Page Header Language

### Problem
The `contact_page_title` and `contact_page_subtitle` values in the `platform_settings` database table are stored in Arabic ("تواصل معنا" and "نحن هنا لمساعدتك..."). The code loads these from the database and uses them directly, overriding the English fallback defaults.

### Solution
Two changes are needed:

**1. Database Migration** — Update the two stored settings to English:
- `contact_page_title`: `"Contact Us"`
- `contact_page_subtitle`: `"We're here to help. Please don't hesitate to ask for help straight away."`

**2. Code Update in `src/pages/ContactPage.tsx`** — Make the title/subtitle language-aware so they show Arabic when in Arabic mode and English when in English mode. Change lines 104-105 to check the current language and use appropriate text:
- When `isRTL` (Arabic): show Arabic translations
- Otherwise: show the stored English value or the English default

This ensures the header always matches the user's selected language regardless of what's stored in the database.

### Files Modified
- `src/pages/ContactPage.tsx` (lines 104-105) — language-aware title/subtitle logic
- Database migration — update `platform_settings` rows

