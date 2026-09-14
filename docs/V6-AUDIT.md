# Tovant V6: audit and implementation record

## Evidence and scope

The supplied `Tovant v5.zip` contained Cursor workspace metadata, screenshots, planning canvases and development transcripts. It was not a runnable application repository. A read-only recovery extracted 48 historical source files. Package metadata, the original CSS tokens, main entry point, shared primitives and mock data were absent. Historical screenshots and transcript assertions were not treated as executable verification.

V6 reconstructs the product as a connected, persistent demo using the supplied brand and directory concepts. No actual provider interviews were conducted or evidenced. Workflow decisions use published sources listed below.

## Material V5 findings

| Area | Finding | V6 implementation |
| --- | --- | --- |
| State | Global customer/provider/dashboard state and disconnected bookings/jobs | Shared jobs with provider, customer, vehicle, service, appointment, estimate, message, report and payment references |
| Identity | Signup passwords saved in browser storage | No passwords collected. Explicitly labeled customer/business/admin demo personas inside an isolated session |
| Scheduling | Coarse time windows without conflict enforcement | Exact time, duration, staff, working hours, buffer, blocked time and cross-provider vehicle conflict checks |
| Workflows | One rigid progression for all categories | Appointment, estimate, inspection and dispatch workflows; mobile travel stages |
| Repair estimates | Single price without itemized approval | Parts/labor line items, computed total, recorded customer approval and renewed approval after provider rescheduling |
| Evidence | Generic job completion | Six-area inspection report, conditions, notes and job-linked photo uploads |
| Conversations | Threads keyed only by provider | Per-job conversation, participant checks and cleared unsent input when changing threads |
| Customer management | Incomplete CRM | Business customer directory, new customer/vehicle creation, shared job history and recorded revenue |
| Money | Seeded payouts inconsistent with direct-payment model | Completed-job invoices, direct-payment ledger, CSV export and zero Tovant job fees |
| Administration | Historical review screens | Demo provider review/visibility controls, onboarding and support resolution |
| Persistence | Browser-only authoritative store | D1-backed session state with revision checks and R2-backed images |

## Product surfaces

- Marketplace: 19 sample providers across 13 automotive categories; name/service search; delivery-mode, category and instant-booking filters; sort; favorites; comparison; profiles.
- Customer: demo identity selector, garage, drafts, booking requests, approval, rescheduling, cancellation, messages, photos, inspection reports, invoice downloads, completed-job reviews and support.
- Business: organization selector, dashboard, jobs, daily/weekly calendar, team blocks, customer records, estimates, workflow progression, report authoring, direct-payment recording, service menu and team/hours settings.
- Platform: simulated provider review and visibility, support queue and per-session reset.
- Demo guide: four walkthroughs and explicit production boundaries.

## Architecture

`app/[[...path]]/page.tsx` renders the client application. `components/tovant` contains marketplace, customer, business and job views. `lib/tovant/model.ts` defines the shared domain and sample data. `lib/tovant/actions.ts` validates mutations and enforces workflow rules on the server. `app/api/demo/route.ts` stores session state in D1. `app/api/media/route.ts` validates and stores image evidence in R2. Schema changes are represented by Drizzle migrations.

The authoritative demo is one revisioned JSON aggregate per random, HttpOnly-cookie session. Business/customer relationships are explicit in that aggregate. This is intentionally a demo architecture, not a production relational tenancy/authentication model. Each browser session is isolated. All demo personas within the same session can be selected by its visitor. Local storage contains only selected-persona preferences.

## Verification

- TypeScript check and Worker build.
- 18 domain tests cover instant booking, estimate approval, line totals, inspections, dispatch, participant checks, vehicle ownership, conflicts, cancellation, reviews, onboarding, support, cross-provider vehicle conflicts, mobile stages, renewed approval, drafts, radius checks and photo metadata.
- Independent engineering and UX source reviews identified and corrected concrete workflow and accessibility problems.
- No browser/end-to-end UI test was performed in this session. Deployed status confirmation is separate from browser validation.

## Production roadmap

### Critical before accepting real customers

1. Replace demo persona switching with real authentication, organization memberships, role permissions and server-derived identity.
2. Normalize production tables and add tenant-level authorization, audit logs, backup/restore, data retention and deletion controls.
3. Connect verified provider onboarding and credential review. Do not present sample ratings or verification as real.
4. Integrate real geocoding, supported service areas, operating calendars, holidays and resource capacity. The demo directory uses ZIP 55407 and sample distances; mobile requests are limited to that ZIP or the provider home ZIP and check the configured sample radius.
5. Implement jurisdiction-appropriate estimates, customer authorization, tax, cancellation, privacy and service terms with professional review.
6. Run browser, mobile, accessibility, concurrency, failure-recovery and security testing against production integrations.

### Launch systems

- Payment processor integration if platform payments are desired, refunds and reconciliation. The current model records direct provider payments and charges no per-job platform fee.
- Subscription billing and entitlements, without paid ranking.
- Email/SMS notifications, consent and delivery status.
- Real-time calendar refresh, appointment reconfirmation and reminders.
- Storage lifecycle cleanup and stricter image content processing.
- Search geospatial indexing, provider matching and booking conversion analytics.

### Growth

- Shared bays/equipment, shifts, holidays, recurring jobs and routing.
- Inspection-specific report templates and export formats.
- Fleet customer accounts, multi-vehicle/multi-location workflows and delegated access.
- Promotions, loyalty, recurring service reminders and deeper reporting.

Live map browsing, multi-provider request distribution, external VIN lookup, real payments/payouts, subscription collection, notifications and emergency dispatch are not connected. These are disclosed boundaries, not completed integrations.

## Published workflow references

- [Booksy business platform](https://biz.booksy.com/): marketplace, scheduling and customer management.
- [Shopmonkey estimates](https://www.shopmonkey.io/product/estimates): digital estimate authorization.
- [Urable vehicle care](https://urable.com/vehicle-care/): mobile/shop scheduling and operations.
- [Jobber detailing](https://www.getjobber.com/industries/auto-detailing-software/): requests, quotes and scheduling.
- [Lemon Squad report](https://lemonsquad.com/sample/standard): inspection findings and condition reporting.
- [Towbook](https://towbook.com/): dispatch acceptance, assignment and progression.
