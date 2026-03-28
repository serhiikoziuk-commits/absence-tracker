# Design System — Team Absence Tracker
**Version:** 1.0
**Phase:** 2 — UI/UX & Design System

---

## Philosophy

**Simple. Clean. Modern.**

The UI must feel like a premium B2B tool — not a cluttered enterprise dashboard. Guiding principles:
- Generous whitespace over dense information
- One primary action per screen
- Color carries meaning (status, type) — never decoration only
- Mobile and web share the same visual language via shared design tokens

---

## 1. Color Palette

### Brand / Primary
| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#EEF2FF` | Light tint, hover backgrounds |
| `primary-100` | `#E0E7FF` | Selected state backgrounds |
| `primary-500` | `#6366F1` | Primary buttons, links, active nav |
| `primary-600` | `#4F46E5` | Primary button hover |
| `primary-700` | `#4338CA` | Pressed states |

### Neutrals (Gray)
| Token | Hex | Usage |
|---|---|---|
| `gray-50` | `#F9FAFB` | Page/app background |
| `gray-100` | `#F3F4F6` | Card backgrounds, input fills |
| `gray-200` | `#E5E7EB` | Borders, dividers |
| `gray-400` | `#9CA3AF` | Placeholder text, disabled |
| `gray-600` | `#4B5563` | Secondary text |
| `gray-800` | `#1F2937` | Primary text |
| `gray-900` | `#111827` | Headings |

### Status Colors
| Token | Hex | Usage |
|---|---|---|
| `success-100` | `#D1FAE5` | Approved background |
| `success-600` | `#059669` | Approved text/icon |
| `warning-100` | `#FEF3C7` | Pending background |
| `warning-600` | `#D97706` | Pending text/icon |
| `error-100` | `#FEE2E2` | Rejected background |
| `error-600` | `#DC2626` | Rejected text/icon |
| `info-100` | `#DBEAFE` | Modified background |
| `info-600` | `#2563EB` | Modified text/icon |

### Absence Type Default Colors (Admin-configurable)
| Type | Color | Hex |
|---|---|---|
| Vacation | Indigo | `#6366F1` |
| Sick Leave | Rose | `#F43F5E` |
| Sick Leave (with cert) | Red | `#EF4444` |
| Day-Off | Amber | `#F59E0B` |
| Work From Home | Emerald | `#10B981` |
| Unpaid Leave | Slate | `#64748B` |

### Surface
| Token | Hex | Usage |
|---|---|---|
| `white` | `#FFFFFF` | Cards, modals, sidebar |
| `overlay` | `rgba(0,0,0,0.4)` | Modal backdrops |

---

## 2. Typography

**Font Family:** [Inter](https://fonts.google.com/specimen/Inter) — loaded via `next/font/google`

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
```

### Scale
| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 30px / 1.875rem | 700 | 1.2 | Page titles, hero |
| `h1` | 24px / 1.5rem | 600 | 1.3 | Section headings |
| `h2` | 20px / 1.25rem | 600 | 1.35 | Card titles |
| `h3` | 16px / 1rem | 600 | 1.4 | Sub-section labels |
| `body-lg` | 16px / 1rem | 400 | 1.6 | Default body |
| `body` | 14px / 0.875rem | 400 | 1.5 | Most UI text |
| `body-sm` | 13px / 0.8125rem | 400 | 1.4 | Secondary info, captions |
| `label` | 12px / 0.75rem | 500 | 1.3 | Form labels, tags |
| `mono` | 13px / 0.8125rem | 400 | 1.4 | Dates, codes |

---

## 3. Spacing & Layout

**Base unit:** 4px

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps |
| `space-2` | 8px | Tight gaps (icon + label) |
| `space-3` | 12px | Inner card padding |
| `space-4` | 16px | Standard component padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large section gaps |
| `space-12` | 48px | Page section padding |

**Breakpoints (Tailwind defaults):**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**App Shell Layout:**
- Sidebar width: 240px (collapsed: 64px)
- Content max-width: 1200px
- Top nav height: 56px (mobile)
- Card border-radius: 12px (`rounded-xl`)
- Button border-radius: 8px (`rounded-lg`)
- Input border-radius: 8px (`rounded-lg`)

---

## 4. Shadows & Elevation

| Level | CSS | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle card borders |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | Cards, inputs |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, command palette |

---

## 5. Component Inventory

### Core (shadcn/ui base)
- `Button` — variants: `default`, `secondary`, `outline`, `ghost`, `destructive`
- `Input` — with label, error state, helper text
- `Select` / `Combobox`
- `Dialog` / `Sheet` (mobile-friendly slide-up)
- `Tabs`
- `Badge` — for statuses and absence type labels
- `Avatar` — with fallback initials
- `Tooltip`
- `Popover`
- `Calendar` (date picker, from shadcn)
- `DateRangePicker` — custom, built on shadcn Calendar
- `Skeleton` — loading placeholders
- `Separator`
- `DropdownMenu`

### App-Specific Components

#### `AbsenceTypeBadge`
Color-coded pill showing absence type name. Color pulled from `absence_types.color`.
```
[ ● Vacation ]   [ ● Sick Leave ]   [ ● Day-Off ]
```

#### `StatusBadge`
```
[ ✓ Approved ]   [ ⏳ Pending ]   [ ✗ Rejected ]   [ ↩ Modified ]
```

#### `RequestCard`
Full-width card with:
- Left border accent (absence type color)
- Title (absence type name)
- Date range
- Status badge
- Days count
- Expandable: comment + file attachments

#### `CalendarDot`
Colored dot (6px circle) shown under calendar dates. Max 5 visible, then "+N" overflow.

#### `AbsenceTimeline`
Horizontal bar per user showing absence spans across the month. Used in the calendar detail section.

#### `BalanceCard`
Dashboard card showing:
- Absence type icon + name
- Available days (large number)
- Used / Total breakdown
- Progress bar

#### `UserRow` (Admin panel)
Table row with avatar, name, email, team, role badge, status, action menu.

#### `SidebarNav`
Left sidebar with:
- Workspace logo/name
- Nav items: Dashboard, Calendar, Requests, Profile
- Admin section (if admin): Admin Panel
- Bottom: user avatar + name + logout

---

## 6. Motion & Interaction

- **Transitions:** 150ms ease for hover states, 200ms for panel open/close
- **Page transitions:** Fade (opacity 0→1, 100ms) — not slide, to feel fast
- **Modals:** Scale + fade (transform: scale(0.95)→1, opacity 0→1, 200ms)
- **Skeleton loading:** Pulse animation on all loading states
- No heavy animations — every interaction should feel instant

---

## 7. Tailwind Configuration

```ts
// tailwind.config.ts
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        success: { 100: '#D1FAE5', 600: '#059669' },
        warning: { 100: '#FEF3C7', 600: '#D97706' },
        error:   { 100: '#FEE2E2', 600: '#DC2626' },
        info:    { 100: '#DBEAFE', 600: '#2563EB' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

---

## 8. Dark Mode

Supported via Tailwind `darkMode: 'class'` and a theme toggle in the user profile. Dark mode token mappings:

| Light | Dark |
|---|---|
| `gray-50` (bg) | `gray-950` |
| `white` (card) | `gray-900` |
| `gray-200` (border) | `gray-800` |
| `gray-800` (text) | `gray-100` |
| `primary-500` | `primary-400` |

---

## 9. Iconography

Library: **Lucide React** — consistent stroke-based icons, tree-shakeable.

Key icons:
- Dashboard: `LayoutDashboard`
- Calendar: `CalendarDays`
- Requests: `ClipboardList`
- Profile: `User`
- Admin: `Settings2`
- Approve: `CheckCircle`
- Reject: `XCircle`
- Pending: `Clock`
- Modified: `RefreshCw`
- Vacation: `Plane`
- Sick Leave: `Thermometer`
- Day-Off: `Coffee`

---

*End of Design System. Awaiting approval to proceed to Phase 3: Landing Page.*
