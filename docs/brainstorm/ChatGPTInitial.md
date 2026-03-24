# Tonic Quest Accept Scheduler (TQAS) – Feedback & Recommendations

## Overview

This is a strong concept that solves a real coordination problem:

> **When is the best time to send quest invites so teammates can accept before random players fill the quest?**

Your idea is essentially a specialized version of availability scheduling tools (like When2meet), but with an important twist:

- It focuses on **invite timing**, not just overlap
- It accounts for a **limited acceptance window**
- It optimizes for **meeting minimum participant thresholds**

This gives it a clear and valuable niche.

---

## Core Value Proposition

Instead of framing this as:
> “When are we all available?”

Frame it as:
> **“When should I send invites so my team can accept in time?”**

That distinction is your product’s strength.

---

## MVP Definition

### Primary Goal

**Find the safest times to send quest invites.**

### Inputs

- Quest Minimum Participants
- Quest Maximum Participants
- Quest Maximum Invites
- Time Reserved for Invitees (hours)
- Required Action Time (minutes)
- Member time zones
- Member availability (weekly grid)

### Outputs

- Ranked list of **best send times**
- For each time:
    - Number of invitees likely to accept in time
    - Whether minimum participants can be reached
    - Which members are unavailable
    - Local time conversion for each member

---

## Product Design Suggestions

### 1. Team Setup

Fields:
- Team Name
- Team ID / Share Link
- Minimum Participants
- Maximum Participants
- Maximum Invites
- Reserved Time for Invitees
- Required Action Time (default: 1 minute)

**Suggested addition:**
- Earliest acceptable send time
- Latest acceptable send time

This prevents results like 3 AM being “optimal.”

---

### 2. Member Availability Input

Use a **weekly grid UI**:
- Columns = days of week
- Rows = time blocks
- Each member selects availability in their own time zone

Why:
- Faster input (~1 minute as desired)
- Simpler than date-specific scheduling
- Matches real-world recurring availability

---

### 3. Results Page

Display results in tiers:
- **Best Times**
- **Good Alternatives**
- **Poor Choices**

For each candidate time:
- Number of available invitees within reserved window
- Whether minimum threshold is met
- Visual indicators (heatmap or score)
- Time shown in each member’s local timezone

---

## Important Logic Adjustment

Your current rule:

> “All members must be available”

This may be too strict.

### Recommended Approach

Prioritize:
1. Times where **minimum participants can accept**
2. Times with **higher total participation**
3. Times that are **reasonable across time zones**

This makes the system more flexible and realistic.

---

## Suggested Scoring Model

For each possible send time:

1. Check each member’s availability within the reserved window
2. Mark member as “covered” if they have ≥1 minute availability
3. Count total covered members

### Score based on:
- Covered members ≥ minimum participants (required)
- Total number of covered members
- Time-of-day fairness across time zones

---

## Technology Recommendations

### Goal
- Minimal cost (preferably free)
- No server management
- Simple deployment

### Recommended Stack

- **Frontend:** React + TypeScript
- **Backend:** Serverless functions
- **Hosting:** Cloudflare Pages + Workers
- **Database:** Cloudflare D1 (SQLite) or KV

### Why Cloudflare
- Free tier available
- Full-stack support
- No server maintenance
- Scales automatically

---

### Alternatives

| Option      | Pros                          | Cons                          |
|------------|-------------------------------|-------------------------------|
| Vercel     | Easy deployment               | Less integrated storage       |
| Firebase   | Strong ecosystem              | Billing complexity            |
| Supabase   | Full Postgres + Auth          | Not fully free long-term      |

---

## Data Model (Minimal)

### Team
- teamId
- teamName
- minimumParticipants
- maximumParticipants
- maximumInvites
- reservedHours
- requiredActionMinutes
- createdAt

### Member
- memberId
- teamId
- displayName
- timeZone

### AvailabilitySlot
- memberId
- dayOfWeek
- startMinute
- endMinute

---

## Naming Suggestions

### Current Name
- Tonic Quest Accept Scheduler (TQAS)
    - Accurate, but not user-friendly

### Better Branding

**Top Recommendation:**
- **Questies Assemble!**

### Alternatives
- Quest Window
- Quest Sync
- Quest Time
- Ready Check
- Party Window
- Invite Window
- QuestClock

### Suggested Structure
- **Brand:** Questies Assemble!
- **Tagline:** Find the best time to send Tonic quest invites

---

## Existing Tools Comparison

Existing tools:
- When2meet
- LettuceMeet

They solve:
- “When are we all available?”

They do NOT solve:
- “When should we send invites given a time-limited acceptance window?”

This is your niche.

---

## MVP Scope (Keep It Small)

### Include:
- Team creation
- Shareable link
- Member entry
- Time zone selection
- Weekly availability grid
- Ranked send times

### Exclude (for now):
- Login/authentication
- Notifications
- Calendar integrations
- Tonic API integration
- History tracking
- Analytics

---

## Security / Access Considerations

Without login:
- Anyone with link can edit

### Simple Solution:
- Admin link (owner only)
- Member-specific edit links
- Public link = read-only

This avoids full auth complexity early.

---

## Alignment with Tonic

Tonic already supports:
- Quest invites
- Team coordination

Your tool:
- Enhances timing decisions
- Reduces risk of public fill
- Supports cross-timezone teams

This aligns well with real usage patterns.

---

## Final Recommendation

This idea is worth building.

### Why:
- Solves a real problem
- Clear differentiation from existing tools
- Small, achievable MVP
- Can run at near-zero cost
- No dependency on Tonic integration

### Best Approach:
> Build a lightweight, share-link-based web app that recommends optimal invite send times based on availability and acceptance windows.

---

## Next Step (Optional)

If desired, the next step would be:
- A full product spec with:
    - Page-by-page breakdown
    - UI wireframes
    - API design
    - Build order roadmap