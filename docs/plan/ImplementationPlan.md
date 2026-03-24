# Questies Assemble! — Implementation Plan

## Overview

This document describes the full plan for building Questies Assemble! across three stages. No code should be written for a stage until the plan for that stage is understood and agreed upon.

- **Stage 1:** Hello World — proves the build and deploy pipeline works
- **Stage 2:** Bare Bones — proves the core data flow and scheduling algorithm work
- **Stage 3:** Full Implementation — completes all specified features

---

## Tech Stack (All Stages)

| Layer | Choice |
|---|---|
| UI Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Database / API | Supabase (Postgres + auto-generated REST API) |
| Hosting | Vercel |
| Time zone library | `luxon` (introduced in Stage 3) |

---

## Accounts and Tools Required Before Stage 1

The following must exist before any code is written:

- **Node.js** (v18 or later) installed locally
- **Git** installed locally
- **GitHub account** — repo created before Stage 1
- **Supabase account** — free tier at supabase.com
- **Vercel account** — free tier at vercel.com, connected to the GitHub account

---

---

# Stage 1: Hello World

## Goal

Confirm the full build and deploy pipeline works end-to-end. The result is a live public URL that renders a single styled page.

## What Is Explicitly NOT in Stage 1

- No routing
- No database usage (Supabase project exists but is not connected to the UI)
- No logic of any kind

## Prerequisites

- GitHub repo created (e.g., `questies-assemble`)
- Supabase project created; note down the Project URL and anon public key — these will be needed in Stage 2

## Steps

1. Scaffold a new Vite + React project locally
2. Install and configure Tailwind CSS
3. Replace the default Vite placeholder with the Hello World page content
4. Create `.env.example` with the Supabase variable names (no values)
5. Create `.gitignore` (ensure `.env.local` is listed)
6. Push to GitHub
7. Import the GitHub repo into Vercel; configure the build settings (Vite defaults work without changes)
8. Confirm the live Vercel URL renders correctly

## File Structure After Stage 1

```
questies-assemble/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## The Page Content

The single page displays:

- **Heading:** Questies Assemble!
- **Description (one sentence):** Enter your team's weekly availability so everyone gets a fair chance to accept quest invites before the window closes.
- Centered layout, Tailwind styling applied (to confirm Tailwind is working)

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` locally; Vercel dashboard for prod | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` locally; Vercel dashboard for prod | Supabase public anon key |

Both variables are defined in `.env.example` with empty values. They are not read by any code in Stage 1 — they are just staged for Stage 2.

## Acceptance Criteria

- [ ] The live Vercel URL loads the page
- [ ] The heading "Questies Assemble!" is visible
- [ ] Tailwind styles are visibly applied (e.g., centered layout, font styling)
- [ ] No console errors
- [ ] `.env.local` is not committed to the repo

---

---

# Stage 2: Bare Bones

## Goal

Prove the full data flow works and the scheduling algorithm is correct. UX is intentionally minimal. Supabase is connected and live. A real user can create a team, add members with availability, and see scheduling results.

## What Is Explicitly NOT in Stage 2

- No optional team name (team config is hardcoded defaults on creation)
- No editing of quest configuration after creation
- No time zone detection or conversion (all times stored and displayed in UTC)
- No member removal
- No availability pre-population on the edit page
- No "Last updated" timestamp
- No Refresh button (page reload suffices)
- No confirmation dialog on any action
- No hyphen-formatted team ID display
- No `luxon` dependency

The availability grid in Stage 2 uses **1-hour slots** (24 rows per day) to simplify the UI. The underlying database schema stores `slot_index` values 0–47 (30-minute resolution), but the Stage 2 grid only writes even values (0, 2, 4, ... 46), one per hour. This means the schema does not change in Stage 3 — only the grid gains finer resolution.

## Database Schema

Run the following SQL in the Supabase SQL editor to create all three tables.

```sql
CREATE TABLE teams (
  id          CHAR(10)     PRIMARY KEY,
  name        TEXT,
  min_participants      INTEGER      NOT NULL,
  max_participants      INTEGER      NOT NULL,
  max_invites           INTEGER      NOT NULL,
  time_reserved_hours   INTEGER      NOT NULL,
  required_action_minutes INTEGER    NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE members (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     CHAR(10)     NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name        TEXT         NOT NULL,
  timezone    TEXT         NOT NULL DEFAULT 'UTC',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE availability_slots (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  day_of_week SMALLINT     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  slot_index  SMALLINT     NOT NULL CHECK (slot_index BETWEEN 0 AND 47)
);

CREATE INDEX idx_members_team         ON members(team_id);
CREATE INDEX idx_slots_member         ON availability_slots(member_id);
```

### Schema Notes

- `teams.id` is a 10-digit numeric string (e.g., `'4827163095'`), not an integer, to preserve leading zeros if they occur.
- `day_of_week`: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
- `slot_index`: 0 = 00:00–00:30 UTC, 1 = 00:30–01:00 UTC, ..., 47 = 23:30–00:00 UTC.
- In Stage 2, only even `slot_index` values are written (0, 2, 4 ... = hourly boundaries). Odd values are reserved for Stage 3.
- Cascade deletes are set on both foreign keys: deleting a team removes its members; deleting a member removes their slots.

### Supabase Row Level Security

For Stage 2, disable RLS on all three tables (Supabase enables it by default). The team ID acts as the access gate. RLS can be added in a future version alongside proper auth.

To disable RLS via SQL:
```sql
ALTER TABLE teams            DISABLE ROW LEVEL SECURITY;
ALTER TABLE members          DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots DISABLE ROW LEVEL SECURITY;
```

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | Home | Create Team button + Enter Team ID form |
| `/team/:id` | Team | Team config, member list, results |
| `/team/:id/member/new` | MemberEdit | Add a new member |
| `/team/:id/member/:memberId` | MemberEdit | Edit an existing member |
| `*` (catch-all) | NotFound | "Team Not Found" equivalent for bad URLs |

The Vercel deployment requires a rewrite rule so all routes serve `index.html`. This is configured via a `vercel.json` file in the repo root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## File Structure After Stage 2

```
questies-assemble/
├── public/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Supabase client initialisation
│   ├── pages/
│   │   ├── Home.jsx             # Route: /
│   │   ├── Team.jsx             # Route: /team/:id
│   │   ├── MemberEdit.jsx       # Route: /team/:id/member/new and /:memberId
│   │   └── NotFound.jsx         # Catch-all
│   ├── components/
│   │   ├── AvailabilityGrid.jsx # 7-day x 24-hour clickable grid
│   │   └── ResultsList.jsx      # Displays good invite times
│   ├── utils/
│   │   └── scheduler.js         # Scheduling algorithm (pure function)
│   ├── App.jsx                  # Router setup
│   ├── main.jsx
│   └── index.css
├── vercel.json
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Page Descriptions

### Home (`/`)

- Brief one-sentence description of the app (same as Stage 1 page).
- **Create a Team** button — generates a random team ID, writes a new row to `teams` with hardcoded default config values (min 3, max 8, max invites 7, time reserved 5 hours), then navigates to `/team/:id`.
- **Enter Team ID** text input + Go button — navigates to `/team/:id`. If the team does not exist, the Team page handles the Not Found state.

Default quest config values used on team creation in Stage 2 (user cannot change these yet):

| Field | Default |
|---|---|
| min_participants | 3 |
| max_participants | 8 |
| max_invites | 7 |
| time_reserved_hours | 5 |
| required_action_minutes | 1 |

### Team (`/team/:id`)

On load:
1. Fetch the team record by ID. If not found, display "Team Not Found" with a link to `/`.
2. Fetch all members for the team.
3. Fetch all availability slots for those members.
4. Run the scheduling algorithm and display results.

Page layout (top to bottom):
- Team ID displayed as plain text (e.g., `Team ID: 4827163095`)
- Quest config displayed as read-only labels (time reserved, min/max participants, max invites)
- **Members** section: list of member names; each name is a link to `/team/:id/member/:memberId`; **Add Member** button navigates to `/team/:id/member/new`
- **Results** section: output of the scheduling algorithm (see ResultsList component)

### MemberEdit (`/team/:id/member/new` and `/team/:id/member/:memberId`)

For `/new`: blank form.
For `/:memberId`: load existing member name and timezone; availability grid is empty in Stage 2 (pre-population added in Stage 3).

Form fields:
- **Name** — text input (required)
- **Timezone** — plain text input in Stage 2 (e.g., user types `America/New_York`); replaced with a proper selector in Stage 3
- **Availability grid** — 7 columns (Sun–Sat) × 24 rows (00:00–23:00 UTC, one row per hour); each cell is a toggle button

On save:
1. Upsert the member record (insert for new, update name/timezone for existing).
2. Delete all existing `availability_slots` rows for this member.
3. Insert new `availability_slots` rows for every checked cell (using even `slot_index` values).
4. Navigate back to `/team/:id`.

### NotFound

Displayed for any unrecognised route. Message: "Page not found." Link back to `/`.

The Team page also shows a similar inline message when the team ID from the URL does not exist in the database.

## Team ID Generation

```javascript
async function generateUniqueTeamId(supabase) {
  while (true) {
    const id = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    const { data } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (!data) return id;
  }
}
```

## Scheduling Algorithm (`src/utils/scheduler.js`)

This is a pure function — it takes data as arguments and returns a list of good invite times. It has no side effects and no database calls, making it easy to test independently.

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `members` | Array | List of member objects `{ id }` |
| `allSlots` | Array | All availability_slots rows for the team: `{ member_id, day_of_week, slot_index }` |
| `timeReservedHours` | Number | Width of the invite window in hours |
| `nowUtc` | Date | Current UTC time (passed in so the function is testable) |

### Constants

```
SLOTS_PER_DAY  = 48       (30-minute resolution, even in Stage 2)
SLOTS_PER_WEEK = 336      (7 * 48)
windowSlots    = timeReservedHours * 2
```

### Steps

```
1. Build a lookup map: memberId -> Set of weekly slot numbers
   weekly slot number = day_of_week * 48 + slot_index

2. Find the current weekly slot number from nowUtc:
   minuteOfDay  = hours(nowUtc) * 60 + minutes(nowUtc)
   currentSlot  = dayOfWeek(nowUtc) * 48 + floor(minuteOfDay / 30)
   (day_of_week: 0=Sunday per JS Date convention)

3. For i = 0 to 47 (48 candidate slots = 24 hours):
     candidateWeeklySlot = (currentSlot + i) % SLOTS_PER_WEEK

     allMembersCovered = true
     for each member in members:
       memberCovers = false
       for j = 0 to windowSlots - 1:
         checkSlot = (candidateWeeklySlot + j) % SLOTS_PER_WEEK
         if checkSlot is in memberSlotSets[member.id]:
           memberCovers = true
           break
       if not memberCovers:
         allMembersCovered = false
         break

     if allMembersCovered:
       add candidateWeeklySlot to goodSlots

4. Return goodSlots as a list of { dayOfWeek, slotIndex, label } objects
   label (Stage 2) = UTC time string, e.g. "Monday 14:00 UTC"
```

### Output Format (Stage 2)

Each entry in the returned list:
```javascript
{
  dayOfWeek: 1,          // 0=Sun ... 6=Sat
  slotIndex: 28,         // 0–47
  label: "Monday 14:00 UTC"
}
```

The ResultsList component renders these as a plain `<ul>` with one `<li>` per entry.

If the list is empty, display: "No available windows in the next 24 hours."

### Manual Verification Test Case

Use this to confirm the algorithm is correct before proceeding to Stage 3.

**Setup:**
- Team: `time_reserved_hours = 2`
- Two members: Alice and Bob
- `nowUtc` is set to **Sunday 00:00 UTC** for the test (so `currentSlot = 0`)

**Alice's availability (UTC):** Sunday 02:00–03:00 → slot_index 4 and slot_index 5 (but Stage 2 only writes even values, so slot_index 4 only), day_of_week 0

**Bob's availability (UTC):** Sunday 01:00–04:00 → slot_index 2, 4, 6 (Stage 2 even only: 2, 4, 6), day_of_week 0

**Window size:** 2 hours = 4 slots

**Expected result:**
- Candidate slot 0 (Sun 00:00): window covers slots 0–3. Alice has no slots in 0–3. **Not good.**
- Candidate slot 1 (Sun 00:30): not reachable in Stage 2 (odd slot — skip in reasoning, algorithm still checks it, just no one has odd slots)
- Candidate slot 2 (Sun 01:00): window covers slots 2–5. Alice has slot 4. Bob has slots 2, 4. **Good.**
- Candidate slot 4 (Sun 02:00): window covers slots 4–7. Alice has slot 4. Bob has slots 4, 6. **Good.**
- Candidate slot 6 (Sun 03:00): window covers slots 6–9. Alice has no slots in 6–9. **Not good.**

Expected output: Sunday 01:00 UTC and Sunday 02:00 UTC (plus any odd-indexed slots between them, which will also pass since coverage relies on even slots that fall within the window).

## Acceptance Criteria for Stage 2

- [ ] Creating a team generates a unique 10-digit ID and stores the record in Supabase
- [ ] Navigating to `/team/:id` with a valid ID shows the team page
- [ ] Navigating to `/team/:id` with an invalid ID shows "Team Not Found"
- [ ] Adding a member saves their name, timezone, and availability slots to Supabase
- [ ] Saving a member's availability replaces (not appends) their previous slots
- [ ] The algorithm output matches the manual verification test case above
- [ ] The results list updates after a member is added (on page reload)
- [ ] Direct URL `/team/:id` works after a Vercel deploy (SPA rewrite is configured)

---

---

# Stage 3: Full Implementation

## Goal

Complete all features from the agreed design. Stage 3 is additive — it does not change the database schema or the algorithm's core logic, only extends the UI and the algorithm's input/output handling.

## Changes from Stage 2

### 1. 30-Minute Availability Grid

Replace the 24-row (1-hour) grid with a 48-row (30-minute) grid. The underlying `slot_index` values are already 0–47 in the database — Stage 3 simply enables writing odd values (e.g., slot_index 1, 3, 5 ...) for the first time.

### 2. Time Zone Detection and Conversion

**New utility: `src/utils/timezone.js`**

Responsibilities:
- Detect browser time zone using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Convert a (day_of_week, slot_index) pair in a given IANA time zone to the corresponding UTC (day_of_week, slot_index) pair
- Convert a UTC (day_of_week, slot_index) pair back to a local time string for display

**On the MemberEdit page:**
- Auto-detect the browser time zone and pre-fill the timezone field
- Replace the plain text input with a searchable `<select>` populated with IANA zone names, displaying friendly labels (e.g., "Eastern Time — New York")
- Show a visible label: "Entering times in: America/New_York (auto-detected)" with an option to change
- The availability grid shows times in the selected local time zone
- On save, convert each selected local (day_of_week, slot_index) to UTC before writing to `availability_slots`

**On the Team page:**
- Detect the viewer's browser time zone (session-only, not saved)
- Show a label: "Times shown in: America/New_York (auto-detected)" with an override option
- Convert UTC slot numbers to local time strings for display in the results list

### 3. Optional Team Name

- Add a **Team Name** text input to the Create Team flow on the Home page (optional — may be left blank)
- Display the team name at the top of the Team page if set (fall back to "Team [ID]" if blank)

### 4. Editable Quest Configuration

- Add an **Edit Config** button to the Team page
- Clicking it reveals an inline form with all five config fields pre-filled with current values
- Saving updates the `teams` row and immediately recalculates results

### 5. Availability Pre-population on MemberEdit

When navigating to `/team/:id/member/:memberId`, fetch the member's existing slots and pre-highlight the corresponding cells in the availability grid.

### 6. Member Removal

- Add a **Remove** button next to each member name on the Team page
- On click, call `window.confirm('Remove [Name] from this team?')`
- If confirmed, delete the member record (cascade deletes their slots), then recalculate and re-render results

### 7. "Last Updated" Timestamp and Refresh Button

- Below the results list, display "Last updated: [time in local TZ]"
- Add a **Refresh** button that re-fetches members and slots and reruns the algorithm

### 8. Hyphen-Formatted Team ID Display

Display the team ID as `XXXX-XXX-XXX` on the Team page for readability. The underlying value in the URL and database remains the plain 10-digit string.

```javascript
function formatTeamId(id) {
  return `${id.slice(0, 4)}-${id.slice(4, 7)}-${id.slice(7)}`;
}
```

### 9. Proper Time Zone Selector Component

**New component: `src/components/TimezoneSelector.jsx`**

A searchable dropdown of IANA time zone names sourced from `Intl.supportedValuesOf('timeZone')` (supported in all modern browsers). Displays a friendly name alongside the IANA identifier.

## File Structure After Stage 3 (additions/changes from Stage 2)

```
src/
├── components/
│   ├── AvailabilityGrid.jsx     # Updated: 48-row grid, local TZ display
│   ├── ResultsList.jsx          # Updated: local TZ display, Last Updated, Refresh
│   └── TimezoneSelector.jsx     # New: searchable IANA timezone dropdown
├── utils/
│   ├── scheduler.js             # Minor update: label generation uses local TZ
│   └── timezone.js              # New: TZ detection and slot conversion
├── pages/
│   ├── Home.jsx                 # Updated: team name field, full config form
│   ├── Team.jsx                 # Updated: name display, edit config, remove member
│   └── MemberEdit.jsx           # Updated: TZ selector, pre-populated grid, 30-min slots
```

## Acceptance Criteria for Stage 3

- [ ] Availability grid shows 48 rows (30-minute slots) in the member's selected time zone
- [ ] Slots saved to the database are correctly converted to UTC
- [ ] Results list displays times in the viewer's browser time zone
- [ ] Time zone label is visible on both the MemberEdit page and Team page, with override working
- [ ] Team name is optional on creation and displays correctly when set
- [ ] Quest config is editable on the Team page; results update immediately after saving
- [ ] Returning to a member's edit page shows their previously saved availability pre-highlighted
- [ ] Remove member triggers confirm dialog; member and slots are deleted on confirmation; results update
- [ ] "Last updated" timestamp is visible; Refresh button reruns the algorithm
- [ ] Team ID displays in hyphen format on the Team page

---

## Summary of All Decisions

| Concern | Decision |
|---|---|
| Stack | React + Vite, Tailwind, React Router v6, Supabase, Vercel |
| Hosting | Vercel (free tier, auto-deploy from GitHub) |
| Routes | `/`, `/team/:id`, `/team/:id/member/new`, `/team/:id/member/:memberId` |
| Team ID | Random 10-digit numeric string; hyphen-formatted for display only |
| Max team size | 15 members |
| Availability granularity | 30-minute slots (slot_index 0–47); Stage 2 uses 1-hour (even indexes only) |
| Times stored in | UTC (converted to/from local TZ in UI) |
| Algorithm scope | All active members; quest config fields are reference only |
| First candidate slot | Floor of current UTC time to nearest 30-min boundary |
| Results window | Next 24 hours (48 candidate slots) |
| Results format | Plain list in browser-detected local time zone |
| Refresh | Manual button + "Last updated" timestamp |
| Member edit entry | Click name in list → dedicated page |
| Member removal | Hard delete, browser confirm(), silent recalculate |
| Config editing | Open to anyone with the team ID; editable after creation |
| Auth | None for v1 |
| No overlapping windows | Display "No available windows in the next 24 hours" |
| Data retention | Indefinitely; 1 month acceptable at launch |
| App name | Questies Assemble! |
