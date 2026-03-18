
Goal: make returning users stay signed in on the same device like a normal consumer app, instead of only marking the device as “known” while still showing Sign In / Sign Up.

What I found:
- The app already stores the real auth session in browser storage via the auth client, so persistent login should come from that session.
- Separately, there is a custom `r8_device_token` system in `src/utils/deviceAuth.ts`, but it does not restore authentication. It only remembers the device.
- The home/header/mobile nav decide between “Dashboard” vs “Sign In” only from `user` in `AuthContext`, not from the remembered device token.
- `GuestTimerContext` uses the remembered device to skip the guest timer, which is why the app can “know” the device but still show the signed-out UI.
- `AuthContext` also aggressively clears session state on `getSession()` error / token refresh failure, which can make persistence feel fragile.
- Important technical note: preview and published URLs are different origins, so login persistence does not carry between them.

Implementation plan:
1. Reframe the auth model
- Treat the real auth session as the source of truth for “logged in”.
- Treat the device token only as a helper for UX, never as a secure replacement for authentication.
- Keep the current secure behavior that roles and protected pages depend on real authenticated sessions only.

2. Harden session persistence in `AuthContext`
- Refactor startup hydration so the app clearly distinguishes:
  - “auth is still loading”
  - “authenticated session found”
  - “no session found”
  - “session invalid and must be cleared”
- Reduce unnecessary forced sign-outs during initialization unless the session is truly unusable.
- Refresh the device expiry whenever a valid session is restored, not only right after a fresh login.

3. Stop showing signed-out CTAs too early
- Update homepage/header/mobile navigation logic so it does not render “Sign In / Sign Up” while auth is still hydrating.
- Show a neutral loading state during auth bootstrap to avoid false signed-out flashes.

4. Add a returning-device fallback UX
- When there is no active session but a valid remembered device exists, replace generic “Sign In / Sign Up” with a clearer returning-user action such as:
  - “Continue to your account”
  - optional small email hint if available from the device token
- This should route into the auth page in a friendlier returning-user state instead of looking like a brand-new visitor flow.
- This does not bypass auth; it just gives returning users a better re-entry path if the real session has expired.

5. Respect explicit logout
- Keep explicit Sign Out as a real sign-out.
- If the user logs out intentionally, the app should not silently re-authenticate them.
- However, the post-logout UX can still be improved so the device is recognized and the app offers a “Continue as…” style entry instead of a cold new-user state.

6. Unify remembered-device logic
- Reuse the shared helper from `deviceAuth.ts` everywhere instead of duplicating fingerprint parsing inside `GuestTimerContext`.
- Use the same helper in:
  - homepage header CTA logic
  - mobile nav / bottom nav
  - guest timer behavior
- This keeps all “known device” behavior consistent.

7. Update key UI surfaces
- `src/contexts/AuthContext.tsx`
  - harden initialization and session restoration
  - expose enough state for “loading vs signed out vs returning device”
- `src/utils/deviceAuth.ts`
  - keep device metadata focused on UX-only helpers
- `src/contexts/GuestTimerContext.tsx`
  - switch to the shared remembered-device helper
- `src/pages/Index.tsx`
  - replace generic signed-out buttons for remembered devices with a returning-user CTA
- `src/components/MobileNav.tsx` and `src/components/BottomNav.tsx`
  - mirror the same returning-user CTA behavior on mobile

What this will change for users:
- If they are truly still signed in, the app should open directly to their account state and show dashboard actions.
- If their session expired but the device is recognized, the app will no longer feel like a brand-new visitor flow; it will offer a faster “continue” path.
- If they explicitly signed out, they will stay signed out, which is the expected secure behavior.

No backend/database changes needed:
- The current database role/profile setup is already appropriate.
- This is primarily a client-side auth persistence and UX consistency fix.

Technical note:
- Facebook-style persistence cannot be achieved securely with only a custom local device token.
- The correct approach is: preserve the real auth session as long as possible, and use the remembered-device token only to improve the signed-out UX when a session is gone.
- Also, testing must be done on the same origin: preview and published are separate sites, so each keeps its own session storage.

Validation checklist:
- Sign in, close the tab, reopen on the same URL, and confirm the user is still recognized.
- Refresh the page and confirm no temporary Sign In / Sign Up flicker appears.
- Check homepage, mobile menu, and dashboard entry points.
- Test explicit Sign Out and confirm it still signs out securely.
- Test both preview and published separately so expectations match per-origin session storage.
