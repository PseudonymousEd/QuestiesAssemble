# Phase 007 — "Now" as a Good Invite Time

## Status: Complete

## Goals

Allow the current time to surface as a result in the Good Times to Send Invites list.

---

## Task 1 — Show "Now" When the Current Slot Is a Good Time

### Problem

The scheduler evaluates 48 candidate slots starting from the current 30-minute boundary, so the very first candidate (`i = 0`) is always the present moment. If all members have availability that covers the current slot, this is a valid and immediately actionable result — but it currently displays as a plain timestamp (e.g., "Today 14:00 PDT"), which does not communicate the urgency or immediacy.

### Changes

- **`src/utils/scheduler.js`:** When `i === 0` (the first candidate, representing the current slot) is included in the results, set its label to `"Now"` instead of the formatted time string.
- **`src/utils/timezone.js`:** No changes required — label generation stays the same; the override happens in the scheduler before pushing to `goodTimes`.

### Design Notes

- Only the `i === 0` candidate is eligible for the "Now" label. All subsequent candidates display their formatted local time as usual.
- "Now" should appear as the first item in the results list if present. This is already guaranteed by the order candidates are evaluated.

### Acceptance Criteria

- [ ] If the current slot is a good invite time, the first result displays as "Now"
- [ ] All other results continue to display formatted local times
- [ ] If the current slot is not a good invite time, no "Now" entry appears and the list is unchanged

---

## Task 2 — Consistent Timezone Selection UX on Member Edit Page

### Problem

The Team page shows the viewer's timezone as a plain label with a small "change" link. Clicking "change" reveals the `TimezoneSelector` dropdown; once a selection is made the dropdown hides again. This keeps the UI compact by default.

The Member Edit page currently shows the full `TimezoneSelector` dropdown (search input + scrollable list) permanently, which takes up significant vertical space and is visually inconsistent with the Team page pattern.

### Changes

- **`src/pages/MemberEdit.jsx`:** Replace the always-visible `TimezoneSelector` with the same collapsed pattern used on the Team page:
  - Show the current timezone as a label: "Entering times in: **America/New_York** (auto-detected)" with a small "change" link beside it.
  - Clicking "change" reveals the `TimezoneSelector` dropdown.
  - Once the user selects a timezone from the dropdown, it collapses automatically and the label updates to reflect the new selection.
  - The "(auto-detected)" qualifier should only appear on the initial render for a new member; it should not appear when editing an existing member whose timezone was previously saved.

### Acceptance Criteria

- [ ] The Member Edit page shows the timezone as a collapsed label by default
- [ ] A "change" link reveals the `TimezoneSelector` dropdown
- [ ] Selecting a timezone from the dropdown collapses it and updates the label
- [ ] The Team page timezone behaviour is unchanged

---

## Task 3 — Enable and Disable Team Members

### Problem

Sometimes a team member is temporarily unavailable (on a break, travelling, etc.) but should not be permanently removed from the team. Currently the only option is to delete the member, losing their saved availability. A disable toggle allows them to be excluded from scheduling calculations while preserving their data.

### Database Change

Add an `active` boolean column to the `members` table:

```sql
ALTER TABLE members ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
```

Existing members will default to `active = true` with no further migration needed.

### Changes

- **`src/pages/Team.jsx`:** Add an enable/disable toggle next to each member name in the members list.
  - Disabled members should be visually distinct (e.g., muted/strikethrough name).
  - Toggling calls a Supabase update on the member row and immediately recalculates results.
  - The Remove button remains available for disabled members.

- **`src/utils/scheduler.js`:** No change needed — the Team page already filters which members are passed to the scheduler. Pass only members where `active === true`.

- **`src/pages/Team.jsx`:** When fetching members, continue to fetch all members (active and inactive) so inactive ones remain visible in the list. Filter to active-only before passing to `getGoodInviteTimes`.

### Design Notes

- The toggle could be a simple "Disable" / "Enable" text button, similar in style to the existing "Remove" button.
- Disabled members should remain visible in the list so they can be re-enabled — do not hide them.

### Acceptance Criteria

- [ ] `active` column added to `members` table in Supabase
- [ ] Each member row on the Team page has an Enable/Disable toggle
- [ ] Disabling a member excludes them from scheduling results immediately
- [ ] Re-enabling a member restores them to scheduling calculations immediately
- [ ] Disabled members are visually distinct in the members list
- [ ] Disabled members' availability data is preserved (not deleted)
- [ ] The "Enable and disable team members" entry is removed from the Planned Features page

---

## Task 4 — Meaningful Page Titles

### Problem

All pages currently share the same browser tab title ("tonicquestacceptscheduler" from the Vite default). When a team page URL is copied into Google Docs or another app that reads the page `<title>`, the link text is meaningless. It should read something like "Questies Assemble team 3791-044-619" so the link is immediately identifiable.

### Changes

- **`index.html`:** Change the default `<title>` from `tonicquestacceptscheduler` to `Questies Assemble!` so all pages have a sensible fallback title.
- **`src/pages/Team.jsx`:** Once the team data has loaded, set `document.title` to `Questie Team ${formatTeamId(id)}` in a `useEffect`. Reset to `Questies Assemble!` on unmount.
- **`src/pages/MemberEdit.jsx`:** Once the member data has loaded (or when the name field changes for a new member), set `document.title` to `Questie ${name}`. Reset to `Questies Assemble!` on unmount. For a new member with no name yet, leave the title as `Questies Assemble!` until a name is entered.

### Notes

- The hyphen-formatted ID (`formatTeamId`) is already available in `Team.jsx`.

### Acceptance Criteria

- [ ] Browser tab on the home page reads "Questies Assemble!"
- [ ] Browser tab on the team page reads "Questie Team XXXX-XXX-XXX"
- [ ] Browser tab on the member edit page reads "Questie [MemberName]" once a name is present
- [ ] Copying a team page URL into Google Docs produces a link labelled "Questie Team XXXX-XXX-XXX"
- [ ] Copying a member page URL into Google Docs produces a link labelled "Questie [MemberName]"
- [ ] Navigating away from either page restores the title to "Questies Assemble!"

---

## Task 5 — Database Cleanup Script

### Problem

During testing, the database accumulates teams, members, and availability slots that are no longer needed. There is no easy way to purge test data while preserving specific teams that should be kept.

### Changes

Create **`docs/scripts/cleanup.sql`** — a SQL script to be run manually in the Supabase SQL editor. It deletes all data except for a specified list of team IDs.

The script should:
- Accept a list of team IDs to preserve (edited by hand before running)
- Delete all `availability_slots` rows belonging to members of teams not in the keep list (handled automatically by cascade, but noted for clarity)
- Delete all `members` rows belonging to teams not in the keep list (cascade handles slots)
- Delete all `teams` rows not in the keep list

Because cascade deletes are configured on both foreign keys, deleting from `teams` is sufficient — members and their slots are removed automatically.

### Script Template

```sql
-- Questies Assemble! — Database Cleanup Script
-- Deletes all teams (and their members and slots) EXCEPT the IDs listed below.
-- Edit the list before running. Run in the Supabase SQL Editor.

DELETE FROM teams
WHERE id NOT IN (
  '1234567890',
  '0987654321'
  -- Add more IDs here, one per line, comma-separated
);
```

### Acceptance Criteria

- [ ] `docs/scripts/cleanup.sql` exists
- [ ] Running the script removes all teams not in the keep list
- [ ] Members and availability slots for removed teams are also deleted (via cascade)
- [ ] Teams in the keep list and all their data are untouched

---

## Task 6 — Add Screenshots to README

### Problem

The README describes the app but has no visuals. Screenshots help new users and collaborators quickly understand what the app looks like before using it.

### Changes

- Take screenshots of the key pages:
  - Home page
  - Team page (with members and results visible)
  - Member edit page (with availability grid visible)
- Save screenshots to an **`images/`** folder in the repo root
- Add the screenshots to **`README.md`** under a new "Screenshots" section

### Acceptance Criteria

- [ ] Screenshots exist in `docs/images/`
- [ ] README includes a Screenshots section displaying the images
- [ ] Images render correctly when viewed on GitHub

---

## Task 7 — FAQ Page

### Problem

New users may have questions about the app's purpose, the invite window value, and why it exists. A FAQ page answers these upfront and gives the app a more polished feel.

### Changes

**New route:** `/faq`

**New page: `src/pages/Faq.jsx`**

Render the FAQ content from `docs/brainstorm/FAQ.txt` as a formatted page. Each Q&A pair should be styled clearly — the question bold or highlighted, the answer beneath it. The page title ("Questies Assemble! — FAQ") and intro line should be included.

**`src/pages/Home.jsx`:** Add a prominent link to the FAQ page above the IN TEST warning banner. It should stand out — more visible than the subtle "Planned features →" link at the bottom.

**`src/App.jsx`:** Add the `/faq` route.

### FAQ Content

Source: `docs/brainstorm/FAQ.txt`

The page should include all questions and answers from that file, rendered in order.

### Acceptance Criteria

- [ ] `/faq` route renders the FAQ page
- [ ] All questions and answers from `FAQ.txt` are present
- [ ] The FAQ link on the home page appears above the IN TEST warning and is visually prominent
- [ ] The FAQ page includes a NavBar link back to the home page
