

## Plan: Generate Website Structure Documentation (DOCX + Standalone HTML)

### What You'll Get
Two downloadable files documenting the entire R8ESTATE platform architecture:
1. **R8ESTATE_Structure.docx** — Professional Word document
2. **R8ESTATE_Structure.html** — Standalone offline HTML file

### Content Covered

Both files will contain identical information organized into these sections:

1. **Platform Overview** — App name, tech stack, provider hierarchy
2. **All Routes & Pages** (30+ routes) — Path, page component, description, auth requirements
3. **Journey Funnel** — 4 stations (Research → Choose → Finance → Protect) with mapped routes
4. **Homepage Sections** (vertical layout order) — Hero tagline, CTAs, Trust Showcase, Traction Stats, Search Bar, Journey Scroll Sections, Next Steps, MiniJourneyArc, Live Market Pulse, Trust Strip, HowWeWork, widgets, footer
5. **Dashboard Pages** — Buyer (10 sub-routes), Business (sub-routes), Admin (sub-routes)
6. **Modals & Dialogs** (14+) — WriteReviewModal, CompareModal, ContractUploadModal, TrustInsightsModal, BusinessUpgradeModal, ClaimBusinessModal, DealRatingModal, LaunchRatingModal, ReviewBlockedModal, ItemDetailModal, DeveloperDetailModal, WhatsAppChatModal, DisclaimerModal, AddBusinessModal, CommunityNewPost, AdminWidgets dialogs
7. **Global UI Components** — Navbar, BottomNav, SideJourneyRail, JourneyStripe, FloatingChatFAB, PWAInstallBanner, GuestTimerBanner, CookieConsentBanner
8. **Embed/Chromeless Routes** — /embed/widget/:token, /review/:token, /go/:slug
9. **Business Categories** (19 categories) — Developers, Units, Apps, Shares, etc.
10. **Contexts & Providers** — Auth, BusinessLogo, BusinessProfile, GuestTimer, CookieConsent
11. **Edge Functions** (14 functions) — ai-chat, review-analysis, trust-insights, etc.
12. **User Flows** — Guest → Auth → Buyer/Business/Admin, Review submission, Business claiming

### Technical Approach
- Run a Node.js script using the `docx` library to generate the .docx file
- Generate a self-contained HTML file with inline Tailwind-like CSS, collapsible sections, and a table of contents
- Both output to `/mnt/documents/`

### Scope
- No codebase changes — script-only execution
- Two output files delivered as downloadable artifacts

