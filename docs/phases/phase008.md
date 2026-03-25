# Phase 008 — Terminology and Polish

## Status: Complete

## Goals

Consistency and small UX improvements.

---

## Task 1 — Standardise on "Tool" Terminology

### Problem

The product is referred to inconsistently across the codebase:

- "app" — used in the README and source code
- "site" — used in the IN TEST warning on the home page
- "tool" — used once in the README opening line

The preferred term is **tool**.

### Changes

Audit and update all user-facing text across the following files, replacing "app" and "site" with "tool" where they refer to the product itself:

- **`README.md`**
- **`src/pages/Home.jsx`** (IN TEST warning, description)
- **`src/pages/ComingFeatures.jsx`**
- **`src/pages/Faq.jsx`**

### Acceptance Criteria

- [x] No user-facing text refers to the product as "app" or "site"
- [x] All references consistently use "tool"

---

## Task 2 — Show Member Timezone on Team Page

### Problem

The team page lists members by name but gives no indication of each member's timezone. This makes it hard to understand the scheduling results without navigating to each member's edit page.

### Changes

- **`src/pages/Team.jsx`:** In the members list, display the member's timezone between their name and the Disable/Enable button. Style it as small secondary text (e.g., muted grey).

### Acceptance Criteria

- [x] Each member row on the team page shows the member's timezone after their name
- [x] The timezone is visually secondary to the name (smaller, muted)
- [x] The order is: name → timezone → Disable/Enable → Remove

---

## Task 3 — Availability Comparison Grid Page

### Problem

The team page shows the best invite times but gives no visual overview of why those times were chosen or what each member's availability looks like over the next 24 hours. A comparison grid lets the team organizer see at a glance which members are available when, making the results easier to understand and trust.

### New Route

`/team/:id/grid`

### New Page: `src/pages/AvailabilityComparison.jsx`

A read-only grid showing the next 24 hours of availability for all active members.

**Layout:**

- **Rows:** The next 24 hours in 1-hour blocks, displayed in the viewer's local timezone (matching the Team page TZ). The current hour should be visually highlighted.
- **Columns:** One column per active member, with their name as the column header.
- **Cells:** Filled/green if the member is available during that hour, empty/grey if not.

**Navigation:**

- Add a **"View availability grid"** link/button on the Team page, in the Results section.
- The comparison page includes a NavBar and a back link to the team page.

### Notes

- Only active members are shown (disabled members are excluded).
- The grid uses the same UTC→local slot conversion already available in `src/utils/timezone.js`.
- This partially implements the "See everyone's availability" planned feature — once shipped, that entry can be removed from the Planned Features page.

### Acceptance Criteria

- [x] `/team/:id/grid` renders the comparison grid
- [x] Rows show the next 24 hours in the viewer's local timezone
- [x] Each active member has a column
- [x] Available hours are visually distinct from unavailable hours
- [x] The current hour is highlighted
- [x] A link to the grid is visible on the Team page
- [x] The "See everyone's availability" entry is removed from the Planned Features page
