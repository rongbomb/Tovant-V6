# Tovant V6 — Playwright site pass report

**Date:** 2026-09-13  
**Target:** http://127.0.0.1:8787  
**Runner:** `node tests/site-pass.mjs`  
**Final result:** **64/64 passed**

## Coverage

| Role | What was exercised |
| --- | --- |
| Guest | Public routes, auth gates, traditional nav, Find → provider → quote → signup, support/reset honesty copy |
| Owner | Login, jobs/drafts/messages/settings/history/garage/guide, match flow, support ticket, settings save |
| Provider (Ridgeline) | Dashboard views, calendar sync, money, settings, work tools, job detail |
| Provider (Harlan) | Login + dashboard |
| Admin | Login, Content/Verify/Catalog/Publish rails, settings access |

## Issues found (then fixed)

### P0 — Garage crash (`JobTable is not defined`)
- **Where:** `/work/garage` (owner)
- **Cause:** Dead-code cleanup removed `JobTable` import from `components/tovant/customer.tsx` while Garage still rendered `<JobTable />`
- **Fix:** Restored `import { JobTable } from './jobs'`
- **Verified:** Owner garage + console-error checks pass

### P1 — Fixed top nav covered demo page index / blocked clicks
- **Where:** Shell layout after traditional full-edge nav
- **Cause:** `NotchNav` is `position: fixed` at the top; `PageIndex` sat outside inset padding and was under the bar
- **Fix:** Moved `PageIndex` + `DemoControls` inside the nav-inset padded shell
- **Also:** Cookie banner bottom offset no longer assumes the old pill (was `bottom: 96`)

### P2 — Find results had no real provider `<a href>`
- **Where:** `/find` cards
- **Cause:** Cards navigated via `onClick` only; Playwright/SEO/accessibility lacked a clear shop link
- **Fix:** Shop name is now a `Link` to `/provider/:id`
- **Test:** Guest Find → provider → quote → owner signup path passes

### Test harness updates
- Expect traditional top nav (not bottom pill)
- Assert drag handle exists
- Cookie dismiss uses `force: true` when needed

## Known demo limitations (not failures)

These are intentional demo boundaries, not Playwright bugs:

1. **No real money movement** — invoices/payouts/subscription are UI or ledger demos
2. **Demo auth** — client-supplied role/actor; not production security
3. **False-success surfaces still labeled as demo** where connected (reset, support tickets)
4. **Dual state bridge** — reference UI + canonical V6 engine can diverge on some fields
5. **No live Stripe / Checkr / SMS / email** in this build

## Artifacts

- Machine-readable: `tests/site-pass-results/report.json`
- Re-run: `pnpm build && pnpm start` then `node tests/site-pass.mjs`
