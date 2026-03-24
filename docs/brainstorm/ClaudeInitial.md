# Claude's Initial Comments on the Tonic Quest Accept Scheduler

## General Assessment

The problem is well-defined and solvable with a modest web application. The core scheduling algorithm is straightforward: find time windows where all team members have at least one minute of availability before the Time Reserved for Invitees expires. The main complexity comes from time zone normalization.

---

## Existing Alternatives

No tool appears to exist for this specific use case. General scheduling tools like **When2meet** and **Doodle** solve the related problem of "when can everyone meet," but they don't model the TQAS-specific constraint — namely, that each person only needs to be available for ~1 minute *at some point within* a multi-hour window, not simultaneously. That distinction makes a custom tool worthwhile.

---

## Scheduling Algorithm

The core logic:

- Normalize all member availability to UTC.
- For a candidate invite time `T`, the window for invitees closes at `T + TimeReservedForInvitees`.
- Each member needs at least one available minute somewhere in `[T, T + TimeReservedForInvitees - RequiredActionTime]`.
- A time slot `T` is "good" if every team member satisfies the above condition.
- The output is a ranked list of good candidate invite times.

Availability can be represented in 15-minute or 30-minute increments for the UI, then checked in aggregate.

---

## Technology Recommendations

Since you want free hosting and no server to maintain, here is a practical stack:

**Frontend:** React or plain HTML/CSS/JS (a simple SPA). Hosted free on **Vercel**, **Netlify**, or **GitHub Pages**.

**Data persistence:** You need team data to be accessible across multiple users and sessions, which rules out localStorage alone. Good free-tier options:
- **Supabase** (Postgres + REST API, generous free tier, no backend code required) — recommended.
- **Firebase Firestore** (also free tier, slightly more vendor lock-in).
- **PocketBase** (self-hosted on a free VPS like Fly.io — more setup, but fully yours).

A team record is small (a few KB at most), so even the most limited free tier will comfortably handle this.

**No login required for MVP:** The 10-digit team ID acts as a shared secret. This is fine for MVP; it matches your stated preference to defer auth to a future enhancement.

---

## Design Observations

- **Team ID as the access mechanism** is simple and appropriate for MVP. Consider making the ID URL-safe and easy to share (e.g., alphanumeric, no ambiguous characters like 0/O or 1/l).
- **Availability input UX** is the most important part of the experience. A grid similar to When2meet (rows = time slots, columns = days of the week or a date range) would be familiar and fast to fill out.
- **Time zone selection** should default to the user's browser-detected time zone to reduce friction.
- The current model assumes availability is recurring (same times each week). If the quest has a specific date, you may want to allow members to enter availability for a specific date range instead of a generic weekly schedule. This is worth clarifying early.

---

## Branding

"Questies Assemble!" is memorable and fits the tone. "Tonic" in the name may be confusing to outsiders who don't know the game — "Questies Assemble!" alone communicates the purpose well.

---

## Questions

1. **What game is "Tonic"?** Understanding the game mechanics (e.g., whether invites expire in a fixed number of hours or the window is truly unknown/variable) will affect how the algorithm should handle the uncertainty in Time Reserved for Invitees.

2. **Is availability recurring or date-specific?** Is the team scheduling around a fixed weekly routine ("I'm always free Tuesday evenings"), or are they coordinating for a specific upcoming window (e.g., "this weekend")?

3. **What does availability mean in practice?** Does a member need to be at their computer for the full duration, or just available to check in for 1 minute at any point during the window? (The document implies the latter, but confirming this matters for the algorithm.)

4. **How long should team data persist?** A week? A month? Indefinitely? This affects storage design and whether you need any cleanup mechanism.

5. **Does the system need to handle the case where no fully-overlapping window exists?** If no time slot works for all members, should it show "best effort" results (e.g., times when all but one person is available)?

6. **Mobile usage?** Team members entering availability from their phones is likely — is a mobile-friendly UI a priority for v1?

7. **Notifications?** Once the best time is identified, does anything happen — a shareable link, a calendar invite export, an email? Or is copy-pasting the time manually out of scope for now?
