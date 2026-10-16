# Request form wizards

Historical capture scripts, logs and browser reports cited below remain in Git history at `3411838`, before the October 16, 2026 cleanup. The maintained wizard regression tests remain in `src/` and run with `npm test`.

Implemented October 14, 2026 on `feature/request-form-wizards`, created from local `development`.

Post Request uses Details, Location, Budget, Payment and Review. Offer Services uses Details, Location, Price, Payment and Review, with the existing provider green styling. The existing Request Service booking dialog uses Details, Location, Payment and Review. Input fields and their IDs remain unchanged. The new Review summaries are read-only and provide Edit buttons that return to the original inputs.

The top progress indicator marks the current and preceding steps. It starts at zero and reaches 100% when the input sections are complete and ready for review; this does not claim server acceptance or confirmed payment. Back/Next preserve draft state. Inactive step containers remain mounted, including location and photo components. Each step validates before Next; final submission validates all sections again. Post Request retains the budget input's existing whole-peso step, field bounds, location schema, urgency values, optional travel allowance and payment requirement.

Post Request still calls `postJobRequest` with the same arguments, including the existing handling of photo IDs and private directions for different arrangements. Request Service still uses `apiBookDirect` for cash and `bookProviderDirectly` for GCash. Cash schedules remain proposals; GCash still hands off to the existing checkout dialog and does not announce booking success at initiation. Account, ownership, availability, active-booking, quantity, payment and total checks remain in place. No API, database or migration changes are needed.

Offer Services still calls `createServiceListing` with the existing provider, category, price, description, photos, location/venue, coverage, travel-fee, duration and payment arguments. The wizard validates the existing native title/description/price bounds and five-minute duration increments before advancing. Traveling providers need an area and explicit coverage; venue-only providers need their venue and do not submit travel coverage or a fee. Flexible arrangements retain venue and coverage. Moderation errors return to Details with the draft preserved; success resets the original fields and returns to the first step. Upload and publish operations block navigation and repeated submissions.

## Files

- `src/components/seeker/PostRequest.tsx`: step navigation, existing validation reused by Next/final submission, review and moderation-error return to Details.
- `src/components/seeker/RequestServiceModal.tsx`: step navigation, booking review, unchanged cash/GCash submissions and clear field-error feedback.
- `src/components/provider/OfferServices.tsx` and `OfferServices.test.tsx`: provider listing wizard and 15 tests covering the original arrangements/publication plus navigation, validation, draft preservation, errors and restrictions.
- `src/components/ui/FormWizard.tsx` and `FormWizard.module.css`: shared progress, persistent step containers, review sections, focus management and reduced-motion transitions.
- `src/components/ui/TransactionForm.module.css`: styles scoped to the wizard's new progress and step containers.
- `src/components/seeker/PostRequest.test.tsx` and `RequestServiceModal.test.tsx`: existing contract regressions navigate the wizard.
- `src/components/seeker/RequestFormWizard.test.tsx`: 15 additional checks for step gating, review/edit, drafts/photos, upload restrictions, stale categories, verification, location/quantity, error recovery, duplicate confirms and self-booking.
- `src/components/ui/ListingPhotos.test.tsx`: corrected one stale cover-photo alt expectation to match the already existing comma label; photo presentation code was unchanged.
- `.impeccable/surfaces/request-form-wizards.md` and `.impeccable/review/capture-request-wizards.cjs`: design audit and bounded browser verification.

## Verification

The initial two-flow check passed 72 tests across seven relevant files. The Offer Services follow-up passed 54 tests across four provider/seeker wizard files. Targeted ESLint and the production build, including TypeScript checks, passed. Intercepted Edge fixtures passed at 1440px, 768px, 390px and 320px, covering light/dark modes, validation, navigation, review/edit, retained drafts, no early submission, exactly one final request, unchanged payloads and no horizontal overflow/page errors. The 390px request fixture also opened a real map, left its step, returned and checked its size and retained directions. Provider fixtures exercised area search, coverage selection, pricing, payments, review edits and publication, and checked that the progress color matches the provider action color.

Evidence: `.wizard-tests.log`, `.wizard-lint.log`, `.wizard-build.log`, `.wizard-browser.log` and `.impeccable/review/request-form-wizards-review.json`. Browser APIs were intercepted; live payment/gateway completion and production acceptance were not executed.

Provider evidence: `.provider-wizard-tests.log`, `.provider-wizard-lint.log`, `.provider-wizard-build.log`, `.provider-wizard-browser.log`, `.impeccable/review/capture-provider-wizard.cjs` and `.impeccable/review/provider-wizard-review.json`.

The backend branch is checked out at `C:/Users/SERVICEHUB-CORDOVA/fullstack/.worktrees/SERVICEHUB-BACKEND-form-wizards`. Its original modified main checkout was preserved because local development is older than that checkout. The new backend branch has no code changes for this frontend-only task. No branches were pushed.
