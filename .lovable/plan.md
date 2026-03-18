
Goal: remove the white flash on app open and replace it with a branded, stable loading experience that feels intentional.

Diagnosis:
1. The browser shows a blank white page before React mounts because `index.html` renders an empty `#root`.
2. The `/` route fallback uses a generic skeleton, so the landing page does not feel “ready” during lazy loading.
3. `HeroTrustShowcase` still lets the review area appear late, so users see an empty/unfinished hero state on first load.

Implementation plan:
1. Add an instant branded boot shell
   - Create a lightweight opening shell directly in `index.html` with inline CSS so it appears before JavaScript loads.
   - Match the app brand: soft background, logo/header feel, trust gauge placeholder, and a static review card placeholder.
   - This solves the true “white flash” before the app mounts.

2. Fade the boot shell out only after first app paint
   - In `src/main.tsx`, keep the shell visible until React has mounted, then remove it with a short fade.
   - Use a minimal delay / `requestAnimationFrame` so the user never sees blank white between shell and app.

3. Replace the current home fallback with a branded landing skeleton
   - Update `src/components/PageSkeletons.tsx` so `IndexSkeleton` mirrors the real home layout:
     - header
     - hero trust area
     - static review card
     - search bar
     - quick stats / cards
   - This makes route loading feel like a polished opening state, not generic placeholders.

4. Make `HeroTrustShowcase` non-empty from frame one
   - In `src/components/HeroTrustShowcase.tsx`, render a static review card/skeleton immediately instead of fading the whole card in from nothing.
   - Animate only the score / marker / content details inside the card.
   - Keep layout height fixed from the first frame to avoid perceived flashing or jumping.

5. Lock background colors at document level
   - Ensure `html`, `body`, and `#root` always share the branded background color and full-height sizing.
   - This prevents any fallback to browser white during startup, route change, or repaint.

Recommended approach:
- Best solution is a hybrid:
  - document-level branded boot shell for the very first paint
  - improved home skeleton for route loading
  - immediate static review card inside `HeroTrustShowcase`
- This is better than only adding a static review card, because it fixes both the pre-React white flash and the in-app loading state.

Files to update:
- `index.html`
- `src/main.tsx`
- `src/index.css`
- `src/components/PageSkeletons.tsx`
- `src/components/HeroTrustShowcase.tsx`

Expected result:
- No white blank screen on open
- The app opens with a branded loading view immediately
- The hero feels stable on first load, with a visible static review/card area instead of an empty flash
- Mobile startup feels much smoother and closer to a native app

Technical notes:
- No backend changes needed.
- I would keep the boot shell very lightweight and static so it loads instantly.
- I would reuse the current visual language from the landing hero rather than inventing a separate loading design.
- If needed later, we can also preload the home route chunk and logo asset, but the boot shell + stable hero should solve the main issue first.

<lov-actions>
<lov-suggestion message="Test the app opening flow end-to-end on mobile and refresh several times to confirm the white flash is gone and the loading transition feels smooth.">Verify that it works</lov-suggestion>
<lov-suggestion message="Make the opening loading shell match the hero card in the screenshot more closely, including the trust arc, static review card, and brand spacing.">Refine opening splash</lov-suggestion>
<lov-suggestion message="Add a subtle fade-and-scale exit animation when the opening loading shell hands off to the home page.">Polish the transition</lov-suggestion>
</lov-actions>
