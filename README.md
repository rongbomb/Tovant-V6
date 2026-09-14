# Tovant V6

A persistent automotive marketplace and provider-workspace demo built with React, TypeScript, Vinext and Cloudflare Workers. The UI retains Tovant's charcoal/yellow identity and reconstructs the incomplete V5 materials into shared customer/business workflows.

## Try the demo

Open the site and select Customer, Business or Admin in the top demo bar. Customer identities and business organizations can be switched independently. The Demo guide provides four walkthroughs: detailing, repair approval, inspection reporting and roadside dispatch. Your changes are saved in the server-backed demo session. Reset restores sample records.

No real business is contacted. No money is processed. Role switching is explicitly a demo mechanism, not production authentication.

## Source map

- `components/tovant`: application screens, booking and job interactions.
- `lib/tovant/model.ts`: domain types, sample data and availability rules.
- `lib/tovant/actions.ts`: server-side validated workflow mutations.
- `app/api/demo/route.ts`: D1-backed revisioned demo state.
- `app/api/media/route.ts`: session-scoped R2 images.
- `db/schema.ts` and `drizzle`: database schema and migrations.
- `docs/V6-AUDIT.md`: audit, implementation record, evidence and production roadmap.
- `tests/domain.mjs`: meaningful workflow and isolation checks.

## Validation

Use the configured project package manager and lockfile. `node node_modules/typescript/bin/tsc --noEmit` checks types. `node tests/domain.mjs` runs 18 domain tests. `pnpm build` generates Worker output. Local run: apply D1 migrations once (`pnpm exec wrangler d1 migrations apply tovant-local-d1 --local --persist-to .wrangler/state --config dist/server/wrangler.json` after build), then `pnpm start` (http://127.0.0.1:8787). Bindings come from `.hosting/hosting.json` (`DB`, `BUCKET`).

This demo requires its server and storage bindings; it is not a standalone static HTML export.
