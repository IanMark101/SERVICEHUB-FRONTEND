# Location rules and compact inboxes

Historical browser evidence cited below remains in Git history at `3411838`, before the October 16, 2026 cleanup. Current location behavior is documented in `MARKETPLACE_UX_AND_MESSAGE_RECEIPTS.md`; the retained regression tests run with `npm test`.

## Provider listings

| Arrangement | Required location | Travel coverage |
| --- | --- | --- |
| Provider visits seeker | General service area selected by city/barangay search; no shop, home address or exact operating base required | Explicit 1–30 km radius or no travel distance limit |
| Seeker visits provider | Actual provider venue / operating location | Not required; anyone can request a visit |
| Either arrangement | Actual provider venue / operating location | Explicit radius or no travel distance limit for provider visits |

The existing `serviceLocation` payload stores the discovery area center for traveling providers, and the actual venue for listings accepting seeker visits. Area search results can be selected directly. Exact venues and job pins retain map confirmation. Travel radius is measured from the selected area center or venue; choosing “Cordova” does not enforce the municipality's exact administrative boundaries or multiple selected barangays. Existing null-radius listings retain unlimited coverage. No database schema change is needed for this clarification.

## Seeker requests

Provider visits and either arrangement collect the seeker's actual job location and optional private directions. Seeker visits collect only a general search area; the provider's offer supplies the actual service venue. Neither flow asks the seeker for the provider's operating base.

Create and edit controls clear the old location when switching between a general-area role and an actual-location role. Update APIs require a newly selected location for that transition. Missing locations have inline errors linked to the picker and receive keyboard focus; drafts are preserved. Existing legacy records can still receive unrelated text edits without silently gaining a made-up location.

## Feedback and inboxes

Toast errors use red borders, icons, progress indicators and tinted surfaces in both workspaces and themes. Errors announce as alerts; successful notices announce politely. Dismiss controls retain 44px targets and reduced-motion preferences are respected.

Offers Received and Incoming Requests use compact empty/loading/error states and bordered rows. Person, service, total, trust, arrangement and general location remain visible. Full work descriptions, availability, private directions and map links use native expandable details. Decisions retain their existing permission, payment and busy-state checks. Both lists show 10 items per page; provider requests and inquiries share one chronological searchable queue. Search changes reset pagination. Offer search also includes the saved request title when the general request list has not loaded. Indexed lookups avoid repeating request/provider scans during sorting.

## Verification

72 frontend tests passed across location search/recovery, provider publish, seeker posting, received offers, incoming requests, request editing and toast semantics. Eight backend arrangement/contract tests passed. Both projects passed TypeScript checking; changed frontend TypeScript passed ESLint; both Git diffs passed whitespace checks.

Real components were checked with illustrative local records in a temporary route, which was removed after review. Desktop empty states measured 86.5px high. At 390px, no horizontal overflow occurred; decision buttons remained 44px high. Actual private directions were reachable through expanded details. Error colors were verified from computed styles in both themes. No real listing, request, booking or payment was submitted. Database integration tests were not run against the configured remote database.

See `../.impeccable/review/location-inbox-review.json` for saved evidence.
