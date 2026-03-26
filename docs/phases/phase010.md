# Phase 010 — UI Polish

## Work Status: Complete
## Verification Status: Complete

## Goals

Small UI improvements to make key actions more discoverable and navigation more consistent.

---

## Task 1 — Edit Link Next to Quest Configuration Title

### Problem

The "Edit Config" control on the Team page should be a small "edit" text link sitting inline with the "Quest Configuration" heading, rather than a standalone button below it.

### Changes

- **`src/pages/Team.jsx`:** Replace the Edit Config button with a small "edit" text link placed directly next to the "Quest Configuration" heading.

### Acceptance Criteria

- [x] "edit" is a text link (not a button)
- [x] The link sits inline next to the "Quest Configuration" heading

---

## Task 2 — Availability Grid as a Button

### Problem

The "View availability grid →" link in the Results section is styled as a plain text link and is easy to overlook.

### Changes

- **`src/pages/Team.jsx`:** Replace the "View availability grid →" text link with a button labelled "Availability Grid", positioned next to the "Good Times to Send Invites" heading.

### Acceptance Criteria

- [x] "Availability Grid" is a button (not a plain text link)
- [x] The button sits next to the "Good Times to Send Invites" heading

---

## Task 3 — Link Planned Features in FAQ

### Problem

The FAQ answer that mentions "I have a few modifications planned already" does not link to the Planned Features page, making it harder for users to find it.

### Changes

- **`src/pages/Faq.jsx`:** Find the answer that contains "I have a few modifications planned already" and turn that phrase into a link to `/coming-features`.

### Acceptance Criteria

- [x] "I have a few modifications planned already" is a clickable link to `/coming-features`

---

## Task 5 — Back to Team Link on Member Pages

### Problem

The Availability Grid page has a "← Back to team" link, but the Add Member and Edit Member pages do not. Users have no quick way to navigate back to the team from those pages.

### Changes

- **`src/pages/MemberEdit.jsx`:** Add a "← Back to team" link matching the style used in `AvailabilityComparison.jsx`, linking to `/team/:id`.

### Acceptance Criteria

- [x] A "← Back to team" link is present on the Add Member page
- [x] A "← Back to team" link is present on the Edit Member page
- [x] The link style matches the one on the Availability Grid page

---

## Task 6 — Update README Project Structure

### Problem

The README's Project Structure section is out of date:

- `docs/brainstorm/` and `docs/scripts/` directories exist but are not listed
- The `images/` directory exists but is not listed
- The individual source files are not listed, making the structure hard to navigate
- The Features section mentions configurable min/max participants, which are no longer visible in the UI

### Changes

- **`README.md`:** Expand the Project Structure section to list individual files within each `src/` subdirectory. Add the missing `docs/brainstorm/` and `docs/scripts/` directories.
- **`README.md`:** Update the Features bullet that mentions min/max participants to reflect that only the invite window duration is configurable by users.
- **`README.md`:** Add `images/available.png` to the Screenshots section alongside the existing three screenshots.

### Acceptance Criteria

- [x] `docs/brainstorm/`, `docs/scripts/`, and `images/` appear in the Project Structure section
- [x] Individual files are listed within each `src/` subdirectory
- [x] The Features section no longer references min/max participants as user-configurable
- [x] `images/available.png` appears in the Screenshots section of the README

---

## Task 4 — Explanation Text in Results Section

### Problem

The "Good Times to Send Invites" section gives no context about what the times represent or why they were chosen. New users may not understand what they're looking at.

### Changes

- **`src/pages/Team.jsx`:** Add a short explanatory sentence below the "Availability Grid" button. The text should read: "Send invites during the following times. Everyone should be available to accept within X hours of the invite." where X is the team's `time_reserved_hours` value.

### Acceptance Criteria

- [x] Explanatory text appears below the Availability Grid button
- [x] The text is small and muted
- [x] X is replaced with the actual `time_reserved_hours` value

---

## Task 7 — Invite Window Duration Limits

### Problem

The invite window duration input has no enforced minimum or maximum, allowing nonsensical values to be entered.

### Changes

- **`src/pages/Team.jsx`:** Set `min="0"` and `max="24"` on the `time_reserved_hours` input in the edit config form.
- **`src/pages/Home.jsx`:** Set `min="0"` and `max="24"` on the `time_reserved_hours` input in the quest config form.

### Acceptance Criteria

- [x] The invite window duration input enforces a minimum of 0
- [x] The invite window duration input enforces a maximum of 24
- [x] Both the Team page edit form and the Home page creation form are updated

---

## Task 8 — Extend Availability Grid to 25 + Time Reserved Hours

### Problem

The availability grid on `/team/:id/grid` shows only the next 24 hours. It should show 25 hours plus the team's invite window duration, so there is always enough visibility to cover a full invite window beyond the current hour.

### Changes

- **`src/pages/AvailabilityComparison.jsx`:** Fetch `time_reserved_hours` from the team record. Render `25 + time_reserved_hours` rows instead of a fixed number. Update the subtitle text accordingly.

### Acceptance Criteria

- [x] The availability grid shows 25 + `time_reserved_hours` hours
- [x] The subtitle text reflects the actual number of hours shown
