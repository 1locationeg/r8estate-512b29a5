

## Post-Decision Retention Loop — "Track Your Developer"

### Answer: Same Follow, Enhanced Purpose

The existing **Follow** button in Portfolio and directory cards is the **same** `followed_businesses` table. What you're asking for builds **on top** of that — turning a passive "following" list into an active retention engine with alerts and automated review requests.

### What We're Building

**Three layers on top of the existing follow system:**

1. **"Track Your Developer" Alert System** — When a followed business gets a new review, deal, or launch, the follower gets an in-app notification. This already partially works via the `user_interests` trigger, but we'll make it explicit for followed businesses.

2. **Automated 6-Month Review Request** — A scheduled check that finds users who followed a business 6+ months ago but haven't reviewed it. Sends an in-app notification nudging them: "You've been following [Developer] for 6 months — share your experience!"

3. **Enhanced Portfolio "Following" Tab** — Show follow duration, last activity from the developer, and a "Write Review" CTA for long-term followers.

---

### Files & Changes

#### 1. Database Migration — Add `follow_reminded_at` column
```sql
ALTER TABLE followed_businesses 
ADD COLUMN follow_reminded_at timestamptz DEFAULT NULL;
```
This tracks when the last review reminder was sent, preventing spam.

#### 2. Database Trigger — Notify followers on new approved reviews
Create a PostgreSQL trigger on `reviews` table (on status change to `approved`) that inserts a notification for each user following that `developer_id` via `followed_businesses`. This ensures followers get "New review for [Developer]" alerts automatically.

#### 3. Edge Function — `follow-review-reminder`
A scheduled function (pg_cron, runs daily) that:
- Queries `followed_businesses` where `created_at < now() - interval '6 months'` AND `follow_reminded_at IS NULL`
- Checks the user hasn't already reviewed that developer (LEFT JOIN `reviews`)
- Inserts a notification: "You've been tracking [Developer] for 6 months — ready to share your experience?"
- Updates `follow_reminded_at` to prevent repeat reminders

#### 4. `src/pages/Portfolio.tsx` — Enhanced "Following" tab
- Show follow duration (e.g., "Following for 3 months")
- Add a "Write Review" button for follows older than 30 days
- Show latest review count or activity indicator per followed business

#### 5. `src/i18n/locales/en.json` & `ar.json` — Add retention copy
```json
"retention": {
  "trackDeveloper": "Track Your Developer",
  "followDuration": "Following for {{duration}}",
  "reviewNudge": "Ready to share your experience?",
  "writeReview": "Write a Review",
  "newReviewAlert": "New review posted for {{developer}}",
  "sixMonthReminder": "You've been tracking {{developer}} for 6 months — share your experience!"
}
```
Arabic:
```json
"retention": {
  "trackDeveloper": "تابع المطوّر",
  "followDuration": "متابع منذ {{duration}}",
  "reviewNudge": "مستعد تشارك تجربتك؟",
  "writeReview": "اكتب تقييم",
  "newReviewAlert": "تقييم جديد لـ {{developer}}",
  "sixMonthReminder": "متابع {{developer}} من ٦ شهور — شاركنا تجربتك!"
}
```

#### 6. `src/components/CommunityEngagementNudge.tsx` — Add retention nudge variant
A new nudge type for users following businesses 3+ months, encouraging review writing.

---

### Technical Details

- **Trigger**: `AFTER UPDATE ON reviews WHEN (NEW.status = 'approved')` → queries `followed_businesses` by `business_id = NEW.developer_id` → inserts into `notifications`
- **Cron**: Daily at 9 AM UTC via pg_cron calling the edge function
- **No new tables** — uses existing `followed_businesses`, `reviews`, and `notifications`
- **One new column**: `follow_reminded_at` on `followed_businesses`

