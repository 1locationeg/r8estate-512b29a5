## Goal
Let a Super Admin upgrade any user to a **Professional** account directly from the Admin → Users table, which immediately gives them a working Trust / Professional Profile page (e.g. `/pro/<their-name>`).

## How it will work

1. **Admin UI** — In the User Management table (and the user detail sheet), add a new pill button **"Make Professional"** next to the existing Buyer / Business / Admin role buttons.
   - If the user is already a professional, the pill turns green and shows **"Professional ✓"** with a "Revert to Buyer" option.
   - Add an **"Open Trust Page"** quick link (uses their name slug) once they are professional, mirroring the existing "Open Page" link for businesses.

2. **What the upgrade does** (single click, atomic):
   - Sets `user_account_kinds.account_kind = 'professional'` for that user.
   - Initialises a default professional profile entry so their `/pro/<slug>` page resolves immediately (uses their `full_name` and avatar from `profiles`).
   - Sends them an in-app notification: *"You've been upgraded to a Professional account — your Trust Page is live."*
   - Toast confirmation in the admin UI with a "View Trust Page" link.

3. **Permissions** — Only Super Admin (and admins with edit permission) can perform the upgrade. Reuses the existing `is_super_admin` / `has_role` checks already used in the User Management screen.

4. **Slug behaviour** — Reuses the existing `slugify(full_name)` already added to `ProfessionalProfile.tsx`. If the resulting slug collides with another professional, append a short suffix.

## Technical details

- **DB migration**: new RPC `admin_set_account_kind(_target_user uuid, _kind text)` — security-definer, restricted to admins, upserts into `user_account_kinds` and inserts a notification row. No schema changes needed beyond the function.
- **Frontend**:
  - `src/pages/AdminDashboard.tsx` — add `handleAccountKindChange`, render the new pill in the table row + detail sheet.
  - `src/components/AdminUserDetailSheet.tsx` — same control inside the sheet.
  - Refresh `nonAdminUsers` after success (extend the user query to also fetch `account_kind` per user so the button state is accurate).
- **Trust page**: no changes needed — `ProfessionalProfile.tsx` already overlays signed-in professional identity onto the template, so the page works as soon as `account_kind = 'professional'`.

## Out of scope
- Billing / paid plan flows (this is an admin-granted upgrade).
- Editing the professional profile content from the admin panel (the user edits their own page after upgrade).