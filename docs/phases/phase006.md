# Phase 006 — Coming Soon Page Updates

## Status: Pending

## Goals

Rename the Coming Features page and add a new planned feature.

---

## Task 1 — Rename "Coming Features" to "Planned Features"

### Changes

- **`src/pages/ComingFeatures.jsx`:** Update the page heading from "Coming Features" to "Planned Features"
- **`src/pages/Home.jsx`:** Update the link text from "Coming features →" to "Planned features →"

### Acceptance Criteria

- [ ] The page heading reads "Planned Features"
- [ ] The link on the home page reads "Planned features →"

---

## Task 2 — Add Enable/Disable Members Feature to Coming Soon

### Changes

- **`src/pages/ComingFeatures.jsx`:** Add a new entry to the coming soon list.
  - **Title:** Enable and disable team members
  - **Description:** Temporarily exclude a member from scheduling calculations without removing them from the team — useful when someone is on a break or unavailable for a period.

### Acceptance Criteria

- [ ] The new feature entry is visible on the Planned Features page

---

## Task 3 — Update Availability Label on Member Edit Page

### Changes

- **`src/pages/MemberEdit.jsx`:** Change the availability grid label from "Availability — click to toggle 1-hour blocks" to "Availability to accept invites — click to toggle 1-hour blocks".

### Acceptance Criteria

- [ ] The label on the member edit page reads "Availability to accept invites — click to toggle 1-hour blocks"
