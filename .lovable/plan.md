

## Plan: Professional Contact Page with Admin Control

### What we're building
A dedicated, professional Contact Us page (replacing the current static placeholder) with a contact form, WhatsApp/Facebook Messenger integration, office info, and a full admin panel to control all content dynamically.

### 1. Database — New table + settings

**New `contact_submissions` table** to store form submissions:
- `id`, `user_id` (nullable — guests can submit), `name`, `email`, `phone`, `subject`, `message`, `status` (new/read/replied/archived), `admin_notes`, `created_at`
- RLS: authenticated admins can read all; anyone can insert; users can read their own

**Platform settings keys** (stored in existing `platform_settings`):
- `contact_page_title` — page heading (AR/EN)
- `contact_page_subtitle` — descriptive text below heading
- `contact_page_body` — rich text (Markdown) for additional info
- `contact_email` — display email
- `contact_phone` — display phone
- `contact_whatsapp` — WhatsApp number (opens wa.me link)
- `contact_facebook_messenger` — Messenger page username (opens m.me link)
- `contact_office_address` — office location text
- `contact_office_hours` — working hours text
- `contact_map_embed` — optional Google Maps embed URL

### 2. Contact Page (`src/pages/ContactPage.tsx`)

Professional layout following best practices (HubSpot, Intercom, Zendesk patterns):

- **Hero section**: Configurable title + subtitle with gradient/glassmorphism styling
- **Two-column layout** (desktop):
  - **Left**: Contact form (Name, Email, Phone, Subject dropdown, Message textarea, Submit button) with validation and success feedback
  - **Right**: Contact info cards — Email, Phone, WhatsApp (tap to open wa.me), Facebook Messenger (tap to open m.me), Office address, Working hours
- **Rich text body** below (rendered from Markdown via `react-markdown`)
- **Optional map embed** section
- Fully responsive (stacks on mobile), RTL-aware, bilingual (AR/EN)
- Navbar + Footer included for standard navigation

### 3. Where users find it (discoverability)

- Already in **Footer** → "Contact Us" link (exists, points to `/contact`)
- Already in **route registry** (exists)
- Add to **Navbar guest links** as a visible item for easy access
- The `/contact` route in `App.tsx` will point to the new `ContactPage` instead of `StaticPage`

### 4. Admin Panel (`src/components/AdminContactSettings.tsx`)

Two tabs:

**Tab 1 — Page Settings**: 
- Rich text editor (same pattern as AdminWelcomeMessage) for title, subtitle, body
- Input fields for email, phone, WhatsApp number, Messenger username, address, hours, map URL
- Save button with toast feedback

**Tab 2 — Submissions Inbox**:
- Table of contact form submissions with status badges (New/Read/Replied/Archived)
- Click to expand: full message, admin notes field, status change dropdown
- Unread count badge in sidebar nav

### 5. Admin Dashboard integration

- Add "Contact Page" nav item under **Communications** group with `Phone` icon
- Add route `/admin/contact` → `AdminContactSettings`

### Files to create/edit

| File | Action |
|------|--------|
| `supabase/migrations/..._contact_submissions.sql` | Create table + RLS + seed settings |
| `src/pages/ContactPage.tsx` | New professional contact page |
| `src/components/AdminContactSettings.tsx` | New admin panel (settings + inbox) |
| `src/pages/AdminDashboard.tsx` | Add nav item + route |
| `src/App.tsx` | Change `/contact` route from StaticPage to ContactPage |

