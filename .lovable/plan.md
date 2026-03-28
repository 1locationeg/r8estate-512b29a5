## AI Content Guard — Full Plan (Implemented)

### Layers
1. **Client-Side Pre-filter** — regex profanity detection (AR/EN)
2. **AI Deep Analysis** — edge function with violation_type + severity
3. **Objectivity Reminder** — bilingual guidance card above submit buttons

### Hybrid Moderation (100-Minute Grace Period) ✅
- **Score > 80**: Auto-hidden immediately (`is_hidden = true`, `moderation_status = 'flagged'`)
- **Score 50–80**: Warning state with `flagged_at` timestamp, visible for 100 minutes with yellow warning banner
- **Auto-expire**: Community feed filters out warning posts older than 100 minutes
- **Anonymous block**: Anonymous users blocked from posting flagged content (score > 50)
- **Admin restore**: Admins can restore false positives via "Restore" button

### Universal Report/Flag System ✅
- **`content_reports` table**: Stores reports with reporter_id, content_type, content_id, reason, status
- **`ReportButton` component**: Reusable flag icon with dialog (Spam, Harassment, Misinformation, Inappropriate, Defamation, Other)
- **Integrated on**: Community posts, community replies, reviews, review replies
- **`AdminContentReports` panel**: Admin dashboard section at `/admin/content-reports` for managing reports
- **Duplicate prevention**: Same user can't report same content twice
