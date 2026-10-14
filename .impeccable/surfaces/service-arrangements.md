# Service arrangements and incoming booking requests

Mode: **Operate**. Clarify the existing marketplace workflows without changing the account shell, search/filter behavior, acceptance lifecycle, or payment options.

## 2026-10-13 refinement

The user clarified that traveling providers require a general service area and explicit travel coverage, while seeker visits and flexible listings require an actual provider venue. Area search no longer forces an exact operating-base pin. Seeker requests use their own job location or general search area according to who travels. General areas cannot silently become exact work locations when arrangements change. Errors use semantic red styling in either workspace. Both incoming inboxes now use compact empty states, expandable details and 10-item pages; provider bookings/inquiries share search and chronological ordering. This scoped refinement preserves the established workspace identity. See `../review/location-inbox-review.json` and `../../docs/MARKETPLACE_LOCATION_UX.md` for current evidence and limitations.

- Both listing bookings and offers on seeker requests explicitly agree whether the provider visits or the seeker visits a provider venue. Listings and requests may allow either arrangement; a booking always resolves to one.
- Use native radio choices, existing form/workspace tokens, visible keyboard focus, full-size controls and plain copy. Preserve orange for Seeker and green for Provider actions. No new entrance motion.
- Provider visits require the job location. Seeker visits reuse the linked listing venue, or require a custom offer venue. Public previews show general areas; exact pins and directions remain private to booking participants.
- Direct bookings add provider transportation once only when the provider travels. Offers quote one final total, including travel. Keep the total and agreed location readable before submission.
- Incoming Requests uses the booking's saved job location, not a profile address. Present person, service, arrangement, location, schedule, final total and work description in that order; Accept confirms the booking and does not start the job.
- Phone layout stacks facts, keeps the total beside the identity, and retains 44px action buttons. Light and dark themes use the existing warm neutral/charcoal palette.

## Audit findings addressed

- **P1 · Wrong location source:** the provider request card displayed a profile location despite a submitted job pin. Render `booking.jobLocation`, private directions and a directions link for the participant.
- **P1 · Ambiguous arrangement:** every direct request asked for a seeker job pin, including work at a provider venue. Choose the arrangement explicitly and resolve the authoritative location on the server.
- **P1 · Price consistency:** keep cash and online location/fee snapshots aligned; quoted offers must not acquire another transportation charge.
- **P2 · Scanning:** replace the dense identity/price/action row with labeled facts and one total. Avoid italic work descriptions and duplicate metadata.
- **P1 · Privacy:** unpaid offers must not return exact venue data; private review/account information is unrelated and unchanged.

## Verification

Real components were reviewed in an illustrative local fixture: light desktop request card and offer form, plus a 390px dark phone card. No real bookings, payments or offers were submitted. The temporary route was removed. See `../review/service-arrangement-review.json` and saved screenshots for evidence. Database migration/integration execution remains a deployment/test-database step, documented in the backend's `docs/SERVICE_ARRANGEMENTS.md`.
