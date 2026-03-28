

## Community-to-Data Bridge: Developer Intelligence Card

### What It Does
When a community post mentions a developer name (e.g., "Palm Hills", "Mountain View"), a glassmorphism card appears below that post showing the developer's logo, trust score, sentiment trend, and a CTA to download a Buyer Intelligence Report. **Only visible to verified buyers** (role = `buyer` with an approved receipt submission) to prevent business-to-business competitive clashes.

### File Changes

#### 1. New: `src/components/DeveloperBridgeCard.tsx`
- Accepts a `post: CommunityPost` prop
- Scans `post.title + post.body` against `developers[]` names (case-insensitive, supports partial matches like "Palm Hills" or "بالم هيلز")
- If no developer match found, renders `null`
- Checks auth: only renders if `role === 'buyer'` AND user has at least one approved `receipt_submissions` record (verified buyer check)
- Glassmorphism card (`backdrop-blur-xl bg-white/10 border border-white/20`) showing:
  - Developer logo (from mock data, with `BusinessLogoContext` override)
  - Trust score as star rating + numeric score
  - "Recent Sentiment" badge: compares developer's `sentimentScore` to a threshold to show Rising/Stable/Declining with colored indicator
  - CTA button: "Download Buyer Intelligence Report for [Name]" — calls existing `downloadTrustReport()` from `src/lib/generateTrustReport.ts`
- Tracks `bridge_click` event to `widget_analytics` table (reuses existing table with `event_type = 'bridge_click'`, using a synthetic embed_token derived from `developer_id + post_id`)
- Full RTL support via logical properties
- i18n keys for all labels

#### 2. Update: `src/pages/Community.tsx`
- Import `DeveloperBridgeCard`
- Render `<DeveloperBridgeCard post={post} />` below each `<CommunityPostCard>` in the feed loop

#### 3. Update: `src/i18n/locales/en.json`
Add under `community`:
- `bridgeTitle`: "Developer Intelligence"
- `bridgeTrustScore`: "Trust Score"
- `bridgeSentimentRising`: "Rising"
- `bridgeSentimentStable`: "Stable"
- `bridgeSentimentDeclining`: "Declining"
- `bridgeDownloadReport`: "Download Buyer Report for {{name}}"
- `bridgeVerifiedOnly`: "Verified buyers only"

#### 4. Update: `src/i18n/locales/ar.json`
Arabic translations for all keys above.

### Technical Details

**Verified Buyer Check**: Query `receipt_submissions` for `user_id = auth.uid()` with `status = 'approved'`, cached per session to avoid repeated DB calls. Uses existing RLS policies (users can view own receipts).

**Developer Matching**: Tokenize post text, match against `developers[].name` split into words. Match threshold: at least 2 consecutive words match (avoids false positives on common words like "View" or "Park").

**Analytics Tracking**: Reuses `widget_analytics` table — inserts with `event_type = 'bridge_click'`, `embed_token = dev_{developerId}`, `referrer_url = /community?post={postId}`. No schema changes needed.

**Report Generation**: Constructs a `SearchItem` from the matched developer's mock data and passes to existing `downloadTrustReport()`.

