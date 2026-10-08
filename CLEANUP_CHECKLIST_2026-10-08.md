# Frontend cleanup checklist — 2026-10-08

Branch: `feature/safe-codebase-cleanup-2026-10-08`  
Repository: `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/`  
Audit base commit, before tracker creation: `30f380b5ea85865683b9f9d4a3e23d93903cd4b8`  
Status: **Planning only. 0 items deleted. No cleanup verification batch has run.**

[Workspace overview and shared-file review](../SERVICEHUB-BACKEND/docs/CLEANUP_TRACKER_2026-10-08.md) · [Backend checklist](../SERVICEHUB-BACKEND/CLEANUP_CHECKLIST_2026-10-08.md)

| Scope | Entries | Deleted |
| --- | ---: | ---: |
| First batch | 28 | 0 |
| Deferred candidates | 3 | 0 |
| Manual review | 12 | 0 |

The first batch contains 18 unused modules, two starter assets, and eight empty QA folders. A folder is one planning entry; its contained files, if any appear later, must be inventoried before cleanup.

## Protected — keep

These paths are excluded from deletion and refactoring in this cleanup.

- `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB_MASTER_PROMPT.md` — Keep the workspace master-prompt pointer.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-BACKEND/docs/SERVICEHUB_MASTER_PROMPT.md` — Keep the authoritative current master prompt.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/.agents/` — Keep all bundled Impeccable and Design Taste Frontend skill files, scripts, binaries, references, and agent definitions.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/.codex/` — Keep hook configuration and supporting agent configuration.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/skills-lock.json` — Keep installed-skill metadata.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/.impeccable/` — Keep even though currently empty; excluded from cleanup by the user's preference.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/.impeccable/` — Keep surface direction, review records, and screenshots; the whole directory is protected.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/PRODUCT.md` — Keep current product/design authority.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/AGENTS.md` — Keep Next.js agent guidance.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/CLAUDE.md` — Keep the intentional AGENTS.md pointer.
- `C:/Users/SERVICEHUB-CORDOVA/fullstack/CAPSTONE_DOCUMENTATION/` — Keep original capstone deliverables.

Keep current application routes, live components, tests, migrations, environment files, installed dependencies, build output, vendor licenses, operational tooling, and package manifests/lockfiles. A manual-review entry for a manifest refers only to individual declarations, not deletion of the manifest.

## Tracking rules

- A deletion checkbox means **actually deleted**. Keep it unchecked until removal has been confirmed.
- Record each removal or restoration by its stable ID in the change log. Include the snapshot/rollback reference, verification result, and commit reference when available.
- If a file is restored, uncheck its deletion entry and record the restoration.
- Verification is recorded separately. A checked deletion entry alone does not mean its batch passed verification.
- Deferred entries and review entries are not part of the first batch.
- "Review" means decide whether to keep, document, wire into tests, or retire. It does not mean approved for deletion.
- If references or contents have changed since the audit, stop that item's removal and return it to review.
- For an empty-folder candidate, recheck that it is empty immediately before removal. Git does not track empty directories.
- Use exact allowlisted paths. Do not bulk-delete by name pattern, stage unrelated existing changes, or modify preserved application behavior.

## First batch — pending deletion

The audit found no reachable consumer for the 18 modules through routes, imports, re-exports, literal dynamic imports, tests, scripts, or configuration. The prior in-memory TypeScript check passed both before and with those modules hidden. This is evidence for candidacy, not a completed physical cleanup.

- [ ] **FE-001** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/landing/LandingFooter.tsx` — Previous landing footer; current landing uses CinematicFooter.
- [ ] **FE-002** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/landing/LandingProblem.tsx` — Previous landing explanation section; current composition uses LandingBenefits.
- [ ] **FE-003** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/motion-footer.tsx` — Unused compatibility wrapper; preserve src/components/ui/motion-footer.tsx.
- [ ] **FE-004** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/particles-bg.tsx` — Unused compatibility wrapper; preserve src/components/ui/particles-bg.tsx.
- [ ] **FE-005** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/profile/VerificationCard.tsx` — Previous verification card with no current consumer.
- [ ] **FE-006** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/container-scroll-animation.tsx` — Scroll animation component with no current consumer.
- [ ] **FE-007** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/demo.tsx` — Unreferenced footer demo; not an application route.
- [ ] **FE-008** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/components/ui/particles-bg-demo.tsx` — Unreferenced particle demo; not an application route.
- [ ] **FE-009** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/community/components/CommunityNavRail.tsx` — Previous navigation rail; current navigation comes from CommunityHeader.
- [ ] **FE-010** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/community/components/CommunityUpdates.tsx` — Previous updates section; remove with FE-011.
- [ ] **FE-011** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/community/components/CommunityUpdateCard.tsx` — Only consumed by FE-010; remove together.
- [ ] **FE-012** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/community/components/LeaderboardTable.tsx` — Previous leaderboard; current hub uses TopProviders.
- [ ] **FE-013** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/community/components/PodiumChampions.tsx` — Previous provider podium with no current consumer.
- [ ] **FE-014** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/help/components/ContextualHelpButton.tsx` — Unreferenced contextual help button.
- [ ] **FE-015** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/help/components/HelpArticleNavigation.tsx` — Unreferenced previous/next article navigation.
- [ ] **FE-016** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/help/components/HelpSidebar.tsx` — Unreferenced previous help sidebar.
- [ ] **FE-017** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/help/components/RelatedArticles.tsx` — Previous related-article section; remove with FE-018.
- [ ] **FE-018** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/features/help/components/HelpArticleCard.tsx` — Only consumed by FE-017; remove together.
- [ ] **FE-019** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/assets/react.svg` — Unused React starter artwork.
- [ ] **FE-020** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/assets/vite.svg` — Unused Vite starter artwork.
- [ ] **FE-021** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/qa-admin-review/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-022** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/qa-case-filters/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-023** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/ui-preview-mobile/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-024** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/ui-preview-seek/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-025** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/workspace-qa/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-026** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/workspace-visual-qa/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-027** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/__qa_case_filters/` — Empty QA folder; recheck emptiness immediately before removal.
- [ ] **FE-028** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/app/__workspace-qa/` — Empty QA folder; recheck emptiness immediately before removal.

Preserve shared dependencies used by other live files. In particular, keep the UI footer/particle implementations, ScrollReveal, CommunityHeader, CommunitySkeletons, CommunityEmptyState, PlatformGuides, TopProviders, help data/types, and current help layouts.

## Deferred — excluded from first batch

These entries were identified in the audit but should be handled in a later, separate pass.

- [ ] **FE-D-001** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/src/assets/hero.png` — Unused original hero artwork; defer until artwork retention is settled.
- [ ] **FE-D-002** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/tsconfig.tsbuildinfo` — Regenerable incremental cache; defer and ensure no typecheck/build is writing it.
- [ ] **FE-D-003** — `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/.safety-report-qa/` — Empty QA output folder; defer and recheck contents before removal.

## Manual review — no deletion scheduled

| ID | Full path | Review reason | Decision | Removal status |
| --- | --- | --- | --- | --- |
| FE-R-001 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/public/cleanstoneimg.webp` | No current executable references; check external and persisted asset URLs. | Pending review | Not scheduled |
| FE-R-002 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/public/icons.svg` | No current executable references; check external URL and SVG-fragment consumers. | Pending review | Not scheduled |
| FE-R-003 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/public/me.jpg` | No current executable references; check external/persisted portrait URLs. | Pending review | Not scheduled |
| FE-R-004 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/public/images/hero-presenter.png` | Original presenter artwork; check retention and older public URLs. | Pending review | Not scheduled |
| FE-R-005 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/public/images/servicehub-hero.png` | Previous hero artwork; check retention and older public URLs. | Pending review | Not scheduled |
| FE-R-006 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/package.json` | Review only unused dependency declarations: @base-ui/react, @hookform/resolvers, class-variance-authority, clsx, tailwind-merge, autoprefixer. Keep the manifest; do not delete it. | Pending review | Not scheduled |
| FE-R-007 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/scripts/generate-brand-assets.mjs` | Manual asset-generation workflow; confirm retirement before removal. | Pending review | Not scheduled |
| FE-R-008 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/ACCOUNT_UI_REDESIGN_REPORT.md` | Historical account UI report; review documentation retention. | Pending review | Not scheduled |
| FE-R-009 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/ACTIVITY_IA_DIRECTION.md` | Activity design direction; confirm whether it remains authoritative. | Pending review | Not scheduled |
| FE-R-010 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/ADMIN_CASE_INSPECTION_REDESIGN_2026-10-07.md` | Inspection design direction referenced by retained review evidence; preserve unless superseded. | Pending review | Not scheduled |
| FE-R-011 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/ADMIN_MINIMALIST_UI_PLAN.md` | Admin design plan; confirm retirement and documentation retention. | Pending review | Not scheduled |
| FE-R-012 | `C:/Users/SERVICEHUB-CORDOVA/fullstack/SERVICEHUB-FRONTEND/Docs/` | Responsive audit documentation; review retention and references. | Pending review | Not scheduled |

The original audit listed the admin inspection review evidence as a review candidate. The user's preference now protects the entire frontend `.impeccable/` directory, so it is omitted from this review list.

## Execution and verification gates

- [x] Confirmed the cleanup branch and preserved all pre-existing local changes.
- [ ] Create a recovery snapshot containing the current tracked edits and untracked source/support files. A branch alone does not capture uncommitted work.
- [ ] Recheck references and exact contents for the first-batch allowlist.
- [ ] Record the baseline TypeScript check, lint, frontend tests, and production build before physical deletion.
- [ ] Perform the first-batch removals and update each FE checkbox and change-log row.
- [ ] Repeat TypeScript, lint, tests, and production build; compare with the recorded baseline.
- [ ] Smoke-check landing, Help Center, Community Hub, profiles, and provider/seeker navigation using local fixtures.
- [ ] Confirm preserved source/configuration/assets and protected paths match the recovery snapshot.
- [ ] Verify the cleanup diff contains only intended deletions and tracking updates; keep unrelated edits out of cleanup commits.
- [ ] Record final verification and synchronize counts in the workspace overview.

Baseline commands, run from the frontend repository when cleanup execution begins: `npx tsc --noEmit --incremental false`, `npm run lint`, `npm test -- --maxWorkers=2`, and `npm run build`. These commands have not been run merely to create this document. Build/font/network limitations and existing failures should be recorded rather than silently changing application configuration.

## Change log

Append one row per item action. No cleanup deletion has occurred as of tracker creation.

| Date/time (Asia/Taipei) | Item ID | Action | Recovery reference | Verification | Commit/reference | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-08 | — | Tracker created; no deletion | Not created yet | Documentation only | Git history when committed | Existing local edits preserved |
