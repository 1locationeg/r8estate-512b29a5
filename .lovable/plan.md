## Problem

After a professional signs up, the avatar dropdown's "Dashboard" link still routes to `/business` (the company dashboard) instead of `/pro-dashboard`. The role in the database is `business` for both companies and individual professionals, so role alone can't distinguish them.

## Root Cause

`src/components/UserAvatarAnchor.tsx` computes the dashboard route from `role` only:
```
role === "business" ? "/business" : ...
```
The professional flag set during signup (`localStorage.oauth_account_kind === "professional"`) is ignored here. Same issue likely exists anywhere else that derives a dashboard route from role.

## Fix

1. **`src/components/UserAvatarAnchor.tsx`** — update the `dashRoute` fallback to check `localStorage.getItem("oauth_account_kind") === "professional"` first and return `/pro-dashboard` before falling back to the role-based mapping. Also surface "Professional" instead of "Business" in the dropdown role label when that flag is set.

2. **`src/pages/Auth.tsx`** — confirm `oauth_account_kind` is persisted (not cleared) after the post-signup redirect so subsequent navigations still resolve correctly. If it's being removed, keep it in localStorage as a long-lived account-kind marker.

3. **Audit other dashboard links** — quick search for `"/business"` navigations triggered from generic "Dashboard" buttons (e.g. BottomNav, header menus, any `getDashboardRoute` callers). Apply the same professional check via a small shared helper `getDashboardRouteForUser(role)` in `src/lib/utils.ts` (or similar) so the logic isn't duplicated.

## Out of scope

- No changes to the dashboards themselves.
- No DB schema changes; professional vs. business stays a client-side flag for now (matches the existing signup approach).
