

## Analysis

The header toggle already switches between "Business" and "Buyer" buttons based on `userMode`. When a user is in the Business view, a "Buyer" button appears in the header. However, the issue is likely that this button is not prominent enough or easy to find, especially for non-business users who landed in the Business view.

## Plan

Make the return-to-buyer path more discoverable by:

1. **Add a prominent "Back to Buyer View" banner/button in the Business view hero section** — When `userMode === "industry"` and the user does NOT have a business/admin role, show a visible link/button like "← Back to Buyer View" near the top of the business content area so they don't have to find the small header toggle.

2. **Improve header toggle visibility** — When in Business mode, style the "Buyer" button with a slightly more attention-grabbing style (e.g., outlined border or subtle animation) so it's clearly visible as a way back.

### Implementation Details

- In `src/pages/Index.tsx`, within the business view section (where `userMode !== "buyers"`), add a small banner or text link at the top: "Not a business? ← Switch to Buyer View" that calls `switchToBuyerView()`.
- This only shows when the user's role is NOT `business` or `admin`.
- Keep the existing header toggle as-is for consistency.

