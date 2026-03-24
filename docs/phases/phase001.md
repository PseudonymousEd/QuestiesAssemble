# Phase 001 — UX Polish

## Status: Complete

## Goals

Small but important UX improvements following the initial full implementation. No database schema changes.

---

## Task 1 — Remove Required Action Time from Editable Config

### Problem

The "Required action time (minutes)" field is currently exposed in both the Create Team config form (Home page) and the Edit Config form (Team page). This field is reserved for future enhancements and should not be user-editable yet, as its effect on the scheduling algorithm is not yet implemented.

### Changes

- **Home page (`Home.jsx`):** Remove the `required_action_minutes` field from the config form. The value inserted on team creation should remain hardcoded to `1` (the existing default).
- **Team page (`Team.jsx`):** Remove the `required_action_minutes` field from the Edit Config inline form. Do not display it in the read-only config summary either.

### What Does NOT Change

- The `required_action_minutes` column remains in the database schema.
- The default value of `1` continues to be written on team creation.
- No algorithm changes.

### Acceptance Criteria

- [ ] "Required action time" field does not appear on the Home page config form
- [ ] "Required action time" field does not appear on the Team page Edit Config form
- [ ] "Required action time" field does not appear in the Team page read-only config summary
- [ ] Creating a team still writes `required_action_minutes: 1` to the database

---

## Task 2 — Home Button on Every Page

### Problem

Once a user navigates away from the home page there is no persistent way to return to it without using the browser's back button.

### Changes

Add a small, unobtrusive navigation bar or header to all non-home pages that includes a link back to `/`. It should appear on:

- Team page (`/team/:id`)
- MemberEdit page (`/team/:id/member/new` and `/:memberId`)
- NotFound page

The home page itself does not need a home button.

### Design Notes

- A minimal top bar (e.g., a thin strip at the top of the page) with the app name "Questies Assemble!" as a link to `/` is sufficient.
- Keep it visually lightweight — this is not a full navigation bar.
- Implement as a shared component (e.g., `src/components/NavBar.jsx`) used in each affected page.

### Acceptance Criteria

- [ ] A visible link/button to the home page is present on the Team page
- [ ] A visible link/button to the home page is present on the MemberEdit page
- [ ] A visible link/button to the home page is present on the NotFound page
- [ ] Clicking it navigates to `/`
- [ ] The Home page itself does not show the button

---

## Task 3 — Home Page Text Updates

### Problem

The home page needs two text additions:
1. A developer credit.
2. A visible warning that the app is in test and data may be lost.

### Changes

**Developer credit:** Add the text "Developed by PseudonymousEd" somewhere on the home page (e.g., as a small footer line at the bottom of the card).

**Test warning:** Add a clearly visible warning notice to the home page informing users that:
- The site is currently IN TEST
- Teams may disappear at any time

The warning should be visually distinct (e.g., a yellow/amber banner or highlighted box) so users notice it before creating or joining a team.

### Acceptance Criteria

- [ ] "Developed by PseudonymousEd" is visible on the home page
- [ ] A test warning is visible on the home page before the Create / Join controls
- [ ] The warning clearly states the site is in test and that teams may disappear at any time
- [ ] The warning is visually distinct from the surrounding content

---

## Task 4 — Investigation: Scheduling Results Starting Earlier Than Member Availability

### Reported Behaviour

A team was created with one member in the `America/Los_Angeles` timezone (PDT, UTC−7). The member's availability was set to **9:00 AM – midnight tomorrow (Wednesday)**. At 12:21 PM PDT (Tuesday), the results showed:

```
Tomorrow 04:30 PDT
Tomorrow 05:00 PDT
...
Tomorrow 11:30 PDT
```

The first result (04:30 AM) is **4.5 hours before the member becomes available**, which was unexpected.

### Analysis

This is **not a code bug** — the algorithm is working exactly as specified. The behaviour is a consequence of how the scheduling algorithm defines a "good" invite time.

**Trace through the algorithm:**

- Current UTC time: ~19:21 Tuesday → `currentSlot = 134`
- Scheduler examines the next 48 slots (24 hours): slots 134–181
- Member's availability after local→UTC conversion: Wed 16:00 UTC (slot 176) onwards
- `time_reserved_hours = 5` → window = 10 slots (5 hours)

For **candidate slot 167** (Wed 11:30 UTC = **Wed 04:30 PDT**):
- The invite window covers slots 167–176
- The member's first available slot is 176 (Wed 09:00 AM PDT)
- Slot 176 falls at the very end of the window → member is considered "covered" → result is included

The algorithm asks: *"Is there at least one slot within [candidateTime, candidateTime + window] where this member is available?"* If yes, the time is included. It does **not** require the member to be available at the moment the invite is sent.

### Root Cause: Design Ambiguity

The algorithm's intent is: *an invite sent at time T is good if every member can log in and accept it before the window closes at T + 5 hours.* Under this definition, sending an invite at 4:30 AM is valid because the member will be online at 9:00 AM — still within the 5-hour window.

Whether this is the correct design intent depends on the use case:

| Interpretation | Behaviour | Current? |
|---|---|---|
| Member must be reachable *at some point* during the window | Invite can be sent while member is asleep, as long as they wake up before the window closes | **Yes — current behaviour** |
| Member must be reachable *at the start* of the window | Only times when the member is already available are shown | No |

### Decision Required

Before implementing any change, a decision is needed on which interpretation is correct:

**Option A — Keep current behaviour.** No code change. The results are technically correct. Consider adding a UI note explaining that results show *invite send times*, not *member online times*.

**Option B — Require availability at the start of the window.** Change the algorithm so that `candidateSlot` itself (not just any slot in the window) must be present in the member's slot set. This would make results show only times when the member is already online. Results would begin at **Tomorrow 09:00 PDT** in the reported scenario.

**Option C — Require a minimum overlap at the start of the window.** A softer version of Option B: require that at least the first `N` slots of the window are covered (e.g., the first 30 or 60 minutes). This avoids the extreme case while still allowing some lead time.

### Acceptance Criteria (pending decision)

- [ ] Decision recorded on which option to implement
- [ ] If Option B or C: algorithm updated and verified against the manual test case in `ImplementationPlan.md`
- [ ] If Option A: UI note added to clarify the meaning of the displayed times

---

## Task 5 — Revert Availability Grid to 1-Hour Blocks

### Problem

The Stage 3 implementation uses 48-row 30-minute blocks in the availability grid. This is more granular than most users need and makes the grid very tall and harder to use. 1-hour blocks are sufficient for now; 30-minute resolution can be re-enabled in a future phase if there is demand.

### Changes

- **`AvailabilityGrid.jsx`:** Reduce from 48 rows to 24 rows. Each row represents 1 hour. Row `n` maps to `slot_index = n * 2` (even values only), preserving the existing database schema.

### What Does NOT Change

- The database schema is unchanged — `slot_index` still supports 0–47.
- The timezone conversion logic (`localSlotToUtcSlot`, `utcSlotToLocalSlot`) is unchanged — it continues to work with any slot index; the grid simply stops writing odd values.
- The scheduler is unchanged.

### Acceptance Criteria

- [ ] Availability grid shows 24 rows (one per hour, 00:00–23:00) in the member's local timezone
- [ ] Selecting a row writes an even `slot_index` to the database
- [ ] Pre-population of existing slots on the member edit page still works (odd slot_index values from any legacy data round to the nearest even value or are ignored gracefully)

---

## Task 6 — Available / Unavailable Toggle on Availability Grid

### Problem

Currently members can only mark their available times (blue cells). Some members may find it more natural to work in the opposite direction — starting from a full week and marking off the times they are busy. A toggle that switches between "marking available" and "marking unavailable" modes supports both workflows.

### Behaviour

Add a toggle button above the availability grid on the MemberEdit page with two modes:

- **Available mode (default):** Clicking a cell marks it blue (available). This is the existing behaviour.
- **Unavailable mode:** Clicking a cell marks it red (unavailable).

Cells from one mode are mutually exclusive with the other: clicking a cell in unavailable mode that is currently marked blue should remove the blue marking and add red (and vice versa). A cell can only be one colour at a time, or unset.

### Persistence

Only **available** (blue) slots are written to the database. Red (unavailable) markings are a visual editing aid only — they are not persisted and will not appear if the member returns to edit their availability later. This keeps the database schema unchanged.

### Design Notes

- The toggle could be two buttons side by side (e.g., "Mark Available" / "Mark Unavailable") with the active mode visually highlighted.
- The grid header or a label near the toggle should make the current mode obvious.
- The existing blue/selected styling remains for available cells. Red styling (e.g., `bg-red-400 border-red-500`) is used for unavailable cells.

### Acceptance Criteria

- [ ] A toggle above the grid switches between "Mark Available" and "Mark Unavailable" modes
- [ ] In available mode, clicking a cell marks it blue
- [ ] In unavailable mode, clicking a cell marks it red
- [ ] Clicking a blue cell in unavailable mode removes the blue and marks it red (and vice versa)
- [ ] Only blue (available) slots are saved to the database when the member saves
- [ ] Red markings do not reappear when the member returns to edit their availability
