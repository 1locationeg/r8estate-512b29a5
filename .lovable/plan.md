
Root cause is likely deeper than the earlier loading guard.

What I found:
- `useBusinessProfile()` is used in multiple places (`DevOverview`, `DevReviews`, `DevCategories`, `DevSettings`, `DevBusinessProfile`, `DeveloperDashboard`, `useGamification`).
- Because it is a custom hook with local `useState`, every usage creates its own separate profile state and its own fetch/save lifecycle.
- `business_profiles.user_id` was originally unique, but that constraint was later removed. So one user can now have multiple root business profiles.
- Current fetch logic picks the latest root row with `.is('parent_id', null).order(...).limit(1)`, but save logic updates `profile.id` from the local hook instance or inserts a new row if that instance still has no `id`.
- That means different components can read/write different rows or one hook can still think “no profile exists” and insert another row. This matches the symptom: saved form data exists, but completion still shows `0%` in another part of the app.
- The “Messages under Dashboard” issue is partly UI behavior: on desktop the avatar opens a dropdown with Messages; on mobile the small avatar goes directly to dashboard and Messages is a separate icon. But there is also inconsistency because user/profile/role/menu state is not centralized cleanly.

Plan

1. Centralize business profile state
- Create a shared business-profile context/provider or equivalent single-source store.
- Move fetch, save, loading, and refetch logic out of the repeated per-component hook state.
- Make `useBusinessProfile()` read from that shared source instead of creating isolated state each time.

2. Make profile selection deterministic
- Always load one canonical primary business profile for the signed-in business user.
- Prefer an existing root profile (`parent_id IS NULL`) and never let normal profile editing accidentally target a child business row.
- Ensure save always updates that canonical row after the first fetch.

3. Stop accidental duplicate root profile creation
- Change save flow so it does not insert a new root profile just because one component mounted before another finished fetching.
- Add a backend migration to enforce only one root business profile per user, while still allowing child rows for sub-businesses/projects.
- Clean up policy/constraint design so the dashboard profile editor and categories editor both operate on the same row.

4. Make gamification read the shared profile
- Update `useGamification()` to consume the centralized business profile state instead of spinning up its own independent fetch.
- Keep the loading state explicit so completion is never computed from an empty fallback while the canonical profile is unresolved.

5. Make avatar/menu behavior consistent
- Refactor `UserAvatarAnchor` so behavior is explicit by mode:
  - desktop: dropdown with Dashboard, Messages, Sign Out
  - mobile: keep direct dashboard tap only if intended, otherwise add a consistent sheet/dropdown action path
- Avoid showing partial auth/profile UI before auth and role are fully resolved.
- Add missing translation key for `nav.messages`, since it is currently referenced with fallback text only and not defined in locale files.

6. Wire dashboard screens to the same source
- Update `DevBusinessProfile`, `DevSettings`, `DevOverview`, and any category/image upload refresh logic to use the shared business profile store.
- Replace full-page reload style refreshes (like cover upload callback) with shared refetch/update so completion updates immediately everywhere.

7. Verify against the reported bug
- Check these exact scenarios after implementation:
  - fill profile fields and save → completion percentage updates immediately
  - refresh page → completion stays correct
  - open avatar menu on desktop → Dashboard + Messages + Sign Out always visible
  - mobile header still behaves intentionally and consistently
  - category/logo/cover/license updates also affect completion without needing repeated saves

Technical details
- Best long-term fix is not another loading tweak; it is removing duplicated local business-profile state.
- Backend migration should enforce “one root profile per user” using a partial unique index on root rows, while preserving child records:
```text
unique root row per user where parent_id is null
child rows allowed where parent_id is not null
```
- This will prevent the app from drifting into multiple competing “main” profiles again.
- The existing removed `user_id` uniqueness is likely what allowed this bug to become persistent.
