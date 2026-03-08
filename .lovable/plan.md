

# AdiNox — Premium UI/UX Overhaul

This plan focuses on elevating the existing application to a top-notch, enterprise-grade security portal with significant visual and interaction improvements — all within the current single-page token manager architecture (no new vault modules).

---

## Phase 1: Layout and Navigation Overhaul

### 1.1 Add Sidebar Navigation
- Implement the existing `sidebar.tsx` shadcn component as the app shell
- Sidebar items: Dashboard (home icon), 2FA Tokens (shield icon), Settings (gear icon, disabled/coming soon)
- Collapsible to icon-only mode on desktop, bottom tab bar on mobile
- Glassmorphism sidebar background matching the dark purple theme
- Active route highlighting with primary color indicator
- Logo in sidebar header, user profile dropdown in sidebar footer

### 1.2 Restructure App Layout
- Wrap authenticated routes in a new `AppLayout.tsx` component with `SidebarProvider`
- Move the header (logo, user menu) from `PageHeader` into the sidebar
- Main content area gets proper padding and max-width constraints
- `SidebarTrigger` in a sticky header bar, always visible

---

## Phase 2: Dashboard Overview Page

### 2.1 New Dashboard at `/`
- Move token list to `/tokens` route
- Dashboard shows:
  - **Stats cards row**: Total tokens, tokens expiring soon (under 10s), last activity timestamp
  - **Quick actions**: "Add Token" button, "Scan QR" button
  - **Recent tokens**: Show last 3 added tokens as compact cards
  - **Security tip**: Rotating security tips in a subtle card

### 2.2 Stats Cards
- Animated number counters using Framer Motion
- Glassmorphism card style with subtle icon backgrounds
- Responsive: 2 columns on mobile, 4 on desktop

---

## Phase 3: Visual Polish and Micro-interactions

### 3.1 Enhanced Token Cards
- Add a subtle gradient border on hover (purple to transparent)
- Card entrance animations staggered with `layoutId` for smooth reordering
- Right-click context menu using existing `context-menu.tsx` component
- Swipe-to-reveal actions on mobile (edit, delete) using touch gestures

### 3.2 Premium Header Bar
- Sticky top bar with blur backdrop
- Breadcrumb navigation showing current section
- Notification bell icon (placeholder, badge count)
- Global `Cmd+K` command palette using existing `cmdk` package — search tokens, navigate sections, quick actions

### 3.3 Command Palette (Cmd+K)
- Full-screen overlay command menu using the installed `cmdk` package
- Search across tokens by name/issuer
- Quick actions: Add token, Sign out, Toggle sidebar
- Keyboard-navigable with arrow keys

### 3.4 Refined Empty States
- Per-section unique empty states with animated illustrations (SVG-based)
- Primary and secondary CTAs with descriptive text

---

## Phase 4: Auth Page Elevation

### 4.1 Split-Screen Auth Layout (Desktop)
- Left panel: Branding, animated feature highlights, trust indicators
- Right panel: Auth form
- On mobile: full-width form only

### 4.2 Trust Indicators
- "256-bit encryption" badge
- "Zero-knowledge architecture" badge  
- Animated lock/shield icon sequence
- User count placeholder ("Trusted by 10,000+ users")

---

## Phase 5: Settings Page

### 5.1 Settings Route (`/settings`)
- Profile section: email display, username
- Security section: change password (placeholder)
- Appearance section: show current theme info
- About section: version, developer credit
- Danger zone: delete account (placeholder)

---

## Technical Implementation Details

### Files to Create
- `src/components/layout/AppLayout.tsx` — Sidebar + header shell
- `src/components/layout/AppSidebar.tsx` — Sidebar navigation component
- `src/components/layout/CommandPalette.tsx` — Cmd+K command menu
- `src/components/dashboard/DashboardPage.tsx` — Stats + quick actions
- `src/components/dashboard/StatsCard.tsx` — Animated stat card
- `src/pages/TokensPage.tsx` — Relocated token list
- `src/pages/DashboardPage.tsx` — Dashboard route
- `src/pages/SettingsPage.tsx` — Settings page

### Files to Modify
- `src/App.tsx` — New routes, wrap in AppLayout
- `src/pages/Index.tsx` — Redirect to dashboard or replace
- `src/components/tokens/TokenList.tsx` — Remove redundant header elements
- `src/components/tokens/TokenCard.tsx` — Add gradient hover border, context menu
- `src/index.css` — New utility classes for gradient borders, enhanced glassmorphism

### Routing Changes
```text
/          → Dashboard (stats, quick actions, recent tokens)
/tokens    → Token list (current Index.tsx content)
/settings  → Settings page
/auth      → Auth page (unchanged route, enhanced layout)
```

### Component Architecture
```text
App
├── AuthPage (unauthenticated)
│   └── Split-screen layout
└── AppLayout (authenticated)
    ├── AppSidebar
    ├── CommandPalette (Cmd+K overlay)
    ├── Sticky Header (trigger, breadcrumbs, notifications)
    └── Routes
        ├── DashboardPage
        ├── TokensPage (TokenProvider → TokenList)
        └── SettingsPage
```

### Design Tokens (additions to index.css)
- `.gradient-border` — animated purple gradient border on hover
- `.stat-card` — glassmorphism with icon watermark
- `.command-palette` — full-screen frosted overlay

### Performance
- All new components wrapped in `React.memo`
- Route-level code splitting with `React.lazy`
- Framer Motion `layoutId` for smooth list reordering
- GPU-accelerated animations only (transform, opacity)

This is a substantial upgrade touching layout, navigation, routing, and visual design. It will be implemented incrementally across the files listed above.

