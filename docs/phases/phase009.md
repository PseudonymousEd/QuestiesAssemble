# Phase 009 — Quest Configuration Visibility

## Status: Complete

## Goals

Simplify the Quest Configuration section by hiding fields that users do not need to see or edit.

---

## Task 1 — Hide Participant and Invite Count Fields

### Problem

The Quest Configuration section currently exposes Min participants, Max participants, and Max invites to the user. These values are internal scheduling parameters that users should not need to read or configure. Showing them adds noise and may cause confusion.

### Changes

- **`src/pages/Team.jsx`:** Remove Min participants, Max participants, and Max invites from both the read view and the edit form. Only "Time reserved for invitees" should remain visible and editable.
- **`src/pages/Home.jsx`:** Remove Min participants, Max participants, and Max invites from the "Customize quest config" collapsible form. Only "Time reserved for invitees" should remain.

### Acceptance Criteria

- [x] The Team page config read view shows only "Time reserved for invitees"
- [x] The Team page config edit form shows only "Time reserved for invitees"
- [x] The Home page "Customize quest config" form shows only "Time reserved for invitees"
- [x] Min participants, Max participants, and Max invites are no longer visible anywhere in the UI
