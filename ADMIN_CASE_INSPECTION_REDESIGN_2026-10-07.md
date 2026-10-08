# Admin content and case inspection redesign

Date: October 7, 2026 (Asia/Taipei)

## Request and direction

The user rejected the long inspection pages and requested formal, understandable content records, standalone content inspection, content case details, and booking dispute details consistent with the existing admin queue design. Preserve the existing admin brand, light/dark workspace tokens, moderation actions, payment rules, and stored records. No underline hover treatment.

Operate mode. Design variance 3, motion intensity 1, visual density 5. Extend the existing admin visual system rather than creating a new identity. The first viewport identifies the case, submitter, status, complaint, and recorded decision. Details remain reachable through clearly named sections. Active decisions remain explicit, require a reason and impact review, and preserve entered values while reviewing other sections.

## Implemented

- Shared inspection layout with labeled facts, bounded long-text previews, button-based section navigation, and responsive panels.
- Content cases: Case summary, Reported/Appealed content, People & bookings, Admin history. Resolved cases show separate content action and account action beside the complaint, without a sticky outcome panel following every section.
- Original content is retained and expandable. Changes are detected from actual content fields, not moderation timestamp changes.
- Human-readable content states distinguish removed publication from suspended accounts. Historical consequences are distinct from the current owner account state.
- Standalone content inspection: Content details, Owner account, Publication status, and a separate eligible action form. Booking blockers link to the owner's booking workspace.
- Booking cases: Case summary, Booking & people, Messages, Evidence, History. The closed decision shows its saved outcome and consequence without inferring them from current payment or booking state.
- Content records show a visible view heading, Marketplace visibility column, content state, and explicit reporter/owner/account-action labels.
- Desktop actions use a second column when the content area is wide enough; tablet/mobile stack. Mobile action links jump to the form. All controls use the existing admin palette and filled/bordered selection states.
- Resolved cases include a direct Recorded outcome/Recorded decision section. Mobile inspections use compact metadata and return through Back to cases/Back to all content; the full workflow navigation remains on the queue and on desktop.
- The standalone content action confirmation has a semantic heading and receives keyboard focus when the editable fields are replaced.

## Verification

- 40 relevant tests across seven suites passed, including reason/confirmation checks, duplicate submission protection, retry state, owner penalty targeting, read-only history, original content access, draft preservation across tabs, and timestamp-only changes.
- TypeScript and targeted ESLint passed. Git diff whitespace check passed.
- Impeccable mechanical detector ran once and returned no findings.
- Signed-in browser checks used existing records; no report outcome, content action, account penalty, or payment decision was submitted.
- Capture directory: `C:/Users/Administrator/.codex/visualizations/2026/10/05/01a10ae5-18f7-77b2-8886-fe3134b5deac/admin-case-inspection/`.
- Browser checks cover content cases, owner details, standalone content inspection, and booking case details at desktop/mobile sizes and light/dark themes. Additional size/finish review evidence is recorded below when complete.
- Content records were checked at 1280 px and 390 px; the standalone inspector also passed overflow checks at 1024 px and 320 px. Temporary viewport overrides are reset after verification.
- A fresh finish review requested two material fixes: mobile first-viewport hierarchy and content inspector confirmation focus. Both were implemented in one correction batch. The same 40 tests, TypeScript, targeted ESLint, and diff checks passed after those corrections; tests assert direct decision access and confirmation focus. Final scored verdict is recorded by the reviewer in `.impeccable/review/admin-inspection/finish-review.md`.
- The final reviewer disposition is `ship`: both requested fixes scored Resolved and the correction batch had no observed material regression. This verdict covers those two scored fixes; it is not a second whole-surface audit.

## Incumbent design preservation

The documenter checked the finished inspection styles and all eleven named implementation sources against the incumbent rules in `src/app/globals.css`, `src/app/layout.tsx`, `src/components/admin/review-queue.css`, and `src/components/admin/content/content-workspace.css`. The implementation retains workspace surface, ink, muted text, border, focus, and admin accent variables in both themes. Geist remains the loaded sans face through `--font-sans`; no new font is introduced. Flat bordered panels, restrained headings, rounded controls, 44 px action targets, and filled/bordered selection states extend the established queue treatment.

This is an ordinary extension of the existing admin system. No global `DESIGN.md` or `.impeccable/design.json` exists at the project root, and neither was invented during this pass. The incumbent global styles, layout typography, PRODUCT.md, configuration, and unrelated Activity brief were preserved. Local token evidence, source coverage, capture coverage, and the scoped finish verdict are recorded in `.impeccable/review/admin-inspection/admin-inspection-evidence.md`.

## Boundaries

This is a frontend layout and clarity change. Existing backend decision eligibility and retained records are preserved. No archive filter or new deletion behavior was introduced. Closed cases remain read-only. Test fixtures verify active decisions because the current live queues contain no pending content or booking cases.

## Existing tooling metadata

Impeccable reported an unset build-path preference and an orphaned Activity surface brief. Neither is needed to extend the existing admin interface. Those pre-existing metadata findings were not repaired as a side effect.
