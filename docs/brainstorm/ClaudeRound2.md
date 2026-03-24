# Claude's Round 2 Comments — Questies Assemble!

## Summary of Answers Received

All seven questions from ClaudeInitial.md were answered. Key decisions locked in:

- Availability is **recurring weekly** (not date-specific).
- A member needs to be available for **1 minute at some point within the window** (not simultaneously with others).
- Team data persists **indefinitely**; 1 month is acceptable to start.
- No overlapping window → **display "no window exists"** for v1; future versions try extending the window by 1-hour increments.
- Mobile is **not a v1 priority**.
- Results **update on the page** every time a member saves their availability.
- Team ID is a **10-digit number**.
- Name confirmed: **Questies Assemble!**

---

## Implications and Design Notes

### Data Model

The recurring weekly model means availability is stored as a weekly schedule, not a date range. A natural representation per member:

```
Member availability = list of { dayOfWeek (0-6), startTime (HH:MM), endTime (HH:MM) }
```

All times should be stored in UTC and converted to/from the member's local time zone in the UI. This makes the algorithm timezone-agnostic.

Suggested tables (using Supabase/Postgres as a reference):

- **teams** — id (10-digit), min_participants, max_participants, max_invites, time_reserved_hours, required_action_minutes, created_at, last_active_at
- **members** — id, team_id, name, timezone, created_at, updated_at
- **availability_slots** — id, member_id, day_of_week, start_utc (time), end_utc (time)

Storing slots as rows (rather than a single JSON blob) makes querying and updating individual slots easier, and supports the future select/deselect feature cleanly.

### Algorithm — Recurring Weekly Schedule

Since availability repeats each week, the search space is one 168-hour week (7 days × 24 hours), discretized into time slots (e.g., 15-minute increments = 672 slots per week).

For each candidate invite slot `T`:
- Window closes at `T + TimeReservedForInvitees`.
- The window may wrap across midnight or across the week boundary (Sunday → Monday) — the algorithm must handle wraparound.
- A member "covers" slot `T` if they have at least one available minute anywhere in `[T, T + TimeReservedForInvitees - 1 min]`.
- A slot is a "good" invite time if **all** members cover it.

Output: list of good slots, expressed in the viewer's own time zone (browser-detected), grouped by day of week.

### "Results Update on the Page" Behavior

This does not require websockets or real-time subscriptions. The simplest correct behavior:
- When a member saves their availability, the page re-runs the algorithm against the latest data from the database and re-renders the results.
- Other team members viewing the page at the same time will see stale results until they refresh. For v1, this is acceptable — a "Refresh Results" button would cover the gap if needed.

If real-time updates become desirable later, Supabase supports Postgres change subscriptions with minimal extra code.

### Member Edit / Update Flow

Since members will update their own availability over time, the UI needs to handle returning members. Two options:

1. **Member selects their name from a list** and edits their existing record.
2. **Member enters their name**, and the system matches it to an existing record (fuzzy or exact).

Option 1 is simpler and avoids duplicate member records. The team page can list all current members with an "Edit" button per member.

No password is required for v1 since the team ID itself is the access gate — anyone with the ID can edit anyone's availability. This is acceptable given the trust model (close-knit teams). Worth noting as an acceptable risk for v1.

### 10-Digit Numeric ID

A purely numeric 10-digit ID gives 10 billion possible values. For a small initial user base this is more than sufficient. Displaying it with a hyphen (e.g., `1234-567-890`) would improve readability without changing the underlying storage.

### Future Select/Deselect Feature

The data model described above already supports this naturally: members are rows in the members table, and the algorithm accepts a list of member IDs to include. The UI addition for v1 should at minimum store all members — even if the selection UI isn't built yet — so future versions don't need a migration.

---

## Remaining Questions

1. **Availability granularity:** What is the smallest time slot a member can mark as available — 15 minutes, 30 minutes, or 1 hour? This affects both the UI grid and the algorithm's resolution. 30-minute slots are a reasonable default (coarse enough to fill out quickly, fine enough to be useful).

2. **Output time zone:** When the results list good invite times, whose time zone should they be displayed in? Options:
   - Each viewer sees times in their own (browser-detected) time zone — most useful for individuals.
   - Times are shown in UTC — simpler but less friendly.
   - Times are shown in the quest organizer's time zone — consistent but requires knowing who the organizer is.
   Browser-detected seems best for v1 since there is no login concept.

3. **Can members be removed from a team?** If someone leaves the team, should their availability be deletable? Or is it sufficient to just stop factoring them into results (which points toward the future select/deselect feature)?

4. **Team name:** Should the team have an optional human-readable name in addition to the numeric ID? This would make it easier to distinguish teams if a person is on multiple teams.

5. **Multiple quest configurations per team?** The current model stores one set of quest parameters (min participants, max invites, etc.) per team. In practice, does a team ever run different quest types that have different minimums or time windows? If so, v1 may want to allow multiple "configurations" per team, or at least make the parameters editable after creation.

6. **What happens at the week boundary?** If a "good" invite window straddles Saturday night into Sunday morning, how should that be displayed? This is an edge case worth deciding early since it affects output formatting.
