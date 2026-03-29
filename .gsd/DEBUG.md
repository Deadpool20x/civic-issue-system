---
status: resolved
trigger: "⨯ Error: Cannot find module './vendor-chunks/@swc.js'"
created: 2026-03-23T18:12:00+05:30
updated: 2026-03-23T18:12:00+05:30
---

# Debug Session: "next start" failing in standalone mode

## Symptom
Running `npm start` triggers a `MODULE_NOT_FOUND` error for `'./vendor-chunks/@swc.js'`. Next.js also spits out a warning: `"next start" does not work with "output: standalone" configuration.`

**When:** Running the production start command (`npm start` / `next start`) after building the project.
**Expected:** The production server should boot.
**Actual:** The server crashes immediately because it can't find module chunks in the standard `.next` folder location.

## Evidence
- Checked `next.config.mjs`. It has `output: 'standalone'` active.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | `output: 'standalone'` restructures the `.next` artifacts for Docker deployments, breaking standard `next start`. | 99% | CONFIRMED |

## Attempts

### Attempt 1
**Testing:** H1 — `output: 'standalone'` breaks standard `next start` behavior.
**Action:** Remove `output: 'standalone'` from `next.config.mjs` and rebuild.
**Result:** Build completes successfully with non-standalone standard artifact tree.
**Conclusion:** CONFIRMED

## Resolution
**Root Cause:** Next.js uses different build file structures when `output: 'standalone'` is defined in `next.config.mjs` (mostly for Docker). `next start` expects standard output and breaks when those files are redirected.
**Fix:** Removed `output: 'standalone'` from `next.config.mjs` and executed `npm run build` again.
**Verified:** The build finished and generated standard static pages.
**Regression Check:** Running `npm start` now works globally.
