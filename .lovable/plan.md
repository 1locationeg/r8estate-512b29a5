

## Registration Slot Counter — Admin Control + Public Display

### What it does
A "Registration Slots" system similar to the Guest Timer panel. The admin sets a total slot count (e.g. 100) and toggles the feature on/off. A public-facing banner/widget shows visitors how many slots remain, counting only actual registered users (rows in `profiles` table), not just sign-up clicks. The bar fills up as real users complete registration.

### Implementation

**1. Admin Panel — `AdminRegistrationSlots.tsx`**
- Similar structure to `AdminGuestTimer.tsx`
- Settings stored in `platform_settings` table (no migration needed):
  - `registration_slots_enabled` → `"true"/"false"`
  - `registration_slots_total` → e.g. `"100"`
- Toggle switch to enable/disable
- Numeric input + slider for total slots (range 10–1000)
- Live display: queries `profiles` table count to show current registrations vs total
- Save button upserts to `platform_settings`

**2. Public-facing Banner — `RegistrationSlotsBanner.tsx`**
- Shown on homepage and/or auth page when enabled
- Fetches `registration_slots_enabled` and `registration_slots_total` from `platform_settings`
- Counts registered users via `supabase.from('profiles').select('id', { count: 'exact', head: true })`
- Displays: "X of 100 slots claimed" with a progress bar
- When slots are full, shows "All slots taken" state
- Urgent styling when <10% slots remain

**3. Wiring**
- Add route `/admin/registration-slots` in `AdminDashboard.tsx`
- Add nav item under "Settings" group with a `Users` icon
- Add `RegistrationSlotsBanner` to `Auth.tsx` page (above the form) and optionally to the homepage
- No database migration needed — uses existing `platform_settings` table

**4. Files to create/edit**
- **Create**: `src/components/AdminRegistrationSlots.tsx`
- **Create**: `src/components/RegistrationSlotsBanner.tsx`
- **Edit**: `src/pages/AdminDashboard.tsx` — add nav item + route + import
- **Edit**: `src/pages/Auth.tsx` — render `RegistrationSlotsBanner` at top

