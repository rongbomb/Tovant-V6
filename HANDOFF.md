# Tovant V6: Cursor handoff

**Snapshot:** 2026-09-12. This guide accompanies `Tovant-V6-Cursor-Handoff.zip`.
**Integrated source commit:** `452447e4a1095cb53cfaa758470fde6910a1c388`.
**Original visual reference:** [rongbomb/Tovant-V6](https://github.com/rongbomb/Tovant-V6), reference HEAD observed during the UI restoration: `68eb2c2241dce7e93624b04a3c6456420c347324`. The ZIP is the integrated V6 source, not an unchanged clone of that reference.
**Deployed demo:** Private hosting demo (source snapshot is in the ZIP; live session records are not).

## Read this first

Tovant is a two-sided automotive marketplace and provider workspace for mechanics, detailers, inspectors, roadside providers and related businesses. V6 is an **interactive, persistent demo**, not a launch-ready service. The original GitHub visual system was restored into `reference-ui/`, while the V6 booking/job engine remains in `components/tovant/` and `lib/tovant/`. The bridge in `reference-ui/lib/bridge.js` makes the two UI families share selected data. Some original pages still use simulated data or local interactions. Do not onboard real people, collect real passwords, claim a provider is verified, or take payments with this build.

The current README and `docs/V6-AUDIT.md` describe the earlier V6 UI before the GitHub visual restoration. Use this handoff as the current map. `docs/V6-AUDIT.md` remains useful for the domain work and its original research references, but its UI inventory and certain claims about no passwords collected are now outdated.

## Getting the source into Cursor

1. Extract the ZIP. Open its `Tovant-V6/` directory as the Cursor project. The ZIP includes every **tracked source file at the integrated commit** plus this handoff. It excludes `.git`, installed dependencies, compiled output, machine-specific files, credentials, and D1/R2 session content.
2. Use Node **22.13 or later** and the lockfile's `pnpm@11.25.0` when available. Run `corepack pnpm install --frozen-lockfile` (or an equivalent pnpm 11.25.0 install), then `corepack pnpm build`, `node node_modules/typescript/bin/tsc --noEmit`, and `node tests/domain.mjs`. The `scripts/install-pnpm.sh` and other `sites-*` scripts contain managed-host environment assumptions. If working outside that host, adapt the local runtime configuration rather than deleting application code.
3. `pnpm dev` is the configured Vinext development entry point. The site **requires Cloudflare D1 `DB` and R2 `BUCKET` bindings**: see `.hosting/hosting.json`, `cloudflare-env.d.ts`, `db/schema.ts`, `drizzle/0000_quick_robbie_robertson.sql`, `app/api/demo/route.ts`, and `app/api/media/route.ts`. A blank local install without configured bindings will not load a working demo. Set up local D1/R2 with equivalent names and apply the migration to the local database. Do not copy production session records or tokens into a local environment.
4. This ZIP is a source snapshot, not a Git clone. To continue under Git version control, initialize a new local repository or connect your own authorized repository. The original visual repository is linked above. The integrated source lived on a private host and was **not pushed back to `rongbomb/Tovant-V6`**.

## Architecture and source map

| Concern | Current files | What they do |
| --- | --- | --- |
| Routes and visual identity | `reference-ui/App.jsx`, `reference-ui/pages/*`, `reference-ui/components/*`, `reference-ui/styles/tokens.css` | Restored GitHub React Router pages, notch navigation, original design tokens, demo page index and visual components. |
| React integration | `app/[[...path]]/page.tsx`, `components/tovant/app.tsx`, `app/layout.tsx`, `reference-ui/styles/integration.css` | Vinext catch-all route loads the reference app client-side; V6 tools and modals fit inside the restored page card style. |
| Shared presentation bridge | `reference-ui/lib/store.jsx`, `reference-ui/lib/bridge.js`, `components/tovant/navigation.tsx` | Adapts canonical jobs/providers/vehicles to the old UI's state shape; translates legacy links; persists a second reference-page snapshot. |
| Core workflow engine | `lib/tovant/model.ts`, `lib/tovant/actions.ts`, `components/tovant/{booking,business,jobs,customer,marketplace,onboarding}.tsx` | Seed data, service types, scheduling rules, bookings, estimates, inspections, dispatch, messages, reviews, admin, garage, reports. |
| Demo API and storage | `app/api/demo/route.ts`, `app/api/media/route.ts`, `db/schema.ts`, `drizzle/*` | A revisioned JSON aggregate per demo cookie in D1; job images in R2. |
| Verification | `tests/domain.mjs` | 18 domain tests. Last integrated source built and type-checked; no complete browser or accessibility test was performed. |

**Routing:** The GitHub UI uses `createBrowserRouter` in `reference-ui/App.jsx`; Next/Vinext catches URLs via `app/[[...path]]/page.tsx`. `/dashboard?view=schedule` is the restored provider Calendar; `/calendar`, `/business/calendar`, and `/dashboard/calendar` redirect there. `/work/calendar` exposes the exact-time V6 booking calendar. `/work/jobs/:id` exposes detailed workflow tools. `/work/customers`, `/work/money`, `/work/services`, `/work/garage`, and `/work/guide` expose other V6 modules inside the original page shell. Original `/find`, `/match`, `/provider/:id`, `/jobs`, `/messages`, `/settings`, `/provider-settings`, `/admin`, `/support` and editorial pages remain.

**Persistence:** `/api/demo` seeds a browser-specific `demo_sessions` row using a random HttpOnly cookie. Every update sends a revision; conflicting tabs receive a 409. `State` has canonical arrays of providers, customers, vehicles, jobs, favorites, tickets, time blocks and drafts, plus an optional `reference` blob containing original-page settings and content. Job evidence uses `/api/media` and session-prefixed R2 keys. This dual state is a compatibility bridge, not the proposed final architecture. It is important to pick one authoritative model before extending features.

**Demo personas:** The page index, `/login`, and Demo controls switch customer, provider and admin views. Passwords in the demo should never be treated as authentic credentials. The backend receives `role`, `actor` and `providerId` from the client; the same browser can impersonate every persona. Existing demo login and signup exist for exploration only. Newly entered demo signup passwords are SHA-256 digested before the legacy snapshot is persisted; this is not a suitable production password system. Sample accounts in `reference-ui/data/accounts.js` are public source constants.

## What currently works as a demo

- A populated automotive provider directory, search/filter/map/profile UI and basic owner/provider/admin page navigation in the GitHub visual style. Directory coordinates, ZIPs, ratings, credentials and editorial statistics are sample values.
- A server-persisted, per-browser session with sample customers, vehicles, providers and jobs. Demo controls switch persona/business. A reset action exists in `components/tovant/app.tsx`, although the current reference UI does not expose its confirmation trigger.
- Four core workflow categories: `appointment` can directly book; `estimate` sends itemized lines and requires customer approval before work; `inspection` requires a six-area published report before completion; `dispatch` progresses through travel and arrival. Mobile jobs also have travel states. They are configurable on services in `lib/tovant/model.ts` and `actions.ts`.
- Scheduling checks provider hours, staff, duration, buffer, blocks, vehicle overlap and a restricted Twin Cities pilot ZIP service area. Provider calendar and exact-time V6 calendar are separate UIs; original requests use morning/midday/afternoon windows, while canonical jobs use exact date/time.
- Customer garage, request/booking, estimates, job-linked messaging, direct-payment marking, invoice summaries, reviews, favorites, drafts, reports, and staff/service management in at least one route. Job-linked photos use R2 with 4 MB JPG/PNG/WebP validation and a maximum of 12 per job.
- Original provider dashboard shows canonical queues/jobs, links into the detailed workflow page, and has a working Schedule/Calendar view. Reference-page settings are auto-saved to D1; some are visual/demo data rather than canonical business rules.

## Known gaps and bugs to tackle first

These are specific observations from this source, not speculative production requirements:

1. **Security is demo-only.** `/api/demo` trusts the action's client-supplied persona/actor/provider; `RequireAuth` automatically changes personas to reach protected pages. Replace this with server-authenticated identity, membership and per-record authorization before real users.
2. **Two models can disagree.** `reference-ui/lib/store.jsx` saves a legacy `reference` snapshot; `reference-ui/lib/bridge.js` overlays only selected canonical fields. Legacy admin page content, rates, capacity counts, endorsements, direct messages before a job, cards, addresses and notification preferences can be simulated or detached from the canonical state. Provider name/description/accepting and owner profile/vehicles have partial bridges. Remove split ownership incrementally.
3. **False success copy on the original pages.** `reference-ui/pages/ResetPassword.jsx` says a reset email was sent but makes no API call. `reference-ui/pages/Support.jsx` says staff will reply but submits no ticket or email. Do not show these claims to real users until connected. Original `Invoice.jsx`, `Payouts.jsx`, marketing content and some provider/customer metrics are presentation or demo summaries, not financial truth.
4. **Data URL uploads in the original UI.** `JobRequestForm.jsx` and owner/provider profile forms can place base64 media in the legacy snapshot; unlike `/api/media`, those flows do not store files in R2 or enforce the same 4 MB/image validation. Move all uploaded files to a signed, authorized media pipeline. The demo API has a 4.5 MB request cap.
5. **Submission semantics:** Restored `/match` requests call the bridge, which selects a matched provider's first compatible service and next sample date/window. An original quoted slot may be substituted with another available time in the same window. The displayed source-page statement about a price held 48 hours is not backed by quote expiry or enforced price holds. Calendar holds are coarse original three-hour windows vs canonical exact intervals.
6. **Identity/account consistency:** Original owner sign-in's sample name/email may not match canonical sample customers; the bridge selects a demo customer. Signing up a provider produces an unverified canonical organization plus a legacy approval record, but credential review is not an operational compliance service. Legacy account deletion does not delete the canonical customer/provider/job/R2 records or satisfy a real erasure request.
7. **Concurrency and auditing:** One D1 JSON row per browser with optimistic revisions is fine for a demo, but a burst of overlapping actions can conflict, cross-device sign-in is absent, there are no staff permissions, immutable financial records, durable queue or event delivery, backups/restore practice, or production audit trails. The original pre-job provider conversation is legacy state; job-linked threads are canonical.
8. **Visual and behavior QA is incomplete.** The last integration passed `pnpm build`, `tsc --noEmit`, and all 18 domain tests. It was not pixel-compared to the GitHub app and its complete button/keyboard/mobile journeys were not run in a browser. Check all routes and responsive breakpoints before calling it exact.

## Roadmap to a functional marketplace

### Phase 0: make the demo truthful and stable

- Browser-test customer, provider and admin journeys at desktop and mobile: direct navigation, Home → Find → Profile → Request → Match → Job, and Dashboard → Calendar → Job → Estimate → Customer approval → Completion. Inspect runtime errors, failed API calls and tab refresh. Capture screenshots against the GitHub reference and correct differences while retaining `tokens.css` and original primitives.
- Make every visible button have a real effect, a clearly labeled demo effect, or a disabled state. Prioritize reset, password reset, support submission, quote send/accept, cancellation, media, invoices, settings, notification preferences and mobile navigation.
- Inventory fields in `reference-ui/lib/store.jsx`; for each decide the canonical owner. Replace overlays in `bridge.js` route by route. Replace hard-coded statistics, sample payout claims and sample verification in customer-facing UI with canonical or explicitly sample data.
- Add integration/E2E tests for at least one path in each vertical and page-level a11y checks. Keep the 18 existing domain tests. Address partial submit and back-button behavior, validation, 409 conflicts, loading/errors and empty states.

### Phase 1: genuine multi-tenant foundations (required before launch)

- Real account lifecycle: verified email/phone, secure password hashing or OAuth/passkeys, reset tokens, sessions, logout, rate limits, MFA for staff/admin, and account recovery. Server derives actor/role; hide rather than route past forbidden pages. Define memberships for one person in multiple organizations, staff roles and delegated customer accounts.
- Normalize tables: users, customer profiles, organizations, locations, memberships, provider credentials/approvals, vehicle records, service catalog, resources/staff, schedules/blocks, service areas, requests, estimates/estimate versions/approval signatures, appointments, jobs, job events, messages, media, reports, invoices, payments/refunds, reviews, support cases, notification preferences and audit records. Use foreign keys, indexes, transactions and ownership checks. Migrate the demo JSON aggregate only if preserving real demo records is desired; do not port seeded identities as real users.
- Introduce one state machine per service workflow with shared job primitives and explicit transition guards. For mechanics: diagnostic request → estimate with parts/labor/tax → approval/decline → scheduling → work/change order → completion → invoice. For detailers: package/add-ons/vehicle size → slot with mobile travel or bay → checklist/photos → finish. For inspections: vehicle/seller access → scheduled visit → findings/photos/report export → delivery. For roadside: location/urgency → provider accepts → ETA/live status → arrival/service/tow destination → close. Include cancellations, no-shows, reschedules and escalations in every vertical.
- Real calendar: staff shifts, bays/lifts/vans, parts dependencies, multi-location capacity, travel time/zones, holidays, time zones/DST, conflicts across customer vehicles and provider resources, provisional holds and expiry. Atomic booking under concurrent users. Search distance must use real geocoding and supported polygons or radii, not the sample ZIP shortcut.
- Operational controls: backups, retention/deletion, admin audit trail, scoped support access, abuse protection, privacy/terms/cancellation/estimate policies reviewed for operating jurisdictions, observability, error alerts and incident response.

### Phase 2: market and business operations

- Marketplace matching and real directory: verified provider profiles, trade/service taxonomy, license/insurance checks as relevant, configurable coverage, onboarding queue, dispute handling, moderation, unbiased ranking with clear sponsored placement, availability-aware search and repeat booking.
- Customer journey: multiple vehicles and photos, quote comparison with identical request scope, messaging, booking confirmation, reminders, invoices, service history, saved providers and verified post-job reviews.
- Provider operations: staff permissions, intake, lead triage, estimates/approvals, calendar, job board, CRM, reusable inspection templates, photos, invoices, tax and parts/labor, analytics. Explicit pricing types: fixed package, starting price, diagnostic fee, estimate required and emergency dispatch rate.
- Choose the actual commerce model. If Tovant collects payments, integrate a marketplace-capable processor with connected accounts, identity checks, deposits, taxes, captures, refunds/chargebacks, payout reconciliation, fee accounting and webhooks with idempotency. If providers collect directly, keep that truth across marketing, invoices and analytics; do not label recorded cash as a processor payout.
- Notifications: transactional email/SMS/in-app, opt-in consent and suppression, delivery retries, reminder schedules, provider response SLAs and webhook/event queue. A real support inbox with attachments, ownership, escalation and status updates.

### Phase 3: reliability and growth

- Multi-location shops, franchises, fleets, delegated roles, recurring maintenance, memberships, promotions, automated follow-ups, no-show controls, price catalogs, referral campaigns and transparent provider subscriptions.
- Search and availability performance, mobile accessibility, localized copy, analytics funnel with consent, provider cohort/retention metrics, fraud signals, review abuse prevention, load/concurrency tests and an admin reporting console.

## Suggested acceptance checks for the next developer

1. New incognito session → Home → Find a Pro → provider profile → request → sign up/sample customer → request in `/jobs`, corresponding provider queue in `/dashboard?view=requests`, and the same `TV-*` job at `/work/jobs/:id` after reload.
2. Estimate provider sends an itemized quote; customer approval is required and recorded; provider cannot start work without it. Rescheduling an approved repair requests approval again.
3. Appointment adds one staff/calendar slot, blocks conflicting bookings, and respects provider opening hours/buffer and mobile radius; cancelled appointments release capacity.
4. Inspection cannot complete without all six findings. Roadside dispatch advances through en route and arrived. A completed job supports a single review and direct-payment record.
5. Verify in a browser that Calendar, My jobs, messages, garage, provider settings, admin and each page-index destination navigate and render at desktop and phone width. Check actual file uploads, refresh/revisit, invalid inputs, API errors and keyboard focus.

For ongoing work, keep this guide and `docs/V6-AUDIT.md` in the Cursor context, but prefer the actual source as the final truth. Preserve the restored GitHub visual language while replacing demo assumptions one system at a time.
