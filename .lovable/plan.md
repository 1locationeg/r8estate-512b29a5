

## Plan: Add New Admin Sidebar Navigation Items

### What's being added
10 new nav items to the admin sidebar (with placeholder page components):

1. **AI Reviewer** (Addon) — `/admin/ai-reviewer`
2. **AI Review Writer** (Addon) — `/admin/ai-review-writer`
3. **Pricing Plans** — `/admin/pricing`
4. **Subscriptions** — `/admin/subscriptions`
5. **Transactions** — `/admin/transactions`
6. **Categories** — `/admin/categories`
7. **Navigation** — `/admin/navigation`
8. **Newsletter** — `/admin/newsletter`
9. **Sections** — `/admin/sections`
10. **Business** — `/admin/business`

### Changes

**`src/pages/AdminDashboard.tsx`**
- Import new icons: `Bot`, `PenTool`, `CreditCard`, `Receipt`, `DollarSign`, `FolderTree`, `Navigation`, `Mail`, `Layout`, `Briefcase`
- Add 10 placeholder components (each ~8 lines: a card with title + "Coming soon" message)
- Add 10 entries to the `navItems` array
- Add 10 `<Route>` entries

### Nav order (final)
```text
Dashboard
Users
Developers
Business          ← new
Reviews
AI Reviewer       ← new
AI Review Writer  ← new
Spotlight
Notifications
WhatsApp
Pricing Plans     ← new
Subscriptions     ← new
Transactions      ← new
Categories        ← new
Navigation        ← new
Newsletter        ← new
Sections          ← new
Analytics
Feedback
SEO & Sharing
Settings
```

No database or sidebar component changes needed — just new nav items and placeholder routes in AdminDashboard.

