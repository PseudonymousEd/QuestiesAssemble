# Phase 002 — Output Polish

## Status: Complete

## Goals

Small refinements to the scheduling output and the availability grid UI.

---

## Task 1 — Show Results on the Hour Only

### Problem

The scheduler currently generates one candidate every 30 minutes (48 candidates over 24 hours), so results can show half-hour times such as "Today 14:30 PDT". Since the availability grid uses 1-hour blocks, half-hour results are misleading — no member ever set a 14:30 slot. Results should align with the hour boundaries that members actually selected.

### Changes

- **`src/utils/scheduler.js`:** After computing `goodTimes`, filter to only include results where `slotIndex % 2 === 0` (i.e., the slot falls on an exact hour boundary). Half-hour candidates are still evaluated internally — the filter only affects what is returned and displayed.

### What Does NOT Change

- The scheduling algorithm logic is unchanged — all 48 candidate slots are still checked for coverage.
- The database schema and slot storage are unchanged.
- The availability grid is unchanged.

### Acceptance Criteria

- [ ] All displayed results show times on the hour (e.g., "Today 14:00 PDT"), never on the half-hour
- [ ] The number of results shown is at most 24 (one per hour) rather than 48
- [ ] The algorithm still correctly finds windows based on member availability

---

## Task 2 — Disable Mark Unavailable Toggle (Future Feature)

### Problem

The "Mark Unavailable" button in the availability grid was added in Phase 1 but the feature is not yet ready for general use. It should be visually present (to signal future intent) but disabled so users cannot activate it.

### Changes

- **`src/components/AvailabilityGrid.jsx`:** Disable the "Mark Unavailable" button. Style it as clearly inactive (e.g., grayed out). Add a small label or tooltip indicating it is a future feature.

### What Does NOT Change

- The "Mark Available" mode and all grid selection behaviour are unchanged.
- The internal `markMode` and `unavailableSlots` state can remain in the component — they simply become unreachable via the UI.

### Design Notes

- The button should remain visible but non-interactive — use `disabled` attribute and muted styling.
- Add a short note next to or below the button such as "(coming soon)" so users understand it is intentional.

### Acceptance Criteria

- [ ] "Mark Unavailable" button is visible but cannot be clicked
- [ ] The button is visually distinct from the active "Mark Available" button (grayed out)
- [ ] A "coming soon" or equivalent label is visible near the disabled button
- [ ] "Mark Available" mode continues to work normally
