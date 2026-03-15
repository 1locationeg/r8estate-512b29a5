

## Plan: Add Trustpilot-style "See What People Are Saying" Review Carousel

### Reference Analysis
The uploaded image shows a Trustpilot-style section with:
- Title: "See what people are saying about [Brand]"
- Subtitle explaining continuous improvement
- Horizontally scrollable review cards with star ratings, title, snippet, author, and time
- Bottom bar: "Rated X.X / 5 based on N reviews" + brand logo
- The user wants R8ESTATE branding (logo + house-star icons instead of Trustpilot stars)

### Best Position
Place it **between the TractionStats and the FeaturedIdentitySpotlight** on the landing page, specifically right after the HeroCategoryLinks/search area and before the Spotlight section. This gives social proof immediately after users see the search and stats, reinforcing trust before they browse featured developers. In the Index.tsx flow, it goes right before `<FeaturedIdentitySpotlight />` (line ~264).

### Implementation

**1. Copy brand assets to project**
- Copy `user-uploads://LOGO_word_SLOGAN.jpg` to `src/assets/logo-slogan.jpg`
- Copy `user-uploads://stars.png` to `src/assets/r8-stars.png`

**2. Create `src/components/ReviewsCarousel.tsx`**
A new Trustpilot-inspired section with R8ESTATE branding:
- **Header**: "See what people are saying about R8ESTATE" (bold, centered) + subtitle
- **Carousel**: Horizontally scrollable row of review cards fetched from the `reviews` mock data, showing:
  - R8ESTATE house-star rating icons (using the uploaded stars asset) instead of Trustpilot green stars
  - Review title (first ~40 chars of comment, bold)
  - Review snippet (comment, 2-line clamp)
  - Author name + relative time
  - Right arrow button to scroll
- **Footer bar**: "Rated X.X / 5 based on N reviews. Showing our latest reviews." + R8ESTATE logo
- **Mobile PWA optimizations**: 
  - Touch-friendly horizontal scroll with momentum (`-webkit-overflow-scrolling: touch`, `scrollbar-hide`)
  - Cards snap to edges (`scroll-snap-type: x mandatory`)
  - Full-width cards on small screens, 280px on larger
  - 44px min touch targets for navigation arrows
  - Safe area padding

**3. Update `src/pages/Index.tsx`**
- Import and render `<ReviewsCarousel />` in the buyers view, placed between the category links area and the FeaturedIdentitySpotlight (around line 263, just before the Spotlight conditional block)

**4. Add i18n keys** to `en.json` and `ar.json`:
- `reviews.carouselTitle`: "See what people are saying about R8ESTATE" / Arabic equivalent
- `reviews.carouselSubtitle`: "We aim to continuously improve..." / Arabic equivalent
- `reviews.basedOn`: "Rated {rating} / 5 based on {count} reviews" / Arabic equivalent
- `reviews.trustedBy`: "Trusted by R8ESTATE"

### Technical Notes
- Reviews sourced from `src/data/mockData.ts` (existing `reviews` array)
- Star rating icons rendered using the uploaded `stars.png` asset (house-shaped stars) for the card headers, and standard star rendering for individual ratings
- Auto-scroll interval every 5s with pause on touch/hover
- Uses `useRef` for scroll container + scroll-snap CSS for smooth mobile swiping

