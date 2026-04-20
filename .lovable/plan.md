

# NFC Tap-to-Trust System

Add a physical-to-digital bridge: **NFC chips/cards** that businesses can program to point to their R8ESTATE profile, a review request page, or any custom URL. Admins control everything globally; business owners control the URL behind their own NFC tag.

## How it works (real-world flow)

```text
Customer at developer's sales office
        │
        │  taps phone on NFC card / sticker / business card
        ▼
Phone opens: r8estate.com/n/{tag_code}
        │
        │  (logs the tap: device, location, time)
        ▼
Redirects to whatever the business set:
  • Their R8ESTATE profile     (default)
  • "Leave a review" page       (frictionless review)
  • Their projects page
  • Custom URL (with admin approval)
```

NFC tags are cheap (~5-10 EGP each), reprogrammable from the dashboard without re-printing — that's the killer feature. A developer prints 1,000 cards once; behind the scenes the destination changes anytime.

## What we'll build

### 1. Database — new `nfc_tags` table
| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | PK |
| `tag_code` | text unique | Short URL slug (e.g. `pHcL3`) — what's encoded on the chip |
| `business_id` | uuid → business_profiles | Owner |
| `label` | text | Friendly name ("Sales office reception", "Mostafa's card") |
| `destination_type` | enum | `profile` / `review` / `projects` / `custom` |
| `custom_url` | text | Used when type = custom |
| `is_active` | boolean | Owner can pause |
| `is_blocked` | boolean | Admin override |
| `tap_count` | int | Cached counter |
| `created_at`, `updated_at` | timestamps | |

Plus `nfc_tag_taps` table (similar to `link_clicks`): `tag_id`, `clicked_at`, `device_type`, `browser`, `country`, `referrer`.

**RLS:** business owners CRUD only their own tags; admins manage all; anyone (anon) can read active tags by `tag_code` for the redirect to work.

### 2. Public redirect route — `/n/:tagCode`
New lightweight `NFCRedirect.tsx` page (mirrors `SmartLinkRedirect`):
- Looks up `tag_code`, checks `is_active && !is_blocked`
- Logs the tap (fire-and-forget) with device/browser
- Resolves destination based on `destination_type` (profile → `/entity/:business_id`, review → `/review?to=:business_id`, custom → external URL)
- Increments `tap_count` via DB trigger

### 3. Business dashboard — new "NFC Tags" section
Added to business sidebar at `/business/nfc`:
- **List view:** all tags with label, current destination, tap count, status toggle, edit/delete
- **Create modal:** auto-generates `tag_code` (5-char nanoid), pick label + destination type, optional custom URL
- **Programming instructions:** shows the URL to encode (`https://r8estate.com/n/{tag_code}`) + step-by-step guide to write it onto a tag using free phone apps (NFC Tools — iOS/Android)
- **QR fallback:** auto-generates a QR code of the same URL (printable for those without NFC)
- **Analytics card:** total taps, taps in last 7/30 days, simple line chart

### 4. Admin dashboard — new "NFC Management" section
Added at `/admin/nfc`:
- **Global table** of all tags across all businesses (search, filter by business, status)
- **Block/unblock** any tag (e.g. abuse, expired campaign)
- **Bulk pre-generate** tag codes for physical printing batches (assign to business later)
- **Custom URL approval queue** — when business sets `destination_type=custom`, it goes to `pending_approval` until admin verifies (anti-phishing)
- **Aggregate analytics:** taps platform-wide, top performing businesses, device/country breakdown

### 5. Custom URL safety
Custom URLs are the abuse vector (phishing). Three layers:
1. Domain blocklist (no `bit.ly`, no IP addresses, no non-HTTPS)
2. Admin approval required before activation
3. Interstitial page warning when redirecting off-platform: *"You're leaving R8ESTATE → going to {domain} → Continue / Cancel"*

## Technical specifics

- **Tag URL pattern:** `https://r8estate.com/n/{tag_code}` (short, fits comfortably in NTAG213 chip's 144 bytes)
- **Tag code generation:** 5-char base62 via `nanoid` → 916M combinations
- **Files to create:** `src/pages/NFCRedirect.tsx`, `src/components/BusinessNFC.tsx`, `src/components/AdminNFCManagement.tsx`, migration for `nfc_tags` + `nfc_tag_taps` tables + RPC `log_nfc_tap`
- **Files to edit:** `src/App.tsx` (route `/n/:tagCode`), `src/pages/DeveloperDashboard.tsx` (sidebar + route), `src/pages/AdminDashboard.tsx` (sidebar + route), `src/data/routeRegistry.ts`
- **QR generation:** `qrcode.react` (lightweight, no extra deps if not already installed)
- **No physical NFC hardware needed from us** — businesses buy blank NTAG213/215 stickers from Amazon/AliExpress (~3-5 EGP each) and program them once with the free "NFC Tools" app

## What you get

- Brand-new revenue-adjacent product: sell branded R8ESTATE NFC cards as a Pro-tier perk
- Bridges offline → online (sales offices, business cards, brochures, model unit tags)
- Fully reprogrammable destinations without reprinting
- Real attribution data: which physical location is generating the most taps

