# Phase 008 — Terminology and Polish

## Status: Pending

## Goals

Consistency and small UX improvements.

---

## Task 1 — Standardise on "Tool" Terminology

### Problem

The product is referred to inconsistently across the codebase:

- "app" — used in the README and source code
- "site" — used in the IN TEST warning on the home page
- "tool" — used once in the README opening line

The preferred term is **tool**.

### Changes

Audit and update all user-facing text across the following files, replacing "app" and "site" with "tool" where they refer to the product itself:

- **`README.md`**
- **`src/pages/Home.jsx`** (IN TEST warning, description)
- **`src/pages/ComingFeatures.jsx`**
- **`src/pages/Faq.jsx`**

### Acceptance Criteria

- [ ] No user-facing text refers to the product as "app" or "site"
- [ ] All references consistently use "tool"
