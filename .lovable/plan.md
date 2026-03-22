

# Deal Watch — Deal Review Feed

## Overview
Add a "Deal Watch" section — a Consumer Reports-style deal review feed where businesses submit deals and buyers rate them. Includes a public page, deal card component, rating modal, business submission form, admin moderation, and database tables.

## Database Changes

### Migration: Create `deals` and `deal_ratings` tables

```sql
-- Deal type enum
CREATE TYPE public.deal_type AS ENUM ('payment_plan', 'discount', 'early_access', 'exclusive_units', 'other');

-- Deal status enum  
CREATE TYPE public.deal_status AS ENUM ('pending', 'verified', 'rejected');

-- Deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  headline text NOT NULL,
  description text NOT NULL,
  deal_type deal_type NOT NULL DEFAULT 'other',
  valid_until date,
  tags text[] DEFAULT '{}',
  status deal_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  avg_rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Deal ratings table (one rating per user per deal)
CREATE TABLE public.deal_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  review_text text,
  is_verified_buyer boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
-- Public can see verified deals
CREATE POLICY "Anyone can read verified deals" ON public.deals FOR SELECT TO anon, authenticated USING (status = 'verified');
-- Business users see own deals (any status)
CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Business users insert own deals
CREATE POLICY "Users can insert own deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Business users update own pending deals
CREATE POLICY "Users can update own pending deals" ON public.deals FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');
-- Admins full access
CREATE POLICY "Admins can manage all deals" ON public.deals FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- RLS on deal_ratings
ALTER TABLE public.deal_ratings ENABLE ROW LEVEL SECURITY;
-- Anyone can read ratings
CREATE POLICY "Anyone can read deal ratings" ON public.deal_ratings FOR SELECT TO anon, authenticated USING (true);
-- Auth users insert own
CREATE POLICY "Users can insert own ratings" ON public.deal_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can update own
CREATE POLICY "Users can update own ratings" ON public.deal_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
-- Admins full access
CREATE POLICY "Admins can manage all ratings" ON public.deal_ratings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Trigger: update avg_rating on deals when rating inserted/updated
CREATE OR REPLACE FUNCTION public.update_deal_rating_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.deals SET
    avg_rating = (SELECT COALESCE(AVG(stars), 0) FROM public.deal_ratings WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)),
    rating_count = (SELECT COUNT(*) FROM public.deal_ratings WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER on_deal_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.deal_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_deal_rating_stats();

-- Trigger: notify business when deal status changes
CREATE OR REPLACE FUNCTION public.notify_deal_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('verified', 'rejected') THEN
    PERFORM public.create_notification(
      NEW.user_id, 'review_status',
      CASE NEW.status WHEN 'verified' THEN 'Deal Verified ✅' WHEN 'rejected' THEN 'Deal Not Approved ❌' END,
      CASE NEW.status
        WHEN 'verified' THEN 'Your deal "' || LEFT(NEW.headline, 50) || '" is now live on Deal Watch.'
        WHEN 'rejected' THEN 'Your deal "' || LEFT(NEW.headline, 50) || '" was not approved.' || CASE WHEN NEW.admin_notes IS NOT NULL THEN ' Reason: ' || NEW.admin_notes ELSE '' END
      END,
      jsonb_build_object('deal_id', NEW.id, 'status', NEW.status, 'link', '/deal-watch')
    );
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_deal_status_change
  AFTER UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.notify_deal_status_change();
```

## Frontend Changes

### New Files

1. **`src/pages/DealWatch.tsx`** — Public deal feed page
   - Header: "Deal Watch" title + "Beta" amber badge + subtitle
   - Filter bar: deal type dropdown, business type dropdown (from business_profiles), sort (Top Rated / Newest / Most Reviewed), search input
   - Fetches verified deals from `deals` table joined with `business_profiles` for logo/name/type
   - Renders grid of `<DealCard />` components
   - Empty state when no deals

2. **`src/components/DealCard.tsx`** — Reusable deal card
   - Top: business avatar + name + type badge (navy bg, gold text) + "Submitted by business" amber badge + "Verified" green badge
   - Body: headline, truncated description with "Read more", tags row
   - Rating: star display (avg), review count, expandable distribution bar
   - Actions: "Rate this deal" button (opens modal), "View business profile" link, share icon
   - Brand styling: white bg, 1px border, 12px radius, subtle shadow

3. **`src/components/DealRatingModal.tsx`** — Rating modal
   - Star selector (1-5 interactive)
   - Optional review text area
   - "I am a verified buyer" checkbox
   - Submit button, trust note at bottom
   - Inserts into `deal_ratings`, handles unique constraint (one per user per deal)

4. **`src/components/DealSubmitForm.tsx`** — Business dashboard form
   - Headline (max 80), deal type dropdown, description (max 300), valid_until date picker, tags (max 5), T&C checkbox
   - Submit → inserts into `deals` with status `pending`
   - Shows list of business's own deals with status badges

### Modified Files

5. **`src/App.tsx`** — Add lazy route `/deal-watch` → `DealWatch`

6. **`src/components/BottomNav.tsx`** — Add "Deals" tab with `Tag` icon between Reviews and Categories (reorder to: Reviews → Deals → Brand → Categories → Insights; drop Portfolio from bottom nav to make room)

7. **`src/pages/DeveloperDashboard.tsx`** — Add "Submit Deal" nav item + route to `DealSubmitForm`

8. **`src/pages/AdminDashboard.tsx`** — Add "Deal Moderation" nav item under "Reviews & Moderation" group + route to new `AdminDealModeration` component

9. **`src/components/AdminDealModeration.tsx`** — Admin page to list pending/all deals, approve/reject with notes (same pattern as `AdminModerationQueue`)

10. **`src/i18n/locales/en.json`** + **`ar.json`** — Add deal-related translation keys

## Key Design Decisions
- "Submitted by business" badge on EVERY card — non-negotiable trust signal
- No "Sponsored", "Featured", or paid ranking anywhere
- Deals enter as `pending`, admin verifies → `verified` or `rejected`
- One rating per user per deal enforced at DB level (unique constraint)
- Rating stats (avg, count) denormalized on deals table via trigger for fast reads

