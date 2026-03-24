# Phase 003 — Home Page & Coming Features

## Status: Pending

## Goals

Update the home page copy to better reflect the app's purpose, and add a Coming Features page so users can see what is planned.

---

## Task 1 — Update Home Page Wording

### Problem

The current description reads: *"Enter your team's weekly availability so everyone gets a fair chance to accept quest invites before the window closes."*

The phrase "before the window closes" is generic and does not capture why timing matters in this context. The more accurate and flavourful phrasing is "before randoms start joining".

### Changes

- **`src/pages/Home.jsx`:** Replace "before the window closes" with "before randoms start joining" in the description paragraph.

### Acceptance Criteria

- [ ] The home page description reads "…before randoms start joining"
- [ ] No other text on the page is changed

---

## Task 2 — Coming Features Page

### Problem

Several planned features (unavailable time selection, availability overview, block selection) are not yet implemented. A dedicated page lets users know what is coming and sets expectations.

### Changes

**New route:** `/coming-features`

**New page: `src/pages/ComingFeatures.jsx`**

Displays a list of planned features. Each entry should have a title and a short description. The initial list:

| Feature | Description |
|---|---|
| Select unavailable times | Mark the times you are busy instead of available — the app will treat everything else as free. |
| See everyone's availability | View a combined grid showing when all team members are free at a glance. |
| Select times as a block | Click and drag (or click a start and end cell) to select a range of time slots at once, rather than toggling cells one by one. |

**Home page button:**

Add a link/button on the home page that navigates to `/coming-features`. It should be understated — secondary to the main Create/Join actions (e.g., a small text link below the main controls).

**NavBar back-link:**

The Coming Features page should include the `NavBar` component so users can return to the home page.

**Router:**

Add the `/coming-features` route to `src/App.jsx`.

### Acceptance Criteria

- [ ] A link to the Coming Features page is visible on the home page
- [ ] Navigating to `/coming-features` shows the coming features list
- [ ] All three features are listed with titles and descriptions
- [ ] The Coming Features page has a NavBar link back to the home page
- [ ] The `/coming-features` route works correctly after a Vercel deploy (covered by the existing `vercel.json` SPA rewrite rule)
