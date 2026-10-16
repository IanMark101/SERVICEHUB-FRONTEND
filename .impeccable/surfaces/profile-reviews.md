# Profile reviews

Mode: **Read**. Preserve the existing profile, role-specific ratings, review text, dates and pagination. Profile review cards are read-only. Remove public reply and review-report forms and their client API code; previously recorded replies remain readable for owners and visitors. Completed-booking review submission/editing remains in Activity.

Profile section tabs scroll with the page at every width. The main account header retains its existing behavior. Keep keyboard tab navigation, both themes and the existing mobile horizontal tab layout.

Trust History shows score events and its help link, without a member review-dispute/trust-appeal case panel, case refresh or response form. Member-only case API helpers are removed. Existing case evidence and decisions remain in the admin-only AdminTrustCasesPanel; backend historical compatibility is retained. Ban appeals and content-removal appeals retain their own workflows. New review reports are rejected by the API, and the former public reply endpoint is removed. See `../review/profile-readonly-review.json` for earlier bounded local browser verification.
