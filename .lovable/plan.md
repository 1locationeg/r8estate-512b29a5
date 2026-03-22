

# Add Dummy Deals for Testing & Ensure User Visibility

## Overview
Insert sample verified deals into the database so the Deal Watch widget and page display real data. The widget and `/deal-watch` page already show verified deals to all users — the issue is just that there are no deals in the database yet.

## Changes

### 1. Insert Dummy Deals (Database)
Use the insert tool to add 4-5 sample deals with `status = 'verified'` directly into the `deals` table. These need a valid `business_id` (from `business_profiles`) and `user_id`.

**Approach**: First query existing `business_profiles` to get real IDs. If none exist, create a dummy business profile first, then insert deals referencing it.

Sample deals:
- "8% Down Payment + 8-Year Installment" (payment_plan)
- "15% Early Bird Discount - New Cairo" (discount)
- "Priority Access to Phase 2 Units" (early_access)
- "Exclusive Penthouse Collection" (exclusive_units)

Each deal will have: headline, description, deal_type, tags, `status = 'verified'`, and some preset `avg_rating` / `rating_count` values so the widget shows meaningful numbers.

### 2. No Frontend Changes Needed
The `DealWatchWidget` on the homepage already fetches verified deals and displays stats. The `/deal-watch` page already lists verified deals publicly. Both work for anonymous and authenticated users. The widget is already in the quick actions grid on the homepage, visible to everyone.

## Technical Details
- Query `business_profiles` for an existing `id` and `user_id`
- If no profiles exist, insert a test business profile first
- Insert 4-5 deals with varied types, tags, ratings
- Insert a few `deal_ratings` to make the rating aggregation realistic

