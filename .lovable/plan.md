

## Plan: Secret Easter Egg to "Coming Soon Products" Page

### What it does
Clicking the "TRUSTPLATFORM" badge on the homepage while holding Ctrl (desktop) or long-pressing it (mobile) navigates to a new `/products` page that showcases the R8ESTATE product ecosystem from the uploaded HTML file.

### Changes

**1. New page: `src/pages/Products.tsx`**
- Convert the uploaded HTML into a React component styled with Tailwind (dark theme, gold accents matching the uploaded design).
- Display all 10 products (R8 Map, Meter, Pulse, Intel, Shield, Check, Certified, Track, Voice, Keys) in a grid with journey stages, flywheel diagram, and footer.
- Add a subtle "back to home" link.

**2. Add route in `src/App.tsx`**
- Add a lazy-loaded route: `/products` → `Products` page.

**3. Add secret trigger in `src/pages/Index.tsx` (line ~274)**
- On the "TRUSTPLATFORM" `<p>` element:
  - **Desktop**: `onClick` handler checks `e.ctrlKey || e.metaKey` → if true, navigate to `/products`.
  - **Mobile**: `onTouchStart`/`onTouchEnd` handlers implement a long-press (hold ~800ms) → navigate to `/products`. Visual feedback: slight scale pulse after 500ms to hint something is happening.
- No visible UI change — the badge looks and behaves normally for regular clicks.

### Technical details

```text
User clicks "TRUSTPLATFORM"
  ├── Ctrl/Cmd held? → navigate("/products")
  ├── Long-press (800ms)? → navigate("/products")
  └── Normal click → nothing (existing behavior)
```

The Products page will use the app's existing dark mode tokens where possible, with custom overrides for the gold/grain aesthetic from the uploaded file.

