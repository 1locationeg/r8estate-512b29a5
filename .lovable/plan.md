

## Plan: Enhanced Business Account Profile & Dashboard

### What We're Building
A polished Business Account experience for the Developer dashboard, inspired by the Trustpilot Business reference image but styled with R8ESTATE's navy/minimal/AI aesthetic. The business profile acts as a "parent" entity that owns the dashboard.

### Changes

#### 1. Business Profile Header Component (`src/components/BusinessProfileHeader.tsx`)
A new reusable component displayed at the top of the Developer Dashboard overview, showing:
- Company logo/avatar with initials and a verified badge
- Company name, location, and industry tags
- Trust score gauge (mini) and star rating inline
- Quick action buttons: "Edit Profile", "Share Page", "View Public Profile"
- Clean card layout with subtle border, matching existing `bg-card` + `border-border` patterns

#### 2. Sidebar Enhancement (`DashboardSidebar.tsx`)
- Add a "Business Profile" nav item at the top of the nav list with a `Building2` icon, linking to `/developer/profile`
- The existing company info card in the sidebar stays but gets a subtle "Verified" indicator if applicable

#### 3. Business Profile Page (`DevBusinessProfile` section in `DeveloperDashboard.tsx`)
A new route `/developer/profile` with:
- **Company Info Card**: Name, logo upload area, description/bio, location, year established, specialties
- **Contact Details**: Email, phone, website, social links
- **Business Documents**: Placeholder for license/registration uploads
- **Public Profile Preview**: Mini preview of how the business appears to buyers
- All form fields use existing input styling (bg-secondary, rounded-lg, border)

#### 4. Dashboard Overview Refresh (`DevOverview` in `DeveloperDashboard.tsx`)
- Add the `BusinessProfileHeader` component at the top of the overview
- Refine stat cards with slightly updated icons from Lucide (keep `Star`, `Edit`, `Eye` but add subtle background gradients)
- Add a "Profile Completion" progress bar below the header showing % complete
- Keep existing charts and reviews list intact

#### 5. Files Changed

| File | Change |
|------|--------|
| `src/components/BusinessProfileHeader.tsx` | **New** — Business profile card component |
| `src/pages/DeveloperDashboard.tsx` | Add profile route, update overview with profile header, add nav item |
| `src/components/DashboardSidebar.tsx` | No changes needed (already supports companyInfo) |

No database changes needed — this uses existing profile data and mock data for the business entity.

