

## Fix: Profile Completion 0% and Inconsistent Avatar Dropdown

### Root Cause

The `useBusinessProfile` hook depends on `user` from `useAuth()`, but it starts fetching before auth is fully initialized. During the race window:
- `user` is null → `fetchProfile` returns early → `profile` stays `null` → `calcProfileCompletion({})` returns **0%**
- `isLoading` stays `true` forever (never set to `false` when user is null)
- Once auth resolves, the hook re-fetches, but if the component already rendered with 0%, it may not update in time (or if multiple instances of `useBusinessProfile` across the dashboard compete)

Additionally, the avatar dropdown may render inconsistently because auth state (`profile`, `role`) arrives after the initial render via a deferred `setTimeout`.

### Plan

**File 1: `src/hooks/useBusinessProfile.ts`**
- Import `isLoading` from `useAuth()` alongside `user`
- Guard `fetchProfile` to wait until auth is done loading (`!isLoading`)
- When `user` is null AND auth is done loading, explicitly set `isLoading: false` and `profile: null` (don't leave isLoading stuck at `true`)
- Add `isLoading` from auth to the `useCallback` dependency array

**File 2: `src/hooks/useGamification.ts`**
- When `isLoading` is true, return safe defaults immediately (don't compute from empty profile)
- This prevents the brief 0% flash while data is loading

**File 3: `src/components/UserAvatarAnchor.tsx`**
- Add a guard: if `user` exists but `role` is still null (auth loading), show a loading skeleton instead of the dropdown — prevents rendering an incomplete menu
- This ensures the dropdown always shows Dashboard + Messages + Sign Out consistently

### Technical Detail

The core fix is ensuring `useBusinessProfile` never computes from stale/empty state by gating on auth readiness:

```text
Auth loading? → skip fetch, keep isLoading=true
Auth done, no user? → set isLoading=false, profile=null  
Auth done, user present? → fetch business profile
```

This eliminates the 0% → 80% flash and ensures the avatar dropdown only renders once auth state is complete.

